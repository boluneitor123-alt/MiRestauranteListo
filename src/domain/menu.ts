/**
 * Ingeniería de menú y sugerencia de distribución de carta (README § 4).
 */

import { dishMetrics, type CostingContext, EMPTY_CONTEXT } from './costing';
import { money } from './format';
import { semaphoreLevel } from './semaphore';
import { MENU_SECTIONS, type Dish, type MenuSection, type Popularity, resolveDish } from './types';

export type MenuClass =
  | 'estrella'
  | 'vaca'
  | 'rompecabezas'
  | 'perro'
  | 'buen margen'
  | 'margen bajo'
  | 'margen justo'
  | 'sin precio';

export const MENU_CLASS_LABELS: Record<MenuClass, string> = {
  estrella: 'Estrella',
  vaca: 'Vaca lechera',
  rompecabezas: 'Rompecabezas',
  perro: 'Perro',
  'buen margen': 'Buen margen · define su popularidad',
  'margen bajo': 'Margen bajo · define su popularidad',
  'margen justo': 'Margen justo · revisar',
  'sin precio': 'Sin precio',
};

/**
 * Clasificación con el food cost **redondeado** y la popularidad declarada:
 *
 *              ≤30%            31–38%          >38%
 *  mucho    Estrella        Margen justo    Vaca lechera
 *  normal   Buen margen     Margen justo    Margen bajo
 *  poco     Rompecabezas    Margen justo    Perro
 */
export function classifyDish(foodCostRounded: number | null, popularity: Popularity): MenuClass {
  const level = semaphoreLevel(foodCostRounded);
  if (level === 'sin-precio') return 'sin precio';
  if (level === 'revisar') return 'margen justo';

  const healthy = level === 'saludable';
  if (popularity === 'alta') return healthy ? 'estrella' : 'vaca';
  if (popularity === 'baja') return healthy ? 'rompecabezas' : 'perro';
  return healthy ? 'buen margen' : 'margen bajo';
}

export interface ClassifiedDish {
  id: string;
  name: string;
  section: MenuSection;
  price: number;
  foodCost: number | null;
  grossProfit: number | null;
  popularity: Popularity;
  klass: MenuClass;
  /** Entra en el reparto de la carta: tiene precio y no es "perro". */
  keep: boolean;
}

export function classifyMenu(dishes: readonly Dish[], ctx: CostingContext = EMPTY_CONTEXT): ClassifiedDish[] {
  return dishes.map((dish) => {
    const d = resolveDish(dish);
    const m = dishMetrics(dish, ctx);
    const klass = classifyDish(m.foodCostRounded, d.popularity);
    return {
      id: d.id,
      name: d.name,
      section: d.section,
      price: m.price,
      foodCost: m.foodCostRounded,
      grossProfit: m.grossProfit,
      popularity: d.popularity,
      klass,
      keep: m.hasPrice && klass !== 'perro',
    };
  });
}

/* ─────────────────────────  Distribución de carta  ───────────────────────── */

export interface LayoutFormat {
  id: string;
  name: string;
  hint: string;
  panels: number;
  labels: string[];
}

export const LAYOUT_FORMATS: readonly LayoutFormat[] = [
  { id: 'p1', name: '1 hoja, 1 página', hint: 'Un solo lado impreso', panels: 1, labels: ['Página única'] },
  { id: 'p2', name: '1 hoja, 2 páginas', hint: 'Frente y vuelta', panels: 2, labels: ['Frente', 'Vuelta'] },
  {
    id: 'tri',
    name: 'Tríptico',
    hint: '1 hoja doblada en 3 paneles',
    panels: 3,
    labels: ['Panel 1 (portada interior)', 'Panel 2 (centro)', 'Panel 3'],
  },
  {
    id: 'book',
    name: '2 hojas tipo libro',
    hint: '4 páginas',
    panels: 4,
    labels: ['Página 1', 'Página 2', 'Página 3', 'Página 4'],
  },
];

export const DEFAULT_LAYOUT_ID = 'p2';

/** Capacidad por panel y mínimo sano para que la carta no se vea vacía. */
export const PANEL_CAPACITY = 8;
export const PANEL_MIN_HEALTHY = 3;

/** Orden de impresión de las secciones: los fuertes deciden la compra. */
const SECTION_ORDER: readonly MenuSection[] = ['Fuertes', 'Entradas', 'Bebidas', 'Postres'];

export interface PanelSection {
  section: MenuSection;
  /** La sección venía partida entre paneles ("(continúa)"). */
  continued: boolean;
  items: Array<ClassifiedDish & { featured: boolean }>;
}

export interface Panel {
  label: string;
  /** Panel 1 = zona de oro: aquí ve primero el cliente. */
  golden: boolean;
  used: number;
  sections: PanelSection[];
}

export interface MenuLayoutPlan {
  format: LayoutFormat;
  panels: Panel[];
  /** Platillos que entran en la carta. */
  placed: number;
  /** Platillos capturados en total. */
  totalDishes: number;
  capacity: number;
  excluded: ClassifiedDish[];
  withoutPrice: ClassifiedDish[];
  warnings: string[];
}

export function planMenuLayout(
  dishes: readonly Dish[],
  layoutId: string = DEFAULT_LAYOUT_ID,
  ctx: CostingContext = EMPTY_CONTEXT,
): MenuLayoutPlan {
  const format = LAYOUT_FORMATS.find((l) => l.id === layoutId) ?? LAYOUT_FORMATS[1];
  const classified = classifyMenu(dishes, ctx);
  const keep = classified.filter((d) => d.keep);
  const excluded = classified.filter((d) => d.klass === 'perro');
  const withoutPrice = classified.filter((d) => d.price <= 0);

  // Secciones en orden de impresión; dentro de cada una, por utilidad descendente.
  const bySection = SECTION_ORDER.map((section) => ({
    section,
    items: keep.filter((d) => d.section === section).sort((a, b) => (b.grossProfit ?? 0) - (a.grossProfit ?? 0)),
  })).filter((s) => s.items.length > 0);

  const panels: Panel[] = format.labels.slice(0, format.panels).map((label, i) => ({
    label,
    golden: i === 0,
    used: 0,
    sections: [],
  }));

  for (const sec of bySection) {
    let rest = sec.items.slice();
    let firstChunk = true;
    while (rest.length) {
      // Cada sección entra completa al primer panel donde quepa; si no cabe en
      // ninguno, se parte empezando por el panel menos ocupado.
      const target =
        panels.find((p) => p.used + rest.length <= PANEL_CAPACITY) ??
        panels.reduce((a, b) => (a.used <= b.used ? a : b));
      const room = Math.max(1, PANEL_CAPACITY - target.used);
      const chunk = rest.slice(0, room);
      rest = rest.slice(room);
      target.sections.push({
        section: sec.section,
        continued: !firstChunk || rest.length > 0,
        // El primer platillo de cada sección se destaca (es el de mayor utilidad).
        items: chunk.map((item, idx) => ({ ...item, featured: firstChunk && idx === 0 })),
      });
      target.used += chunk.length;
      firstChunk = false;
    }
  }

  const capacity = format.panels * PANEL_CAPACITY;
  const placed = keep.length;
  const warnings: string[] = [];

  if (!dishes.length) {
    warnings.push('Aún no tienes platillos costeados: costea al menos 6 para que la sugerencia tenga sentido.');
  }
  if (placed > capacity) {
    warnings.push(
      `Tu carta no cabe en ${format.name.toLowerCase()}: tienes ${placed} platillos y caben ${capacity}. ` +
        'Sube a un formato con más páginas o retira los platillos "perro".',
    );
  }
  if (placed && placed < format.panels * PANEL_MIN_HEALTHY) {
    warnings.push(
      `Te sobra espacio: con ${placed} platillos un formato más chico se ve más cuidado y cuesta menos imprimir.`,
    );
  }
  if (excluded.length) {
    warnings.push(
      `Deja fuera ${excluded.length} platillo(s) clasificados "perro": se venden poco y dejan poco.`,
    );
  }
  if (withoutPrice.length) {
    warnings.push(`${withoutPrice.length} platillo(s) sin precio no entran en el reparto.`);
  }

  return {
    format,
    panels,
    placed,
    totalDishes: dishes.length,
    capacity,
    excluded,
    withoutPrice,
    warnings,
  };
}

/** Reglas fijas que se muestran junto a la sugerencia de distribución. */
export const MENU_LAYOUT_RULES = [
  'Máximo 7 u 8 platillos por página: más opciones confunden y bajan el ticket.',
  'En la primera página o panel van los platos fuertes y tus estrellas: es donde se decide la compra.',
  'Sin columna de precios alineada: pon el precio junto al nombre para que no se compare a la baja.',
  'Un platillo por sección con recuadro o foto: dirige la venta al de mejor margen.',
] as const;

export { MENU_SECTIONS };

/* ───────────────────────────  Tu plan de acción  ──────────────────────────── */

/**
 * El plan de acción de Mi Menú (`menuMoney()` del prototipo).
 *
 * Toma la carta capturada, la proyecta sobre los platillos que esperas vender
 * al día y saca los cambios que mueven dinero, ordenados por cuánto mueve cada
 * uno. Cada cambio se puede aplicar de verdad sobre el platillo.
 */

/** Cuánto pesa cada popularidad al repartir los platillos del día. */
export const POPULARITY_WEIGHT: Record<Popularity, number> = { alta: 5, media: 3, baja: 1 };

/** Platillos al día sobre los que se proyecta, cuando el usuario no eligió. */
export const DEFAULT_DAILY_MIX = 100;

/** Las cuatro opciones de "Proyectado sobre" del prototipo. */
export const DAILY_MIX_OPTIONS = [60, 100, 150, 220] as const;

/** Días al mes con los que el prototipo proyecta la utilidad de la carta. */
export const DAYS_PER_MONTH = 30;

/** Arriba de este food cost, el platillo pide subir de precio. */
export const RAISE_PRICE_FC = 33;
/** Food cost al que queda después de subirle. */
export const RAISE_PRICE_TARGET_FC = 0.32;
/** El precio propuesto se redondea a múltiplos de esto. */
export const PRICE_STEP = 5;
/** Hasta este food cost el platillo es lo bastante rentable para empujarlo. */
export const PUSH_FC = 30;
/** Arriba de este food cost, y vendiéndose poco, el platillo estorba. */
export const DROP_FC = 40;
/** Una sugerencia se muestra sólo si mueve al menos esto al mes. */
export const MIN_ACTION_IMPACT = 100;
/** Cuántas sugerencias se muestran a la vez. */
export const MAX_ACTIONS = 5;

export type MenuActionKind = 'Subir precio' | 'Empujar en la carta' | 'Sacar de la carta';

export interface MenuAction {
  /** Identidad estable de la sugerencia: es la que se archiva. */
  key: string;
  kind: MenuActionKind;
  dishId: string;
  dishName: string;
  /** Cuánto dinero mueve al mes. */
  impact: number;
  title: string;
  body: string;
  /** Texto del botón que lo aplica. */
  cta: string;
  /** Precio propuesto. Sólo en "Subir precio". */
  targetPrice?: number;
}

export interface MenuMoney {
  /** Hay al menos un platillo con precio: sin eso no hay nada que proyectar. */
  ready: boolean;
  /** Platillos al día sobre los que se proyectó. */
  daily: number;
  /** Utilidad bruta al mes con la carta de hoy. */
  monthly: number;
  /** La misma utilidad si aplicas las sugerencias que se muestran. */
  monthlyAfter: number;
  /** La diferencia entre las dos. */
  upside: number;
  /**
   * Food cost de toda la carta, ponderado por lo que se vende (no promedio
   * simple): un platillo caro de producir importa poco si nadie lo pide.
   */
  weightedFoodCost: number;
  /** Las sugerencias vivas, de la que más mueve a la que menos. */
  actions: MenuAction[];
  /** Las que el usuario archivó con "No, gracias". */
  archived: MenuAction[];
}

/** Clave de una sugerencia: el tipo y el platillo. */
export const menuActionKey = (kind: MenuActionKind, dishId: string): string => `${kind}|${dishId}`;

export function menuMoney(
  dishes: readonly Dish[],
  ctx: CostingContext = EMPTY_CONTEXT,
  options: { daily?: number; ignored?: Record<string, boolean> } = {},
): MenuMoney {
  const daily = options.daily && options.daily > 0 ? options.daily : DEFAULT_DAILY_MIX;
  const ignored = options.ignored ?? {};

  const priced = dishes
    .map((dish) => ({ dish: resolveDish(dish), m: dishMetrics(dish, ctx) }))
    .filter((d) => d.m.hasPrice);

  if (!priced.length) {
    return {
      ready: false,
      daily,
      monthly: 0,
      monthlyAfter: 0,
      upside: 0,
      weightedFoodCost: 0,
      actions: [],
      archived: [],
    };
  }

  const weightSum = priced.reduce((a, d) => a + POPULARITY_WEIGHT[d.dish.popularity], 0) || 1;
  /** Piezas al día de un platillo, repartiendo el mix por popularidad. */
  const units = (popularity: Popularity) =>
    Math.max(1, Math.round((POPULARITY_WEIGHT[popularity] / weightSum) * daily));

  const perDay = priced.reduce((a, d) => a + units(d.dish.popularity) * (d.m.grossProfit ?? 0), 0);
  const monthly = perDay * DAYS_PER_MONTH;
  const soldCost = priced.reduce((a, d) => a + units(d.dish.popularity) * d.m.costPerPortion, 0);
  const soldNet = priced.reduce((a, d) => a + units(d.dish.popularity) * d.m.netPrice, 0);
  const weightedFoodCost = soldNet ? Math.round((soldCost / soldNet) * 100) : 0;
  const averageProfit = daily ? perDay / daily : 0;

  const all: MenuAction[] = [];
  for (const { dish, m } of priced) {
    const fc = m.foodCost ?? 0;
    const u = units(dish.popularity);
    const profit = m.grossProfit ?? 0;
    // Cuánto del precio de lista queda después del IVA: el precio propuesto se
    // captura como precio de lista, pero el food cost se mide sobre el neto.
    const netShare = m.netPrice / m.price;

    if (fc > RAISE_PRICE_FC) {
      const target =
        Math.ceil(m.costPerPortion / RAISE_PRICE_TARGET_FC / netShare / PRICE_STEP) * PRICE_STEP;
      if (target > m.price) {
        all.push({
          key: menuActionKey('Subir precio', dish.id),
          kind: 'Subir precio',
          dishId: dish.id,
          dishName: dish.name,
          impact: (target - m.price) * netShare * u * DAYS_PER_MONTH,
          targetPrice: target,
          title: `Sube ${dish.name} a ${money(target)}`,
          body:
            `Su insumo se lleva ${Math.round(fc)}% de lo que cobras. A ${money(target)} baja a 32% ` +
            `y sigue dentro de lo que cobra el mercado. Vende ${u} al día.`,
          cta: `Aplicar ${money(target)}`,
        });
      }
    }

    if (fc <= PUSH_FC && dish.popularity !== 'alta') {
      const starUnits = Math.round((POPULARITY_WEIGHT.alta / weightSum) * daily);
      const impact = (starUnits - u) * profit * DAYS_PER_MONTH;
      if (impact > 0) {
        all.push({
          key: menuActionKey('Empujar en la carta', dish.id),
          kind: 'Empujar en la carta',
          dishId: dish.id,
          dishName: dish.name,
          impact,
          title: `Destaca ${dish.name}`,
          body:
            `Deja ${money(profit)} por pieza y casi nadie lo pide. Súbelo al primer renglón de su ` +
            'sección y ponle recuadro: es tu platillo más rentable desaprovechado.',
          cta: 'Marcar como destacado',
        });
      }
    }

    if (fc > DROP_FC && dish.popularity === 'baja') {
      all.push({
        key: menuActionKey('Sacar de la carta', dish.id),
        kind: 'Sacar de la carta',
        dishId: dish.id,
        dishName: dish.name,
        impact: u * DAYS_PER_MONTH * Math.max(0, averageProfit - profit),
        title: `Saca ${dish.name}`,
        body:
          `Food cost de ${Math.round(fc)}% y casi no se vende: te obliga a comprar insumos que solo ` +
          'usa él, y lo que no se vende se convierte en merma. Si esas ventas se van a tus otros ' +
          'platillos, ganas más.',
        cta: 'Quitar del menú',
      });
    }
  }

  all.sort((a, b) => b.impact - a.impact);
  const worth = all.filter((a) => a.impact >= MIN_ACTION_IMPACT);
  const actions = worth.filter((a) => !ignored[a.key]).slice(0, MAX_ACTIONS);
  const archived = worth.filter((a) => ignored[a.key]);
  const upside = actions.reduce((a, x) => a + x.impact, 0);

  return {
    ready: true,
    daily,
    monthly,
    monthlyAfter: monthly + upside,
    upside,
    weightedFoodCost,
    actions,
    archived,
  };
}

/** Cómo queda la carta después de aplicar una sugerencia. */
export function applyMenuAction(dishes: readonly Dish[], action: MenuAction): Dish[] {
  if (action.kind === 'Sacar de la carta') return dishes.filter((d) => d.id !== action.dishId);
  return dishes.map((d) => {
    if (d.id !== action.dishId) return d;
    if (action.kind === 'Subir precio') return { ...d, price: action.targetPrice ?? d.price };
    return { ...d, star: true };
  });
}

/** El aviso que se muestra al aplicar una sugerencia. */
export function menuActionFlash(action: MenuAction): string {
  if (action.kind === 'Subir precio') return `${action.dishName} ahora cuesta ${money(action.targetPrice ?? 0)}`;
  if (action.kind === 'Empujar en la carta') return `${action.dishName} marcado para destacar en la carta`;
  return `${action.dishName} salió de tu carta`;
}
