import { describe, expect, it } from 'vitest';
import { CAPACITY_DEFAULTS, kitchenCapacity, realityCheck, seatCapacity, TURNS_PER_DAY } from '../reality';
import { BENCH } from '@/content/giros';

const bench = BENCH['Taquería'];

/** Un proyecto que sale limpio en los cinco cruces. */
const sano = {
  capacity: { ordersPerHour: 30, peakHours: 4, seats: 40 },
  ticketsNeeded: 60,
  monthlySales: 300_000,
  // 7% de renta y 22% de nómina: dentro del rango de una taquería.
  rent: 21_000,
  payroll: 66_000,
  investment: 200_000,
  budgetCap: 250_000,
  giro: 'Taquería',
  bench,
};

describe('revisión de realidad', () => {
  it('cruza cinco cosas y las nombra siempre igual', () => {
    const r = realityCheck(sano);
    expect(r.rows.map((x) => x.id)).toEqual(['cocina', 'lugares', 'renta', 'nomina', 'inversion']);
  });

  it('con todo en rango no reporta nada por ajustar', () => {
    const r = realityCheck(sano);
    expect(r.bad).toBe(0);
    expect(r.rows.every((x) => x.ok)).toBe(true);
    expect(r.head).toBe('Tu negocio cuadra');
    expect(r.sub).toContain('5 cruces');
  });

  it('la capacidad es órdenes por hora × horas pico, y el aforo lugares × rotaciones', () => {
    expect(kitchenCapacity({ ordersPerHour: 30, peakHours: 4, seats: 0 })).toBe(120);
    expect(seatCapacity({ ordersPerHour: 0, peakHours: 0, seats: 40 })).toBe(40 * TURNS_PER_DAY);
    // Nunca da cero: con eso las lecturas dirían disparates.
    expect(kitchenCapacity({ ordersPerHour: 0, peakHours: 0, seats: 0 })).toBe(1);
    expect(seatCapacity({ ordersPerHour: 0, peakHours: 0, seats: 0 })).toBe(1);
  });

  it('marca la cocina cuando la venta que hace falta no cabe en el pico', () => {
    const r = realityCheck({ ...sano, ticketsNeeded: 500 });
    const cocina = r.rows.find((x) => x.id === 'cocina')!;
    expect(cocina.ok).toBe(false);
    expect(cocina.value).toBe('500 de 120 órdenes');
    expect(cocina.read).toContain('Es un tema de capacidad');
  });

  it('mide renta y nómina como porcentaje de la venta proyectada', () => {
    const r = realityCheck({ ...sano, rent: 30_000, payroll: 90_000 });
    expect(r.rows.find((x) => x.id === 'renta')!.value).toBe('10%');
    expect(r.rows.find((x) => x.id === 'nomina')!.value).toBe('30%');
  });

  it('avisa en gris cuando la renta se pasa por poco y en naranja cuando se pasa de más', () => {
    // El rango sano de una taquería llega a 9%; hasta 12% es "vigílalo".
    const porPoco = realityCheck({ ...sano, rent: 33_000 }).rows.find((x) => x.id === 'renta')!;
    expect(porPoco.ok).toBe(false);
    expect(porPoco.warn).toBe(true);

    const de_mas = realityCheck({ ...sano, rent: 60_000 }).rows.find((x) => x.id === 'renta')!;
    expect(de_mas.ok).toBe(false);
    expect(de_mas.warn).toBe(false);
  });

  it('compara la inversión contra el tope de presupuesto y dice por cuánto se pasa', () => {
    const r = realityCheck({ ...sano, investment: 320_000 });
    const fila = r.rows.find((x) => x.id === 'inversion')!;
    expect(fila.ok).toBe(false);
    expect(fila.read).toContain('$70,000 arriba');
  });

  it('cuenta los puntos por ajustar y adapta el titular', () => {
    // Sólo la inversión se sale: la cocina y el aforo siguen dando.
    expect(realityCheck({ ...sano, investment: 900_000 }).head).toBe('Hay un punto por ajustar');
    // 500 tickets rompen a la vez la cocina y el aforo.
    expect(realityCheck({ ...sano, ticketsNeeded: 500 }).head).toBe('Hay 2 puntos por ajustar');
    expect(realityCheck({ ...sano, ticketsNeeded: 500, investment: 900_000 }).head).toBe('Hay 3 puntos por ajustar');
  });

  it('no divide entre cero cuando todavía no hay venta proyectada', () => {
    const r = realityCheck({ ...sano, monthlySales: 0, rent: 10_000, payroll: 10_000 });
    expect(r.rows.find((x) => x.id === 'renta')!.value).toBe('1000000%');
    expect(Number.isFinite(r.bad)).toBe(true);
  });

  it('nombra el giro y sus rangos en la línea de referencia', () => {
    const r = realityCheck(sano);
    expect(r.benchLine).toContain('Taquería');
    expect(r.benchLine).toContain(`renta ${bench.renta[0]}-${bench.renta[1]}%`);
  });

  it('trae valores de arranque para la capacidad que nadie midió todavía', () => {
    expect(CAPACITY_DEFAULTS.ordersPerHour).toBeGreaterThan(0);
    expect(CAPACITY_DEFAULTS.peakHours).toBeGreaterThan(0);
    expect(CAPACITY_DEFAULTS.seats).toBeGreaterThan(0);
  });
});
