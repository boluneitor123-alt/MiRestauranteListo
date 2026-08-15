import { describe, expect, it } from 'vitest';
import {
  classifyDish,
  classifyMenu,
  LAYOUT_FORMATS,
  MENU_CLASS_LABELS,
  PANEL_CAPACITY,
  planMenuLayout,
  type MenuClass,
} from '../menu';
import { dishMetrics } from '../costing';
import type { Dish, MenuSection, Popularity } from '../types';

/** Platillo sintético con food cost exacto: precio sin IVA y sin varios. */
const dish = (
  id: string,
  foodCost: number,
  popularity: Popularity,
  section: MenuSection = 'Fuertes',
  price = 100,
): Dish => ({
  id,
  name: id,
  price,
  section,
  popularity,
  priceIncludesTax: false,
  extrasPct: 0,
  ingredients: [{ id: `${id}i`, name: 'Insumo', qty: 1, unit: 'pz', unitPrice: (price * foodCost) / 100 }],
});

describe('ingeniería de menú (README § 4 · tabla)', () => {
  it('reproduce la tabla completa de clasificación', () => {
    const tabla: Array<[Popularity, number, MenuClass]> = [
      ['alta', 25, 'estrella'],
      ['alta', 34, 'margen justo'],
      ['alta', 45, 'vaca'],
      ['media', 25, 'buen margen'],
      ['media', 34, 'margen justo'],
      ['media', 45, 'margen bajo'],
      ['baja', 25, 'rompecabezas'],
      ['baja', 34, 'margen justo'],
      ['baja', 45, 'perro'],
    ];
    for (const [pop, fc, expected] of tabla) {
      expect(classifyDish(fc, pop)).toBe(expected);
    }
  });

  it('respeta las fronteras exactas del semáforo', () => {
    expect(classifyDish(30, 'alta')).toBe('estrella');
    expect(classifyDish(31, 'alta')).toBe('margen justo');
    expect(classifyDish(38, 'baja')).toBe('margen justo');
    expect(classifyDish(39, 'baja')).toBe('perro');
  });

  it('clasifica como "Sin precio" cuando no hay precio', () => {
    expect(classifyDish(null, 'alta')).toBe('sin precio');
    expect(MENU_CLASS_LABELS['sin precio']).toBe('Sin precio');
  });

  it('nunca contradice el food cost mostrado', () => {
    // 30.4% se muestra "30%": la etiqueta tiene que leerse como saludable.
    const casi = dish('casi', 30.4, 'alta');
    const [clasificado] = classifyMenu([casi]);
    expect(dishMetrics(casi).foodCostRounded).toBe(30);
    expect(clasificado.klass).toBe('estrella');
  });

  it('marca como fuera de la carta a los "perro" y a los sin precio', () => {
    const result = classifyMenu([dish('perro', 45, 'baja'), dish('sin', 30, 'alta', 'Fuertes', 0)]);
    expect(result[0].keep).toBe(false);
    expect(result[1].keep).toBe(false);
    expect(result[1].klass).toBe('sin precio');
  });
});

describe('sugerencia de distribución de carta (README § 4)', () => {
  it('ofrece los cuatro formatos con su número de paneles', () => {
    expect(LAYOUT_FORMATS.map((l) => l.panels)).toEqual([1, 2, 3, 4]);
    expect(PANEL_CAPACITY).toBe(8);
  });

  it('pone la primera página como zona de oro', () => {
    const plan = planMenuLayout([dish('a', 25, 'alta')], 'tri');
    expect(plan.panels[0].golden).toBe(true);
    expect(plan.panels.slice(1).every((p) => !p.golden)).toBe(true);
  });

  it('ordena las secciones con los fuertes primero', () => {
    const dishes = [
      dish('postre', 25, 'alta', 'Postres'),
      dish('bebida', 25, 'alta', 'Bebidas'),
      dish('fuerte', 25, 'alta', 'Fuertes'),
      dish('entrada', 25, 'alta', 'Entradas'),
    ];
    const plan = planMenuLayout(dishes, 'p1');
    expect(plan.panels[0].sections.map((s) => s.section)).toEqual(['Fuertes', 'Entradas', 'Bebidas', 'Postres']);
  });

  it('ordena cada sección por utilidad descendente y destaca al primero', () => {
    const dishes = [
      dish('flojo', 45, 'alta', 'Fuertes', 100),
      dish('bueno', 20, 'alta', 'Fuertes', 300),
      dish('medio', 30, 'alta', 'Fuertes', 200),
    ];
    const plan = planMenuLayout(dishes, 'p1');
    const items = plan.panels[0].sections[0].items;
    expect(items.map((i) => i.id)).toEqual(['bueno', 'medio', 'flojo']);
    expect(items[0].featured).toBe(true);
    expect(items.slice(1).every((i) => !i.featured)).toBe(true);
  });

  it('mete cada sección completa en el primer panel donde quepa', () => {
    const fuertes = Array.from({ length: 5 }, (_, i) => dish(`f${i}`, 25, 'alta', 'Fuertes', 100 + i));
    const entradas = Array.from({ length: 5 }, (_, i) => dish(`e${i}`, 25, 'alta', 'Entradas', 100 + i));
    const plan = planMenuLayout([...fuertes, ...entradas], 'p2');

    expect(plan.panels[0].sections.map((s) => s.section)).toEqual(['Fuertes']);
    expect(plan.panels[1].sections.map((s) => s.section)).toEqual(['Entradas']);
    expect(plan.panels.every((p) => p.used <= PANEL_CAPACITY)).toBe(true);
  });

  it('parte una sección que no cabe y la marca como continuada', () => {
    const fuertes = Array.from({ length: 12 }, (_, i) => dish(`f${i}`, 25, 'alta', 'Fuertes', 100 + i));
    const plan = planMenuLayout(fuertes, 'p2');

    expect(plan.panels[0].used).toBe(8);
    expect(plan.panels[1].used).toBe(4);
    expect(plan.panels[0].sections[0].continued).toBe(true);
    expect(plan.panels[1].sections[0].continued).toBe(true);
    // Sólo el primer trozo destaca un platillo.
    expect(plan.panels[1].sections[0].items.some((i) => i.featured)).toBe(false);
  });

  it('excluye perros y platillos sin precio del reparto', () => {
    const dishes = [
      dish('estrella', 25, 'alta'),
      dish('perro', 45, 'baja'),
      dish('sin', 25, 'alta', 'Fuertes', 0),
    ];
    const plan = planMenuLayout(dishes, 'p2');

    expect(plan.placed).toBe(1);
    expect(plan.totalDishes).toBe(3);
    expect(plan.excluded.map((d) => d.id)).toEqual(['perro']);
    expect(plan.withoutPrice.map((d) => d.id)).toEqual(['sin']);
    expect(plan.warnings.some((w) => w.includes('"perro"'))).toBe(true);
    expect(plan.warnings.some((w) => w.includes('sin precio'))).toBe(true);
  });

  it('avisa cuando la carta no cabe en el formato elegido', () => {
    const dishes = Array.from({ length: 10 }, (_, i) => dish(`d${i}`, 25, 'alta', 'Fuertes', 100 + i));
    const plan = planMenuLayout(dishes, 'p1');
    expect(plan.capacity).toBe(8);
    expect(plan.warnings.some((w) => w.includes('no cabe'))).toBe(true);
    // Ningún platillo se pierde en silencio aunque el formato se desborde.
    const colocados = plan.panels.reduce((a, p) => a + p.used, 0);
    expect(colocados).toBe(10);
  });

  it('avisa cuando sobra espacio', () => {
    const plan = planMenuLayout([dish('a', 25, 'alta'), dish('b', 25, 'alta')], 'book');
    expect(plan.warnings.some((w) => w.includes('Te sobra espacio'))).toBe(true);
  });

  it('pide costear antes de sugerir con la carta vacía', () => {
    const plan = planMenuLayout([], 'p2');
    expect(plan.placed).toBe(0);
    expect(plan.warnings[0]).toContain('Aún no tienes platillos costeados');
  });
});
