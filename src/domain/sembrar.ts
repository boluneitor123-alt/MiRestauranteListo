/**
 * Sembrar el proyecto con lo que el diagnóstico dejó estimado.
 *
 * Vive aparte del estimador porque sabe dos cosas que aquél no debe saber: qué
 * había ya en el estado y cuántas cosas deja guardar el nivel. El estimador es
 * una función de las respuestas y nada más.
 *
 * La regla es una sola y no tiene excepciones: **sólo se escribe encima de lo
 * que nadie ha tocado.** Si la persona ya capturó su renta, su renta se queda.
 */

import { BUDGET_CONCEPTS, FIXED_CONCEPTS } from '@/content/catalog';
import { ONBOARDING_QUESTIONS } from '@/content/onboarding';
import { estimarProyecto } from './estimacion';
import type { ProjectState } from './projectState';
import type { Topes } from './access';

/** ¿Hay que dejar este estado en paz? */
export function traeDatosCapturados(state: ProjectState): boolean {
  /*
    Si ya hubo una siembra, no hay segunda. Aunque la persona haya borrado
    todo: ese vacío también es una decisión suya, y volver a llenarlo sería
    exactamente lo que prometimos no hacer.
  */
  if (state.selloEstimado) return true;

  return (
    state.dishes.length > 0 ||
    state.subrecipes.length > 0 ||
    state.budget.some((c) => c.amount > 0) ||
    state.fixed.some((c) => c.amount > 0)
  );
}

/**
 * El estado ya sembrado.
 *
 * Devuelve el mismo objeto si no hay nada que sembrar, para que quien la llame
 * pueda comparar por identidad y no guardar de más.
 */
export function sembrarEstimacion(state: ProjectState, topes: Topes): ProjectState {
  // A quien ya capturó algo no se le toca nada. Nunca.
  if (traeDatosCapturados(state)) return state;

  /*
    Se espera al diagnóstico completo.
    La app guarda sola después de cada respuesta, así que sembrar en el primer
    guardado dejaba la estimación hecha con una sola pregunta contestada —el
    giro— y como sólo se siembra una vez, las otras once ya no cambiaban nada.
    La etiqueta salía «estimado para taquería», sin el equipo, y el tope de
    presupuesto se quedaba sin la respuesta que lo define.
  */
  if (Object.keys(state.answers).length < ONBOARDING_QUESTIONS.length) return state;

  const est = estimarProyecto(
    state.answers,
    { presupuesto: BUDGET_CONCEPTS, fijos: FIXED_CONCEPTS },
    { ciudadDelPerfil: state.profile.city },
  );

  /*
    Los platillos se recortan aquí, no en el estimador: el tope es del nivel de
    acceso y la estimación es del diagnóstico. En prueba entran 2 de los 3, que
    es justo lo que la prueba incluye; el tercero llega con el pago.
  */
  const dishes = topes.platillos === null ? est.dishes : est.dishes.slice(0, topes.platillos);
  const idsSembrados = new Set(dishes.map((d) => d.id));

  return {
    ...state,
    ticket: est.ticket,
    margin: est.margin,
    project: { ...state.project, budgetCap: est.budgetCap },
    budget: est.budget,
    fixed: est.fixed,
    dishes,
    estimados: est.estimados.filter((ruta) => !ruta.startsWith('platillo:') || idsSembrados.has(ruta.slice(9))),
    selloEstimado: est.sello,
  };
}

/**
 * Los platillos estimados de un giro, sin sembrar nada más.
 *
 * Lo usa «Plantilla de mi giro» en Más, que prometía datos por giro y cargaba
 * el mismo juego de ejemplo para los diez. Devuelve lista vacía si ese giro
 * todavía no tiene platillos en la tabla, para que quien llame lo diga en vez
 * de fingir.
 */
export function platillosDeGiro(giro: string): ProjectState['dishes'] {
  return estimarProyecto({ giro }, { presupuesto: BUDGET_CONCEPTS, fijos: FIXED_CONCEPTS }).dishes;
}
