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
  /** Token de color del módulo, sin el prefijo --color-. */
  col?: string;
  /** true en los cuatro mini cursos con estrella. */
  course?: boolean;
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
  /** Token de color del módulo, sin el prefijo --color-. */
  col: string;
  /** true en los cuatro mini cursos con estrella. */
  course: boolean;
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
      col: m.col ?? 'accent-500',
      course: !!m.course,
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

/* ────────────────────  A tu ritmo actual, abres el…  ──────────────────── */

const DAY_MS = 86_400_000;

const MESES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

/** Ritmo mínimo con el que se proyecta: menos de esto se lee como "nunca". */
export const MIN_PACE = 0.15;
/**
 * Tareas hechas antes de atreverse a proyectar una fecha. Con menos, el ritmo
 * todavía no dice nada: una tarea el primer día proyectaría tres meses y otra
 * el segundo, seis. Hasta llegar aquí se anima, no se estima.
 */
export const PACE_MIN_TASKS = 10;

/**
 * "Te faltan 78 tareas. A tu ritmo actual, abres alrededor del 28 de septiembre."
 *
 * Portado del prototipo. El ritmo son las tareas hechas entre los días que
 * lleva usando la app. Con menos de `PACE_MIN_TASKS` hechas no se estima nada:
 * el ritmo todavía no es un ritmo, y una fecha inventada a esas alturas
 * desanima en vez de ayudar.
 */
export function paceProjection(input: {
  /** Tareas que le faltan. */
  pending: number;
  /** Tareas que ya hizo. */
  done: number;
  /** Cuándo empezó: la fecha en que arrancó su prueba. */
  startedAt: number;
  now: number;
}): string {
  if (input.pending <= 0) return 'Terminaste tu ruta completa.';
  if (input.done < PACE_MIN_TASKS) {
    return `Vas muy bien. Con ${PACE_MIN_TASKS} tareas hechas te digo, a tu ritmo, para cuándo abres.`;
  }

  const daysIn = Math.max(1, Math.round((input.now - input.startedAt) / DAY_MS));
  const pace = input.done / daysIn;
  const daysLeft = Math.ceil(input.pending / Math.max(MIN_PACE, pace));
  const day = new Date(input.now + daysLeft * DAY_MS);

  return (
    `Te faltan ${input.pending} ${input.pending === 1 ? 'tarea' : 'tareas'}. ` +
    `A tu ritmo actual, abres alrededor del ${day.getDate()} de ${MESES[day.getMonth()]}.`
  );
}

/** Estado de una etapa: los tres que pinta el prototipo. */
export type StageState = 'Completado' | 'En progreso' | 'Pendiente';

export interface StageProgress {
  id: string;
  /** El número que se pinta en el círculo. */
  n: string;
  name: string;
  desc: string;
  /** Los dos trazos del icono de la etapa. */
  d1: string;
  d2: string;
  /** Relleno y tinta del icono. */
  tint: string;
  ink: string;
  total: number;
  done: number;
  state: StageState;
  /** Los módulos de la etapa, en el orden que declara la etapa. */
  modules: ModuleProgress[];
}

/** La forma mínima de una etapa: lo que `ETAPAS` declara en el prototipo. */
export interface StageDef {
  id: string;
  n: string;
  name: string;
  desc: string;
  mods: readonly string[];
  d1: string;
  d2: string;
  tint: string;
  ink: string;
}

/**
 * Las etapas con su avance. La agrupación viene de `ETAPAS`; aquí sólo se
 * cuentan las tareas de sus módulos, para que ninguna pantalla tenga que
 * repetir qué módulo cae en qué etapa.
 *
 * Un módulo omitido se queda fuera de la cuenta, igual que en el avance
 * general: sus tareas no son pendientes ni completadas.
 */
export function stageProgress(stages: readonly StageDef[], modules: readonly ModuleProgress[]): StageProgress[] {
  return stages.map((stage) => {
    const mods = stage.mods
      .map((id) => modules.find((m) => m.id === id))
      .filter((m): m is ModuleProgress => !!m);
    const contadas = mods.filter((m) => !m.skipped);
    const total = contadas.reduce((a, m) => a + m.total, 0);
    const done = contadas.reduce((a, m) => a + m.done, 0);
    const state: StageState = !total ? 'Pendiente' : done === total ? 'Completado' : done > 0 ? 'En progreso' : 'Pendiente';
    return {
      id: stage.id,
      n: stage.n,
      name: stage.name,
      desc: stage.desc,
      d1: stage.d1,
      d2: stage.d2,
      tint: stage.tint,
      ink: stage.ink,
      total,
      done,
      state,
      modules: mods,
    };
  });
}

/**
 * La etapa en la que va el proyecto, como la dice Inicio: "Define · etapa 1
 * de 3". Si lo pendiente ya es un mini curso, la ruta terminó y no hay etapa.
 */
export function stageLabel(stages: readonly StageDef[], nextTask?: RouteTask): string {
  const i = nextTask ? stages.findIndex((e) => e.mods.includes(nextTask.moduleId)) : -1;
  if (i < 0) return 'Puntos extra';
  const nombre = stages[i].name.charAt(0) + stages[i].name.slice(1).toLowerCase();
  return `${nombre} · etapa ${i + 1} de ${stages.length}`;
}
