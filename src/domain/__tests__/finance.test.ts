import { describe, expect, it } from 'vitest';
import {
  breakeven,
  conceptTotal,
  fixedExpensesTotal,
  investment,
  LANDING_MARGIN,
  salesScenarios,
  type Concept,
} from '../finance';
import { BUDGET_CONCEPTS, FIXED_CONCEPTS } from '@/content/catalog';

describe('presupuesto de apertura (README § 4 · "Inversión")', () => {
  it('suma los subconceptos en lugar del monto directo', () => {
    // Trastes y cubiertos → Platos $5,000, Cucharas $5,000, Sartenes $500.
    const subs = [
      { id: '1', label: 'Platos', amount: 5000 },
      { id: '2', label: 'Cucharas', amount: 5000 },
      { id: '3', label: 'Sartenes', amount: 500 },
    ];
    expect(conceptTotal(12000, subs)).toBe(10500);
    expect(conceptTotal(12000, [])).toBe(12000);
  });

  it('totaliza la inversión de los 13 conceptos base', () => {
    // $263,500: el mismo dato que la landing usa como inversión típica.
    const result = investment({ concepts: BUDGET_CONCEPTS });
    expect(BUDGET_CONCEPTS).toHaveLength(13);
    expect(result.total).toBe(263500);
  });

  it('marca el exceso cuando la inversión no cabe en el presupuesto', () => {
    const concepts: Concept[] = [{ key: 'a', label: 'Obra', amount: 300000 }];
    const result = investment({ concepts, budgetCap: 250000 });
    expect(result.difference).toBe(-50000);
    expect(result.exceeded).toBe(true);
    expect(result.usedPct).toBe(100);
  });

  it('deja diferencia positiva cuando sí cabe', () => {
    const concepts: Concept[] = [{ key: 'a', label: 'Obra', amount: 200000 }];
    const result = investment({ concepts, budgetCap: 250000 });
    expect(result.difference).toBe(50000);
    expect(result.exceeded).toBe(false);
    expect(result.usedPct).toBe(80);
  });

  it('sugiere 10% del total como fondo de emergencia', () => {
    const result = investment({ concepts: [{ key: 'a', label: 'Todo', amount: 250000 }] });
    expect(result.suggestedEmergencyFund).toBe(25000);
  });

  it('incluye los conceptos propios del usuario en el total', () => {
    const result = investment({
      concepts: [...BUDGET_CONCEPTS, { key: 'letrero', label: 'Letrero luminoso', amount: 12000, custom: true }],
      subconcepts: { cocina: [{ id: 's1', label: 'Plancha', amount: 20000 }] },
    });
    // La cocina pasa de $45,000 a $20,000 por sus subconceptos.
    expect(result.total).toBe(263500 - 45000 + 20000 + 12000);
    expect(result.byConcept.find((c) => c.key === 'cocina')?.total).toBe(20000);
  });
});

describe('punto de equilibrio (README § 4 y § 1.8)', () => {
  const fixed = fixedExpensesTotal(FIXED_CONCEPTS);

  it('suma los 10 gastos fijos base', () => {
    expect(FIXED_CONCEPTS).toHaveLength(10);
    expect(fixed).toBe(79800);
  });

  it('calcula venta mensual, diaria y tickets al día', () => {
    const r = breakeven({ fixedExpenses: fixed, grossMargin: 68, ticket: 120 });
    expect(r.days).toBe(30);
    expect(r.monthlySales).toBeCloseTo(117352.94, 2);
    expect(r.dailySales).toBeCloseTo(3911.76, 2);
    expect(r.ticketsPerDay).toBe(33);
  });

  it('usa el ejemplo de las preguntas frecuentes', () => {
    // "Si pagas $80,000 fijos y tu margen es 68%, necesitas vender ~$117,600."
    const r = breakeven({ fixedExpenses: 80000, grossMargin: 68, ticket: 120 });
    expect(Math.round(r.monthlySales)).toBe(117647);
  });

  it('reparte sobre 26 días cuando el negocio cierra un día a la semana', () => {
    const abierto = breakeven({ fixedExpenses: 80000, grossMargin: 68, ticket: 120 });
    const cerrado = breakeven({ fixedExpenses: 80000, grossMargin: 68, ticket: 120, closedOneDay: true });

    expect(cerrado.days).toBe(26);
    expect(cerrado.monthlySales).toBeCloseTo(abierto.monthlySales, 6);
    expect(cerrado.dailySales).toBeGreaterThan(abierto.dailySales);
    // La nota del toggle compara exactamente estos dos números.
    expect(cerrado.dailyAt30Days).toBeCloseTo(abierto.dailySales, 6);
    expect(cerrado.dailyAt26Days).toBeCloseTo(cerrado.dailySales, 6);
  });

  it('trata la meta del dueño como un gasto fijo más', () => {
    const r = breakeven({ fixedExpenses: 80000, grossMargin: 68, ticket: 120, ownerGoal: 25000 });
    expect(r.goalMonthlySales).toBeCloseTo(105000 / 0.68, 4);
    expect(r.goalDailySales).toBeCloseTo(105000 / 0.68 / 30, 4);
    expect(r.goalTicketsPerDay).toBe(Math.ceil(105000 / 0.68 / 30 / 120));
    expect(r.goalMonthlySales).toBeGreaterThan(r.monthlySales);
  });

  it('traduce los tickets a un cliente cada N minutos del turno', () => {
    const r = breakeven({ fixedExpenses: 80000, grossMargin: 68, ticket: 120, ownerGoal: 25000, hours: 8 });
    expect(r.minutesBetweenCustomers).toBe(Math.max(1, Math.round((8 * 60) / r.goalTicketsPerDay)));
    // Un turno más largo reparte a los mismos clientes en más minutos.
    const largo = breakeven({ fixedExpenses: 80000, grossMargin: 68, ticket: 120, ownerGoal: 25000, hours: 12 });
    expect(largo.minutesBetweenCustomers).toBeGreaterThan(r.minutesBetweenCustomers);
  });

  it('redondea los tickets hacia arriba: medio cliente no paga la renta', () => {
    const r = breakeven({ fixedExpenses: 3060, grossMargin: 68, ticket: 100 });
    expect(r.dailySales).toBeCloseTo(150, 6);
    expect(r.ticketsPerDay).toBe(2);
  });

  it('reparte los gastos fijos entre los días del mes', () => {
    const r = breakeven({ fixedExpenses: 79800, grossMargin: 68, ticket: 120 });
    expect(r.fixedPerDay).toBeCloseTo(2660, 6);
  });

  it('no explota con gastos fijos en cero ni con margen inválido', () => {
    const r = breakeven({ fixedExpenses: 0, grossMargin: 0, ticket: 0 });
    expect(Number.isFinite(r.monthlySales)).toBe(true);
    expect(r.monthlySales).toBe(0);
    expect(r.ticketsPerDay).toBe(0);
  });

  it('la landing calcula con margen fijo de 68%', () => {
    expect(LANDING_MARGIN).toBe(68);
    const landing = breakeven({ fixedExpenses: 45000, grossMargin: LANDING_MARGIN, ticket: 120 });
    expect(landing.monthlySales).toBeCloseTo(45000 / 0.68, 4);
  });
});

describe('escenarios de venta del resumen financiero (README § 9)', () => {
  const input = { fixedExpenses: 80000, grossMargin: 68, ticket: 120 };
  const scenarios = salesScenarios(breakeven(input), input);

  it('produce los cuatro escenarios documentados', () => {
    expect(scenarios.map((s) => s.key)).toEqual(['equilibrio', 'menos15', 'mas15', 'mas35']);
  });

  it('deja utilidad cero exactamente en el punto de equilibrio', () => {
    expect(scenarios[0].estimatedProfit).toBeCloseTo(0, 6);
  });

  it('pierde dinero 15% abajo y gana 15% arriba', () => {
    expect(scenarios[1].estimatedProfit).toBeLessThan(0);
    expect(scenarios[2].estimatedProfit).toBeGreaterThan(0);
    expect(scenarios[3].estimatedProfit).toBeGreaterThan(scenarios[2].estimatedProfit);
  });

  it('traduce cada escenario a clientes por día', () => {
    expect(scenarios[0].customersPerDay).toBe(Math.ceil(scenarios[0].dailySales / 120));
  });
});
