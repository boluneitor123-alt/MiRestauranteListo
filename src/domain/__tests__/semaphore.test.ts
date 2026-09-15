import { describe, expect, it } from 'vitest';
import {
  ANCHOR_MAX,
  matchesSemaphoreFilter,
  SEMAPHORE_LEGEND,
  semaphoreLevel,
  semaphoreNeedlePct,
  semaphoreVerdict,
} from '../semaphore';
import { dishMetrics } from '../costing';
import type { Dish } from '../types';

describe('semáforo de rentabilidad (README § 4)', () => {
  it('usa la misma frontera en todas las pantallas', () => {
    expect(semaphoreLevel(0)).toBe('saludable');
    expect(semaphoreLevel(30)).toBe('saludable');
    expect(semaphoreLevel(31)).toBe('revisar');
    expect(semaphoreLevel(38)).toBe('revisar');
    expect(semaphoreLevel(39)).toBe('peligroso');
    expect(semaphoreLevel(null)).toBe('sin-precio');
  });

  it('decide sobre el food cost redondeado, que es el que ve el usuario', () => {
    // 30.4% se muestra como 30% ⇒ la etiqueta no puede decir "revisar".
    const casi: Dish = {
      id: 'x',
      name: 'Casi',
      price: 100,
      priceIncludesTax: false,
      extrasPct: 0,
      ingredients: [{ id: 'i', name: 'Insumo', qty: 1, unit: 'pz', unitPrice: 30.4 }],
    };
    const m = dishMetrics(casi);
    expect(m.foodCost).toBeCloseTo(30.4, 6);
    expect(m.foodCostRounded).toBe(30);
    expect(semaphoreLevel(m.foodCostRounded)).toBe('saludable');
  });

  it('pide definir el precio cuando no hay precio', () => {
    expect(semaphoreVerdict(null)).toBe('Define tu precio de venta para ver tu food cost y tu margen.');
    expect(semaphoreNeedlePct(null)).toBe(50);
  });

  it('coloca la aguja proporcional al food cost, topada al 97%', () => {
    expect(semaphoreNeedlePct(25)).toBe(50);
    expect(semaphoreNeedlePct(38)).toBe(76);
    expect(semaphoreNeedlePct(80)).toBe(97);
    expect(semaphoreNeedlePct(0)).toBe(1);
  });

  it('filtra la lista de platillos por color', () => {
    expect(matchesSemaphoreFilter(null, 'todos')).toBe(true);
    expect(matchesSemaphoreFilter(28, 'saludable')).toBe(true);
    expect(matchesSemaphoreFilter(28, 'peligroso')).toBe(false);
    expect(matchesSemaphoreFilter(45, 'peligroso')).toBe(true);
  });

  it('da un veredicto distinto por nivel', () => {
    const verdicts = [26, 34, 50].map(semaphoreVerdict);
    expect(new Set(verdicts).size).toBe(3);
    expect(verdicts[0]).toContain('Saludable');
    expect(verdicts[1]).toContain('Revisa');
    expect(verdicts[2]).toContain('Peligroso');
  });

  it('un food cost muy bajo no recibe el mismo consejo que uno apenas sano', () => {
    /*
      Era el defecto: el taco de pastor al 24% y un platillo al 29% leían
      exactamente lo mismo, "manténlo en la carta y empújalo". Un margen así
      es para decidir qué hacer con él, no para dejarlo quieto.
    */
    expect(semaphoreVerdict(15)).not.toBe(semaphoreVerdict(29));
    expect(semaphoreVerdict(15)).toContain('bajo');
    expect(semaphoreVerdict(29)).toContain('Saludable');
  });

  it('el veredicto del ancla dice el número que la persona está viendo', () => {
    expect(semaphoreVerdict(24)).toContain('24%');
    expect(semaphoreVerdict(12)).toContain('12%');
  });

  it('la frontera del ancla es 20%: incluido abajo, excluido arriba', () => {
    expect(semaphoreVerdict(ANCHOR_MAX)).toContain('bajo');
    expect(semaphoreVerdict(ANCHOR_MAX + 1)).toContain('Saludable');
  });

  it('el cuarto veredicto no agrega un cuarto color', () => {
    // El semáforo sigue en tres tramos: 15% se pinta verde, como 29%.
    expect(semaphoreLevel(15)).toBe('saludable');
    expect(semaphoreLevel(0)).toBe('saludable');
    expect(matchesSemaphoreFilter(15, 'saludable')).toBe(true);
    expect(SEMAPHORE_LEGEND).toHaveLength(3);
  });
});
