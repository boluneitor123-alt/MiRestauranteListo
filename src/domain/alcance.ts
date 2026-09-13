/**
 * Lo que de verdad se puede guardar, según el nivel.
 *
 * `PUT /api/project` recibe el estado completo y antes lo guardaba tal cual:
 * esconder un botón no impedía nada a quien llamara la API a mano. Aquí se
 * compara lo que llega contra lo que ya estaba guardado y se deja pasar sólo
 * lo que el nivel permite escribir.
 *
 * **Recorta, no rechaza.** Un `PUT` trae el estado entero, así que devolver un
 * 400 tiraría también las ediciones legítimas que vinieran en el mismo cuerpo.
 * Lo que no se puede escribir conserva el valor guardado, y `recortado` dice
 * qué se ignoró para que la pantalla lo avise en vez de fingir que guardó.
 *
 * **Nunca borra.** Ni un platillo, ni una tarea marcada, ni una cifra. Al
 * vencer la prueba todo lo capturado sigue ahí, sólo deja de ser editable.
 */

import { ROUTE_MODULES } from '@/content/route';
import { alcanceDe, alcanceDeModulo, topesDe, type AccessLevel } from './access';
import { emptyProjectState, type ProjectState } from './projectState';

/** Nombres que entiende una persona, para avisar qué no se guardó. */
export type Recortado =
  | 'platillos'
  | 'sub-recetas'
  | 'tareas'
  | 'presupuesto'
  | 'gastos-fijos'
  | 'punto-de-equilibrio'
  | 'prueba-de-estres'
  | 'revision-de-realidad'
  | 'herramientas'
  | 'diagnostico';

export interface ResultadoDeAlcance {
  state: ProjectState;
  /** Qué venía en la petición y no se guardó. Vacío = entró todo. */
  recortado: Recortado[];
}

/** Los ids de módulo, del más largo al más corto: `menu` no debe ganarle a `menu`… */
const IDS = [...ROUTE_MODULES].map((m) => m.id).sort((a, b) => b.length - a.length);

/**
 * De qué módulo es una clave de tarea.
 *
 * `taskKey` es `moduleId + index`, sin separador, así que se busca el id más
 * largo que embone y se exige que lo que sobra sean dígitos. Sin lo segundo,
 * una clave inventada podría colarse como si fuera de un módulo abierto.
 */
export function moduloDeClave(clave: string): string | undefined {
  return IDS.find((id) => clave.startsWith(id) && /^\d+$/.test(clave.slice(id.length)));
}

/** Copia las llaves congeladas del estado guardado, y avisa si venían distintas. */
function congelar<K extends keyof ProjectState>(
  entrante: ProjectState,
  guardado: ProjectState,
  llaves: readonly K[],
  etiqueta: Recortado,
  recortado: Set<Recortado>,
): Partial<ProjectState> {
  const parche: Partial<ProjectState> = {};
  for (const llave of llaves) {
    if (JSON.stringify(entrante[llave]) !== JSON.stringify(guardado[llave])) recortado.add(etiqueta);
    parche[llave] = guardado[llave];
  }
  return parche;
}

/** Los campos que edita cada módulo de Números. */
const CAMPOS_DE_NUMEROS = [
  { recurso: 'numeros:presupuesto', etiqueta: 'presupuesto', llaves: ['budget', 'budgetSub'] },
  { recurso: 'numeros:fijos', etiqueta: 'gastos-fijos', llaves: ['fixed'] },
  {
    recurso: 'numeros:equilibrio',
    etiqueta: 'punto-de-equilibrio',
    llaves: ['ticket', 'margin', 'ownerGoal', 'hours', 'closedOneDay'],
  },
  { recurso: 'numeros:aguante', etiqueta: 'prueba-de-estres', llaves: ['weeklyHours', 'prepMinutes', 'stress'] },
  { recurso: 'numeros:realidad', etiqueta: 'revision-de-realidad', llaves: ['capacity'] },
] as const;

export function aplicarAlcance(
  level: AccessLevel,
  entrante: ProjectState,
  guardado: ProjectState | null,
): ResultadoDeAlcance {
  // Sin nada guardado todavía, lo congelado son los valores de fábrica.
  const previo = guardado ?? emptyProjectState();
  const recortado = new Set<Recortado>();
  const topes = topesDe(level);

  /* ── Costeador ──────────────────────────────────────────────────────────
     Con la calculadora abierta se respeta el tope y ya: crear, editar y
     borrar son cosa de la persona. En sólo lectura se conserva lo guardado
     tal cual, ni un platillo menos. */
  const coleccion = <T,>(
    recurso: 'costeador:platillos' | 'costeador:subrecetas',
    tope: number | null,
    entran: T[],
    previos: T[],
    etiqueta: Recortado,
  ): T[] => {
    if (alcanceDe(level, recurso) !== 'abierto') {
      if (JSON.stringify(entran) !== JSON.stringify(previos)) recortado.add(etiqueta);
      return previos;
    }
    if (tope !== null && entran.length > tope) {
      recortado.add(etiqueta);
      /* Se recorta por el final: lo que ya estaba guardado va primero y no se
         pierde por mandar uno de más. */
      return entran.slice(0, Math.max(tope, previos.length));
    }
    return entran;
  };

  const dishes = coleccion('costeador:platillos', topes.platillos, entrante.dishes, previo.dishes, 'platillos');
  const subrecipes = coleccion(
    'costeador:subrecetas',
    topes.subrecetas,
    entrante.subrecipes,
    previo.subrecipes,
    'sub-recetas',
  );

  /* ── Mi Ruta ────────────────────────────────────────────────────────────
     Marcar, omitir y agregar tarea sólo en módulos abiertos. Lo de los demás
     conserva su valor guardado: una clave de un módulo cerrado que llegue en
     `true` no marca nada. */
  const puedeEditar = (moduleId: string | undefined): boolean =>
    !!moduleId && alcanceDeModulo(level, moduleId) === 'abierto';

  const done: Record<string, boolean> = { ...previo.done };
  for (const [clave, valor] of Object.entries(entrante.done)) {
    if (puedeEditar(moduloDeClave(clave))) done[clave] = valor;
    else if (valor !== previo.done[clave]) recortado.add('tareas');
  }
  // Una tarea desmarcada llega como llave ausente, no como `false`.
  for (const clave of Object.keys(previo.done)) {
    if (clave in entrante.done) continue;
    if (puedeEditar(moduloDeClave(clave))) delete done[clave];
    else recortado.add('tareas');
  }

  const skipped: Record<string, string> = { ...previo.skipped };
  for (const [moduleId, motivo] of Object.entries(entrante.skipped)) {
    if (puedeEditar(moduleId)) skipped[moduleId] = motivo;
    else if (motivo !== previo.skipped[moduleId]) recortado.add('tareas');
  }
  for (const moduleId of Object.keys(previo.skipped)) {
    if (moduleId in entrante.skipped) continue;
    if (puedeEditar(moduleId)) delete skipped[moduleId];
    else recortado.add('tareas');
  }

  const extraPermitidas = entrante.extraTasks.filter((t) => puedeEditar(t.moduleId));
  const extraCongeladas = previo.extraTasks.filter((t) => !puedeEditar(t.moduleId));
  const extraTasks = [...extraCongeladas, ...extraPermitidas];
  if (JSON.stringify(entrante.extraTasks.filter((t) => !puedeEditar(t.moduleId))) !== JSON.stringify(extraCongeladas)) {
    recortado.add('tareas');
  }

  /* ── Números y herramientas ─────────────────────────────────────────── */
  let congelados: Partial<ProjectState> = {};
  for (const grupo of CAMPOS_DE_NUMEROS) {
    if (alcanceDe(level, grupo.recurso) === 'abierto') continue;
    congelados = {
      ...congelados,
      ...congelar(entrante, previo, grupo.llaves as readonly (keyof ProjectState)[], grupo.etiqueta, recortado),
    };
  }
  if (alcanceDe(level, 'herramientas') !== 'abierto') {
    congelados = { ...congelados, ...congelar(entrante, previo, ['delivery', 'ads'], 'herramientas', recortado) };
  }

  /*
    Las respuestas del diagnóstico.

    Se capturan durante la prueba, así que ahí se dejan pasar. Al vencer se
    congelan: se descubrió probando que un guardado parcial —el estado sin la
    llave `answers`— las borraba, y con ellas el diagnóstico entero. Quien
    vuelve después de los 7 días tiene que encontrar su proyecto como lo dejó,
    no la primera pregunta del cuestionario.
  */
  if (alcanceDe(level, 'ruta:define') !== 'abierto') {
    congelados = { ...congelados, ...congelar(entrante, previo, ['answers'], 'diagnostico', recortado) };
  }

  return {
    state: { ...entrante, dishes, subrecipes, done, skipped, extraTasks, ...congelados },
    recortado: [...recortado],
  };
}
