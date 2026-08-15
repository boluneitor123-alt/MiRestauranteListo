/**
 * Avance del proyecto (README § 4 · "Avance del proyecto").
 *
 *   tareas   = módulos NO omitidos → tareas base + tareas propias del usuario
 *   avance % = round(completadas / total × 100)
 *
 * Las tareas de un módulo omitido salen del cálculo por completo: no cuentan
 * como pendientes ni como completadas.
 */

export interface RouteTask {
  /** Clave estable de la tarea, usada en el mapa de completadas. */
  key: string;
  moduleId: string;
  title: string;
  /** Pista corta bajo el título. */
  hint: string;
  why: string;
  next: string;
  /** Tarea agregada por el usuario (se puede eliminar). */
  custom?: boolean;
  /** Id de la tarea propia, para poder borrarla. */
  customId?: string;
}

export interface RouteModule {
  id: string;
  name: string;
  desc: string;
  tasks: Array<Omit<RouteTask, 'key' | 'moduleId'>>;
}

/** Tarea que el usuario agregó a un módulo. */
export interface ExtraTask {
  id: string;
  moduleId: string;
  title: string;
  hint?: string;
}

const EXTRA_TASK_DEFAULTS = {
  hint: 'Tarea que agregaste tú',
  why: 'La agregaste porque es importante para tu apertura.',
  next: 'Complétala y márcala para subir tu avance.',
};

/** Clave de una tarea base: id del módulo + su posición. */
export function taskKey(moduleId: string, index: number): string {
  return `${moduleId}${index}`;
}

/** Clave de una tarea propia. */
export function extraTaskKey(id: string): string {
  return `x${id}`;
}

/** Tareas de un módulo: las base seguidas de las propias del usuario. */
export function moduleTasks(module: RouteModule, extras: readonly ExtraTask[] = []): RouteTask[] {
  const base = module.tasks.map((t, i) => ({ ...t, moduleId: module.id, key: taskKey(module.id, i) }));
  const own = extras
    .filter((x) => x.moduleId === module.id)
    .map((x) => ({
      key: extraTaskKey(x.id),
      moduleId: module.id,
      title: x.title,
      hint: x.hint || EXTRA_TASK_DEFAULTS.hint,
      why: EXTRA_TASK_DEFAULTS.why,
      next: EXTRA_TASK_DEFAULTS.next,
      custom: true,
      customId: x.id,
    }));
  return [...base, ...own];
}

export interface ProgressInput {
  modules: readonly RouteModule[];
  extraTasks?: readonly ExtraTask[];
  /** Mapa clave de tarea → completada. */
  done: Readonly<Record<string, boolean>>;
  /** Mapa id de módulo → motivo de omisión. */
  skipped?: Readonly<Record<string, string>>;
}

export interface ModuleProgress {
  id: string;
  name: string;
  desc: string;
  skipped: boolean;
  /** Motivo declarado al omitir el módulo. */
  reason?: string;
  total: number;
  done: number;
  pct: number;
  tasks: RouteTask[];
}

export interface ProjectProgress {
  total: number;
  done: number;
  pct: number;
  /** Nivel mostrado en el diagnóstico. */
  level: string;
  modules: ModuleProgress[];
  /** Primera tarea pendiente en orden de módulos: alimenta "Tu siguiente paso". */
  nextTask?: RouteTask;
}

export function progressLevel(pct: number): string {
  if (pct < 25) return 'Etapa de idea';
  if (pct < 50) return 'En planeación';
  if (pct < 80) return 'Casi listo';
  return 'Listo para abrir';
}

export function projectProgress(input: ProgressInput): ProjectProgress {
  const skipped = input.skipped ?? {};
  const extras = input.extraTasks ?? [];

  const modules: ModuleProgress[] = input.modules.map((m) => {
    const tasks = moduleTasks(m, extras);
    const doneCount = tasks.filter((t) => input.done[t.key]).length;
    const isSkipped = !!skipped[m.id];
    return {
      id: m.id,
      name: m.name,
      desc: m.desc,
      skipped: isSkipped,
      reason: skipped[m.id],
      total: tasks.length,
      done: doneCount,
      pct: tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0,
      tasks,
    };
  });

  const counted = modules.filter((m) => !m.skipped);
  const total = counted.reduce((a, m) => a + m.total, 0);
  const done = counted.reduce((a, m) => a + m.done, 0);
  const pct = total ? Math.round((done / total) * 100) : 0;
  const nextTask = counted.flatMap((m) => m.tasks).find((t) => !input.done[t.key]);

  return { total, done, pct, level: progressLevel(pct), modules, nextTask };
}

/**
 * Avance que quedaría si se omitiera un módulo más.
 * Es el número que muestra el paso 3 del flujo de omisión:
 * "Sacaremos sus N tareas de tu avance. Tu avance quedaría en Y%."
 */
export function progressWithoutModule(input: ProgressInput, moduleId: string): { pct: number; removedTasks: number } {
  const simulated = projectProgress({
    ...input,
    skipped: { ...(input.skipped ?? {}), [moduleId]: input.skipped?.[moduleId] ?? 'simulado' },
  });
  const current = projectProgress(input);
  const module = current.modules.find((m) => m.id === moduleId);
  return { pct: simulated.pct, removedTasks: module ? module.total : 0 };
}
