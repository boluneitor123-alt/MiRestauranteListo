import { describe, expect, it } from 'vitest';
import { capabilities } from '../access';
import { leerEntitlement, nivelDeAcceso } from '../entitlement';

/** Una respuesta buena del servidor, para ir rompiéndola de a una pieza. */
const buena = (extra: Record<string, unknown> = {}) => ({
  ok: true,
  level: 'licencia',
  licensed: true,
  code: 'MRL-AAAA-BBBB',
  status: 'activada',
  trial: { startedAt: 1, expiresAt: 2, daysLeft: 0, expired: true, label: 'Tu prueba terminó' },
  capabilities: capabilities('licencia'),
  price: 2450,
  warrantyDays: 14,
  trialDays: 7,
  ...extra,
});

describe('leer la respuesta de acceso', () => {
  it('una respuesta completa se acepta tal cual', () => {
    const leido = leerEntitlement(buena());
    expect(leido?.level).toBe('licencia');
    expect(leido?.licensed).toBe(true);
    expect(leido?.capabilities.printableDocuments).toBe(true);
  });

  it.each([
    ['nula', null],
    ['un texto', 'licencia'],
    ['vacía', {}],
    ['un error con 200', { ok: false, error: 'sin-base-de-datos' }],
    ['sin nivel', buena({ level: undefined })],
    ['con un nivel inventado', buena({ level: 'premium' })],
    ['con el nivel en otro idioma', buena({ level: 'licensed' })],
    ['sin datos de la prueba', buena({ trial: undefined })],
    ['con la prueba a medias', buena({ trial: { startedAt: 1 } })],
    ['sin precio', buena({ price: undefined })],
    ['con el precio en texto', buena({ price: '2450' })],
  ])('%s no se entiende, y no entender es no abrir', (_caso, data) => {
    expect(leerEntitlement(data)).toBeNull();
    expect(nivelDeAcceso(leerEntitlement(data))).toBe('bloqueado');
  });

  it('sin respuesta el nivel es bloqueado, nunca abierto', () => {
    expect(nivelDeAcceso(null)).toBe('bloqueado');
  });

  it('un licensed en true con nivel de prueba no cuela como licencia', () => {
    const leido = leerEntitlement(buena({ level: 'prueba', licensed: true }));
    expect(leido?.level).toBe('prueba');
    expect(leido?.licensed).toBe(false);
  });

  it('un alcance incompleto se cambia por el del nivel, no se rellena con huecos', () => {
    const roto = { ...capabilities('prueba') } as Record<string, unknown>;
    delete roto.printableDocuments;
    const leido = leerEntitlement(buena({ level: 'prueba', capabilities: roto }));
    expect(leido?.capabilities).toEqual(capabilities('prueba'));
    expect(leido?.capabilities.printableDocuments).toBe(false);
  });

  it('un alcance más generoso que su nivel no abre nada de más', () => {
    // El servidor dice "prueba" pero manda, bien formado, el alcance de una
    // licencia pagada. Manda el nivel, no el alcance que venga pegado.
    const leido = leerEntitlement(buena({ level: 'prueba', capabilities: capabilities('licencia') }));
    expect(leido?.capabilities).toEqual(capabilities('prueba'));
    expect(leido?.capabilities.openRouteModules).not.toBe('todos');
    expect(leido?.capabilities.printableDocuments).toBe(false);
    expect(leido?.capabilities.dishLimit).toBe(3);
  });

  it('un bloqueado con alcance de licencia sigue bloqueado', () => {
    const leido = leerEntitlement(buena({ level: 'bloqueado', capabilities: capabilities('licencia') }));
    expect(leido?.capabilities).toEqual(capabilities('bloqueado'));
    expect(leido?.capabilities.tabs.ruta).toBe(false);
  });

  it('un alcance a medias no deja llaves en undefined', () => {
    const leido = leerEntitlement(buena({ level: 'bloqueado', capabilities: { menu: true } }));
    expect(leido?.capabilities).toEqual(capabilities('bloqueado'));
    expect(leido?.capabilities.printableDocuments).toBe(false);
  });
});
