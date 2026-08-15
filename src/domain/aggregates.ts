/**
 * Agregados del costeador y de Mi Menú (README § 4 · "Agregados").
 *
 * Regla única y no negociable: **los platillos sin precio (precio 0) siempre se
 * excluyen**. Si no queda ninguno, el agregado es `null` y la UI muestra "—".
 */

import { dishMetrics, type CostingContext, EMPTY_CONTEXT } from './costing';
import type { Dish } from './types';

export interface MenuAggregates {
  /** Platillos capturados, con o sin precio. */
  total: number;
  /** Platillos con precio (los únicos que entran a los promedios). */
  priced: number;
  /** Food cost promedio simple, %. */
  averageFoodCost: number | null;
  /** Food cost ponderado por precio, %. */
  weightedFoodCost: number | null;
  /** Precio promedio de venta. */
  averagePrice: number | null;
  /** Ticket promedio de la carta (mismo cálculo que el precio promedio). */
  averageTicket: number | null;
  /** Utilidad bruta promedio por platillo. */
  averageGrossProfit: number | null;
  /** Margen sugerido para el punto de equilibrio: 100 − food cost promedio. */
  suggestedMargin: number | null;
}

function mean(values: number[]): number | null {
  if (!values.length) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function menuAggregates(dishes: readonly Dish[], ctx: CostingContext = EMPTY_CONTEXT): MenuAggregates {
  const metrics = dishes.map((d) => dishMetrics(d, ctx));
  const priced = metrics.filter((m) => m.hasPrice);

  const foodCosts = priced.map((m) => m.foodCost as number);
  const netSales = priced.reduce((a, m) => a + m.netPrice, 0);
  const totalCost = priced.reduce((a, m) => a + m.costPerPortion, 0);
  const averageFoodCost = mean(foodCosts);

  return {
    total: dishes.length,
    priced: priced.length,
    averageFoodCost,
    weightedFoodCost: netSales > 0 ? (totalCost / netSales) * 100 : null,
    averagePrice: mean(priced.map((m) => m.price)),
    averageTicket: mean(priced.map((m) => m.price)),
    averageGrossProfit: mean(priced.map((m) => m.grossProfit as number)),
    suggestedMargin: averageFoodCost === null ? null : 100 - Math.round(averageFoodCost),
  };
}
