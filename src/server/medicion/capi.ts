/**
 * API de Conversiones de Meta. Ver `MEDICION.md` § 5.
 *
 * Todo lo que sale de aquí es de servidor. El token nunca llega al navegador.
 *
 * Dos reglas que valen más que la medición misma:
 *
 * 1. **Nada de esto puede tumbar un cobro.** Si Meta falla, se tarda o el token
 *    no está, la función devuelve por qué y sigue su camino. Nunca lanza.
 * 2. **Sin token, apagado y en silencio.** Un despliegue sin la variable
 *    funciona igual; simplemente no se mide.
 */

import { createHash } from 'node:crypto';
import { FB_PIXEL_ID } from '@/content/medicion';

const VERSION = 'v21.0';

/**
 * SHA-256 en hexadecimal, sobre el valor recortado y en minúsculas.
 *
 * Meta hashea igual de su lado y compara: si el nuestro no normaliza, no
 * empareja con nadie. `" Ana@Correo.com "` tiene que dar lo mismo que
 * `"ana@correo.com"`.
 */
export function huella(valor: string | undefined | null): string | undefined {
  const limpio = (valor ?? '').trim().toLowerCase();
  if (!limpio) return undefined;
  return createHash('sha256').update(limpio).digest('hex');
}

/** Un teléfono se hashea en E.164 sin el `+` ni separadores. */
export function huellaDeTelefono(valor: string | undefined | null): string | undefined {
  const digitos = (valor ?? '').replace(/\D/g, '');
  return digitos ? createHash('sha256').update(digitos).digest('hex') : undefined;
}

/** Un nombre completo se parte en nombre y apellidos para `fn` y `ln`. */
export function huellasDeNombre(nombre: string | undefined | null): { fn?: string; ln?: string } {
  const partes = (nombre ?? '').trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return {};
  if (partes.length === 1) return { fn: huella(partes[0]) };
  return { fn: huella(partes[0]), ln: huella(partes.slice(1).join(' ')) };
}

export interface DatosDePersona {
  email?: string;
  telefono?: string;
  nombre?: string;
  userId?: string;
  /** Sin hashear: Meta no empareja si se hashean. */
  fbp?: string;
  fbc?: string;
  ip?: string;
  userAgent?: string;
}

export interface EventoCapi {
  nombre: string;
  /** Clave de deduplicación contra el mismo evento del navegador. */
  eventId: string;
  /** En segundos. */
  cuando: number;
  urlDeOrigen?: string;
  persona: DatosDePersona;
  datos?: Record<string, unknown>;
}

export type ResultadoCapi =
  | { ok: true }
  | { ok: false; motivo: 'sin-token' | 'error-de-meta' | 'sin-red'; detalle?: string };

export const capiConfigurada = (): boolean => !!process.env.FB_CAPI_ACCESS_TOKEN;

/** Los campos vacíos se omiten: mandarlos en blanco empeora el emparejamiento. */
function sinVacios<T extends Record<string, unknown>>(objeto: T): Record<string, unknown> {
  return Object.fromEntries(Object.entries(objeto).filter(([, v]) => v !== undefined && v !== ''));
}

function userData(p: DatosDePersona): Record<string, unknown> {
  const { fn, ln } = huellasDeNombre(p.nombre);
  const em = huella(p.email);
  const ph = huellaDeTelefono(p.telefono);
  const externalId = huella(p.userId);
  return sinVacios({
    // Meta espera arreglos en los campos hasheados.
    em: em ? [em] : undefined,
    ph: ph ? [ph] : undefined,
    fn: fn ? [fn] : undefined,
    ln: ln ? [ln] : undefined,
    external_id: externalId ? [externalId] : undefined,
    fbp: p.fbp,
    fbc: p.fbc,
    client_ip_address: p.ip,
    client_user_agent: p.userAgent,
  });
}

/**
 * Manda un evento a Meta. Nunca lanza.
 *
 * `test_event_code` sale de la variable `FB_CAPI_TEST_CODE` y sirve para probar
 * sin ensuciar los datos reales. Se quita de Vercel antes de abrir al público.
 */
export async function enviarACapi(evento: EventoCapi): Promise<ResultadoCapi> {
  const token = process.env.FB_CAPI_ACCESS_TOKEN;
  if (!token) return { ok: false, motivo: 'sin-token' };

  const cuerpo = {
    data: [
      sinVacios({
        event_name: evento.nombre,
        event_time: Math.floor(evento.cuando / 1000),
        event_id: evento.eventId,
        action_source: 'website',
        event_source_url: evento.urlDeOrigen,
        user_data: userData(evento.persona),
        custom_data: evento.datos,
      }),
    ],
    ...(process.env.FB_CAPI_TEST_CODE ? { test_event_code: process.env.FB_CAPI_TEST_CODE } : {}),
  };

  try {
    const respuesta = await fetch(
      `https://graph.facebook.com/${VERSION}/${FB_PIXEL_ID}/events?access_token=${encodeURIComponent(token)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cuerpo),
        // Meta caída no puede dejar colgado un webhook de Stripe.
        signal: AbortSignal.timeout(8000),
      },
    );
    if (!respuesta.ok) {
      return { ok: false, motivo: 'error-de-meta', detalle: `${respuesta.status} ${(await respuesta.text()).slice(0, 300)}` };
    }
    return { ok: true };
  } catch (error) {
    return { ok: false, motivo: 'sin-red', detalle: error instanceof Error ? error.message : undefined };
  }
}
