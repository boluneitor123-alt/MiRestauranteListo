import { describe, expect, it } from 'vitest';
import { calculate, routePanel, urgency } from '../landing';
import { LANDING_ROUTE, LAUNCH, STARTING_POINTS, TOTAL_STEPS } from '@/content/landing';
import { ROUTE_MODULES } from '@/content/route';

const BEFORE = new Date('2026-09-01T10:00:00').getTime();
const AFTER = new Date('2026-10-01T10:00:00').getTime();

describe('barra de urgencia (README § 12.1)', () => {
  it('se muestra mientras haya fecha y cupo', () => {
    const u = urgency(BEFORE);
    expect(u.visible).toBe(true);
    expect(u.daysLeft).toBeGreaterThan(0);
    expect(u.spotsLabel).toBe('23 de 100 lugares');
  });

  it('desaparece sola cuando vence la fecha', () => {
    expect(urgency(AFTER).visible).toBe(false);
    expect(urgency(AFTER).daysLeft).toBe(0);
  });

  it('desaparece sola cuando se agota el cupo', () => {
    expect(urgency(BEFORE, { ...LAUNCH, spotsLeft: 0 }).visible).toBe(false);
  });

  it('mide el cupo tomado para la barra', () => {
    expect(urgency(BEFORE).spotsTakenPct).toBeCloseTo(77, 6);
    expect(urgency(BEFORE, { ...LAUNCH, spotsLeft: 100 }).spotsTakenPct).toBe(0);
  });

  it('habla en singular el último día', () => {
    const u = urgency(new Date('2026-09-15T10:00:00').getTime());
    expect(u.daysLeft).toBe(1);
    expect(u.label).toBe('último día');
  });
});

describe('panel de ruta del diagnóstico (README § 12.3)', () => {
  it('mapea cada punto de partida a su paso', () => {
    expect(STARTING_POINTS.map((p) => [p.label, p.step])).toEqual([
      ['Solo tengo la idea', 1],
      ['Ya sé qué voy a vender', 3],
      ['Estoy buscando local', 4],
      ['Ya tengo el local', 6],
    ]);
  });

  it('arma el panel de quien apenas tiene la idea', () => {
    const panel = routePanel('Taquería', 'Solo tengo la idea');
    expect(panel?.title).toBe('Tu ruta para abrir una taquería');
    expect(panel?.step).toBe(1);
    expect(panel?.covered).toHaveLength(0);
    expect(panel?.next.title).toBe('Define el tipo de negocio');
    expect(panel?.following).toHaveLength(2);
    expect(panel?.skippedNote).toBeNull();
    expect(panel?.restLine).toBe(`+${TOTAL_STEPS - 3} pasos más, en orden.`);
  });

  it('palomea los pasos ya cubiertos', () => {
    const panel = routePanel('Cafetería', 'Ya sé qué voy a vender');
    expect(panel?.covered.map((s) => s.title)).toEqual(['Define el tipo de negocio']);
    expect(panel?.next.title).toBe('Identifica a tu cliente ideal');
  });

  it('muestra el bloque de pasos saltados a quien ya busca o tiene local', () => {
    const buscando = routePanel('Restaurante', 'Estoy buscando local');
    expect(buscando?.skippedNote).toContain('Hay 2 pasos que van antes de buscar local');
    expect(buscando?.next.title).toBe('Crea tu propuesta de valor');

    const conLocal = routePanel('Fonda / cocina económica', 'Ya tengo el local');
    expect(conLocal?.step).toBe(6);
    expect(conLocal?.next.title).toBe('Define tu menú inicial');
    expect(conLocal?.skippedNote).not.toBeNull();
  });

  it('escribe la franja de CTA con el paso del diagnóstico', () => {
    expect(routePanel('Taquería', 'Ya tengo el local')?.ctaLine).toBe(
      'Vas en el paso 6 de 43. Los otros 37 ya están armados y en orden, esperándote.',
    );
  });

  it('no arma panel sin punto de partida', () => {
    expect(routePanel('Taquería', 'Otra cosa')).toBeNull();
  });

  it('usa los mismos textos que la app', () => {
    // Los pasos de la landing existen tal cual en la ruta del producto.
    const appTitles = new Set(ROUTE_MODULES.flatMap((m) => m.tasks.map((t) => t.title)));
    for (const step of LANDING_ROUTE) {
      expect(appTitles.has(step.title)).toBe(true);
    }
    const appTask = ROUTE_MODULES[0].tasks[0];
    expect(LANDING_ROUTE[0].instruction).toBe(appTask.next);
    expect(LANDING_ROUTE[0].why).toBe(appTask.why);
  });
});

describe('calculadora de la landing (README § 12.5)', () => {
  it('usa margen fijo de 68%', () => {
    const result = calculate({ rent: 20000, payroll: 30000, other: 10000, ticket: 120 });
    expect(result.fixedExpenses).toBe(60000);
    expect(result.monthlySales).toBeCloseTo(60000 / 0.68, 4);
    expect(result.dailySales).toBeCloseTo(60000 / 0.68 / 30, 4);
    expect(result.ticketsPerDay).toBe(Math.ceil(60000 / 0.68 / 30 / 120));
  });

  it('incluye la meta del dueño como segundo resultado', () => {
    const result = calculate({ rent: 20000, payroll: 30000, other: 10000, ticket: 120, goal: 25000 });
    expect(result.goalMonthlySales).toBeCloseTo(85000 / 0.68, 4);
    expect(result.goalDailySales).toBeGreaterThan(result.dailySales);
    expect(result.minutesBetweenCustomers).toBeGreaterThan(0);
  });

  it('recalcula sobre 26 días con el toggle de día de descanso', () => {
    const abierto = calculate({ rent: 20000, payroll: 0, other: 0, ticket: 120 });
    const cerrado = calculate({ rent: 20000, payroll: 0, other: 0, ticket: 120, closedOneDay: true });
    expect(cerrado.days).toBe(26);
    expect(cerrado.dailySales).toBeGreaterThan(abierto.dailySales);
  });

  it('da una nota neutral con cifras absurdas, no un error', () => {
    const result = calculate({ rent: 90_000_000, payroll: 0, other: 0, ticket: 120 });
    expect(result.note).toContain('se queda corta');
    expect(Number.isFinite(result.dailySales)).toBe(true);
  });

  it('invita a capturar cuando todavía no hay datos', () => {
    const result = calculate({ rent: 0, payroll: 0, other: 0, ticket: 120 });
    expect(result.note).toContain('Captura tu renta');
    expect(result.dailySales).toBe(0);
  });

  it('traduce la renta a lo que hay que vender para pagarla', () => {
    const result = calculate({ rent: 18000, payroll: 0, other: 0, ticket: 120 });
    expect(result.rentCost).toBeCloseTo(18000 / 0.68, 4);
  });

  it('calcula el precio como porcentaje de la inversión típica', () => {
    expect(calculate({ rent: 0, payroll: 0, other: 0, ticket: 120 }).pricePctOfInvestment).toBe('0.9%');
  });
});
