import { describe, expect, it } from 'vitest';
import {
  classifyDish,
  classifyMenu,
  LAYOUT_FORMATS,
  MENU_CLASS_LABELS,
  PANEL_CAPACITY,
  planMenuLayout,
  applyMenuAction,
  menuActionFlash,
  menuActionKey,
  menuMoney,
  MAX_ACTIONS,
  LAYOUT_PRINT_GUIDES,
  menuPrintTag,
  MIN_ACTION_IMPACT,
  type MenuClass,
} from '../menu';
import { dishMetrics, EMPTY_CONTEXT } from '../costing';
import { money } from '../format';
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

describe('plan de acción de Mi Menú (menuMoney del prototipo)', () => {
  it('sin platillos con precio no hay nada que proyectar', () => {
    const m = menuMoney([]);
    expect(m.ready).toBe(false);
    expect(m.actions).toEqual([]);
  });

  it('reparte el mix por popularidad y proyecta la utilidad a 30 días', () => {
    // Dos platillos: uno de popularidad alta (peso 5) y uno media (peso 3).
    // Con 100 al día: 63 y 38 piezas, cada uno deja $70 y $70.
    const carta = [dish('a', 30, 'alta'), dish('b', 30, 'media')];
    const m = menuMoney(carta, EMPTY_CONTEXT, { daily: 100 });
    expect(m.ready).toBe(true);
    expect(m.daily).toBe(100);
    expect(m.weightedFoodCost).toBe(30);
    expect(m.monthly).toBe((63 + 38) * 70 * 30);
  });

  it('propone subir el precio cuando el insumo se lleva más del 33%', () => {
    const caro = dish('caro', 45, 'alta');
    const m = menuMoney([caro], EMPTY_CONTEXT, { daily: 100 });
    const accion = m.actions.find((a) => a.kind === 'Subir precio');
    // Insumo de $45 al 32% pide $140.63 → se redondea al múltiplo de 5 de arriba.
    expect(accion?.targetPrice).toBe(145);
    expect(accion?.title).toBe('Sube caro a $145');
    expect(accion?.cta).toBe('Aplicar $145');
    expect(accion?.impact).toBeGreaterThan(0);
  });

  it('propone empujar el platillo rentable que casi nadie pide', () => {
    const m = menuMoney([dish('rentable', 25, 'baja'), dish('otro', 25, 'alta')], EMPTY_CONTEXT, {
      daily: 100,
    });
    const accion = m.actions.find((a) => a.kind === 'Empujar en la carta');
    expect(accion?.title).toBe('Destaca rentable');
    expect(accion?.cta).toBe('Marcar como destacado');
  });

  it('propone sacar el platillo caro que casi no se vende', () => {
    // Sacarlo gana sobre subirle el precio cuando el resto de la carta deja
    // mucho más por pieza: esas ventas se van a los otros platillos.
    const carta = [dish('perro', 41, 'baja'), dish('estrella', 10, 'alta', 'Fuertes', 300)];
    const m = menuMoney(carta, EMPTY_CONTEXT, { daily: 100 });
    const accion = m.actions.find((a) => a.kind === 'Sacar de la carta');
    expect(accion?.title).toBe('Saca perro');
    expect(accion?.cta).toBe('Quitar del menú');
  });

  it('un platillo, una sola recomendación: gana la que mueve más dinero', () => {
    // "perro" cumple las dos reglas a la vez —food cost de 55% y venta baja—,
    // así que subirle el precio y sacarlo se disparan sobre el mismo platillo.
    const carta = [dish('perro', 55, 'baja'), dish('bueno', 25, 'alta')];
    const m = menuMoney(carta, EMPTY_CONTEXT, { daily: 100 });

    const delPerro = m.actions.filter((a) => a.dishId === 'perro');
    expect(delPerro.length).toBe(1);
    expect(delPerro[0].kind).toBe('Subir precio');

    // Y el potencial no cuenta dos veces al mismo platillo.
    expect(m.upside).toBeCloseTo(m.actions.reduce((a, x) => a + x.impact, 0), 6);
    expect(new Set(m.actions.map((a) => a.dishId)).size).toBe(m.actions.length);
  });

  it('ordena por dinero, corta en cinco y suma el potencial', () => {
    const carta = [
      dish('uno', 45, 'alta', 'Fuertes', 200),
      dish('dos', 45, 'alta', 'Fuertes', 150),
      dish('tres', 45, 'media', 'Fuertes', 120),
      dish('cuatro', 45, 'media', 'Fuertes', 110),
      dish('cinco', 45, 'baja', 'Fuertes', 100),
      dish('seis', 45, 'baja', 'Fuertes', 90),
    ];
    const m = menuMoney(carta, EMPTY_CONTEXT, { daily: 150 });
    expect(m.actions.length).toBe(MAX_ACTIONS);
    const impactos = m.actions.map((a) => a.impact);
    expect([...impactos].sort((a, b) => b - a)).toEqual(impactos);
    expect(m.upside).toBeCloseTo(impactos.reduce((a, b) => a + b, 0), 6);
    expect(m.monthlyAfter).toBeCloseTo(m.monthly + m.upside, 6);
  });

  it('archiva la sugerencia y la saca del potencial', () => {
    const carta = [dish('caro', 45, 'alta')];
    const abierto = menuMoney(carta, EMPTY_CONTEXT, { daily: 100 });
    const clave = abierto.actions[0].key;
    expect(clave).toBe(menuActionKey('Subir precio', 'caro'));

    const archivado = menuMoney(carta, EMPTY_CONTEXT, { daily: 100, ignored: { [clave]: true } });
    expect(archivado.actions).toEqual([]);
    expect(archivado.archived.map((a) => a.key)).toEqual([clave]);
    expect(archivado.upside).toBe(0);
    expect(archivado.monthlyAfter).toBe(archivado.monthly);
  });

  it('no muestra sugerencias que mueven menos de $100 al mes', () => {
    // Un solo platillo barato: subirle el precio mueve centavos al mes.
    const m = menuMoney([dish('mini', 34, 'baja', 'Bebidas', 5)], EMPTY_CONTEXT, { daily: 60 });
    expect(m.actions.every((a) => a.impact >= MIN_ACTION_IMPACT)).toBe(true);
  });

  it('aplicar el cambio deja la carta como el botón promete', () => {
    const carta = [
      dish('caro', 45, 'alta'),
      dish('perro', 41, 'baja'),
      dish('rentable', 25, 'baja'),
      dish('estrella', 10, 'alta', 'Fuertes', 300),
    ];
    const m = menuMoney(carta, EMPTY_CONTEXT, { daily: 100 });

    const subir = m.actions.find((a) => a.kind === 'Subir precio')!;
    expect(applyMenuAction(carta, subir).find((d) => d.id === 'caro')?.price).toBe(subir.targetPrice);
    expect(menuActionFlash(subir)).toBe(`caro ahora cuesta ${money(subir.targetPrice!)}`);

    const sacar = m.actions.find((a) => a.kind === 'Sacar de la carta')!;
    expect(applyMenuAction(carta, sacar).map((d) => d.id)).toEqual(['caro', 'rentable', 'estrella']);
    expect(menuActionFlash(sacar)).toBe('perro salió de tu carta');

    const empujar = m.actions.find((a) => a.kind === 'Empujar en la carta')!;
    expect(applyMenuAction(carta, empujar).find((d) => d.id === 'rentable')?.star).toBe(true);
    expect(menuActionFlash(empujar)).toBe('rentable marcado para destacar en la carta');
  });
});

describe('documento de la carta de menú', () => {
  it('trae guía de armado para los cuatro formatos', () => {
    for (const format of LAYOUT_FORMATS) {
      const guide = LAYOUT_PRINT_GUIDES[format.id];
      expect(guide, format.id).toBeDefined();
      expect(guide.steps.length).toBeGreaterThan(2);
      expect(guide.cols).toBeGreaterThan(0);
    }
  });

  it('etiqueta el primer platillo de cada sección y los que piden atención', () => {
    expect(menuPrintTag('estrella', true)).toBe('Destácalo con recuadro');
    expect(menuPrintTag('estrella', false)).toBe('Estrella');
    expect(menuPrintTag('vaca', false)).toBe('Revisa su costo');
    expect(menuPrintTag('rompecabezas', false)).toBe('Empújalo');
    expect(menuPrintTag('margen justo', false)).toBe('');
  });
});
