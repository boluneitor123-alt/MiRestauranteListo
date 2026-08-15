import { describe, expect, it } from 'vitest';
import { diagnose } from '../diagnosis';
import { emptyProjectState, type ProjectState } from '../projectState';
import { ROUTE_MODULES } from '@/content/route';
import { DEMO_DISHES } from '@/content/demo';
import type { Dish } from '../types';

function state(over: Partial<ProjectState> = {}): ProjectState {
  return emptyProjectState(over);
}

const run = (s: ProjectState, showFigures = true) =>
  diagnose({ state: s, modules: ROUTE_MODULES, showFigures });

describe('diagnóstico (README § 1.4)', () => {
  it('propone tres huecos como máximo, en orden de prioridad', () => {
    const d = run(state({ answers: { costeo: 'No', ventas: 'No', menuq: 'No', permisos: 'No' } }));
    expect(d.gaps).toHaveLength(3);
    expect(d.gaps.map((g) => g.n)).toEqual(['1', '2', '3']);
    expect(d.gaps[0].title).toBe('Costear tu menú');
  });

  it('siempre propone algo, aunque el proyecto vaya bien', () => {
    const d = run(
      state({
        dishes: DEMO_DISHES as Dish[],
        fixed: [{ key: 'renta', label: 'Renta', amount: 22000 }],
        budget: [{ key: 'renta', label: 'Renta y depósito', amount: 40000 }],
        project: { name: 'X', giro: 'Taquería', budgetCap: 250000, openDate: '', people: '' },
        answers: { costeo: 'Sí', ventas: 'Sí', menuq: 'Sí', permisos: 'Sí', localq: 'Sí, rentado', nombre: 'Sí' },
      }),
    );
    expect(d.gaps.length).toBeGreaterThan(0);
  });

  it('el siguiente paso es la primera tarea pendiente de la ruta', () => {
    const d = run(state());
    expect(d.nextStep.title).toBe(ROUTE_MODULES[0].tasks[0].title);
    expect(d.nextStep.target).toEqual({ tab: 'ruta', module: 'concepto' });
  });

  it('cambia el siguiente paso cuando ya no quedan tareas', () => {
    const done: Record<string, boolean> = {};
    for (const m of ROUTE_MODULES) m.tasks.forEach((_, i) => (done[`${m.id}${i}`] = true));
    const d = run(state({ done }));
    expect(d.progress.pct).toBe(100);
    expect(d.nextStep.title).toContain('define tu fecha de apertura');
  });
});

describe('riesgos y mentor (README § 1.5)', () => {
  const excedido = state({
    budget: [{ key: 'obra', label: 'Obra', amount: 300000 }],
    project: { name: 'X', giro: 'Taquería', budgetCap: 250000, openDate: '', people: '' },
  });

  it('detecta que la inversión no cabe en el presupuesto', () => {
    const d = run(excedido);
    expect(d.risks.some((r) => r.includes('supera tu presupuesto'))).toBe(true);
    expect(d.recommendations[0].id).toBe('presupuesto-excedido');
    expect(d.recommendations[0].severity).toBe('alta');
  });

  it('sin licencia no revela la cifra del excedente', () => {
    const conLicencia = run(excedido, true);
    const enPrueba = run(excedido, false);

    expect(conLicencia.risks.join(' ')).toContain('$50,000');
    expect(enPrueba.risks.join(' ')).not.toContain('50,000');
    expect(enPrueba.recommendations[0].body).not.toMatch(/\$\d/);
    expect(enPrueba.recommendations[0].body).toContain('pago único');
  });

  it('avisa de permisos pendientes cuando quiere abrir pronto', () => {
    const d = run(state({ answers: { permisos: 'No', cuando: 'En menos de 3 meses' } }));
    expect(d.risks.some((r) => r.includes('permisos'))).toBe(true);
    expect(d.recommendations.find((r) => r.id === 'permisos')?.target).toEqual({ tab: 'ruta', module: 'permisos' });
  });

  it('no lo avisa si todavía no tiene fecha cercana', () => {
    const d = run(state({ answers: { permisos: 'No', cuando: 'En 6 a 12 meses' } }));
    expect(d.recommendations.find((r) => r.id === 'permisos')).toBeUndefined();
  });

  it('detecta platillos con food cost peligroso', () => {
    const caro: Dish = {
      id: 'x',
      name: 'Caro',
      price: 100,
      priceIncludesTax: false,
      extrasPct: 0,
      ingredients: [{ id: 'i', name: 'Insumo', qty: 1, unit: 'pz', unitPrice: 45 }],
    };
    const d = run(state({ dishes: [caro] }));
    expect(d.recommendations.find((r) => r.id === 'platillos-rojos')?.title).toBe('Tienes un platillo en rojo');
    expect(d.risks.some((r) => r.includes('food cost peligroso'))).toBe(true);
  });

  it('pide capturar gastos fijos antes de creerse el punto de equilibrio', () => {
    const d = run(state());
    expect(d.recommendations.find((r) => r.id === 'sin-gastos-fijos')).toBeDefined();
    expect(d.recommendations.find((r) => r.id === 'equilibrio')).toBeUndefined();
  });

  it('con gastos fijos capturados da el piso diario de tickets', () => {
    const d = run(
      state({
        fixed: [{ key: 'renta', label: 'Renta', amount: 79800 }],
        ticket: 120,
        margin: 68,
      }),
    );
    const equilibrio = d.recommendations.find((r) => r.id === 'equilibrio');
    expect(equilibrio?.title).toBe('Necesitas 33 tickets al día para no perder');
  });

  it('ordena las recomendaciones por severidad', () => {
    const d = run(excedido);
    const orden = d.recommendations.map((r) => r.severity);
    const rank = { alta: 0, media: 1, baja: 2 } as const;
    expect(orden.map((s) => rank[s])).toEqual([...orden.map((s) => rank[s])].sort((a, b) => a - b));
  });
});
