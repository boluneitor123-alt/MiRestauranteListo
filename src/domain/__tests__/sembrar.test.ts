import { describe, expect, it } from 'vitest';
import { topesDe } from '../access';
import { alDia, rutasTocadas } from '../desestimar';
import { ONBOARDING_QUESTIONS } from '@/content/onboarding';
import { emptyProjectState, type ProjectState } from '../projectState';
import { platillosDeGiro, sembrarEstimacion, traeDatosCapturados } from '../sembrar';

/** Un diagnóstico completo: sembrar exige las doce respuestas. */
const DOCE = Object.fromEntries(ONBOARDING_QUESTIONS.map((q) => [q.id, 'contestada']));

const conRespuestas = (extra: Partial<ProjectState> = {}): ProjectState =>
  emptyProjectState({
    answers: { ...DOCE, giro: 'Taquería', presupuesto: '$100,000 a $250,000', personal: '1 a 2' },
    ...extra,
  });

const total = (cs: Array<{ amount: number }>) => cs.reduce((a, c) => a + c.amount, 0);

describe('una cuenta nueva abre con sus números', () => {
  it('deja de estar en ceros', () => {
    const antes = conRespuestas();
    expect(total(antes.budget)).toBe(0);

    const despues = sembrarEstimacion(antes, topesDe('licencia'));
    expect(total(despues.budget)).toBeGreaterThan(0);
    expect(total(despues.fixed)).toBeGreaterThan(0);
    expect(despues.dishes.length).toBe(3);
    expect(despues.selloEstimado).toContain('taquería');
  });

  it('en prueba entran 2 platillos, que es lo que la prueba incluye', () => {
    const e = sembrarEstimacion(conRespuestas(), topesDe('prueba'));
    expect(e.dishes).toHaveLength(2);
    // Y no queda una marca huérfana del tercero.
    expect(e.estimados.filter((r) => r.startsWith('platillo:'))).toHaveLength(2);
  });

  it('el tope de presupuesto sale de su respuesta', () => {
    const e = sembrarEstimacion(conRespuestas(), topesDe('licencia'));
    expect(e.project.budgetCap).toBe(175_000);
    expect(e.project.budgetCap).not.toBe(emptyProjectState().project.budgetCap);
  });
});

describe('a quien ya capturó algo no se le toca nada', () => {
  it('con un platillo suyo, no siembra', () => {
    const suyo = conRespuestas({
      dishes: [{ id: 'mio', name: 'Mi taco', price: 30, portions: 1, ingredients: [] }],
    });
    expect(traeDatosCapturados(suyo)).toBe(true);
    expect(sembrarEstimacion(suyo, topesDe('licencia'))).toBe(suyo);
  });

  it('con un gasto capturado, tampoco', () => {
    const base = conRespuestas();
    const suyo = { ...base, fixed: base.fixed.map((c) => (c.key === 'renta' ? { ...c, amount: 9_000 } : c)) };
    expect(sembrarEstimacion(suyo, topesDe('licencia'))).toBe(suyo);
  });

  it('no hay segunda siembra, ni aunque ella lo haya borrado todo', () => {
    const sembrado = sembrarEstimacion(conRespuestas(), topesDe('licencia'));
    const vaciado: ProjectState = { ...sembrado, dishes: [], budget: sembrado.budget.map((c) => ({ ...c, amount: 0 })) };
    // Ese vacío también es una decisión suya.
    expect(sembrarEstimacion(vaciado, topesDe('licencia'))).toBe(vaciado);
  });
});

describe('lo que la persona corrige deja de ser estimación, para siempre', () => {
  const sembrado = sembrarEstimacion(conRespuestas(), topesDe('licencia'));

  it('corregir la renta borra su marca y no toca las demás', () => {
    const corregido = { ...sembrado, fixed: sembrado.fixed.map((c) => (c.key === 'renta' ? { ...c, amount: 9_000 } : c)) };
    const guardado = alDia(sembrado, corregido);

    expect(guardado.estimados).not.toContain('fijos:renta');
    expect(guardado.estimados).toContain('fijos:nomina');
    expect(guardado.fixed.find((c) => c.key === 'renta')!.amount).toBe(9_000);
  });

  it('borrar un platillo estimado también cuenta como decisión suya', () => {
    const id = sembrado.dishes[0].id;
    const corregido = { ...sembrado, dishes: sembrado.dishes.slice(1) };
    expect(alDia(sembrado, corregido).estimados).not.toContain(`platillo:${id}`);
  });

  it('editarle el precio a un platillo estimado lo vuelve suyo', () => {
    const id = sembrado.dishes[0].id;
    const corregido = {
      ...sembrado,
      dishes: sembrado.dishes.map((d) => (d.id === id ? { ...d, price: 99 } : d)),
    };
    expect(alDia(sembrado, corregido).estimados).not.toContain(`platillo:${id}`);
  });

  it('el cliente no puede reclamar como estimación un dato que ya es suyo', () => {
    /*
      Las marcas mandan las guardadas, no las que vengan en la petición. Si el
      navegador pudiera declararlas, bastaría con mandar `estimados` lleno para
      que la app se sintiera con permiso de pisar lo que la persona capturó.
    */
    const suyo: ProjectState = { ...sembrado, estimados: [] };
    const mentiroso: ProjectState = { ...suyo, estimados: ['fijos:renta', 'ticket', 'budgetCap'] };
    expect(alDia(suyo, mentiroso).estimados).toEqual([]);
  });

  it('tampoco puede agregarse una marca nueva a una lista que sí existe', () => {
    const inventada = 'presupuesto:inventado';
    const mentiroso: ProjectState = { ...sembrado, estimados: [...sembrado.estimados, inventada] };
    expect(alDia(sembrado, mentiroso).estimados).not.toContain(inventada);
  });

  it('guardar sin cambiar nada no borra marcas', () => {
    expect(alDia(sembrado, sembrado).estimados).toEqual(sembrado.estimados);
  });

  it('rutasTocadas nombra exactamente lo que cambió', () => {
    const corregido = { ...sembrado, ticket: 999, margin: sembrado.margin };
    expect(rutasTocadas(sembrado, corregido)).toEqual(['ticket']);
  });
});

describe('la plantilla de Más carga la del giro, no una genérica', () => {
  it('cada giro con platillos da los suyos', () => {
    const taco = platillosDeGiro('Taquería');
    const pizza = platillosDeGiro('Pizzería');
    expect(taco.length).toBeGreaterThan(0);
    expect(taco.map((d) => d.name)).not.toEqual(pizza.map((d) => d.name));
  });

  it('un giro sin platillos devuelve vacío para que la pantalla lo diga', () => {
    expect(platillosDeGiro('Sushi')).toEqual([]);
  });
});

describe('se espera al diagnóstico completo', () => {
  it('con una sola respuesta no siembra: faltan las que definen la estimación', () => {
    const aMedias = emptyProjectState({ answers: { giro: 'Taquería' } });
    expect(sembrarEstimacion(aMedias, topesDe('licencia'))).toBe(aMedias);
  });

  it('con once tampoco', () => {
    const once = Object.fromEntries(ONBOARDING_QUESTIONS.slice(0, -1).map((q) => [q.id, 'x']));
    const casi = emptyProjectState({ answers: once });
    expect(sembrarEstimacion(casi, topesDe('licencia'))).toBe(casi);
  });

  it('con las doce sí, y la etiqueta ya trae el equipo', () => {
    const completo = Object.fromEntries(ONBOARDING_QUESTIONS.map((q) => [q.id, 'x']));
    const listo = emptyProjectState({
      answers: { ...completo, giro: 'Taquería', presupuesto: '$100,000 a $250,000', personal: '1 a 2' },
    });
    const e = sembrarEstimacion(listo, topesDe('licencia'));
    expect(e).not.toBe(listo);
    expect(e.selloEstimado).toBe('Estimado para taquería con equipo de 1 a 2 personas');
    expect(e.project.budgetCap).toBe(175_000);
  });
});

describe('las marcas de la siembra sobreviven al guardado que las crea', () => {
  it('sembrar sobre un proyecto que ya existía sin marcas no las pierde', () => {
    /*
      El proyecto se crea en el primer autoguardado, con la lista vacía, y la
      siembra llega en uno posterior. Si las marcas se tomaran de lo guardado
      también en esa petición, nacerían y morirían en el mismo viaje: los
      números quedarían sin etiqueta de estimados y la app los presentaría como
      datos de la persona.
    */
    const yaExistia = conRespuestas();
    expect(yaExistia.estimados).toEqual([]);

    const sembrado = sembrarEstimacion(yaExistia, topesDe('licencia'));
    expect(sembrado.estimados.length).toBeGreaterThan(0);

    // Así lo guarda la ruta cuando sembró: sin pasar por `alDia`.
    expect(sembrado.estimados).toContain('fijos:renta');
    // Y si pasara, las perdería — que es justo el defecto que se corrigió.
    expect(alDia(yaExistia, sembrado).estimados).toEqual([]);
  });
});
