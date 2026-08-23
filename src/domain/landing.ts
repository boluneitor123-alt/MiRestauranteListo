/**
 * Lógica de la landing de venta (README § 12).
 *
 * Pura y probada: la calculadora en vivo, con el margen bruto fijo del 68% y
 * los 26 días de venta al mes que usa el diseño.
 */

import { breakeven, LANDING_MARGIN } from './finance';
import { LAUNCH, TYPICAL_INVESTMENT } from '@/content/landing';

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
  /** Un cliente cada N minutos sólo para no perder: el par de `ticketsPerDay`. */
  minutesBetweenCustomersAtBreakeven: number;
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
    minutesBetweenCustomersAtBreakeven: result.minutesBetweenCustomersAtBreakeven,
    days: result.days,
    note,
    // Un mes de renta mal elegida cuesta la renta más lo que hay que vender para pagarla.
    rentCost: (input.rent || 0) / (LANDING_MARGIN / 100),
    pricePctOfInvestment: `${((LAUNCH.price / TYPICAL_INVESTMENT) * 100).toFixed(1)}%`,
  };
}
