/**
 * Afinar la estimación con la ciudad y el tamaño del local.
 *
 * El diagnóstico son doce preguntas y no incluye estas dos: agregarlas antes
 * de que la persona vea un solo número le cobraría más caro el primer minuto.
 * Se preguntan después, en una tarjeta de Números, cuando ya tiene sus cifras
 * enfrente y entiende para qué sirve contestar.
 *
 * Vale la pena porque la renta es el gasto que decide si el negocio aguanta, y
 * hasta aquí se deducía del presupuesto con el que cuenta — un proxy pobre:
 * dos personas con los mismos $200,000 pagan rentas muy distintas si una abre
 * un puesto en Oaxaca y la otra un local en la Ciudad de México.
 *
 * **Sólo reescribe lo que sigue marcado como estimación.** Si ya corrigió su
 * renta, su renta se queda; la afinación mueve lo demás y no la toca. Es la
 * misma promesa de siempre y no tiene excepciones.
 */

import { BUDGET_CONCEPTS, FIXED_CONCEPTS } from '@/content/catalog';
import { estaAfinado, estimarProyecto } from './estimacion';
import type { Concept } from './finance';
import type { ProjectState } from './projectState';

/** Los montos nuevos, sólo donde la marca de estimado sigue puesta. */
function soloLoEstimado(grupo: 'presupuesto' | 'fijos', actuales: Concept[], nuevos: Concept[], marcas: Set<string>) {
  const porLlave = new Map(nuevos.map((c) => [c.key, c.amount]));
  return actuales.map((c) => {
    const nuevo = porLlave.get(c.key);
    if (nuevo === undefined || !marcas.has(`${grupo}:${c.key}`)) return c;
    return { ...c, amount: nuevo };
  });
}

/**
 * El estado con la estimación afinada.
 *
 * Devuelve el mismo objeto si no hay nada que mover, para que quien la llame
 * pueda comparar por identidad y no guardar ni responder de más.
 */
export function afinarEstimacion(state: ProjectState): ProjectState {
  /*
    Sin sello no hubo siembra: o es una cuenta vieja que capturó todo a mano o
    alguien mandó respuestas sueltas por la API. En los dos casos, aquí no hay
    ninguna estimación nuestra que afinar.
  */
  if (!state.selloEstimado) return state;
  if (!estaAfinado(state.answers)) return state;

  const est = estimarProyecto(
    state.answers,
    { presupuesto: BUDGET_CONCEPTS, fijos: FIXED_CONCEPTS },
    { ciudadDelPerfil: state.profile.city },
  );

  const marcas = new Set(state.estimados);
  const budget = soloLoEstimado('presupuesto', state.budget, est.budget, marcas);
  const fixed = soloLoEstimado('fijos', state.fixed, est.fixed, marcas);

  const igual =
    est.sello === state.selloEstimado &&
    JSON.stringify(budget) === JSON.stringify(state.budget) &&
    JSON.stringify(fixed) === JSON.stringify(state.fixed);
  if (igual) return state;

  return { ...state, budget, fixed, selloEstimado: est.sello };
}
