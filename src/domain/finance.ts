/**
 * Inversión, gastos fijos y punto de equilibrio (README § 4).
 */

/** Un concepto del presupuesto de apertura o de los gastos fijos. */
export interface Concept {
  key: string;
  label: string;
  amount: number;
  /** Concepto agregado por el usuario (se puede eliminar). */
  custom?: boolean;
}

/** Desglose de un concepto del presupuesto de apertura. */
export interface Subconcept {
  id: string;
  label: string;
  amount: number;
}

/**
 * Total de un concepto: si tiene subconceptos, manda la suma de ellos y el
 * input directo se oculta en la UI.
 */
export function conceptTotal(amount: number, subconcepts: readonly Subconcept[] = []): number {
  if (subconcepts.length) return subconcepts.reduce((a, s) => a + (s.amount || 0), 0);
  return amount || 0;
}

export function hasSubconcepts(subconcepts: readonly Subconcept[] | undefined): boolean {
  return !!subconcepts && subconcepts.length > 0;
}

export interface InvestmentInput {
  concepts: readonly Concept[];
  /** Subconceptos por clave de concepto. */
  subconcepts?: Readonly<Record<string, Subconcept[]>>;
  /** Presupuesto tope declarado por el usuario. */
  budgetCap?: number;
}

export interface InvestmentResult {
  /** Total estimado de inversión. */
  total: number;
  /** Total por concepto, ya resuelto con subconceptos. */
  byConcept: Array<{ key: string; label: string; total: number; breakdown: Subconcept[] }>;
  budgetCap: number;
  /** presupuestoTope − inversión. Negativa ⇒ estado de exceso. */
  difference: number;
  exceeded: boolean;
  /** Avance de la barra contra el presupuesto, 0–100. */
  usedPct: number;
  /** 10% del total sugerido como fondo de emergencia. */
  suggestedEmergencyFund: number;
}

export function investment(input: InvestmentInput): InvestmentResult {
  const subs = input.subconcepts ?? {};
  const byConcept = input.concepts.map((c) => {
    const breakdown = subs[c.key] ?? [];
    return { key: c.key, label: c.label, total: conceptTotal(c.amount, breakdown), breakdown };
  });
  const total = byConcept.reduce((a, c) => a + c.total, 0);
  const budgetCap = input.budgetCap || 0;
  const difference = budgetCap - total;

  return {
    total,
    byConcept,
    budgetCap,
    difference,
    exceeded: budgetCap > 0 && difference < 0,
    usedPct: budgetCap > 0 ? Math.min(100, (total / budgetCap) * 100) : 0,
    suggestedEmergencyFund: total * 0.1,
  };
}

/** Suma de gastos fijos mensuales. */
export function fixedExpensesTotal(concepts: readonly Concept[]): number {
  return concepts.reduce((a, c) => a + (c.amount || 0), 0);
}

export const DAYS_FULL_MONTH = 30;
export const DAYS_WITH_REST_DAY = 26;

/** Valores por defecto del módulo de punto de equilibrio. */
export const BREAKEVEN_DEFAULTS = {
  ownerGoal: 25000,
  hours: 8,
  ticket: 120,
  grossMargin: 68,
};

/** La landing calcula con margen fijo de 68%. */
export const LANDING_MARGIN = 68;

export interface BreakevenInput {
  /** Gastos fijos del mes. */
  fixedExpenses: number;
  /** Margen bruto %, 40–85 en la app. */
  grossMargin: number;
  /** Ticket promedio, 80–400 en la app. */
  ticket: number;
  /** ¿Cuánto quieres ganar tú al mes? */
  ownerGoal?: number;
  /** Horas de operación al día. */
  hours?: number;
  /** "Cierro un día a la semana" ⇒ 26 días de venta. */
  closedOneDay?: boolean;
}

export interface BreakevenResult {
  /** Días de venta al mes: 30, o 26 si cierra un día a la semana. */
  days: number;
  /** Gastos fijos repartidos entre los días del mes. */
  fixedPerDay: number;
  /** Para no perder. */
  monthlySales: number;
  dailySales: number;
  ticketsPerDay: number;
  /** Para ganar la meta del dueño. */
  goalMonthlySales: number;
  goalDailySales: number;
  goalTicketsPerDay: number;
  /** Un cliente cada N minutos para llegar a la meta, en el turno declarado. */
  minutesBetweenCustomers: number;
  /**
   * Un cliente cada N minutos sólo para no perder. Es el que acompaña a
   * `ticketsPerDay`: mezclarlos dice que 17 tickets salen a uno cada 20
   * minutos, cuando salen a uno cada 28.
   */
  minutesBetweenCustomersAtBreakeven: number;
  /** Venta diaria de equilibrio con 30 y con 26 días (para la nota del toggle). */
  dailyAt30Days: number;
  dailyAt26Days: number;
}

/**
 *   ventaMensual  = gastosFijos / (margenBruto/100)
 *   ventaDiaria   = ventaMensual / días
 *   ticketsPorDía = ceil(ventaDiaria / ticketPromedio)
 *
 * La meta del dueño entra como gasto fijo adicional: lo que quiere ganar tiene
 * que salir del mismo margen.
 */
export function breakeven(input: BreakevenInput): BreakevenResult {
  const margin = Math.max(1, input.grossMargin || BREAKEVEN_DEFAULTS.grossMargin) / 100;
  const ticket = Math.max(1, input.ticket || BREAKEVEN_DEFAULTS.ticket);
  const days = input.closedOneDay ? DAYS_WITH_REST_DAY : DAYS_FULL_MONTH;
  const hours = Math.max(1, input.hours ?? BREAKEVEN_DEFAULTS.hours);
  const fixed = Math.max(0, input.fixedExpenses || 0);
  const goal = Math.max(0, input.ownerGoal ?? 0);

  const monthlySales = fixed / margin;
  const dailySales = monthlySales / days;
  const goalMonthlySales = (fixed + goal) / margin;
  const goalDailySales = goalMonthlySales / days;
  const goalTicketsPerDay = Math.ceil(goalDailySales / ticket);

  return {
    days,
    fixedPerDay: fixed / DAYS_FULL_MONTH,
    monthlySales,
    dailySales,
    ticketsPerDay: Math.ceil(dailySales / ticket),
    goalMonthlySales,
    goalDailySales,
    goalTicketsPerDay,
    minutesBetweenCustomers: Math.max(1, Math.round((hours * 60) / (goalTicketsPerDay || 1))),
    minutesBetweenCustomersAtBreakeven: Math.max(
      1,
      Math.round((hours * 60) / (Math.ceil(dailySales / ticket) || 1)),
    ),
    dailyAt30Days: fixed / margin / DAYS_FULL_MONTH,
    dailyAt26Days: fixed / margin / DAYS_WITH_REST_DAY,
  };
}

/** Escenarios de venta del resumen financiero imprimible (README § 9). */
export const SALES_SCENARIOS = [
  { key: 'equilibrio', label: 'Punto de equilibrio', delta: 0 },
  { key: 'menos15', label: 'Venta 15% abajo', delta: -0.15 },
  { key: 'mas15', label: 'Venta 15% arriba', delta: 0.15 },
  { key: 'mas35', label: 'Venta 35% arriba', delta: 0.35 },
] as const;

export interface Scenario {
  key: string;
  label: string;
  monthlySales: number;
  dailySales: number;
  customersPerDay: number;
  /** Utilidad estimada: venta × margen − gastos fijos. */
  estimatedProfit: number;
}

export function salesScenarios(result: BreakevenResult, input: BreakevenInput): Scenario[] {
  const margin = Math.max(1, input.grossMargin || BREAKEVEN_DEFAULTS.grossMargin) / 100;
  const ticket = Math.max(1, input.ticket || BREAKEVEN_DEFAULTS.ticket);
  const fixed = Math.max(0, input.fixedExpenses || 0);

  return SALES_SCENARIOS.map((s) => {
    const monthlySales = result.monthlySales * (1 + s.delta);
    const dailySales = monthlySales / result.days;
    return {
      key: s.key,
      label: s.label,
      monthlySales,
      dailySales,
      customersPerDay: Math.ceil(dailySales / ticket),
      estimatedProfit: monthlySales * margin - fixed,
    };
  });
}
