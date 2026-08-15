import type { UnitCode } from './units';

/** Secciones de la carta, en el orden en que se imprimen. */
export const MENU_SECTIONS = ['Entradas', 'Fuertes', 'Bebidas', 'Postres'] as const;
export type MenuSection = (typeof MENU_SECTIONS)[number];

/** Popularidad declarada por el usuario ("Qué tanto se vende"). */
export type Popularity = 'alta' | 'media' | 'baja';

export const POPULARITY_LABELS: Record<Popularity, string> = {
  alta: 'Se vende mucho',
  media: 'Se vende normal',
  baja: 'Se vende poco',
};

/**
 * Ingrediente de un platillo o de una sub-receta.
 *
 * Hay tres formas de conocer su precio, en orden de prioridad:
 * 1. `subrecipeId` — el costo sale de la receta base por lote.
 * 2. `buyPrice` + `buyQty` (+ `buyUnit`) — lo que el usuario paga en la compra.
 * 3. `unitPrice` — precio unitario capturado directo (datos de ejemplo e importaciones).
 */
export interface Ingredient {
  id: string;
  name: string;
  /** Cantidad que usas en la receta. */
  qty: number;
  /** Unidad de medida de la receta. */
  unit: UnitCode;
  /** Precio que pagas por la compra ($). */
  buyPrice?: number;
  /** Cantidad que viene en esa compra. */
  buyQty?: number;
  /** Unidad de medida de la compra. */
  buyUnit?: UnitCode;
  /** Precio por unidad de uso, ya sin merma, cuando no hay datos de compra. */
  unitPrice?: number;
  /** Merma: lo que se desperdicia al limpiar (%). Se topa a 90%. */
  waste?: number;
  /** Referencia a una sub-receta por lote. */
  subrecipeId?: string;
}

/** Sub-receta: se costea por lote (salsa, marinada, base). */
export interface Subrecipe {
  id: string;
  name: string;
  /** Cantidad que rinde el lote. */
  yieldQty: number;
  /** Unidad del lote. */
  unit: UnitCode;
  ingredients: Ingredient[];
}

/** Platillo del costeador. */
export interface Dish {
  id: string;
  name: string;
  /** Precio de venta capturado. 0 = "sin precio". */
  price: number;
  ingredients: Ingredient[];
  /** Porciones que rinde la receta. */
  portions?: number;
  /** Condimentos y varios (%) sobre el costo de ingredientes. */
  extrasPct?: number;
  /** Empaque por porción ($). */
  packaging?: number;
  /** Mano de obra por porción ($). */
  labor?: number;
  /** El precio capturado ya incluye IVA. */
  priceIncludesTax?: boolean;
  /** Comisión que cobra la app de delivery (%). */
  deliveryCommission?: number;
  section?: MenuSection;
  popularity?: Popularity;
}

/** Valores por defecto de un platillo, iguales a los del prototipo. */
export const DISH_DEFAULTS = {
  portions: 1,
  extrasPct: 3,
  packaging: 0,
  labor: 0,
  priceIncludesTax: true,
  deliveryCommission: 28,
  section: 'Fuertes' as MenuSection,
  popularity: 'media' as Popularity,
};

export type ResolvedDish = Dish & Required<Omit<typeof DISH_DEFAULTS, never>>;

/** Aplica los valores por defecto a un platillo parcialmente capturado. */
export function resolveDish(dish: Dish): ResolvedDish {
  return {
    ...DISH_DEFAULTS,
    ...dish,
    portions: dish.portions && dish.portions > 0 ? dish.portions : DISH_DEFAULTS.portions,
  };
}

/** IVA mexicano usado para separar el precio con y sin impuesto. */
export const IVA_RATE = 0.16;
export const IVA_FACTOR = 1 + IVA_RATE;
