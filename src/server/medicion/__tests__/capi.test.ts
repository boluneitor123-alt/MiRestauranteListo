import { describe, expect, it } from 'vitest';
import { createHash } from 'node:crypto';
import { capiConfigurada, enviarACapi, huella, huellaDeTelefono, huellasDeNombre } from '../capi';

const sha = (v: string) => createHash('sha256').update(v).digest('hex');

describe('el hasheo que Meta espera', () => {
  /*
    Meta hashea de su lado y compara. Si el nuestro no normaliza igual, el
    evento llega y no empareja con nadie: la atribución sale en cero sin que
    nada falle.
  */
  it('normaliza a minúsculas y recorta antes de hashear', () => {
    expect(huella('  Ana@Correo.com ')).toBe(sha('ana@correo.com'));
    expect(huella('ANA@CORREO.COM')).toBe(huella('ana@correo.com'));
  });

  it('lo que no existe no se manda vacío: se omite', () => {
    // Un hash de cadena vacía es un valor válido que no empareja con nadie y
    // que baja la calidad de coincidencia. Mejor no mandar el campo.
    expect(huella(undefined)).toBeUndefined();
    expect(huella('')).toBeUndefined();
    expect(huella('   ')).toBeUndefined();
  });

  it('el teléfono va en E.164 sin el + ni separadores', () => {
    expect(huellaDeTelefono('+52 55 1234 5678')).toBe(sha('525512345678'));
    expect(huellaDeTelefono('(55) 1234-5678')).toBe(sha('5512345678'));
    expect(huellaDeTelefono('sin dígitos')).toBeUndefined();
  });

  it('el nombre se parte en nombre y apellidos', () => {
    expect(huellasDeNombre('Ana María Pérez López')).toEqual({
      fn: sha('ana'),
      ln: sha('maría pérez lópez'),
    });
    // Con un solo nombre no se inventa un apellido.
    expect(huellasDeNombre('Ana')).toEqual({ fn: sha('ana') });
    expect(huellasDeNombre('')).toEqual({});
  });
});

describe('sin token, apagado y sin ruido', () => {
  it('no está configurada si falta la variable', async () => {
    const previo = process.env.FB_CAPI_ACCESS_TOKEN;
    delete process.env.FB_CAPI_ACCESS_TOKEN;
    try {
      expect(capiConfigurada()).toBe(false);

      // Lo que importa: no lanza. Un cobro no puede fallar porque falte una
      // variable de medición.
      const r = await enviarACapi({
        nombre: 'Purchase',
        eventId: 'pi_x',
        cuando: Date.now(),
        persona: { email: 'ana@correo.com' },
      });
      expect(r).toEqual({ ok: false, motivo: 'sin-token' });
    } finally {
      if (previo === undefined) delete process.env.FB_CAPI_ACCESS_TOKEN;
      else process.env.FB_CAPI_ACCESS_TOKEN = previo;
    }
  });
});

describe('Meta no puede tumbar un cobro', () => {
  /*
    La licencia ya se emitió cuando esto corre. Si Meta falla, se tarda o no
    contesta, el webhook tiene que poder responder 200: sin ese 200 Stripe
    reintenta y se emite la licencia otra vez. Así que nada de aquí lanza.
  */
  const conFetch = async (impl: typeof fetch, fn: () => Promise<unknown>) => {
    const previoToken = process.env.FB_CAPI_ACCESS_TOKEN;
    const previoFetch = globalThis.fetch;
    process.env.FB_CAPI_ACCESS_TOKEN = 'token-de-prueba';
    globalThis.fetch = impl;
    try {
      return await fn();
    } finally {
      globalThis.fetch = previoFetch;
      if (previoToken === undefined) delete process.env.FB_CAPI_ACCESS_TOKEN;
      else process.env.FB_CAPI_ACCESS_TOKEN = previoToken;
    }
  };

  const evento = { nombre: 'Purchase', eventId: 'pi_x', cuando: Date.now(), persona: {} };

  it('un error de Meta se reporta, no se lanza', async () => {
    const r = await conFetch(
      (async () => new Response('boom', { status: 500 })) as typeof fetch,
      () => enviarACapi(evento),
    );
    expect(r).toMatchObject({ ok: false, motivo: 'error-de-meta' });
  });

  it('la red caída tampoco lanza', async () => {
    const r = await conFetch(
      (async () => {
        throw new Error('ECONNRESET');
      }) as typeof fetch,
      () => enviarACapi(evento),
    );
    expect(r).toMatchObject({ ok: false, motivo: 'sin-red' });
  });

  it('si Meta no contesta, corta sola y no se queda colgada', async () => {
    // El webhook de Stripe tiene su propio límite de tiempo: quedarse
    // esperando a Meta lo haría fallar y disparar un reintento.
    const r = await conFetch(
      ((_u: unknown, init: { signal?: AbortSignal }) =>
        new Promise((_res, rej) => {
          init.signal?.addEventListener('abort', () => rej(new Error('AbortError')));
        })) as unknown as typeof fetch,
      () => enviarACapi(evento),
    );
    expect(r).toMatchObject({ ok: false, motivo: 'sin-red' });
  }, 15_000);
});
