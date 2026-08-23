import { describe, expect, it } from 'vitest';
import { nivelDeEstres, survival, SURVIVAL_DEFAULTS, type SurvivalInput } from '../survival';
import { DEMO_DISHES, DEMO_SUBRECIPES } from '@/content/demo';

/**
 * Una fonda con los gastos fijos del proyecto de ejemplo ($80,000 al mes),
 * margen 68% y meta de $25,000. Venta objetivo = (80,000 + 25,000) / 0.68.
 */
const base: SurvivalInput = {
  monthlySales: 105000 / 0.68,
  fixedExpenses: 80000,
  rent: 22000,
  days: 30,
  marginPct: 68,
  ticket: 120,
  goalTicketsPerDay: 43,
  ownerGoal: 25000,
  investment: 263500,
  budgetCap: 250000,
  hoursPerDay: 8,
  weeklyHours: SURVIVAL_DEFAULTS.weeklyHours,
  prepMinutes: SURVIVAL_DEFAULTS.prepMinutes,
  dailyMix: SURVIVAL_DEFAULTS.dailyMix,
  dishes: DEMO_DISHES,
  costing: { subrecipes: DEMO_SUBRECIPES },
  stress: { supplies: 0, rent: 0, sales: 0 },
};

const con = (over: Partial<SurvivalInput> = {}): SurvivalInput => ({ ...base, ...over });

describe('rampa de venta de los primeros cuatro meses', () => {
  it('proyecta 40%, 65%, 85% y 100% de la venta', () => {
    const r = survival(con());
    expect(r.ramp.map((x) => x.pct)).toEqual([
      '40% de tu venta',
      '65% de tu venta',
      '85% de tu venta',
      '100% de tu venta',
    ]);
    // Venta objetivo ≈ $154,411.76
    expect(r.ramp[0].sales).toBeCloseTo(61764.71, 2);
    expect(r.ramp[3].sales).toBeCloseTo(154411.76, 2);
  });

  it('marca el mes en que el negocio ya se paga solo', () => {
    const r = survival(con());
    // Mes 1: 61,764.71 × 0.68 − 80,000 = −38,000
    expect(r.ramp[0].result).toBeCloseTo(-38000, 6);
    // Mes 2: 100,367.65 × 0.68 − 80,000 = −11,750
    expect(r.ramp[1].result).toBeCloseTo(-11750, 6);
    // Mes 3 ya sale positivo
    expect(r.ramp[2].result).toBeGreaterThan(0);
    expect(r.breakEvenMonth).toBe(3);
    expect(r.rampNote).toContain('A partir del mes 3 el negocio ya se paga solo');
  });

  it('suma la pérdida de los meses que todavía no llegan', () => {
    const r = survival(con());
    expect(r.hole).toBeCloseTo(49750, 6);
  });

  it('avisa cuando la cuenta no cierra ni al 100% de venta', () => {
    const r = survival(con({ monthlySales: 60000 }));
    expect(r.breakEvenMonth).toBe(0);
    expect(r.rampNote).toContain('todavía no cierra al 100% de venta');
  });
});

describe('el colchón para los meses de arranque', () => {
  it('resta la inversión del presupuesto y calcula lo que falta', () => {
    const r = survival(con());
    // 250,000 − 263,500 = −13,500 libres; el arranque pide 49,750
    expect(r.free).toBeCloseTo(-13500, 6);
    expect(r.gap).toBeCloseTo(63250, 6);
    expect(r.cards[0].ok).toBe(false);
    expect(r.cards[0].big).toBe('Por conseguir: $63,250');
  });

  it('usa el texto de inversión excedida cuando el presupuesto no alcanza', () => {
    const r = survival(con());
    expect(r.cards[0].note).toContain('Buena noticia: ya sabes tu número');
    expect(r.cards[0].note).toContain('$13,500 arriba del presupuesto');
  });

  it('usa el texto intermedio cuando queda algo libre pero no basta', () => {
    const r = survival(con({ budgetCap: 300000 }));
    expect(r.free).toBeCloseTo(36500, 6);
    expect(r.gap).toBeCloseTo(13250, 6);
    expect(r.cards[0].note).toContain('Vas bien encaminado');
  });

  it('dice "Vas cubierto" cuando alcanza', () => {
    const r = survival(con({ budgetCap: 400000 }));
    expect(r.gap).toBeLessThanOrEqual(0);
    expect(r.cards[0].big).toBe('Vas cubierto');
    expect(r.cards[0].ok).toBe(true);
    expect(r.cards[0].note).toContain('Muy bien');
  });

  it('escribe la etiqueta del colchón en sus tres formas', () => {
    expect(survival(con()).cushionLabel).toBe('Colchón por armar: $49,750');
    expect(survival(con({ budgetCap: 300000 })).cushionLabel).toContain('meses de colchón');
    // Sin pérdida proyectada: la venta cubre los gastos desde el mes 1.
    expect(survival(con({ fixedExpenses: 10000 })).cushionLabel).toBe('Sin pérdida proyectada');
  });
});

describe('el sueldo real del dueño', () => {
  it('descuenta gastos fijos, comisión de tarjeta e impuestos', () => {
    const r = survival(con());
    // bruta 105,000 − fijos 80,000 − comisión (154,411.76 × 40% × 3.6% = 2,223.53)
    // = 22,776.47; menos 10% de impuestos = 20,498.82
    expect(r.ownerSalary).toBeCloseTo(20498.82, 2);
    expect(r.cards[1].big).toBe('$20,499 al mes');
    expect(r.cards[1].ok).toBe(true);
  });

  it('marca el sueldo como corto por debajo de $15,000', () => {
    const r = survival(con({ monthlySales: 120000 }));
    expect(r.ownerSalary).toBeLessThan(15000);
    expect(r.cards[1].ok).toBe(false);
  });

  it('reparte el sueldo entre las horas de la semana', () => {
    const r = survival(con());
    // 20,498.82 / (70 × 4.33) = 67.63
    expect(r.hourlyRate).toBeCloseTo(67.63, 2);
    expect(r.cards[2].ok).toBe(true);
    expect(r.cards[2].note).toContain('Con 70 horas a la semana');
  });

  it('sube el valor de la hora cuando el dueño trabaja menos', () => {
    const menos = survival(con({ weeklyHours: 40 }));
    expect(menos.hourlyRate).toBeGreaterThan(survival(con()).hourlyRate);
    expect(menos.cards[2].note).toContain('Con 40 horas a la semana');
  });

  it('calcula en cuántos meses vuelve la inversión', () => {
    const r = survival(con());
    // ceil(263,500 / 20,498.82) = 13
    expect(r.paybackMonths).toBe(13);
    expect(r.cards[3].big).toBe('Mes 13');
    expect(r.cards[3].ok).toBe(true);
  });

  it('no calcula el retorno cuando no hay sueldo', () => {
    const r = survival(con({ monthlySales: 60000 }));
    expect(r.ownerSalary).toBeLessThan(0);
    expect(r.paybackMonths).toBe(0);
    expect(r.cards[3].big).toBe('Aún por calcular');
    expect(r.cards[3].ok).toBe(false);
  });
});

describe('los cuatro números de operación', () => {
  it('reparte los gastos fijos entre las horas abiertas', () => {
    const r = survival(con());
    // 80,000 / (8 × 30) = 333.33
    expect(r.costPerOpenHour).toBeCloseTo(333.33, 2);
    expect(r.ops[0].value).toBe('$333');
    expect(r.ops[0].note).toContain('no vendes $667');
  });

  it('estima la compra de insumos con la mezcla diaria', () => {
    const r = survival(con());
    expect(r.monthlySupplies).toBeGreaterThan(0);
    expect(r.ops[3].label).toBe('Compra de insumos al mes');
  });

  it('saca la merma promedio de los ingredientes capturados', () => {
    const r = survival(con());
    // La carta de ejemplo sí trae merma: la que se promedia es la de los
    // ingredientes del platillo, no la de sus sub-recetas.
    expect(r.wastePct).toBeCloseTo(11.25, 6);
    expect(r.ops[1].value).not.toBe('Sin datos');
    expect(r.ops[1].note).toContain('11% promedio de merma');
  });

  it('lo dice sin rodeos cuando ningún platillo trae merma', () => {
    const sinMerma = DEMO_DISHES.map((d) => ({
      ...d,
      ingredients: d.ingredients.map(({ waste: _waste, ...i }) => i),
    }));
    const r = survival(con({ dishes: sinMerma }));
    expect(r.wastePct).toBe(0);
    expect(r.ops[1].value).toBe('Sin datos');
    expect(r.ops[1].note).toContain('Captura el porcentaje de merma');
  });

  it('cuenta la merma cuando el platillo sí la trae', () => {
    const conMerma = DEMO_DISHES.map((d) => ({
      ...d,
      ingredients: d.ingredients.map((i) => ({ ...i, waste: 10 })),
    }));
    const r = survival(con({ dishes: conMerma }));
    expect(r.wastePct).toBe(10);
    expect(r.monthlyWaste).toBeCloseTo(r.monthlySupplies * 0.1, 6);
    expect(r.ops[1].note).toContain('Es el 10% promedio de merma');
  });

  it('divide la utilidad del platillo promedio entre sus minutos', () => {
    const r = survival(con());
    expect(r.profitPerMinute).toBeCloseTo(r.averageDishProfit / 6, 6);
    expect(r.ops[2].note).toContain('tarda 6 minutos');
  });

  it('nunca divide entre cero minutos', () => {
    const r = survival(con({ prepMinutes: 0 }));
    expect(Number.isFinite(r.profitPerMinute)).toBe(true);
    expect(r.ops[2].note).toContain('tarda 1 minutos');
  });

  it('no truena sin platillos costeados', () => {
    const r = survival(con({ dishes: [] }));
    expect(r.monthlySupplies).toBe(0);
    expect(r.averageDishProfit).toBe(0);
    expect(r.profitPerMinute).toBe(0);
  });
});

describe('prueba de estrés', () => {
  it('está apagada mientras los tres supuestos estén en cero', () => {
    expect(survival(con()).stressOn).toBe(false);
  });

  it('se enciende con mover uno solo', () => {
    expect(survival(con({ stress: { supplies: 10, rent: 0, sales: 0 } })).stressOn).toBe(true);
  });

  it('un alza de insumos se come parte del margen', () => {
    const r = survival(con({ stress: { supplies: 20, rent: 0, sales: 0 } }));
    // margen 0.68 − (1 − 0.68) × 0.20 = 0.616
    // (80,000 + 25,000) / 0.616 = 170,454.55 → /30 /120 = 47.35 → 48 tickets
    expect(r.stressTicketsPerDay).toBe(48);
  });

  it('un alza de renta sube sólo la renta, no todo el gasto fijo', () => {
    const r = survival(con({ stress: { supplies: 0, rent: 30, sales: 0 } }));
    // fijos 80,000 + 22,000 × 30% = 86,600; (86,600 + 25,000) / 0.68 → 46 tickets
    expect(r.stressTicketsPerDay).toBe(46);
  });

  it('los tickets del escenario se comparan con los de hoy, no con otra base', () => {
    // Antes salían del punto de equilibrio pelón y se comparaban contra la
    // meta: el escenario parecía pedir MENOS tickets que la situación normal.
    const r = survival(con({ stress: { supplies: 20, rent: 0, sales: 0 } }));
    expect(r.stressTicketsPerDay).toBeGreaterThan(base.goalTicketsPerDay);
    expect(r.stressTicketsLine).toBe('De 43 a 48 tickets al día · +5');
  });

  it('avisa cuando el escenario no mueve los tickets', () => {
    const r = survival(con({ goalTicketsPerDay: 43, stress: { supplies: 0, rent: 0, sales: 0 } }));
    expect(r.stressTicketsPerDay).toBe(43);
    expect(r.stressTicketsLine).toBe('Seguirían siendo 43 tickets al día');
  });

  it('una caída de venta baja el sueldo del dueño', () => {
    const normal = survival(con());
    const r = survival(con({ stress: { supplies: 0, rent: 0, sales: 30 } }));
    expect(r.stressOwnerSalary).toBeLessThan(normal.ownerSalary);
    expect(r.stressNote).toMatch(/Aguanta bien|Ahí la cuenta queda/);
  });

  it('avisa cuando el escenario deja la cuenta corta', () => {
    const r = survival(con({ stress: { supplies: 30, rent: 30, sales: 30 } }));
    expect(r.stressOwnerSalary).toBeLessThan(0);
    expect(r.stressLevel).toBe('pierde');
    expect(r.stressNote).toContain('saberlo hoy es una ventaja');
  });
});

describe('los tres tramos del sueldo bajo estrés', () => {
  it('aguanta mientras quede arriba del 70% del sueldo de hoy', () => {
    const r = survival(con({ stress: { supplies: 5, rent: 0, sales: 0 } }));
    expect(r.stressSalaryRatio).toBeGreaterThanOrEqual(0.7);
    expect(r.stressLevel).toBe('aguanta');
    expect(r.stressNote).toContain('Aguanta bien');
  });

  it('aprieta cuando sigue en positivo pero cae más de 30%', () => {
    const r = survival(con({ stress: { supplies: 20, rent: 0, sales: 0 } }));
    expect(r.stressOwnerSalary).toBeGreaterThan(0);
    expect(r.stressSalaryRatio).toBeLessThan(0.7);
    expect(r.stressLevel).toBe('aprieta');
    expect(r.stressNote).toContain('El negocio sobrevive, pero tú dejas de cobrar como esperabas');
  });

  it('en el tramo de en medio dice cuánto baja el sueldo', () => {
    const r = survival(con({ stress: { supplies: 20, rent: 0, sales: 0 } }));
    const caida = Math.round((1 - r.stressSalaryRatio) * 100);
    expect(r.stressNote).toContain(`un ${caida}% menos`);
  });

  it('pierde en cuanto el sueldo se vuelve negativo', () => {
    expect(nivelDeEstres(20000, -1)).toBe('pierde');
    expect(nivelDeEstres(20000, 0)).toBe('pierde');
  });

  it('el tramo exacto del 70% todavía aguanta', () => {
    expect(nivelDeEstres(10000, 7000)).toBe('aguanta');
    expect(nivelDeEstres(10000, 6999)).toBe('aprieta');
  });

  it('sin sueldo de partida no hay contra qué comparar', () => {
    expect(nivelDeEstres(-5000, 1000)).toBe('aguanta');
  });

  it('el margen bajo estrés nunca cae por debajo de 5%', () => {
    const r = survival(con({ marginPct: 8, stress: { supplies: 100, rent: 0, sales: 0 } }));
    // 0.08 − 0.92 = negativo, se topa en 0.05
    expect(r.stressTicketsPerDay).toBe(Math.ceil((80000 + 25000) / 0.05 / 30 / 120));
  });
});
