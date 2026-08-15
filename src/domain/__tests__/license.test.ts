import { describe, expect, it } from 'vitest';
import {
  ACTIVATION_MESSAGES,
  activateLicense,
  canActivate,
  DAY_MS,
  demoMetrics,
  freeDevices,
  generateLicenseCode,
  grantsAccess,
  isClaimable,
  isValidLicenseCode,
  LICENSE_ALPHABET,
  LICENSE_DEFAULTS,
  normalizeLicenseCode,
  reactivateLicense,
  refundLicense,
  revokeLicense,
  sealTrial,
  trialState,
  type License,
} from '../license';

const NOW = Date.UTC(2026, 0, 10, 12, 0, 0);

const license = (over: Partial<License> = {}): License => ({
  code: 'MRL-A2B3-C4D5',
  status: 'nueva',
  devices: [],
  createdAt: NOW,
  ...over,
});

describe('códigos de licencia (README § 4 · "Licencias")', () => {
  it('usa el formato MRL-XXXX-XXXX', () => {
    for (let i = 0; i < 200; i++) {
      expect(isValidLicenseCode(generateLicenseCode())).toBe(true);
    }
  });

  it('excluye caracteres ambiguos del alfabeto', () => {
    for (const ambiguo of ['I', 'L', 'O', '0', '1']) {
      expect(LICENSE_ALPHABET).not.toContain(ambiguo);
    }
    const muestra = Array.from({ length: 200 }, () => generateLicenseCode()).join('');
    expect(/[ILO01]/.test(muestra.replace(/MRL/g, ''))).toBe(false);
  });

  it('rechaza códigos mal formados', () => {
    expect(isValidLicenseCode('MRL-ABCD-EFG')).toBe(false);
    expect(isValidLicenseCode('MRL-ABCD-EFGI')).toBe(false); // I ambigua
    expect(isValidLicenseCode('XXX-ABCD-EFGH')).toBe(false);
    expect(isValidLicenseCode('')).toBe(false);
  });

  it('normaliza lo que el usuario teclea en Recuperar acceso', () => {
    expect(normalizeLicenseCode('mrl-a2b3-c4d5')).toBe('MRL-A2B3-C4D5');
    expect(normalizeLicenseCode('MRLA2B3C4D5')).toBe('MRL-A2B3-C4D5');
    expect(normalizeLicenseCode(' a2b3 c4d5 ')).toBe('MRL-A2B3-C4D5');
    expect(normalizeLicenseCode('no-es-un-codigo')).toBeNull();
    expect(normalizeLicenseCode('MRL-A2B3-C4D')).toBeNull();
  });

  it('genera códigos distintos', () => {
    const codes = new Set(Array.from({ length: 500 }, () => generateLicenseCode()));
    expect(codes.size).toBeGreaterThan(495);
  });

  it('permite inyectar el generador aleatorio para pruebas', () => {
    let n = 0;
    expect(generateLicenseCode(() => n++ % LICENSE_ALPHABET.length)).toBe('MRL-ABCD-EFGH');
  });
});

describe('activación y equipos', () => {
  it('registra el equipo y marca la licencia como activada', () => {
    const activada = activateLicense(license(), 'equipo-1', NOW);
    expect(activada.status).toBe('activada');
    expect(activada.devices).toEqual(['equipo-1']);
    expect(activada.activatedAt).toBe(NOW);
    expect(grantsAccess(activada)).toBe(true);
  });

  it('no funciona en un cuarto equipo hasta liberar desde el panel', () => {
    let l = license({ status: 'activada', devices: ['a', 'b', 'c'] });
    expect(canActivate(l, 'd')).toEqual({ ok: false, error: 'limite-de-equipos' });
    expect(() => activateLicense(l, 'd', NOW)).toThrow('limite-de-equipos');

    l = freeDevices(l);
    expect(l.devices).toEqual([]);
    expect(canActivate(l, 'd')).toEqual({ ok: true });
    expect(activateLicense(l, 'd', NOW).devices).toEqual(['d']);
  });

  it('deja volver a un equipo que ya estaba registrado', () => {
    const l = license({ status: 'activada', devices: ['a', 'b', 'c'] });
    expect(canActivate(l, 'b')).toEqual({ ok: true });
    expect(activateLicense(l, 'b', NOW).devices).toEqual(['a', 'b', 'c']);
  });

  it('respeta un máximo de equipos configurable', () => {
    const l = license({ status: 'activada', devices: ['a'] });
    expect(canActivate(l, 'b', 1)).toEqual({ ok: false, error: 'limite-de-equipos' });
    expect(canActivate(l, 'b', 5)).toEqual({ ok: true });
    expect(LICENSE_DEFAULTS.maxDevices).toBe(3);
  });

  it('bloquea licencias revocadas y reembolsadas', () => {
    expect(canActivate(revokeLicense(license(), NOW), 'x')).toEqual({ ok: false, error: 'revocada' });
    expect(canActivate(refundLicense(license(), NOW), 'x')).toEqual({ ok: false, error: 'reembolsada' });
    expect(canActivate(undefined, 'x')).toEqual({ ok: false, error: 'no-existe' });
  });

  it('quita el acceso al revocar o reembolsar', () => {
    const activa = activateLicense(license(), 'a', NOW);
    expect(grantsAccess(revokeLicense(activa, NOW))).toBe(false);
    expect(grantsAccess(refundLicense(activa, NOW))).toBe(false);
  });

  it('reactiva devolviendo la licencia a su estado anterior', () => {
    const activa = activateLicense(license(), 'a', NOW);
    const reactivada = reactivateLicense(revokeLicense(activa, NOW));
    expect(reactivada.status).toBe('activada');
    expect(reactivada.revokedAt).toBeUndefined();
    expect(grantsAccess(reactivada)).toBe(true);

    // Sin equipos vuelve a "nueva", lista para reclamarse.
    expect(reactivateLicense(revokeLicense(license(), NOW)).status).toBe('nueva');
  });

  it('sólo reclama automáticamente licencias pagadas y sin equipos', () => {
    expect(isClaimable(license())).toBe(true);
    expect(isClaimable(license({ devices: ['a'] }))).toBe(false);
    expect(isClaimable(license({ status: 'activada', devices: ['a'] }))).toBe(false);
    expect(isClaimable(revokeLicense(license(), NOW))).toBe(false);
  });

  it('tiene un mensaje para cada error de activación', () => {
    for (const key of ['codigo-invalido', 'no-existe', 'revocada', 'reembolsada', 'limite-de-equipos'] as const) {
      expect(ACTIVATION_MESSAGES[key].length).toBeGreaterThan(10);
    }
  });
});

describe('prueba de 7 días (README § 1.12)', () => {
  it('arranca en el primer arranque y dura los días configurados', () => {
    const t = trialState(NOW, NOW);
    expect(t.days).toBe(7);
    expect(t.expiresAt).toBe(NOW + 7 * DAY_MS);
    expect(t.expired).toBe(false);
    expect(t.daysLeft).toBe(7);
  });

  it('cuenta los días que faltan', () => {
    expect(trialState(NOW, NOW + 3 * DAY_MS).daysLeft).toBe(4);
    expect(trialState(NOW, NOW + 6 * DAY_MS).daysLeft).toBe(1);
    expect(trialState(NOW, NOW + 6 * DAY_MS).label).toBe('Último día de prueba');
    expect(trialState(NOW, NOW + 2 * DAY_MS).label).toBe('Te quedan 5 días de prueba');
  });

  it('expira exactamente al cumplirse el plazo', () => {
    expect(trialState(NOW, NOW + 7 * DAY_MS - 1).expired).toBe(false);
    expect(trialState(NOW, NOW + 7 * DAY_MS).expired).toBe(true);
    expect(trialState(NOW, NOW + 30 * DAY_MS).daysLeft).toBe(0);
    expect(trialState(NOW, NOW + 7 * DAY_MS).label).toBe('Tu prueba terminó');
  });

  it('acepta un plazo configurado desde el panel', () => {
    expect(trialState(NOW, NOW + 7 * DAY_MS, 14).expired).toBe(false);
    expect(trialState(NOW, NOW + 4 * DAY_MS, 3).expired).toBe(true);
  });
});

describe('telemetría de demos (KPI del panel)', () => {
  it('sella la demo al cumplirse el plazo, no antes', () => {
    const t = { deviceId: 'a', startedAt: NOW };
    expect(sealTrial(t, NOW + 3 * DAY_MS).expiredAt).toBeUndefined();
    expect(sealTrial(t, NOW + 8 * DAY_MS).expiredAt).toBe(NOW + 7 * DAY_MS);
  });

  it('no vuelve a sellar una demo ya sellada', () => {
    const t = { deviceId: 'a', startedAt: NOW, expiredAt: NOW + DAY_MS };
    expect(sealTrial(t, NOW + 30 * DAY_MS).expiredAt).toBe(NOW + DAY_MS);
  });

  it('calcula demos iniciadas, concluidas, sin pago y conversión', () => {
    const m = demoMetrics([
      { deviceId: '1', startedAt: NOW, expiredAt: NOW + 7 * DAY_MS, converted: true },
      { deviceId: '2', startedAt: NOW, expiredAt: NOW + 7 * DAY_MS },
      { deviceId: '3', startedAt: NOW, expiredAt: NOW + 7 * DAY_MS },
      { deviceId: '4', startedAt: NOW },
    ]);
    expect(m).toEqual({ started: 4, finished: 3, finishedWithoutPaying: 2, conversionPct: 33 });
  });

  it('no divide entre cero sin demos concluidas', () => {
    expect(demoMetrics([{ deviceId: '1', startedAt: NOW }]).conversionPct).toBe(0);
    expect(demoMetrics([]).conversionPct).toBe(0);
  });
});
