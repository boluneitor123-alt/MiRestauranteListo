/**
 * Costeo de ingredientes, sub-recetas y platillos (README § 4).
 *
 * Todo lo de este archivo es puro: entra un platillo capturado por el usuario y
 * sale un número. No lee estado global ni formatea nada.
 */

import { IVA_FACTOR, resolveDish, type Dish, type Ingredient, type Subrecipe } from './types';
import { sameFamily, unitFactor } from './units';

/** Tope de merma: arriba de 90% el precio unitario se dispararía al infinito. */
export const MAX_WASTE_PCT = 90;

export interface CostingContext {
  subrecipes: readonly Subrecipe[];
}

export const EMPTY_CONTEXT: CostingContext = { subrecipes: [] };

function findSubrecipe(ctx: CostingContext, id: string): Subrecipe | undefined {
  return ctx.subrecipes.find((s) => s.id === id);
}

/** Merma efectiva del ingrediente, acotada a [0, 90]%. */
export function effectiveWaste(waste: number | undefined): number {
  if (!Number.isFinite(waste) || !waste || waste <= 0) return 0;
  return Math.min(MAX_WASTE_PCT, waste);
}

/** Porcentaje aprovechable después de limpiar: "Te queda X% aprovechable". */
export function yieldPct(waste: number | undefined): number {
  return 1 - effectiveWaste(waste) / 100;
}

/**
 * Precio de una unidad de uso del ingrediente, ya con la merma aplicada.
 *
 *   precioBase      = precioCompra / (cantidadComprada × factor(unidadCompra))
 *   precioPorUnidad = mismaFamilia ? precioBase × factor(unidadUso)
 *                                  : precioCompra / cantidadComprada
 *   precioUnitario  = precioPorUnidad / (1 − merma/100)
 *
 * Cuando el ingrediente es una sub-receta, el precio sale del costo del lote y
 * la merma ya está contada dentro de los ingredientes de esa receta base.
 */
export function ingredientUnitPrice(
  ing: Ingredient,
  ctx: CostingContext = EMPTY_CONTEXT,
  visiting: ReadonlySet<string> = new Set(),
): number {
  if (ing.subrecipeId) {
    const sub = findSubrecipe(ctx, ing.subrecipeId);
    if (!sub || visiting.has(sub.id)) return 0;
    const perUnit = subrecipeUnitCost(sub, ctx, visiting);
    // factor(unidadUso) / factor(unidadLote), sólo si son de la misma familia.
    const conversion = sameFamily(ing.unit, sub.unit) ? unitFactor(ing.unit) / unitFactor(sub.unit) : 1;
    return perUnit * conversion;
  }

  let pricePerUsedUnit: number;
  if (ing.buyPrice && ing.buyQty) {
    const buyUnit = ing.buyUnit ?? ing.unit;
    const perBaseUnit = ing.buyPrice / (ing.buyQty * unitFactor(buyUnit));
    pricePerUsedUnit = sameFamily(buyUnit, ing.unit)
      ? perBaseUnit * unitFactor(ing.unit)
      : ing.buyPrice / ing.buyQty;
  } else {
    pricePerUsedUnit = ing.unitPrice ?? 0;
  }

  return pricePerUsedUnit / yieldPct(ing.waste);
}

/** Costo del ingrediente dentro de la receta: cantidad usada × precio unitario. */
export function ingredientCost(
  ing: Ingredient,
  ctx: CostingContext = EMPTY_CONTEXT,
  visiting: ReadonlySet<string> = new Set(),
): number {
  return (ing.qty || 0) * ingredientUnitPrice(ing, ctx, visiting);
}

/** Costo total del lote de una sub-receta: suma de sus ingredientes. */
export function subrecipeBatchCost(
  sub: Subrecipe,
  ctx: CostingContext = EMPTY_CONTEXT,
  visiting: ReadonlySet<string> = new Set(),
): number {
  // Guarda contra sub-recetas que se referencian entre sí.
  const next = new Set(visiting).add(sub.id);
  return sub.ingredients.reduce((total, ing) => total + ingredientCost(ing, ctx, next), 0);
}

/** Costo por unidad del lote (por ml, por g, por pz…). */
export function subrecipeUnitCost(
  sub: Subrecipe,
  ctx: CostingContext = EMPTY_CONTEXT,
  visiting: ReadonlySet<string> = new Set(),
): number {
  const yieldQty = sub.yieldQty > 0 ? sub.yieldQty : 1;
  return subrecipeBatchCost(sub, ctx, visiting) / yieldQty;
}

/** Costo de ingredientes por porción: Σ costoIngrediente / porciones. */
export function dishIngredientsCost(dish: Dish, ctx: CostingContext = EMPTY_CONTEXT): number {
  const d = resolveDish(dish);
  const total = d.ingredients.reduce((sum, ing) => sum + ingredientCost(ing, ctx), 0);
  return total / d.portions;
}

/**
 * Costo por porción:
 *   costoIngredientes × (1 + varios/100) + empaque + manoDeObra
 */
export function dishCostPerPortion(dish: Dish, ctx: CostingContext = EMPTY_CONTEXT): number {
  const d = resolveDish(dish);
  const ingredients = dishIngredientsCost(dish, ctx);
  return ingredients * (1 + (d.extrasPct || 0) / 100) + (d.packaging || 0) + (d.labor || 0);
}

/** Precio sin IVA: el food cost siempre se calcula sobre este. */
export function netPrice(dish: Dish): number {
  const d = resolveDish(dish);
  const price = d.price || 0;
  return d.priceIncludesTax ? price / IVA_FACTOR : price;
}

/**
 * Precio que necesitarías para alcanzar tu food cost objetivo.
 * Si el precio del platillo incluye IVA, el sugerido también lo incluye.
 */
export function suggestedPrice(costPerPortion: number, targetFoodCost: number, includesTax: boolean): number {
  if (targetFoodCost <= 0) return 0;
  return (costPerPortion / (targetFoodCost / 100)) * (includesTax ? IVA_FACTOR : 1);
}

/** Precio para apps de delivery: el sugerido absorbe la comisión de la app. */
export function deliveryPrice(basePrice: number, commissionPct: number): number {
  const commission = Math.min(99, Math.max(0, commissionPct || 0));
  return basePrice / (1 - commission / 100);
}

export interface DishMetrics {
  /** Costo de ingredientes por porción, antes de varios/empaque/mano de obra. */
  ingredientsCost: number;
  /** Costo por porción tal como lo sirves. */
  costPerPortion: number;
  /** Costo de "condimentos y varios" por porción. */
  extrasCost: number;
  /** Precio capturado. */
  price: number;
  /** Precio sin IVA. */
  netPrice: number;
  /** Tiene precio de venta definido. */
  hasPrice: boolean;
  /** Food cost %. `null` cuando no hay precio (la UI muestra "—"). */
  foodCost: number | null;
  /** Food cost redondeado: es el que se muestra y el que decide el semáforo. */
  foodCostRounded: number | null;
  /** Utilidad bruta por porción. `null` sin precio. */
  grossProfit: number | null;
  /** Margen bruto %. `null` sin precio. */
  grossMargin: number | null;
  /** Precio sugerido para el food cost objetivo. */
  suggestedPrice: number;
  /** Precio sugerido con la comisión de delivery encima. */
  deliveryPrice: number;
}

export interface DishMetricsOptions {
  /** Food cost objetivo del usuario (25 / 30 / 35). */
  targetFoodCost?: number;
}

export const FOOD_COST_TARGETS = [25, 30, 35] as const;
export const DEFAULT_FOOD_COST_TARGET = 30;

/** Cicla el food cost objetivo 25 → 30 → 35 → 25. */
export function nextFoodCostTarget(current: number): number {
  const i = FOOD_COST_TARGETS.indexOf(current as (typeof FOOD_COST_TARGETS)[number]);
  return FOOD_COST_TARGETS[(i + 1) % FOOD_COST_TARGETS.length];
}

/** Todas las cifras de un platillo, calculadas de una sola pasada. */
export function dishMetrics(
  dish: Dish,
  ctx: CostingContext = EMPTY_CONTEXT,
  options: DishMetricsOptions = {},
): DishMetrics {
  const d = resolveDish(dish);
  const target = options.targetFoodCost ?? DEFAULT_FOOD_COST_TARGET;

  const ingredientsCost = dishIngredientsCost(dish, ctx);
  const extrasCost = ingredientsCost * ((d.extrasPct || 0) / 100);
  const costPerPortion = ingredientsCost + extrasCost + (d.packaging || 0) + (d.labor || 0);
  const net = netPrice(dish);
  const hasPrice = (d.price || 0) > 0 && net > 0;

  const foodCost = hasPrice ? (costPerPortion / net) * 100 : null;
  const grossProfit = hasPrice ? net - costPerPortion : null;
  const suggested = suggestedPrice(costPerPortion, target, d.priceIncludesTax);

  return {
    ingredientsCost,
    extrasCost,
    costPerPortion,
    price: d.price || 0,
    netPrice: net,
    hasPrice,
    foodCost,
    foodCostRounded: foodCost === null ? null : Math.round(foodCost),
    grossProfit,
    grossMargin: hasPrice && grossProfit !== null ? (grossProfit / net) * 100 : null,
    suggestedPrice: suggested,
    deliveryPrice: deliveryPrice(suggested, d.deliveryCommission),
  };
}
