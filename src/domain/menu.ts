/**
 * Ingeniería de menú y sugerencia de distribución de carta (README § 4).
 */

import { dishMetrics, type CostingContext, EMPTY_CONTEXT } from './costing';
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
