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
 */

import { ROUTE_MODULES } from '@/content/route';
import { getLesson, LESSONS, type Lesson } from '@/content/lessons';
import { lessonArt } from '@/content/illustrations';
import { alcanceDeModulo, type AccessLevel } from '@/domain/access';

export interface LeccionServida {
  titulo: string;
  /** El contenido completo. */
  leccion: Lesson;
  /** El SVG de la ilustración, o `null` si esa lección todavía no tiene. */
  arte: string | null;
}

export type ResultadoDeLeccion =
  | { ok: true; leccion: LeccionServida }
  /** El módulo no existe, o el título no es de ese módulo. */
  | { ok: false; motivo: 'no-existe' }
  /** Existe, pero este nivel no la abre. */
  | { ok: false; motivo: 'cerrada' };

/** ¿Ese título es una tarea de ese módulo? */
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
 * Una tarea que la persona agregó a mano no tiene lección y no hay nada que
 * proteger: se contesta la de reserva, que va vacía.
 */
export function leerLeccion(level: AccessLevel, moduleId: string, titulo: string): ResultadoDeLeccion {
  const modulo = ROUTE_MODULES.find((m) => m.id === moduleId);
  if (!modulo) return { ok: false, motivo: 'no-existe' };

  if (alcanceDeModulo(level, moduleId) === 'cerrado') return { ok: false, motivo: 'cerrada' };

  // Una tarea propia: no es de las 90, así que no trae contenido que cuidar.
  if (!esDelModulo(moduleId, titulo)) {
    if (titulo in LESSONS) return { ok: false, motivo: 'no-existe' };
    return { ok: true, leccion: { titulo, leccion: getLesson(titulo), arte: null } };
  }

  return { ok: true, leccion: { titulo, leccion: getLesson(titulo), arte: lessonArt(titulo) } };
}
