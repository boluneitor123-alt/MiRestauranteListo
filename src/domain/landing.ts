/**
 * Lógica de la landing de venta (README § 12).
 *
 * Pura y probada: la urgencia que se apaga sola, el panel de ruta que sale del
 * diagnóstico de dos taps y la calculadora con margen fijo de 68%.
 */

import { breakeven, LANDING_MARGIN } from './finance';
import {
  LANDING_ROUTE,
  LAUNCH,
  STARTING_POINTS,
  TOTAL_STEPS,
  TYPICAL_INVESTMENT,
  type LandingStep,
} from '@/content/landing';

export interface RoutePanel {
  giro: string;
  /** "Tu ruta para abrir una taquería". */
  title: string;
  step: number;
  totalSteps: number;
  progressPct: number;
  /** Pasos ya cubiertos: se muestran palomeados y tachados. */
  covered: LandingStep[];
  /** Bloque de pasos saltados cuando ya busca o tiene local. */
  skippedNote: string | null;
  next: LandingStep;
  /** Los dos pasos que siguen al siguiente. */
  following: LandingStep[];
  /** "+N pasos más, en orden." */
  restLine: string;
  /** Franja de CTA que lee del diagnóstico. */
  ctaLine: string;
}

const ARTICLE: Record<string, string> = {
  Taquería: 'una taquería',
  Cafetería: 'una cafetería',
  'Food truck': 'un food truck',
  Restaurante: 'un restaurante',
  'Fonda / cocina económica': 'una fonda',
  Otro: 'tu negocio de comida',
};

/** Panel de ruta a partir del diagnóstico de dos taps. */
export function routePanel(giro: string, startingPointLabel: string): RoutePanel | null {
  const point = STARTING_POINTS.find((p) => p.label === startingPointLabel);
  if (!point) return null;

  const covered = LANDING_ROUTE.slice(0, point.nextIndex);
  const next = LANDING_ROUTE[point.nextIndex];
  const following = LANDING_ROUTE.slice(point.nextIndex + 1, point.nextIndex + 3);
  const rest = TOTAL_STEPS - (point.nextIndex + 3);

  return {
    giro,
    title: `Tu ruta para abrir ${ARTICLE[giro] ?? 'tu negocio de comida'}`,
    step: point.step,
    totalSteps: TOTAL_STEPS,
    progressPct: (point.step / TOTAL_STEPS) * 100,
    covered,
    skippedNote: point.skipped
      ? `Hay ${point.nextIndex} pasos que van antes de buscar local: los tienes en tu ruta para cerrarlos sin frenar la búsqueda.`
      : null,
    next,
    following,
    restLine: rest > 0 ? `+${rest} pasos más, en orden.` : '',
    ctaLine: `Vas en el paso ${point.step} de ${TOTAL_STEPS}. Los otros ${TOTAL_STEPS - point.step} ya están armados y en orden, esperándote.`,
  };
}

export interface CalculatorInput {
  rent: number;
  payroll: number;
  other: number;
  ticket: number;
  /** Meta del dueño: cuánto quiere ganar al mes. */
  goal?: number;
  closedOneDay?: boolean;
}

export interface CalculatorResult {
  fixedExpenses: number;
  dailySales: number;
  ticketsPerDay: number;
  monthlySales: number;
  goalDailySales: number;
  goalTicketsPerDay: number;
  goalMonthlySales: number;
  minutesBetweenCustomers: number;
  days: number;
  /** Cifras absurdas: nota neutral, nunca un error. */
  note: string | null;
  /** "Un mes de renta mal elegida te cuesta $X". */
  rentCost: number;
  /** El precio como porcentaje de la inversión típica. */
  pricePctOfInvestment: string;
}

const ABSURD_FIXED = 5_000_000;

/** La landing calcula con margen bruto fijo de 68% (README § 4). */
export function calculate(input: CalculatorInput): CalculatorResult {
  const fixedExpenses = Math.max(0, (input.rent || 0) + (input.payroll || 0) + (input.other || 0));
  const result = breakeven({
    fixedExpenses,
    grossMargin: LANDING_MARGIN,
    ticket: input.ticket || 120,
    ownerGoal: input.goal ?? 0,
    hours: 8,
    closedOneDay: input.closedOneDay,
  });

  const note =
    fixedExpenses > ABSURD_FIXED
      ? 'Con gastos fijos de ese tamaño, esta calculadora se queda corta: escríbenos y lo vemos contigo.'
      : fixedExpenses === 0
        ? 'Captura tu renta, tu nómina y tus otros gastos para ver cuánto tienes que vender.'
        : null;

  return {
    fixedExpenses,
    dailySales: result.dailySales,
    ticketsPerDay: result.ticketsPerDay,
    monthlySales: result.monthlySales,
    goalDailySales: result.goalDailySales,
    goalTicketsPerDay: result.goalTicketsPerDay,
    goalMonthlySales: result.goalMonthlySales,
    minutesBetweenCustomers: result.minutesBetweenCustomers,
    days: result.days,
    note,
    // Un mes de renta mal elegida cuesta la renta más lo que hay que vender para pagarla.
    rentCost: (input.rent || 0) / (LANDING_MARGIN / 100),
    pricePctOfInvestment: `${((LAUNCH.price / TYPICAL_INVESTMENT) * 100).toFixed(1)}%`,
  };
}
