import { describe, expect, it } from 'vitest';
import { ETAPAS, taskKey } from '@/content/route';
import { aplicarAlcance, moduloDeClave } from '../alcance';
import { emptyProjectState, type ProjectState } from '../projectState';
import type { Dish, Subrecipe } from '../types';

const DEFINE = ETAPAS[0].mods[0];
const CONSTRUYE = ETAPAS[1].mods[0];

const platillo = (id: string): Dish => ({ id, name: id, portions: 1, price: 0, ingredients: [] });
const subreceta = (id: string): Subrecipe => ({ id, name: id, yieldQty: 1000, unit: 'ml', ingredients: [] });

/** Un estado con lo que se le pida encima del de fábrica. */
const con = (patch: Partial<ProjectState>): ProjectState => ({ ...emptyProjectState(), ...patch });

describe('de qué módulo es una clave de tarea', () => {
  it('se resuelve por el id más largo que embone, y sólo con dígitos detrás', () => {
    expect(moduloDeClave(taskKey(CONSTRUYE, 2))).toBe(CONSTRUYE);
    expect(moduloDeClave(taskKey(DEFINE, 0))).toBe(DEFINE);
    expect(moduloDeClave('inventado3')).toBeUndefined();
    expect(moduloDeClave(`${CONSTRUYE}x`)).toBeUndefined();
  });
});

describe('prueba: el servidor no guarda el tercer platillo', () => {
  it('recorta al tope y lo dice', () => {
    const entrante = con({ dishes: [platillo('a'), platillo('b'), platillo('c')] });
    const { state, recortado } = aplicarAlcance('prueba', entrante, null);
    expect(state.dishes.map((d) => d.id)).toEqual(['a', 'b']);
    expect(recortado).toContain('platillos');
  });

  it('dos sí entran, y no avisa de nada', () => {
    const entrante = con({ dishes: [platillo('a'), platillo('b')] });
    const { state, recortado } = aplicarAlcance('prueba', entrante, null);
    expect(state.dishes).toHaveLength(2);
    expect(recortado).toEqual([]);
  });

  it('las sub-recetas llevan su propio tope', () => {
    const entrante = con({ subrecipes: [subreceta('a'), subreceta('b'), subreceta('c')] });
    const { state, recortado } = aplicarAlcance('prueba', entrante, null);
    expect(state.subrecipes).toHaveLength(2);
    expect(recortado).toContain('sub-recetas');
  });

  it('con licencia no hay tope', () => {
    const entrante = con({ dishes: [platillo('a'), platillo('b'), platillo('c'), platillo('d')] });
    const { state, recortado } = aplicarAlcance('licencia', entrante, null);
    expect(state.dishes).toHaveLength(4);
    expect(recortado).toEqual([]);
  });
});

describe('prueba: el servidor no guarda escrituras en Números', () => {
  const guardado = con({ fixed: [{ key: 'renta', label: 'Renta', amount: 0 }], ticket: 100, margin: 60 });

  it('los gastos fijos conservan lo guardado', () => {
    const entrante = con({ ...guardado, fixed: [{ key: 'renta', label: 'Renta', amount: 99_000 }] });
    const { state, recortado } = aplicarAlcance('prueba', entrante, guardado);
    expect(state.fixed[0].amount).toBe(0);
    expect(recortado).toContain('gastos-fijos');
  });

  it('el punto de equilibrio también', () => {
    const entrante = con({ ...guardado, ticket: 500, margin: 90 });
    const { state, recortado } = aplicarAlcance('prueba', entrante, guardado);
    expect(state.ticket).toBe(100);
    expect(state.margin).toBe(60);
    expect(recortado).toContain('punto-de-equilibrio');
  });

  it('el presupuesto no se toca', () => {
    const guardadoP = con({ budget: [{ key: 'obra', label: 'Obra', amount: 1000 }] });
    const entrante = con({ budget: [{ key: 'obra', label: 'Obra', amount: 7 }] });
    const { state, recortado } = aplicarAlcance('prueba', entrante, guardadoP);
    expect(state.budget[0].amount).toBe(1000);
    expect(recortado).toContain('presupuesto');
  });

  it('con licencia sí se guarda', () => {
    const entrante = con({ ...guardado, ticket: 500 });
    const { state, recortado } = aplicarAlcance('licencia', entrante, guardado);
    expect(state.ticket).toBe(500);
    expect(recortado).toEqual([]);
  });
});

describe('prueba: sólo se marcan tareas de la etapa 1', () => {
  it('la de un módulo cerrado no se marca, la de la etapa 1 sí', () => {
    const entrante = con({ done: { [taskKey(DEFINE, 0)]: true, [taskKey(CONSTRUYE, 0)]: true } });
    const { state, recortado } = aplicarAlcance('prueba', entrante, null);
    expect(state.done[taskKey(DEFINE, 0)]).toBe(true);
    expect(state.done[taskKey(CONSTRUYE, 0)]).toBeUndefined();
    expect(recortado).toContain('tareas');
  });

  it('una clave inventada no se cuela', () => {
    const entrante = con({ done: { inventada9: true } });
    const { state } = aplicarAlcance('prueba', entrante, null);
    expect(state.done.inventada9).toBeUndefined();
  });

  it('omitir un módulo cerrado tampoco', () => {
    const entrante = con({ skipped: { [CONSTRUYE]: 'no aplica' } });
    const { state, recortado } = aplicarAlcance('prueba', entrante, null);
    expect(state.skipped[CONSTRUYE]).toBeUndefined();
    expect(recortado).toContain('tareas');
  });

  it('agregar tarea a un módulo cerrado tampoco', () => {
    const entrante = con({ extraTasks: [{ id: 'x', moduleId: CONSTRUYE, title: 'mía' }] });
    const { state, recortado } = aplicarAlcance('prueba', entrante, null);
    expect(state.extraTasks).toHaveLength(0);
    expect(recortado).toContain('tareas');
  });

  it('pero sí a uno de la etapa 1', () => {
    const entrante = con({ extraTasks: [{ id: 'x', moduleId: DEFINE, title: 'mía' }] });
    const { state, recortado } = aplicarAlcance('prueba', entrante, null);
    expect(state.extraTasks).toHaveLength(1);
    expect(recortado).toEqual([]);
  });

  it('con licencia se marca cualquiera', () => {
    const entrante = con({ done: { [taskKey(CONSTRUYE, 3)]: true } });
    const { state, recortado } = aplicarAlcance('licencia', entrante, null);
    expect(state.done[taskKey(CONSTRUYE, 3)]).toBe(true);
    expect(recortado).toEqual([]);
  });
});

describe('al vencer la prueba no se pierde nada', () => {
  const guardado = con({
    dishes: [platillo('a'), platillo('b')],
    subrecipes: [subreceta('s')],
    done: { [taskKey(DEFINE, 0)]: true },
    fixed: [{ key: 'renta', label: 'Renta', amount: 12_000 }],
  });

  it('lo capturado se conserva aunque llegue un estado vacío', () => {
    const { state } = aplicarAlcance('bloqueado', emptyProjectState(), guardado);
    expect(state.dishes.map((d) => d.id)).toEqual(['a', 'b']);
    expect(state.subrecipes).toHaveLength(1);
    expect(state.done[taskKey(DEFINE, 0)]).toBe(true);
    expect(state.fixed[0].amount).toBe(12_000);
  });

  it('un borrado mandado a propósito tampoco pasa', () => {
    const entrante = con({ ...guardado, dishes: [] });
    const { state, recortado } = aplicarAlcance('bloqueado', entrante, guardado);
    expect(state.dishes).toHaveLength(2);
    expect(recortado).toContain('platillos');
  });

  it('desmarcar una tarea de la etapa 1 ya no se puede', () => {
    const entrante = con({ ...guardado, done: {} });
    const { state, recortado } = aplicarAlcance('bloqueado', entrante, guardado);
    expect(state.done[taskKey(DEFINE, 0)]).toBe(true);
    expect(recortado).toContain('tareas');
  });
});

describe('lo que no toca el contrato se sigue guardando', () => {
  it('el perfil, las respuestas, las notas y los proveedores pasan', () => {
    const entrante = con({
      profile: { ...emptyProjectState().profile, name: 'Ana' },
      answers: { giro: 'taqueria' },
      notes: [{ id: 'n', title: 'x', body: 'y', date: '2026-09-13' }],
    });
    const { state, recortado } = aplicarAlcance('prueba', entrante, null);
    expect(state.profile.name).toBe('Ana');
    expect(state.answers.giro).toBe('taqueria');
    expect(state.notes).toHaveLength(1);
    expect(recortado).toEqual([]);
  });
});

describe('el diagnóstico no se pierde al vencer', () => {
  const guardado = con({ answers: { giro: 'taqueria', etapa: 'idea' } });

  it('un guardado parcial ya no borra las respuestas', () => {
    const { state, recortado } = aplicarAlcance('bloqueado', emptyProjectState(), guardado);
    expect(state.answers).toEqual({ giro: 'taqueria', etapa: 'idea' });
    expect(recortado).toContain('diagnostico');
  });

  it('durante la prueba sí se contesta: el onboarding tiene que poder guardar', () => {
    const entrante = con({ answers: { giro: 'sushi' } });
    const { state, recortado } = aplicarAlcance('prueba', entrante, guardado);
    expect(state.answers).toEqual({ giro: 'sushi' });
    expect(recortado).toEqual([]);
  });
});
