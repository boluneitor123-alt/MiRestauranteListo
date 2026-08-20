/**
 * Analizador de anuncios de Meta.
 *
 * Portado de `adDoctor()` del prototipo. Toma los cinco números que se ven en
 * el Administrador de anuncios y dice si el anuncio deja dinero.
 *
 * El número que decide es el costo real por cliente que llegó: mientras esté
 * por debajo de la utilidad que deja un cliente, el anuncio se paga solo.
 */

export interface AdsInput {
  /** Lo que llevas invertido. */
  spend: number;
  /** Días que lleva corriendo. Mínimo 1. */
  days: number;
  /** Cuántas personas lo vieron. */
  reach: number;
  /** Mensajes o clics que trajo. */
  results: number;
  /** De los que escribieron, cuántos llegaron al negocio. */
  visits: number;
  /** Ticket promedio del negocio. */
  ticket: number;
  /** Margen bruto, en porcentaje. */
  marginPct: number;
}

export type AdsBand = 'bien' | 'medio' | 'mal';

export interface AdsMetrics {
  /** Inversión diaria. */
  perDay: number;
  /** Costo por mensaje o clic. */
  costPerResult: number;
  /** Costo real por cliente que llegó. */
  costPerVisit: number;
  /** De los que lo vieron, qué porcentaje respondió. */
  showRate: number;
  /** De los que escribieron, qué porcentaje llegó. */
  closeRate: number;
  /** Venta que trajo el anuncio. */
  income: number;
  /** Utilidad menos la inversión. */
  profit: number;
  /** Venta entre inversión. */
  roas: number;
  /** Utilidad que deja un cliente. */
  profitPerCustomer: number;
  /** Hasta aquí conviene pagar por traer a alguien. */
  maxCostPerVisit: number;
  /** Hay datos suficientes para analizar. */
  hasData: boolean;
}

export function adsMetrics(input: AdsInput): AdsMetrics {
  const days = Math.max(1, input.days);
  const margin = input.marginPct / 100;

  const perDay = input.spend / days;
  const costPerResult = input.results ? input.spend / input.results : 0;
  const costPerVisit = input.visits ? input.spend / input.visits : 0;
  const showRate = input.reach ? (input.results / input.reach) * 100 : 0;
  const closeRate = input.results ? (input.visits / input.results) * 100 : 0;
  const income = input.visits * input.ticket;
  const profit = income * margin - input.spend;
  const roas = input.spend ? income / input.spend : 0;
  const profitPerCustomer = input.ticket * margin;

  return {
    perDay,
    costPerResult,
    costPerVisit,
    showRate,
    closeRate,
    income,
    profit,
    roas,
    profitPerCustomer,
    maxCostPerVisit: profitPerCustomer,
    hasData: input.spend > 0 && input.results > 0,
  };
}

/** Las cuatro bandas del diagnóstico, con el umbral de cada una. */
export function adsBands(m: AdsMetrics): {
  costPerResult: AdsBand;
  showRate: AdsBand;
  closeRate: AdsBand;
  costPerVisit: AdsBand;
} {
  return {
    costPerResult: m.costPerResult <= 25 ? 'bien' : m.costPerResult <= 40 ? 'medio' : 'mal',
    showRate: m.showRate >= 1.5 ? 'bien' : m.showRate >= 0.7 ? 'medio' : 'mal',
    closeRate: m.closeRate >= 30 ? 'bien' : m.closeRate >= 15 ? 'medio' : 'mal',
    costPerVisit:
      m.costPerVisit > 0 && m.costPerVisit < m.maxCostPerVisit * 0.5
        ? 'bien'
        : m.costPerVisit < m.maxCostPerVisit
          ? 'medio'
          : 'mal',
  };
}

export type AdsVerdictKind = 'sin-datos' | 'falta-visitas' | 'sirve' | 'no-sirve';

export function adsVerdict(input: AdsInput, m: AdsMetrics): AdsVerdictKind {
  if (!m.hasData) return 'sin-datos';
  if (!input.visits) return 'falta-visitas';
  return m.profit > 0 ? 'sirve' : 'no-sirve';
}

/**
 * Plan de inversión del primer mes. La base sale del 6% de tus gastos fijos
 * diarios, con un piso de $80 y redondeada a la decena.
 */
export function adsBudgetPlan(monthlyFixed: number): { base: number; week2: number; week34: number; month: number } {
  const base = Math.max(80, Math.round(((monthlyFixed / 30) * 0.06) / 10) * 10);
  return {
    base,
    week2: base * 2,
    week34: base * 2.4,
    month: base * 5 + base * 2 * 7 + base * 2.4 * 14,
  };
}
