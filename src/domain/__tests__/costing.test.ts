import { describe, expect, it } from 'vitest';
import {
  deliveryPrice,
  dishCostPerPortion,
  dishIngredientsCost,
  dishMetrics,
  effectiveWaste,
  ingredientCost,
  ingredientUnitPrice,
  netPrice,
  nextFoodCostTarget,
  subrecipeBatchCost,
  subrecipeUnitCost,
  suggestedPrice,
  yieldPct,
  type CostingContext,
} from '../costing';
import type { Dish, Ingredient, Subrecipe } from '../types';
import { DEMO_DISHES, DEMO_SUBRECIPES } from '@/content/demo';

const ctx: CostingContext = { subrecipes: DEMO_SUBRECIPES as Subrecipe[] };

/*
 * La carta de ejemplo se busca por id, nunca por posición: la entrega puede
 * agregar platillos al inicio y eso no debe mover ninguna prueba.
 */
const demoDish = (id: string): Dish => {
  const d = (DEMO_DISHES as Dish[]).find((x) => x.id === id);
  if (!d) throw new Error(`No está el platillo de ejemplo ${id}`);
  return d;
};

const demoSubrecipe = (id: string): Subrecipe => {
  const s = (DEMO_SUBRECIPES as Subrecipe[]).find((x) => x.id === id);
  if (!s) throw new Error(`No está la sub-receta de ejemplo ${id}`);
  return s;
};

const ing = (over: Partial<Ingredient>): Ingredient => ({
  id: 'i',
  name: 'Insumo',
  qty: 1,
  unit: 'g',
  ...over,
});

describe('costo de un ingrediente (README § 4)', () => {
  it('convierte el precio de compra a la unidad de uso', () => {
    // Jitomate: $28 el kilo, se usa en gramos ⇒ $0.028 por gramo.
    const i = ing({ qty: 250, unit: 'g', buyUnit: 'kg', buyPrice: 28, buyQty: 1 });
    expect(ingredientUnitPrice(i)).toBeCloseTo(0.028, 6);
    expect(ingredientCost(i)).toBeCloseTo(7, 6);
  });

  it('aplica la merma sobre el precio por unidad', () => {
    // 10% de merma ⇒ sólo aprovechas el 90% de lo que compras.
    const i = ing({ qty: 1, unit: 'kg', buyUnit: 'kg', buyPrice: 28, buyQty: 1, waste: 10 });
    expect(ingredientUnitPrice(i)).toBeCloseTo(28 / 0.9, 6);
    expect(ingredientCost(i)).toBeCloseTo(31.1111, 4);
  });

  it('topa la merma a 90% para que el precio no se dispare', () => {
    expect(effectiveWaste(150)).toBe(90);
    expect(yieldPct(150)).toBeCloseTo(0.1, 10);
    const i = ing({ qty: 1, unit: 'kg', buyUnit: 'kg', buyPrice: 100, buyQty: 1, waste: 99 });
    expect(ingredientUnitPrice(i)).toBeCloseTo(1000, 6);
  });

  it('ignora mermas negativas o ausentes', () => {
    expect(effectiveWaste(undefined)).toBe(0);
    expect(effectiveWaste(-5)).toBe(0);
    expect(yieldPct(0)).toBe(1);
  });

  it('cae a "precio por unidad de compra" cuando las familias no coinciden', () => {
    // Compras por pieza (un pan) pero la receta pide gramos: no hay conversión
    // honesta, así que el precio unitario es el precio de la pieza.
    const i = ing({ qty: 2, unit: 'g', buyUnit: 'pz', buyPrice: 24, buyQty: 3 });
    expect(ingredientUnitPrice(i)).toBeCloseTo(8, 6);
    expect(ingredientCost(i)).toBeCloseTo(16, 6);
  });

  it('usa el precio unitario capturado directo cuando no hay datos de compra', () => {
    const i = ing({ qty: 70, unit: 'g', unitPrice: 0.09 });
    expect(ingredientCost(i)).toBeCloseTo(6.3, 6);
  });

  it('convierte compras grandes a unidades chicas de uso', () => {
    // $22 el litro de vinagre, la receta usa 700 ml.
    const i = ing({ qty: 700, unit: 'ml', buyUnit: 'l', buyPrice: 22, buyQty: 1 });
    expect(ingredientCost(i)).toBeCloseTo(15.4, 6);
  });
});

describe('sub-recetas por lote (README § 4 y § 1.7)', () => {
  const salsa = demoSubrecipe('sr1');

  it('costea el lote sumando sus ingredientes con merma', () => {
    // Valor exacto de la ficha del prototipo: "Lote $142.30 · $0.05 por ml".
    expect(subrecipeBatchCost(salsa, ctx)).toBeCloseTo(142.2953, 3);
    expect(subrecipeUnitCost(salsa, ctx)).toBeCloseTo(0.047432, 6);
    expect(salsa.yieldQty).toBe(3000);
    expect(salsa.ingredients).toHaveLength(4);
  });

  it('convierte el costo del lote a la unidad de uso del platillo', () => {
    // 15 ml de salsa dentro de un taco.
    const i = ing({ qty: 15, unit: 'ml', subrecipeId: 'sr1' });
    expect(ingredientUnitPrice(i, ctx)).toBeCloseTo(0.047432, 6);
    expect(ingredientCost(i, ctx)).toBeCloseTo(0.71148, 5);
  });

  it('escala cuando el lote y el uso están en unidades distintas de la misma familia', () => {
    // El lote rinde 3000 ml; si el platillo lo mide en litros, cuesta 1000× más.
    const porLitro = ing({ qty: 1, unit: 'l', subrecipeId: 'sr1' });
    expect(ingredientUnitPrice(porLitro, ctx)).toBeCloseTo(47.432, 3);
  });

  it('no cuesta nada si la sub-receta ya no existe', () => {
    expect(ingredientUnitPrice(ing({ subrecipeId: 'fantasma' }), ctx)).toBe(0);
  });

  it('no se cuelga con sub-recetas que se referencian entre sí', () => {
    const ciclicas: Subrecipe[] = [
      { id: 'a', name: 'A', yieldQty: 100, unit: 'ml', ingredients: [ing({ id: 'a1', qty: 10, unit: 'ml', subrecipeId: 'b' })] },
      { id: 'b', name: 'B', yieldQty: 100, unit: 'ml', ingredients: [ing({ id: 'b1', qty: 10, unit: 'ml', subrecipeId: 'a' })] },
    ];
    expect(subrecipeBatchCost(ciclicas[0], { subrecipes: ciclicas })).toBe(0);
  });
});

describe('costo y rentabilidad del platillo (README § 4)', () => {
  const taco = demoDish('d1');

  it('suma ingredientes, varios, empaque y mano de obra por porción', () => {
    expect(dishIngredientsCost(taco)).toBeCloseTo(8.85, 6);
    // 3% de condimentos y varios por defecto.
    expect(dishCostPerPortion(taco)).toBeCloseTo(9.1155, 4);

    const conExtras: Dish = { ...taco, packaging: 2.5, labor: 1.5 };
    expect(dishCostPerPortion(conExtras)).toBeCloseTo(13.1155, 4);
  });

  it('reparte el costo entre las porciones que rinde la receta', () => {
    const lote: Dish = { ...taco, portions: 4 };
    expect(dishIngredientsCost(lote)).toBeCloseTo(2.2125, 6);
  });

  it('calcula el food cost sobre el precio sin IVA', () => {
    expect(netPrice(taco)).toBeCloseTo(24.1379, 4);
    const m = dishMetrics(taco);
    expect(m.foodCost).toBeCloseTo(37.7642, 3);
    expect(m.foodCostRounded).toBe(38);
    expect(m.grossProfit).toBeCloseTo(15.0224, 3);
    expect(m.grossMargin).toBeCloseTo(62.2358, 3);
  });

  it('no divide entre 1.16 cuando el precio no incluye IVA', () => {
    const sinIva: Dish = { ...taco, priceIncludesTax: false };
    expect(netPrice(sinIva)).toBe(28);
    expect(dishMetrics(sinIva).foodCost).toBeCloseTo(32.555, 3);
  });

  it('devuelve null en food cost, utilidad y margen cuando no hay precio', () => {
    const m = dishMetrics({ ...taco, price: 0 });
    expect(m.hasPrice).toBe(false);
    expect(m.foodCost).toBeNull();
    expect(m.foodCostRounded).toBeNull();
    expect(m.grossProfit).toBeNull();
    expect(m.grossMargin).toBeNull();
    // El costo sí se conoce aunque no haya precio.
    expect(m.costPerPortion).toBeCloseTo(9.1155, 4);
  });

  it('sugiere el precio que alcanza el food cost objetivo', () => {
    const costo = dishCostPerPortion(taco);
    // Con IVA incluido el sugerido también lo trae.
    expect(suggestedPrice(costo, 30, true)).toBeCloseTo(35.2466, 3);
    expect(suggestedPrice(costo, 30, false)).toBeCloseTo(30.385, 3);
    expect(suggestedPrice(costo, 25, true)).toBeCloseTo(42.296, 3);

    // Y ese precio sí produce el food cost objetivo.
    const alPrecioSugerido: Dish = { ...taco, price: suggestedPrice(costo, 30, true) };
    expect(dishMetrics(alPrecioSugerido).foodCost).toBeCloseTo(30, 6);
  });

  it('cicla el food cost objetivo 25 → 30 → 35 → 25', () => {
    expect(nextFoodCostTarget(25)).toBe(30);
    expect(nextFoodCostTarget(30)).toBe(35);
    expect(nextFoodCostTarget(35)).toBe(25);
  });

  it('absorbe la comisión de la app de delivery', () => {
    expect(deliveryPrice(100, 28)).toBeCloseTo(138.8889, 3);
    // Y el precio de delivery deja el mismo neto que el precio de mostrador.
    expect(deliveryPrice(100, 28) * (1 - 0.28)).toBeCloseTo(100, 6);
    expect(dishMetrics(taco).deliveryPrice).toBeCloseTo(48.9536, 3);
  });

  it('costea un platillo que usa una sub-receta', () => {
    const tacoConSalsa: Dish = {
      ...taco,
      ingredients: [
        ...taco.ingredients.slice(0, 4),
        { id: 'sr', name: 'Salsa de la casa', qty: 15, unit: 'ml', subrecipeId: 'sr1' },
      ],
    };
    // Los cuatro primeros ingredientes suman 8.40 y la salsa 0.71148.
    expect(dishIngredientsCost(tacoConSalsa, ctx)).toBeCloseTo(9.11148, 5);
  });
});
