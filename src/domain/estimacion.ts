/**
 * El diagnóstico como motor, no como archivo.
 *
 * La persona contestaba 12 preguntas y recibía una pantalla en ceros: 0%
 * completado, $0 de venta, costo «—». Su primera tarea era escribir un párrafo.
 * Aquí se invierte: con lo que ya contestó se arma un proyecto completo y lo
 * único que le queda es corregirlo.
 *
 * Función pura: recibe las respuestas, devuelve el estado y la etiqueta de
 * dónde salió. No lee el reloj, no toca la red y no sabe de niveles de acceso
 * — de los topes de la prueba se encarga quien la llama.
 */

import {
  CIUDADES,
  CIUDADES_CONOCIDAS,
  CONCEPTOS_DE_ESPACIO,
  ESTIMACIONES,
  GIRO_GENERICO,
  TAMANOS,
  type EstimacionDeGiro,
  type PlatilloEstimado,
} from '@/content/estimaciones';
import type { Concept } from './finance';
import type { Dish } from './types';

/* ──────────────────────────  Lo que se estima  ──────────────────────────── */

/**
 * Cada valor estimado deja su rastro aquí, con una ruta.
 *
 * `presupuesto:renta`, `fijos:nomina`, `ticket`, `platillo:e1`. Cuando la
 * persona cambia uno, su ruta se borra de la lista y ese valor pasa a ser
 * suyo: la app no vuelve a tocarlo nunca.
 */
export type RutaEstimada = string;

export interface Estimacion {
  ticket: number;
  margin: number;
  budget: Concept[];
  fixed: Concept[];
  dishes: Dish[];
  /** El tope de presupuesto que se deduce de su respuesta. */
  budgetCap: number;
  /** Qué quedó estimado. Se va vaciando conforme ella corrige. */
  estimados: RutaEstimada[];
  /**
   * De dónde salió, en palabras: «estimado para taquería con equipo de 1 a 2
   * personas». Se enseña junto a los números para que nadie los confunda con
   * un dato suyo.
   */
  sello: string;
}

/* ─────────────────────  Leer lo que contestó  ───────────────────────────── */

/**
 * El tope de presupuesto que implica su respuesta.
 *
 * Antes la respuesta se archivaba y el tope se quedaba en los $250,000 de
 * fábrica: alguien que contestó «Menos de $50,000» veía su inversión comparada
 * contra un número que nunca dio. Se toma el punto medio del rango; de los
 * extremos abiertos, el borde.
 */
const TOPES_DE_PRESUPUESTO: Array<[string, number]> = [
  ['Menos de $50,000', 40_000],
  ['$50,000 a $100,000', 75_000],
  ['$100,000 a $250,000', 175_000],
  ['$250,000 a $500,000', 375_000],
  ['Más de $500,000', 600_000],
];

export function topeDePresupuesto(respuesta: string | undefined): number | undefined {
  return TOPES_DE_PRESUPUESTO.find(([texto]) => texto === respuesta)?.[1];
}

/**
 * Cuánto se mueve el arranque según el dinero con el que cuenta.
 *
 * Dos negocios del mismo giro no cuestan lo mismo si uno abre con $50,000 y el
 * otro con medio millón. El factor toca la inversión y la renta, no el ticket
 * ni el margen: esos son del giro, no del bolsillo.
 */
const FACTOR_POR_PRESUPUESTO: Record<string, number> = {
  'Menos de $50,000': 0.45,
  '$50,000 a $100,000': 0.65,
  '$100,000 a $250,000': 0.9,
  '$250,000 a $500,000': 1.25,
  'Más de $500,000': 1.6,
};

/**
 * Cuánta gente implica su respuesta. Mueve la nómina, nada más.
 *
 * La segunda columna es cómo se lee en la etiqueta: las opciones del
 * diagnóstico son «1 a 2», «6 o más», que pegadas a «con equipo de» quedan
 * cojas. Se redacta aquí y no se arma con pedazos.
 */
const EQUIPO: Record<string, { factor: number; comoSeLee: string }> = {
  'Solo yo': { factor: 0.35, comoSeLee: 'trabajando tú solo' },
  '1 a 2': { factor: 0.6, comoSeLee: 'con equipo de 1 a 2 personas' },
  '3 a 5': { factor: 1, comoSeLee: 'con equipo de 3 a 5 personas' },
  '6 o más': { factor: 1.5, comoSeLee: 'con equipo de 6 o más personas' },
};

/** La nómina la mueve el equipo; todo lo demás, el bolsillo. */
const ES_NOMINA = (llave: string): boolean => llave === 'nomina';

/* ─────────────────────────  La afinación  ───────────────────────────────── */

/**
 * Ciudad y tamaño del local, que el diagnóstico no pregunta.
 *
 * Se contestan después, en la tarjeta de Números. Mientras no estén las dos,
 * la estimación usa el presupuesto como proxy de "qué tan grande y dónde":
 * media respuesta movería la renta sin saber el tamaño, que es peor que no
 * moverla.
 */
export interface Afinacion {
  ciudad: string | undefined;
  tamano: string | undefined;
}

const opcionDeCiudad = (r: string | undefined) => CIUDADES.find((c) => c.opcion === r);
const opcionDeTamano = (r: string | undefined) => TAMANOS.find((t) => t.opcion === r);

/** ¿Está contestada la tarjeta de afinación? */
export function estaAfinado(answers: Record<string, string>): boolean {
  return !!opcionDeCiudad(answers.ciudad) && !!opcionDeTamano(answers.tamano);
}

/** Sin acentos y en minúsculas, para comparar lo que la persona escribió. */
const plano = (s: string): string =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es-MX')
    .trim();

/**
 * La opción de ciudad que implica lo que ya escribió en su perfil.
 *
 * Existe para no preguntarle dos veces lo mismo. Lo que no esté en la tabla
 * devuelve `undefined` y la tarjeta pregunta: suponer que un pueblo que no
 * conozco es una ciudad grande le movería la renta hacia arriba sin razón.
 */
export function ciudadDelPerfil(city: string | undefined): string | undefined {
  const escrito = plano(city ?? '');
  if (escrito.length < 3) return undefined;
  for (const { busca, opcion } of CIUDADES_CONOCIDAS) {
    if (busca.some((nombre) => escrito.includes(nombre))) return opcion;
  }
  return undefined;
}

/**
 * La ciudad del perfil como se lee en pantalla.
 *
 * Es texto libre: llega «zapopan, jalisco», «CDMX » o «Monterrey NL». Se toma
 * lo de antes de la coma y se le sube la primera letra, nada más — es su
 * texto, no uno nuestro. La coma importa: el sello ya separa sus partes con
 * comas, y «en Zapopan, jalisco» se leía como dos datos distintos.
 */
export function nombreDeCiudad(city: string | undefined): string {
  const escrita = (city ?? '').split(',')[0].trim();
  if (!escrita || escrita.length > 28) return '';
  return `${escrita.charAt(0).toLocaleUpperCase('es-MX')}${escrita.slice(1)}`;
}

/** Los conceptos cuyo monto depende de la ciudad y del tamaño del local. */
const esDeEspacio = (grupo: 'presupuesto' | 'fijos', llave: string): boolean =>
  (CONCEPTOS_DE_ESPACIO[grupo] as readonly string[]).includes(llave);

/* ──────────────────────────  El estimador  ──────────────────────────────── */

const redondear = (v: number): number => Math.max(0, Math.round(v / 100) * 100);

function conceptos(
  grupo: 'presupuesto' | 'fijos',
  plantilla: Record<string, number>,
  catalogo: readonly Concept[],
  factores: { general: number; nomina: number; espacio: number | undefined },
): Concept[] {
  const factorDe = (llave: string): number => {
    if (ES_NOMINA(llave)) return factores.nomina;
    /*
      El de espacio **sustituye** al general, no se le suma. El presupuesto
      con el que cuenta era un proxy de dónde y de qué tamaño va a abrir;
      contestada la pregunta directa, multiplicar los dos cobraría dos veces
      lo mismo y sacaba rentas de $58,000 para una taquería.
    */
    if (factores.espacio !== undefined && esDeEspacio(grupo, llave)) return factores.espacio;
    return factores.general;
  };
  return catalogo.map((c) => ({ ...c, amount: redondear((plantilla[c.key] ?? 0) * factorDe(c.key)) }));
}

function aPlatillo(p: PlatilloEstimado, indice: number): Dish {
  return {
    id: `est-${indice + 1}`,
    name: p.nombre,
    price: p.precio,
    portions: 1,
    ...(p.extras ? { extrasPct: p.extras } : {}),
    ...(p.seccion ? { section: p.seccion } : {}),
    ...(p.popularidad ? { popularity: p.popularidad } : {}),
    ingredients: p.ingredientes.map((i, n) => ({
      id: `est-${indice + 1}-${n + 1}`,
      name: i.nombre,
      qty: i.qty,
      unit: i.u,
      buyPrice: i.buyPrice,
      buyQty: i.buyQty,
      buyUnit: i.bu,
      waste: i.merma,
    })),
  };
}

/**
 * Cómo se nombra el giro en la etiqueta. El genérico no presume uno.
 *
 * La etiqueta dice exactamente lo que la app sabe, ni una palabra más: si no
 * contestó la afinación, no aparece ni la ciudad ni el tamaño. Por eso vale
 * la pena contestarla — se ve que la estimación se volvió más específica.
 */
/**
 * Cómo se nombra la ciudad en la etiqueta.
 *
 * Si lo que escribió en su perfil cae en la misma opción que contestó, va su
 * ciudad con nombre y apellido —«en Zapopan»— en vez de la opción genérica:
 * es más suyo y se lee mejor. Si su perfil dice otra cosa, gana lo que
 * contestó en la tarjeta, que es la respuesta más reciente y más deliberada.
 */
function comoSeLeeLaCiudad(
  ciudad: { opcion: string; comoSeLee: string },
  ciudadDelPerfilEscrita: string | undefined,
): string {
  const nombre = nombreDeCiudad(ciudadDelPerfilEscrita);
  if (!nombre || ciudadDelPerfil(ciudadDelPerfilEscrita) !== ciudad.opcion) return ciudad.comoSeLee;
  return `en ${nombre}`;
}

function selloDe(
  giro: string | undefined,
  conocido: boolean,
  equipo: string | undefined,
  afinacion: { tamano: string | undefined; ciudad: string | undefined },
): string {
  // El equipo se pega con espacio, como siempre; la afinación va con comas
  // detrás: «para taquería con equipo de 1 a 2 personas, en local chico, en
  // Zapopan».
  const conEquipo = equipo && EQUIPO[equipo] ? ` ${EQUIPO[equipo].comoSeLee}` : '';
  const afinado = [afinacion.tamano, afinacion.ciudad].filter(Boolean);
  const cola = conEquipo + (afinado.length ? `, ${afinado.join(', ')}` : '');
  if (!conocido) return `Estimado general para negocio de comida${cola}`;
  return `Estimado para ${(giro ?? '').toLocaleLowerCase('es-MX')}${cola}`;
}

export function estimarProyecto(
  answers: Record<string, string>,
  catalogos: { presupuesto: readonly Concept[]; fijos: readonly Concept[] },
  opciones: { ciudadDelPerfil?: string } = {},
): Estimacion {
  const giro = answers.giro;
  const conocido = !!giro && giro in ESTIMACIONES && giro !== GIRO_GENERICO;
  const tabla: EstimacionDeGiro = ESTIMACIONES[conocido ? (giro as string) : GIRO_GENERICO];

  /*
    Si el diagnóstico quedó a medias se usa el promedio general y la etiqueta lo
    dice: más vale un punto de partida honesto que una precisión fingida.
  */
  const factorGeneral = FACTOR_POR_PRESUPUESTO[answers.presupuesto ?? ''] ?? 1;
  const factorNomina = EQUIPO[answers.personal ?? '']?.factor ?? 1;

  /*
    La afinación entra sólo completa. Con la ciudad pero sin el tamaño se
    movería la renta a ciegas: en la Ciudad de México un puesto y un local de
    60 lugares no se parecen en nada, y el factor de ciudad solo los trataría
    igual.
  */
  const ciudad = opcionDeCiudad(answers.ciudad);
  const tamano = opcionDeTamano(answers.tamano);
  const factorEspacio = ciudad && tamano ? ciudad.factor * tamano.factor : undefined;

  const factores = { general: factorGeneral, nomina: factorNomina, espacio: factorEspacio };
  const budget = conceptos('presupuesto', tabla.presupuesto, catalogos.presupuesto, factores);
  const fixed = conceptos('fijos', tabla.gastosFijos, catalogos.fijos, factores);
  const dishes = tabla.platillos.map(aPlatillo);

  const estimados: RutaEstimada[] = [
    'ticket',
    'margin',
    'budgetCap',
    ...budget.map((c) => `presupuesto:${c.key}`),
    ...fixed.map((c) => `fijos:${c.key}`),
    ...dishes.map((d) => `platillo:${d.id}`),
  ];

  return {
    ticket: tabla.ticket,
    margin: tabla.margin,
    budget,
    fixed,
    dishes,
    budgetCap: topeDePresupuesto(answers.presupuesto) ?? redondear(budget.reduce((a, c) => a + c.amount, 0)),
    estimados,
    /*
      La etiqueta sólo nombra ciudad y tamaño cuando de verdad movieron algo.
      Con media respuesta los montos son los mismos de antes: decir «en una
      ciudad mediana» sobre cifras que no cambiaron es presumir una precisión
      que no existe, que es justo lo que la etiqueta está para impedir.
    */
    sello: selloDe(giro, conocido, answers.personal, {
      tamano: factorEspacio === undefined ? undefined : tamano?.comoSeLee,
      ciudad:
        factorEspacio === undefined || !ciudad
          ? undefined
          : comoSeLeeLaCiudad(ciudad, opciones.ciudadDelPerfil),
    }),
  };
}
