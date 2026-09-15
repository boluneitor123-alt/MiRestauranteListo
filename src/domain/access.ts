/**
 * Qué abre cada nivel de acceso (README § 1.12).
 *
 * Es la regla de negocio del producto, no un detalle de interfaz: vive aquí
 * para que la app, la API y las pruebas usen la misma verdad. El servidor
 * decide el **nivel**; el alcance de cada nivel sale de la tabla `ALCANCES`,
 * que se lee igual en el servidor y en el navegador.
 *
 * Antes había dos cosas peleadas: un objeto `Capabilities` con campos planos
 * —cuatro de ellos sin un solo consumidor— y una función suelta,
 * `routeTaskAccess`, que decidía lo importante sin consultarlo. Y sólo había
 * dos estados, abierto y cerrado, así que «se ve pero no se edita» no cabía en
 * ninguna parte. Ahora el estado tiene tres valores y la tabla es el contrato.
 */

import { ETAPAS, ROUTE_MODULES } from '@/content/route';
import { grantsAccess, trialState, type License, LICENSE_DEFAULTS } from './license';

export type AccessLevel =
  /** Prueba vigente. */
  | 'prueba'
  /** Licencia activada: todo abierto. */
  | 'licencia'
  /** La prueba terminó sin pago. */
  | 'bloqueado';

/**
 * Los tres estados de un recurso.
 *
 * `solo-lectura` no es un gris a medias: es un estado con sus propias reglas.
 * Lo capturado se ve completo y no se pierde nada; lo que se apaga es la
 * escritura. Al vencer la prueba, la etapa 1 cae aquí — nunca a `cerrado`.
 * Si se pierde el trabajo, se pierde la venta.
 */
export type Alcance = 'abierto' | 'solo-lectura' | 'cerrado';

export type Recurso =
  /* Mi Ruta, por etapa. `cerrado` deja ver la lista y el resumen de cada
     tarea, pero no abre la lección. */
  | 'ruta:define'
  | 'ruta:construye'
  | 'ruta:abre'
  /** Los cuatro mini cursos: misma regla que una etapa cerrada. */
  | 'ruta:cursos'
  | 'costeador:platillos'
  | 'costeador:subrecetas'
  | 'costeador:menu'
  | 'numeros:presupuesto'
  | 'numeros:fijos'
  | 'numeros:equilibrio'
  | 'numeros:aguante'
  | 'numeros:realidad'
  /** El resumen financiero para imprimir o guardar en PDF. */
  | 'numeros:resumen'
  /** Los documentos imprimibles de Más. */
  | 'documentos'
  /** Plantillas y guías de Más. */
  | 'recursos'
  /** Calculadora de delivery y analizador de anuncios. */
  | 'herramientas';

export const RECURSOS: readonly Recurso[] = [
  'ruta:define',
  'ruta:construye',
  'ruta:abre',
  'ruta:cursos',
  'costeador:platillos',
  'costeador:subrecetas',
  'costeador:menu',
  'numeros:presupuesto',
  'numeros:fijos',
  'numeros:equilibrio',
  'numeros:aguante',
  'numeros:realidad',
  'numeros:resumen',
  'documentos',
  'recursos',
  'herramientas',
];

const todo = (alcance: Alcance): Record<Recurso, Alcance> =>
  Object.fromEntries(RECURSOS.map((r) => [r, alcance])) as Record<Recurso, Alcance>;

/**
 * ─── El contrato ────────────────────────────────────────────────────────────
 *
 * Esta tabla **es** el alcance de cada nivel. Nada se decide fuera de aquí: si
 * una pantalla necesita saber si algo se abre, pregunta por su recurso.
 *
 * Prueba de 7 días:
 *   · Etapa 1 DEFINE completa: se abre, se lee y se marca.
 *   · Etapas 2 y 3: la ruta se ve entera —módulos, títulos, el resumen de cada
 *     tarea y los contadores— para entender qué se compra, pero las lecciones
 *     no abren. El contenido es el producto.
 *   · Mini cursos: portada sí, lecciones no. Misma regla, sin excepciones: la
 *     «muestra gratis» de la lección 1 se quitó.
 *   · Costeador: la calculadora funciona completa, con tope de platillos y de
 *     sub-recetas. Mi menú se arma de los platillos, así que hereda el tope.
 *   · Números: se entra a los cinco módulos y se ve la estructura, sin
 *     capturar. El resumen para imprimir queda fuera.
 *
 * Al vencer los 7 días todo lo capturado sigue visible y deja de ser editable.
 * Nunca se borra nada.
 */
const ALCANCES: Record<AccessLevel, Record<Recurso, Alcance>> = {
  licencia: todo('abierto'),

  prueba: {
    ...todo('cerrado'),
    'ruta:define': 'abierto',
    'costeador:platillos': 'abierto',
    'costeador:subrecetas': 'abierto',
    'costeador:menu': 'abierto',
    'numeros:presupuesto': 'solo-lectura',
    'numeros:fijos': 'solo-lectura',
    'numeros:equilibrio': 'solo-lectura',
    'numeros:aguante': 'solo-lectura',
    'numeros:realidad': 'solo-lectura',
  },

  bloqueado: {
    ...todo('cerrado'),
    'ruta:define': 'solo-lectura',
    'costeador:platillos': 'solo-lectura',
    'costeador:subrecetas': 'solo-lectura',
    'costeador:menu': 'solo-lectura',
    'numeros:presupuesto': 'solo-lectura',
    'numeros:fijos': 'solo-lectura',
    'numeros:equilibrio': 'solo-lectura',
    'numeros:aguante': 'solo-lectura',
    'numeros:realidad': 'solo-lectura',
  },
};

/**
 * Cuántas cosas se guardan. Va aparte de `Alcance` a propósito: un tope no es
 * un estado, es un número. `null` = sin tope.
 */
export interface Topes {
  platillos: number | null;
  subrecetas: number | null;
}

const TOPES: Record<AccessLevel, Topes> = {
  licencia: { platillos: null, subrecetas: null },
  prueba: { platillos: 2, subrecetas: 2 },
  // Vencida no se crea nada nuevo, pero lo que ya existe se conserva: el tope
  // no borra, lo hace el alcance de sólo lectura.
  bloqueado: { platillos: 2, subrecetas: 2 },
};

export interface Capabilities {
  /** El alcance de cada recurso en este nivel. */
  alcances: Record<Recurso, Alcance>;
  topes: Topes;
  /**
   * ¿Se puede enseñar la cifra de inversión y el excedente de presupuesto?
   * En prueba **nunca**: ni en Inicio, ni en Números, ni en el mentor, ni en
   * Alertas. Es de lo que se abre con el pago.
   */
  muestraCifrasDeInversion: boolean;
}

export function capabilities(level: AccessLevel): Capabilities {
  return {
    alcances: ALCANCES[level],
    topes: TOPES[level],
    muestraCifrasDeInversion: level === 'licencia',
  };
}

export const alcanceDe = (level: AccessLevel, recurso: Recurso): Alcance => ALCANCES[level][recurso];

export const topesDe = (level: AccessLevel): Topes => TOPES[level];

/* ─────────────────────────────  Mi Ruta  ─────────────────────────────────── */

/** Ids de etapa tal como los declara `ETAPAS`, sin teclearlos otra vez. */
export type EtapaId = string;

/**
 * En qué etapa cae un módulo. Sale de `ETAPAS`, que ya es la fuente única de
 * la agrupación. Los módulos que no están en ninguna etapa son los cuatro mini
 * cursos.
 */
export function etapaDeModulo(moduleId: string): EtapaId | undefined {
  return ETAPAS.find((e) => e.mods.includes(moduleId))?.id;
}

export const esMiniCurso = (moduleId: string): boolean => etapaDeModulo(moduleId) === undefined;

const recursoDeEtapa = (etapa: EtapaId): Recurso => `ruta:${etapa}` as Recurso;

/**
 * El alcance de un módulo de Mi Ruta.
 *
 * `abierto` abre la lección y deja marcarla; `solo-lectura` la abre y no deja
 * marcarla; `cerrado` deja ver el título y el resumen de la tarea en la lista,
 * pero la lección no abre.
 */
export function alcanceDeModulo(level: AccessLevel, moduleId: string): Alcance {
  const etapa = etapaDeModulo(moduleId);
  return alcanceDe(level, etapa ? recursoDeEtapa(etapa) : 'ruta:cursos');
}

/** Igual que `alcanceDeModulo`: la tarea hereda el alcance de su módulo. */
export const alcanceDeTarea = (level: AccessLevel, moduleId: string): Alcance =>
  alcanceDeModulo(level, moduleId);

/** ¿Se puede marcar, agregar tarea u omitir este módulo? */
export const sePuedeEditarModulo = (level: AccessLevel, moduleId: string): boolean =>
  alcanceDeModulo(level, moduleId) === 'abierto';

/** ¿Abre la lección completa? */
export const seAbreLaLeccion = (level: AccessLevel, moduleId: string): boolean =>
  alcanceDeModulo(level, moduleId) !== 'cerrado';

/* ──────────────────────────────  Topes  ─────────────────────────────────── */

/**
 * ¿Cabe uno más?
 *
 * Dos condiciones, y las dos importan: que el recurso esté abierto —al vencer
 * la prueba lo guardado se conserva pero ya no se crea nada— y que quede lugar
 * bajo el tope.
 */
export function sePuedeGuardarOtro(level: AccessLevel, que: keyof Topes, cuantos: number): boolean {
  const recurso: Recurso = que === 'platillos' ? 'costeador:platillos' : 'costeador:subrecetas';
  if (alcanceDe(level, recurso) !== 'abierto') return false;
  const tope = TOPES[level][que];
  return tope === null ? true : cuantos < tope;
}

/** Aviso del tope en la vista de Platillos. `null` = sin tope que avisar. */
export function avisoDeTope(level: AccessLevel, que: keyof Topes, cuantos: number): string | null {
  const tope = TOPES[level][que];
  if (tope === null) return null;

  const cosa = que === 'platillos' ? 'platillos' : 'sub-recetas';
  if (level === 'bloqueado') return `${CANDADO_VENCIDO} Lo que costeaste sigue aquí.`;

  const faltan = Math.max(0, tope - cuantos);
  return faltan > 0
    ? `En la prueba puedes costear ${tope} ${cosa}. Te ${faltan === 1 ? 'queda 1' : `quedan ${faltan}`}.`
    : `Llegaste a las ${tope} ${cosa} de la prueba. ${CANDADO_TEXTO}`;
}

/* ─────────────────────────  Textos del candado  ─────────────────────────── */

/** Lo que está detrás del pago. Un solo texto, en todas las pantallas. */
export const CANDADO_TEXTO = 'Desbloquea con el pago único';

/** Lo mismo, cuando lo que se apaga es la edición y no el contenido. */
export const CANDADO_EDICION = 'Para editar, desbloquea con el pago único';

/** Cuando los 7 días ya pasaron. */
export const CANDADO_VENCIDO = 'Tu prueba terminó. Desbloquea con el pago único.';

/** La cifra de inversión, mientras no se abre. */
export const INVESTMENT_HIDDEN_LABEL = 'Con el pago único';

/**
 * El texto que toca según el nivel y lo que se esté bloqueando.
 *
 * `null` con licencia: a quien pagó no se le ofrece pagar. Es la misma regla
 * de precedencia que en `avisoDePrueba` — primero el nivel, después todo lo
 * demás— y aquí devuelve nada en vez de un texto para que una pantalla que se
 * olvide de preguntar pinte un hueco y no una venta.
 */
export function textoDeCandado(level: AccessLevel, motivo: 'contenido' | 'edicion'): string | null {
  if (level === 'licencia') return null;
  if (level === 'bloqueado') return CANDADO_VENCIDO;
  return motivo === 'edicion' ? CANDADO_EDICION : CANDADO_TEXTO;
}

/* ──────────────────────  El aviso de la prueba  ─────────────────────────── */

/** Lo que se le dice a alguien sobre su prueba, o `null` si no hay nada que decir. */
export interface AvisoDePrueba {
  titulo: string;
  detalle: string;
  /** Los 7 días ya pasaron. Sólo para el tono; la decisión ya está tomada. */
  vencida: boolean;
}

/**
 * El aviso de prueba que le toca a este nivel.
 *
 * **El nivel manda; la fecha sólo decide el tono.** `licencia` devuelve `null`
 * en la primera línea, sin mirar el calendario: la prueba de 7 días del equipo
 * sigue corriendo y venciendo en la base aunque la persona haya pagado el día
 * dos, y una pantalla que leyera `trial.expired` por su cuenta le diría «Tu
 * prueba terminó» a alguien que compró acceso de por vida. No es un letrero
 * feo: es decirle que perdió lo que pagó.
 *
 * Ésta es la única función que decide si se muestra un aviso de prueba. Si
 * hace falta uno nuevo, sale de aquí; ninguna pantalla vuelve a mirar la fecha.
 */
export function avisoDePrueba(
  level: AccessLevel,
  trial: { daysLeft: number; expired: boolean } | null,
): AvisoDePrueba | null {
  if (level === 'licencia' || !trial) return null;

  if (trial.expired) {
    return { titulo: 'Tu prueba terminó', detalle: resumenDeAlcance(level), vencida: true };
  }
  const dias = trial.daysLeft === 1 ? 'Te queda 1 día' : `Te quedan ${trial.daysLeft} días`;
  return { titulo: 'Versión de prueba', detalle: `${dias}. ${resumenDeAlcance(level)}`, vencida: false };
}

/** Acceso de por vida. Lo que ve en su estado quien ya pagó. */
export const ETIQUETA_DE_POR_VIDA = 'Acceso de por vida';

/**
 * La etiqueta de estado que va en las píldoras de Más, del paywall y del
 * perfil. Con licencia dice lo que compró; sin ella, cómo va su prueba.
 *
 * Existe porque `trialState().label` se arma sólo con fechas —no sabe de
 * licencias— y estaba pintándose crudo en cuatro lugares, cada uno con su
 * propio `if` a mano. Uno de los cuatro no lo tenía.
 */
export function etiquetaDeAcceso(level: AccessLevel, etiquetaDePrueba: string | undefined): string {
  if (level === 'licencia') return ETIQUETA_DE_POR_VIDA;
  return etiquetaDePrueba ?? 'Prueba en curso';
}

/**
 * Lo que abre este nivel, en una línea, para el aviso de Inicio.
 *
 * Se compone de `ETAPAS`, de los módulos y de `TOPES`: los conteos se calculan.
 * El texto anterior estaba tecleado —«Concepto y Local completos, la primera
 * lección de los otros 12 módulos, 3 platillos»— y quedó mintiendo en cuanto
 * cambió el contrato.
 */
export function resumenDeAlcance(level: AccessLevel): string {
  if (level === 'licencia') return 'Tienes todo abierto, de por vida.';

  const primera = ETAPAS[0];
  const tareas = primera.mods
    .map((id) => ROUTE_MODULES.find((m) => m.id === id))
    .reduce((suma, m) => suma + (m?.tasks.length ?? 0), 0);

  if (level === 'bloqueado') {
    return `Todo lo que capturaste sigue aquí, completo y visible: las ${tareas} tareas de ${primera.name}, tus platillos y tus números. Desbloquea con el pago único para volver a editarlo.`;
  }

  const tope = TOPES.prueba.platillos;
  return `Trabajas completa la etapa ${primera.n} ${primera.name}, sus ${tareas} tareas, y costeas ${tope} platillos. Ves la ruta entera para saber qué sigue.`;
}

/** Estado que muestra el menú de cursos junto a cada uno. */
export function courseState(level: AccessLevel, done: number): string {
  if (alcanceDe(level, 'ruta:cursos') === 'cerrado') return 'se abre con el pago único';
  return done ? `${done} completadas` : 'sin empezar';
}

/* ──────────────────────────  Nivel de acceso  ───────────────────────────── */

export interface AccessInput {
  license?: License;
  /** Momento del primer arranque. */
  trialStart: number;
  now: number;
  trialDays?: number;
}

export interface AccessState {
  level: AccessLevel;
  trial: ReturnType<typeof trialState>;
  licensed: boolean;
}

export function resolveAccess(input: AccessInput): AccessState {
  const trial = trialState(input.trialStart, input.now, input.trialDays ?? LICENSE_DEFAULTS.trialDays);
  const licensed = grantsAccess(input.license);
  return {
    level: licensed ? 'licencia' : trial.expired ? 'bloqueado' : 'prueba',
    trial,
    licensed,
  };
}
