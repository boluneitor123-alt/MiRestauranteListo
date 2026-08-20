/**
 * El calendario de 30 días del Plan de apertura (sección 6 de
 * `PlanDeApertura.dc.html`).
 *
 * El prototipo trae un calendario de ejemplo; aquí sale de las tareas que el
 * dueño todavía tiene pendientes en Mi Ruta, en el orden de la ruta. Cuatro
 * semanas, y cada semana toma el foco del módulo de su primera tarea.
 */

import type { ProjectProgress } from './progress';

/** Semanas que cubre el calendario. */
export const PLAN_WEEKS = 4;
/** Tareas por semana: es lo que cabe sin que la semana se vuelva una lista. */
export const TASKS_PER_WEEK = 4;

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

const DAY = 24 * 60 * 60 * 1000;

/** "5 sep", como en el documento del prototipo. */
export function shortDate(date: Date): string {
  return `${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

export interface PlanWeek {
  /** "Semana 1". */
  week: string;
  /** "5 sep a 11 sep". */
  range: string;
  /** Módulo al que pertenece la primera tarea de la semana. */
  focus: string;
  /** Las tareas de la semana, ya en una sola línea. */
  tasks: string;
  /** Cuántas tareas son. */
  count: number;
}

/**
 * Reparte las tareas pendientes de la ruta en cuatro semanas.
 *
 * Los mini cursos no entran: son puntos extra, no pasos de la apertura. Los
 * módulos omitidos tampoco, porque el dueño ya dijo que no los va a usar.
 */
export function openingCalendar(progress: ProjectProgress, from: Date, done: Record<string, boolean>): PlanWeek[] {
  const pending = progress.modules
    .filter((m) => !m.skipped && !m.course)
    .flatMap((m) => m.tasks.filter((t) => !done[t.key]).map((t) => ({ module: m.name, title: t.title })));

  const weeks: PlanWeek[] = [];
  for (let i = 0; i < PLAN_WEEKS; i++) {
    const chunk = pending.slice(i * TASKS_PER_WEEK, (i + 1) * TASKS_PER_WEEK);
    if (!chunk.length) break;
    const start = new Date(from.getTime() + i * 7 * DAY);
    const end = new Date(start.getTime() + 6 * DAY);
    weeks.push({
      week: `Semana ${i + 1}`,
      range: `${shortDate(start)} a ${shortDate(end)}`,
      focus: chunk[0].module,
      tasks: chunk.map((t) => t.title).join(' · '),
      count: chunk.length,
    });
  }
  return weeks;
}
