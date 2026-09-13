import { describe, expect, it } from 'vitest';
import { LicenseService } from '@/server/licensing/service';
import { MemoryLicenseStore } from '@/server/licensing/memoryStore';
import { leerHuerfanas } from '../licenciasHuerfanas';

function setup() {
  const store = new MemoryLicenseStore();
  const service = new LicenseService({ store, mailer: { async send() {} } });
  return { store, service };
}

describe('licencias sin dueño registrado', () => {
  it('el recuento se calcula, no se teclea', async () => {
    const { store, service } = setup();
    store.cuentas.add('ana@correo.com');

    await service.issue({ email: 'ana@correo.com', userId: 'u-ana', paymentRef: 'p1' });
    await service.issue({ email: 'ana@correo.com', paymentRef: 'p2' });
    await service.issue({ email: 'nadie@correo.com', paymentRef: 'p3' });

    const { huerfanas, resumen } = await leerHuerfanas(store);
    expect(resumen).toEqual({ total: 3, conCuenta: 1, soloCorreo: 1, huerfanas: 1 });
    expect(huerfanas.map((h) => h.email)).toEqual(['nadie@correo.com']);
  });

  it('trae el equipo y la fecha, que es lo que hace falta para decidir', async () => {
    const { store, service } = setup();
    const { code } = await service.issue({ email: 'nadie@correo.com', paymentRef: 'p1' });
    await service.activate({ code, deviceId: 'eq-7' });

    const { huerfanas } = await leerHuerfanas(store);
    expect(huerfanas[0].devices).toEqual(['eq-7']);
    expect(huerfanas[0].activatedAt).toBeGreaterThan(0);
    expect(huerfanas[0].code).toBe(code);
  });

  it('una revocada ya no presta nada: sale de la lista', async () => {
    const { store, service } = setup();
    const { code } = await service.issue({ email: 'nadie@correo.com', paymentRef: 'p1' });
    await service.revoke(code);
    const { huerfanas, resumen } = await leerHuerfanas(store);
    expect(huerfanas).toHaveLength(0);
    expect(resumen.total).toBe(0);
  });

  it('asignarle dueño la saca de la lista y la ata a la cuenta', async () => {
    const { store, service } = setup();
    store.cuentas.add('ana@correo.com');
    const { code } = await service.issue({ email: 'pago@correo.com', paymentRef: 'p1' });
    await service.activate({ code, deviceId: 'eq-1' });

    expect((await leerHuerfanas(store)).huerfanas).toHaveLength(1);

    const result = await service.asignarDueno(code, 'Ana@Correo.com');
    expect(result.ok).toBe(true);
    expect((await leerHuerfanas(store)).huerfanas).toHaveLength(0);

    // Y ahora sólo abre para Ana.
    expect((await service.entitlement({ deviceId: 'eq-1', email: 'ana@correo.com' })).level).toBe('licencia');
    expect((await service.entitlement({ deviceId: 'eq-1', email: 'otro@correo.com' })).level).toBe('prueba');
  });

  it('no se asigna a un correo sin cuenta: escondería el pendiente', async () => {
    const { service } = setup();
    const { code } = await service.issue({ email: 'pago@correo.com', paymentRef: 'p1' });
    expect(await service.asignarDueno(code, 'fantasma@correo.com')).toEqual({ ok: false, error: 'sin-cuenta' });
    expect(await service.asignarDueno('MRL-XXXX-XXXX', 'a@b.com')).toEqual({ ok: false, error: 'no-existe' });
    expect(await service.asignarDueno(code, 'sin-arroba')).toEqual({ ok: false, error: 'correo-invalido' });
  });
});

describe('revocar por correo', () => {
  it('revoca todas las vigentes de esa persona y deja las demás', async () => {
    const { store, service } = setup();
    const a = await service.issue({ email: 'ana@correo.com', paymentRef: 'p1' });
    const b = await service.issue({ email: 'ana@correo.com', paymentRef: 'p2' });
    const c = await service.issue({ email: 'beto@correo.com', paymentRef: 'p3' });

    const { codes } = await service.revokeByEmail('Ana@Correo.com');
    expect(codes.sort()).toEqual([a.code, b.code].sort());
    expect((await store.findLicense(c.code))?.status).toBe('nueva');
  });

  it('el acceso se cae en el siguiente arranque', async () => {
    const { store, service } = setup();
    store.cuentas.add('ana@correo.com');
    const { code } = await service.issue({ email: 'ana@correo.com', userId: 'u-ana', paymentRef: 'p1' });
    await service.activate({ code, deviceId: 'eq-1' });
    expect((await service.entitlement({ deviceId: 'eq-1', userId: 'u-ana' })).level).toBe('licencia');

    await service.revokeByEmail('ana@correo.com');
    expect((await service.entitlement({ deviceId: 'eq-1', userId: 'u-ana' })).level).toBe('prueba');
  });

  it('un correo sin licencias vigentes no revoca nada', async () => {
    const { service } = setup();
    expect(await service.revokeByEmail('nadie@correo.com')).toEqual({ codes: [] });
    expect(await service.revokeByEmail('')).toEqual({ codes: [] });
  });
});
