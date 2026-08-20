import { describe, expect, it } from 'vitest';
import {
  canCreateDish,
  canOpenRouteModule,
  capabilities,
  dishLimitNotice,
  resolveAccess,
  TRIAL_DISH_LIMIT,
} from '../access';
import { activateLicense, DAY_MS, refundLicense, revokeLicense, type License } from '../license';
import { ROUTE_MODULES } from '@/content/route';

const NOW = Date.UTC(2026, 0, 10);
const licencia = (over: Partial<License> = {}): License => ({
  code: 'MRL-A2B3-C4D5',
  status: 'nueva',
  devices: [],
  createdAt: NOW,
  ...over,
});

describe('prueba, bloqueo y activación (README § 1.12)', () => {
  it('empieza en prueba y pasa a bloqueo al vencer sin pago', () => {
    expect(resolveAccess({ trialStart: NOW, now: NOW }).level).toBe('prueba');
    expect(resolveAccess({ trialStart: NOW, now: NOW + 6 * DAY_MS }).level).toBe('prueba');
    expect(resolveAccess({ trialStart: NOW, now: NOW + 7 * DAY_MS }).level).toBe('bloqueado');
  });

  it('una licencia activada abre todo, aunque la prueba haya vencido', () => {
    const license = activateLicense(licencia(), 'equipo-1', NOW);
    const acceso = resolveAccess({ license, trialStart: NOW, now: NOW + 90 * DAY_MS });
    expect(acceso.level).toBe('licencia');
    expect(acceso.licensed).toBe(true);
  });

  it('revocar o reembolsar regresa al usuario a prueba en su siguiente arranque', () => {
    const activa = activateLicense(licencia(), 'equipo-1', NOW);

    const revocada = resolveAccess({ license: revokeLicense(activa, NOW), trialStart: NOW, now: NOW + DAY_MS });
    expect(revocada.level).toBe('prueba');

    const reembolsada = resolveAccess({ license: refundLicense(activa, NOW), trialStart: NOW, now: NOW + DAY_MS });
    expect(reembolsada.level).toBe('prueba');

    // Y si además la prueba ya venció, queda bloqueado.
    const vencida = resolveAccess({ license: revokeLicense(activa, NOW), trialStart: NOW, now: NOW + 10 * DAY_MS });
    expect(vencida.level).toBe('bloqueado');
  });

  it('una licencia sin activar todavía no da acceso', () => {
    expect(resolveAccess({ license: licencia(), trialStart: NOW, now: NOW + 10 * DAY_MS }).level).toBe('bloqueado');
  });
});

describe('alcance de la prueba', () => {
  const prueba = capabilities('prueba');

  it('abre Concepto y Local, y deja los otros 12 módulos detrás del pago', () => {
    expect(canOpenRouteModule('prueba', 'concepto')).toBe(true);
    expect(canOpenRouteModule('prueba', 'local')).toBe(true);

    const cerrados = ROUTE_MODULES.filter((m) => !canOpenRouteModule('prueba', m.id));
    expect(cerrados).toHaveLength(12);
  });

  it('permite costear hasta 3 platillos', () => {
    expect(TRIAL_DISH_LIMIT).toBe(3);
    expect(canCreateDish('prueba', 0)).toBe(true);
    expect(canCreateDish('prueba', 2)).toBe(true);
    expect(canCreateDish('prueba', 3)).toBe(false);
    expect(dishLimitNotice('prueba', 2)).toContain('queda 1');
    expect(dishLimitNotice('prueba', 3)).toContain('Desbloquea');
  });

  it('abre por completo punto de equilibrio y gastos fijos', () => {
    expect(prueba.breakeven).toBe(true);
    expect(prueba.fixedExpenses).toBe(true);
  });

  it('deja bloqueados presupuesto de apertura, Mi Menú y recursos', () => {
    expect(prueba.budget).toBe(false);
    expect(prueba.menu).toBe(false);
    expect(prueba.resources).toBe(false);
  });

  it('nunca filtra la cifra de inversión', () => {
    expect(prueba.showsInvestmentFigures).toBe(false);
    expect(capabilities('bloqueado').showsInvestmentFigures).toBe(false);
    expect(capabilities('licencia').showsInvestmentFigures).toBe(true);
  });
});

describe('bloqueo al expirar la prueba', () => {
  const bloqueado = capabilities('bloqueado');

  it('deja únicamente la pestaña Más', () => {
    expect(bloqueado.tabs).toEqual({ inicio: false, ruta: false, costeador: false, numeros: false, mas: true });
  });

  it('cierra todos los módulos de Mi Ruta', () => {
    expect(ROUTE_MODULES.every((m) => !canOpenRouteModule('bloqueado', m.id))).toBe(true);
  });

  it('no permite costear ni un platillo más', () => {
    expect(canCreateDish('bloqueado', 0)).toBe(false);
    expect(dishLimitNotice('bloqueado', 0)).toContain('Tu prueba terminó');
  });
});

describe('acceso con licencia', () => {
  const licenciado = capabilities('licencia');

  it('abre las cinco pestañas y todos los módulos', () => {
    expect(Object.values(licenciado.tabs).every(Boolean)).toBe(true);
    expect(licenciado.openRouteModules).toBe('todos');
    expect(ROUTE_MODULES.every((m) => canOpenRouteModule('licencia', m.id))).toBe(true);
  });

  it('quita el límite de platillos y abre menú, presupuesto y recursos', () => {
    expect(licenciado.dishLimit).toBeNull();
    expect(canCreateDish('licencia', 500)).toBe(true);
    expect(dishLimitNotice('licencia', 500)).toBeNull();
    expect(licenciado.menu).toBe(true);
    expect(licenciado.budget).toBe(true);
    expect(licenciado.resources).toBe(true);
    expect(licenciado.printableDocuments).toBe(true);
  });
});
