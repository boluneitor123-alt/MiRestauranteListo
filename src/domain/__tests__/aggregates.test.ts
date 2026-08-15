import { describe, expect, it } from 'vitest';
import { menuAggregates } from '../aggregates';
import type { Dish } from '../types';
import { DEMO_DISHES } from '@/content/demo';

const dish = (id: string, price: number, unitCost: number): Dish => ({
  id,
  name: id,
  price,
  priceIncludesTax: false,
  extrasPct: 0,
  ingredients: [{ id: `${id}i`, name: 'Insumo', qty: 1, unit: 'pz', unitPrice: unitCost }],
});

describe('agregados del costeador (README § 4 · "Agregados")', () => {
  it('excluye siempre los platillos sin precio', () => {
    const dishes = [dish('a', 100, 30), dish('b', 200, 60), dish('sin', 0, 45)];
    const agg = menuAggregates(dishes);

    expect(agg.total).toBe(3);
    expect(agg.priced).toBe(2);
    expect(agg.averageFoodCost).toBeCloseTo(30, 6);
    expect(agg.averagePrice).toBeCloseTo(150, 6);
    expect(agg.averageGrossProfit).toBeCloseTo(105, 6);
  });

  it('devuelve null cuando ningún platillo tiene precio', () => {
    const agg = menuAggregates([dish('a', 0, 30), dish('b', 0, 12)]);
    expect(agg.averageFoodCost).toBeNull();
    expect(agg.weightedFoodCost).toBeNull();
    expect(agg.averagePrice).toBeNull();
    expect(agg.averageTicket).toBeNull();
    expect(agg.averageGrossProfit).toBeNull();
    expect(agg.suggestedMargin).toBeNull();
  });

  it('devuelve null con la carta vacía', () => {
    const agg = menuAggregates([]);
    expect(agg.total).toBe(0);
    expect(agg.averageFoodCost).toBeNull();
  });

  it('pondera el food cost por el peso de cada platillo en la venta', () => {
    // Simple: (20% + 50%)/2 = 35%. Ponderado: 110 de costo sobre 600 de venta.
    const dishes = [dish('barato', 100, 20), dish('caro', 500, 250)];
    const agg = menuAggregates(dishes);
    expect(agg.averageFoodCost).toBeCloseTo(35, 6);
    expect(agg.weightedFoodCost).toBeCloseTo(45, 6);
  });

  it('propone el margen bruto complementario al food cost promedio', () => {
    const agg = menuAggregates([dish('a', 100, 32)]);
    expect(agg.suggestedMargin).toBe(68);
  });

  it('resume la carta de demostración', () => {
    const agg = menuAggregates(DEMO_DISHES);
    expect(agg.total).toBe(4);
    expect(agg.priced).toBe(4);
    expect(agg.averagePrice).toBeCloseTo(90.25, 6);
    expect(agg.averageFoodCost).toBeCloseTo(38.7889, 3);
  });
});
