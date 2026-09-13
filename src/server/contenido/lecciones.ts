/**
 * El contenido de las lecciones, servido desde el servidor.
 *
 * Antes `lessons.ts` y `illustrations.ts` los importaba un componente de
 * cliente, así que las 90 lecciones y sus ilustraciones —418 KB— se
 * descargaban al navegador de cualquiera, pagara o no. El candado era de
 * pantalla: con las herramientas del navegador se leía todo.
 *
 * Ahora el contenido no sale de aquí sin que el nivel lo permita, y la
 * comprobación usa la misma función de dominio que decide qué se ve en la app.
 *
 * Lo que no se puede dar se niega **siempre igual**: una lección cerrada, una
 * que no existe y un título que no es de ese módulo contestan lo mismo, con el
 * mismo código y el mismo cuerpo. Distinguirlas convertía este endpoint en un
 * índice de lo que hay detrás del pago.
 *
 * Las tareas que la persona agrega a mano no pasan por aquí: no tienen
 * lección, así que el navegador ni pregunta.
 */

import { ROUTE_MODULES } from '@/content/route';
import { getLesson, type Lesson } from '@/content/lessons';
import { lessonArt } from '@/content/illustrations';
import { alcanceDeModulo, type AccessLevel } from '@/domain/access';

export interface LeccionServida {
  titulo: string;
  /** El contenido completo. */
  leccion: Lesson;
  /** El SVG de la ilustración, o `null` si esa lección todavía no tiene. */
  arte: string | null;
}

/**
 * Un solo motivo de fallo, a propósito.
 *
 * Antes había dos, `cerrada` y `no-existe`, y la diferencia le confirmaba a
 * quien probara que detrás de ese título sí hay algo. Una lección que no
 * existe y una que existe pero no se abre tienen que verse exactamente igual:
 * si no, el endpoint sirve de índice de lo que hay del otro lado del pago.
 */
export type ResultadoDeLeccion =
  | { ok: true; leccion: LeccionServida }
  | { ok: false; motivo: 'no-encontrada' };

/** La única respuesta de fallo. Se comparte para que no puedan divergir. */
export const NO_ENCONTRADA: ResultadoDeLeccion = { ok: false, motivo: 'no-encontrada' };

/** ¿Ese título es una tarea de ese módulo? Un módulo que no existe: no. */
function esDelModulo(moduleId: string, titulo: string): boolean {
  return !!ROUTE_MODULES.find((m) => m.id === moduleId)?.tasks.some((t) => t.title === titulo);
}

/**
 * La lección, si quien pregunta puede verla.
 *
 * Se exige que el título pertenezca al módulo que se declara. Sin eso, pedir
 * una lección de la etapa 2 diciendo que es de Concepto habría bastado para
 * sacarla: el nivel se revisa contra el módulo, así que el módulo tiene que
 * ser el de verdad.
 *
 * Todo lo que no cumple las dos condiciones sale por la misma puerta.
 */
export function leerLeccion(level: AccessLevel, moduleId: string, titulo: string): ResultadoDeLeccion {
  /*
    Los dos hechos se calculan siempre, antes de decidir nada, y en el mismo
    orden pase lo que pase. Si se salieran antes —«está cerrado, ya no busco el
    título»— el trabajo del servidor sería distinto en cada caso y el tiempo de
    respuesta volvería a delatar cuál de los dos falló.
  */
  const esDeEsteModulo = esDelModulo(moduleId, titulo);
  const abierto = alcanceDeModulo(level, moduleId) !== 'cerrado';

  if (!esDeEsteModulo || !abierto) return NO_ENCONTRADA;

  return { ok: true, leccion: { titulo, leccion: getLesson(titulo), arte: lessonArt(titulo) } };
}
