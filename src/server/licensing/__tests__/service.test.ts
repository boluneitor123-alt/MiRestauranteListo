import { beforeEach, describe, expect, it } from 'vitest';
import { LicenseService, type Mailer, type MailTemplate } from '../service';
import { MemoryLicenseStore } from '../memoryStore';
import { DAY_MS, isValidLicenseCode } from '@/domain/license';

const START = Date.UTC(2026, 0, 10, 12, 0, 0);

class FakeMailer implements Mailer {
  sent: Array<{ to: string; template: MailTemplate; data: Record<string, unknown> }> = [];
  async send(message: { to: string; template: MailTemplate; data: Record<string, unknown> }) {
    this.sent.push(message);
  }
}

function setup() {
  const store = new MemoryLicenseStore();
  const mailer = new FakeMailer();
  let now = START;
  const service = new LicenseService({ store, mailer, now: () => now });
  return {
    store,
    mailer,
    service,
    advance: (ms: number) => {
      now += ms;
    },
    setNow: (value: number) => {
      now = value;
    },
  };
}

describe('emisión de licencias', () => {
  it('emite un código con el formato del contrato y lo manda por correo', async () => {
    const { service, mailer } = setup();
    const { code, license } = await service.issue({ email: 'Ana@Correo.com', name: 'Ana', amount: 2450 });

    expect(isValidLicenseCode(code)).toBe(true);
    expect(license.status).toBe('nueva');
    expect(license.email).toBe('ana@correo.com');
    expect(mailer.sent[0]).toMatchObject({ to: 'ana@correo.com', template: 'compra-confirmada' });
  });

  it('no emite dos códigos por el mismo pago aunque el webhook llegue repetido', async () => {
    const { service, store } = setup();
    const primera = await service.issue({ email: 'ana@correo.com', paymentRef: 'pi_123' });
    const segunda = await service.issue({ email: 'ana@correo.com', paymentRef: 'pi_123' });

    expect(segunda.code).toBe(primera.code);
    expect(segunda.alreadyIssued).toBe(true);
    expect(await store.listLicenses()).toHaveLength(1);
  });

  it('registra el pago y la emisión en la bitácora', async () => {
    const { service, store } = setup();
    await service.issue({ email: 'ana@correo.com' });
    const kinds = (await store.listEvents()).map((e) => e.kind);
    expect(kinds).toContain('pago-recibido');
    expect(kinds).toContain('licencia-emitida');
  });
});

describe('activación', () => {
  it('activa con el código, aceptando lo que el usuario teclee', async () => {
    const { service } = setup();
    const { code } = await service.issue({ email: 'ana@correo.com' });

    const result = await service.activate({ code: code.toLowerCase().replace(/-/g, ''), deviceId: 'eq-1' });
    expect(result).toMatchObject({ ok: true, code, devices: 1, max: 3 });
  });

  it('rechaza códigos inválidos y desconocidos sin filtrar información', async () => {
    const { service } = setup();
    expect(await service.activate({ code: 'no-sirve', deviceId: 'eq-1' })).toMatchObject({
      ok: false,
      error: 'codigo-invalido',
    });
    expect(await service.activate({ code: 'MRL-AAAA-BBBB', deviceId: 'eq-1' })).toMatchObject({
      ok: false,
      error: 'no-existe',
    });
  });

  it('no funciona en un cuarto equipo hasta liberar equipos desde el panel', async () => {
    const { service } = setup();
    const { code } = await service.issue({ email: 'ana@correo.com' });

    for (const device of ['eq-1', 'eq-2', 'eq-3']) {
      expect((await service.activate({ code, deviceId: device })).ok).toBe(true);
    }
    expect(await service.activate({ code, deviceId: 'eq-4' })).toMatchObject({
      ok: false,
      error: 'limite-de-equipos',
    });

    await service.freeDevices(code);
    expect((await service.activate({ code, deviceId: 'eq-4' })).ok).toBe(true);
  });

  it('respeta el máximo de equipos configurado en el panel', async () => {
    const { service, store } = setup();
    await store.updateSettings({ maxDevices: 1 });
    const { code } = await service.issue({ email: 'ana@correo.com' });

    expect((await service.activate({ code, deviceId: 'eq-1' })).ok).toBe(true);
    expect(await service.activate({ code, deviceId: 'eq-2' })).toMatchObject({ error: 'limite-de-equipos' });
  });

  it('bloquea la activación de licencias revocadas y reembolsadas', async () => {
    const { service } = setup();
    const revocada = await service.issue({ email: 'a@a.com' });
    await service.revoke(revocada.code);
    expect(await service.activate({ code: revocada.code, deviceId: 'eq-1' })).toMatchObject({ error: 'revocada' });

    const reembolsada = await service.issue({ email: 'b@b.com' });
    await service.refund(reembolsada.code);
    expect(await service.activate({ code: reembolsada.code, deviceId: 'eq-1' })).toMatchObject({
      error: 'reembolsada',
    });
  });
});

describe('validación en cada arranque', () => {
  it('valida sólo para el equipo que activó', async () => {
    const { service } = setup();
    const { code } = await service.issue({ email: 'ana@correo.com' });
    await service.activate({ code, deviceId: 'eq-1' });

    expect(await service.validate({ code, deviceId: 'eq-1' })).toEqual({ ok: true, status: 'activada' });
    expect(await service.validate({ code, deviceId: 'ajeno' })).toEqual({ ok: false, status: 'activada' });
  });

  it('deja de validar cuando la licencia se revoca o se reembolsa', async () => {
    const { service } = setup();
    const { code } = await service.issue({ email: 'ana@correo.com' });
    await service.activate({ code, deviceId: 'eq-1' });

    await service.revoke(code);
    expect(await service.validate({ code, deviceId: 'eq-1' })).toEqual({ ok: false, status: 'revocada' });

    await service.reactivate(code);
    expect(await service.validate({ code, deviceId: 'eq-1' })).toEqual({ ok: true, status: 'activada' });

    await service.refund(code);
    expect(await service.validate({ code, deviceId: 'eq-1' })).toEqual({ ok: false, status: 'reembolsada' });
  });

  it('no valida códigos desconocidos', async () => {
    const { service } = setup();
    expect(await service.validate({ code: 'MRL-AAAA-BBBB', deviceId: 'eq-1' })).toEqual({
      ok: false,
      status: 'desconocida',
    });
  });
});

describe('activación automática al volver del checkout', () => {
  it('un pago real desbloquea sin que el usuario escriba nada', async () => {
    const { service } = setup();
    // El equipo ya venía usando la prueba.
    await service.entitlement({ deviceId: 'eq-1' });

    // Llega el webhook del cobro, con la cuenta que compró.
    const { code } = await service.issue({
      email: 'ana@correo.com',
      userId: 'u-ana',
      originDeviceId: 'eq-1',
      paymentRef: 'pi_1',
    });

    // La app pregunta al volver del pago: se reclama sola.
    expect(await service.claim({ deviceId: 'eq-1', userId: 'u-ana', email: 'ana@correo.com' })).toEqual({
      ok: true,
      code,
    });
    const entitlement = await service.entitlement({ deviceId: 'eq-1' });
    expect(entitlement.level).toBe('licencia');
    expect(entitlement.licensed).toBe(true);
  });

  it('el acceso sigue a la cuenta: se paga en un equipo y entra en otro', async () => {
    const { service } = setup();
    await service.issue({ email: 'ana@correo.com', userId: 'u-ana', originDeviceId: 'celular', paymentRef: 'pi_1' });
    await service.claim({ deviceId: 'celular', userId: 'u-ana', email: 'ana@correo.com' });

    // La laptop nunca pagó, pero es de la misma persona.
    const laptop = await service.entitlement({ deviceId: 'laptop', userId: 'u-ana', email: 'ana@correo.com' });
    expect(laptop.licensed).toBe(true);
  });

  it('sin identidad no se entrega nada, aunque haya una licencia esperando', async () => {
    const { service } = setup();
    await service.issue({ email: 'ana@correo.com', userId: 'u-ana', paymentRef: 'pi_1' });
    // Éste es el reclamo cruzado: un equipo cualquiera pidiendo sin decir quién es.
    expect(await service.claim({ deviceId: 'eq-1' })).toEqual({ ok: false });
  });

  it('no le entrega a una persona la licencia que pagó otra', async () => {
    const { service } = setup();
    await service.issue({ email: 'ana@correo.com', userId: 'u-ana', paymentRef: 'pi_1' });

    expect(await service.claim({ deviceId: 'eq-2', userId: 'u-beto', email: 'beto@correo.com' })).toEqual({
      ok: false,
    });
  });

  it('no reclama nada si no hay licencia pagada esperando', async () => {
    const { service } = setup();
    expect(await service.claim({ deviceId: 'eq-1', userId: 'u-ana', email: 'ana@correo.com' })).toEqual({ ok: false });
  });

  it('no roba la licencia de otro equipo ya activada', async () => {
    const { service } = setup();
    const { code } = await service.issue({ email: 'ana@correo.com' });
    await service.activate({ code, deviceId: 'eq-1' });

    expect(await service.claim({ deviceId: 'intruso', userId: 'u-otro', email: 'otro@correo.com' })).toEqual({
      ok: false,
    });
  });

  it('respeta el switch de activación automática del panel', async () => {
    const { service, store } = setup();
    await store.updateSettings({ autoActivation: false });
    await service.issue({ email: 'ana@correo.com' });
    expect(await service.claim({ deviceId: 'eq-1' })).toEqual({ ok: false });
  });

  it('puede acotar la búsqueda al correo de la compra', async () => {
    const { service } = setup();
    await service.issue({ email: 'otra@correo.com' });
    const mia = await service.issue({ email: 'ana@correo.com' });
    expect(await service.claim({ deviceId: 'eq-1', email: 'ANA@correo.com' })).toEqual({ ok: true, code: mia.code });
  });
});

describe('acceso resuelto en el servidor', () => {
  it('arranca en prueba y sella la demo al vencer', async () => {
    const { service, store, advance } = setup();

    const inicio = await service.entitlement({ deviceId: 'eq-1' });
    expect(inicio.level).toBe('prueba');
    expect(inicio.trial.daysLeft).toBe(7);
    expect(inicio.capabilities.budget).toBe(false);
    expect(inicio.capabilities.breakeven).toBe(true);
    expect(inicio.capabilities.showsInvestmentFigures).toBe(false);

    advance(8 * DAY_MS);
    const vencida = await service.entitlement({ deviceId: 'eq-1' });
    expect(vencida.level).toBe('bloqueado');
    expect(vencida.capabilities.tabs).toEqual({
      inicio: false,
      ruta: false,
      costeador: false,
      numeros: false,
      mas: true,
    });

    const trial = await store.getTrial('eq-1');
    expect(trial?.expiredAt).toBe(START + 7 * DAY_MS);
    expect(trial?.converted).toBe(false);
  });

  it('marca la demo como convertida al activar', async () => {
    const { service, store } = setup();
    await service.entitlement({ deviceId: 'eq-1' });
    const { code } = await service.issue({ email: 'ana@correo.com' });
    await service.activate({ code, deviceId: 'eq-1' });

    expect((await store.getTrial('eq-1'))?.converted).toBe(true);
  });

  it('revocar regresa al usuario a prueba en su siguiente arranque', async () => {
    const { service, advance } = setup();
    const { code } = await service.issue({ email: 'ana@correo.com' });
    await service.activate({ code, deviceId: 'eq-1' });
    expect((await service.entitlement({ deviceId: 'eq-1' })).level).toBe('licencia');

    await service.revoke(code);
    advance(DAY_MS);
    const despues = await service.entitlement({ deviceId: 'eq-1' });
    expect(despues.level).toBe('prueba');
    expect(despues.status).toBe('revocada');
    expect(despues.capabilities.showsInvestmentFigures).toBe(false);
  });

  it('con licencia activa la prueba vencida ya no importa', async () => {
    const { service, advance } = setup();
    await service.entitlement({ deviceId: 'eq-1' });
    advance(30 * DAY_MS);
    const { code } = await service.issue({ email: 'ana@correo.com' });
    await service.activate({ code, deviceId: 'eq-1' });

    const entitlement = await service.entitlement({ deviceId: 'eq-1' });
    expect(entitlement.level).toBe('licencia');
    expect(entitlement.capabilities.dishLimit).toBeNull();
    expect(entitlement.devices).toEqual({ used: 1, max: 3 });
  });

  it('un código ajeno no abre la app en otro equipo', async () => {
    const { service } = setup();
    const { code } = await service.issue({ email: 'ana@correo.com' });
    await service.activate({ code, deviceId: 'eq-1' });

    const intruso = await service.entitlement({ deviceId: 'intruso', code });
    expect(intruso.level).toBe('prueba');
    expect(intruso.licensed).toBe(false);
  });

  it('respeta los días de prueba configurados en el panel', async () => {
    const { service, store, advance } = setup();
    await store.updateSettings({ trialDays: 3 });
    await service.entitlement({ deviceId: 'eq-1' });

    advance(4 * DAY_MS);
    expect((await service.entitlement({ deviceId: 'eq-1' })).level).toBe('bloqueado');
  });
});

describe('operaciones del panel', () => {
  let ctx: ReturnType<typeof setup>;
  beforeEach(() => {
    ctx = setup();
  });

  it('reenvía el código al correo del cliente', async () => {
    const { service, mailer } = ctx;
    const { code } = await service.issue({ email: 'ana@correo.com' });
    expect(await service.resend(code)).toBe(true);
    expect(mailer.sent.at(-1)).toMatchObject({ to: 'ana@correo.com', template: 'recuperar-acceso' });
  });

  it('devuelve false al reenviar un código que no existe', async () => {
    expect(await ctx.service.resend('MRL-AAAA-BBBB')).toBe(false);
  });

  it('registra cada operación en la bitácora', async () => {
    const { service, store } = ctx;
    const { code } = await service.issue({ email: 'ana@correo.com' });
    await service.activate({ code, deviceId: 'eq-1' });
    await service.revoke(code);
    await service.reactivate(code);
    await service.freeDevices(code);
    await service.resend(code);

    const kinds = (await store.listEvents()).map((e) => e.kind);
    for (const kind of [
      'licencia-activada',
      'licencia-revocada',
      'licencia-reactivada',
      'equipos-liberados',
      'codigo-reenviado',
    ]) {
      expect(kinds).toContain(kind);
    }
  });

  it('busca licencias por código, nombre o correo y filtra por estado', async () => {
    const { service, store } = ctx;
    const a = await service.issue({ email: 'ana@correo.com', name: 'Ana Rodríguez' });
    await service.issue({ email: 'luis@correo.com', name: 'Luis Pérez' });
    await service.activate({ code: a.code, deviceId: 'eq-1' });

    expect(await store.listLicenses({ query: 'ana' })).toHaveLength(1);
    expect(await store.listLicenses({ query: a.code })).toHaveLength(1);
    expect(await store.listLicenses({ status: 'activada' })).toHaveLength(1);
    expect(await store.listLicenses({ status: 'nueva' })).toHaveLength(1);
    expect(await store.listLicenses({ status: 'todas' })).toHaveLength(2);
  });
});
