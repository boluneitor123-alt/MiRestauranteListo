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

import { ESTIMACIONES, GIRO_GENERICO, type EstimacionDeGiro, type PlatilloEstimado } from '@/content/estimaciones';
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

/* ──────────────────────────  El estimador  ──────────────────────────────── */

const redondear = (v: number): number => Math.max(0, Math.round(v / 100) * 100);

function conceptos(
  plantilla: Record<string, number>,
  catalogo: readonly Concept[],
  factorGeneral: number,
  factorNomina: number,
): Concept[] {
  return catalogo.map((c) => ({
    ...c,
    amount: redondear((plantilla[c.key] ?? 0) * (ES_NOMINA(c.key) ? factorNomina : factorGeneral)),
  }));
}

function aPlatillo(p: PlatilloEstimado, indice: number): Dish {
  return {
    id: `est-${indice + 1}`,
    name: p.nombre,
    price: p.precio,
    portions: 1,
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

/** Cómo se nombra el giro en la etiqueta. El genérico no presume uno. */
function selloDe(giro: string | undefined, conocido: boolean, equipo: string | undefined): string {
  if (!conocido) return 'Estimado general para negocio de comida';
  const nombre = (giro ?? '').toLocaleLowerCase('es-MX');
  const cola = equipo && EQUIPO[equipo] ? ` ${EQUIPO[equipo].comoSeLee}` : '';
  return `Estimado para ${nombre}${cola}`;
}

export function estimarProyecto(
  answers: Record<string, string>,
  catalogos: { presupuesto: readonly Concept[]; fijos: readonly Concept[] },
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

  const budget = conceptos(tabla.presupuesto, catalogos.presupuesto, factorGeneral, factorNomina);
  const fixed = conceptos(tabla.gastosFijos, catalogos.fijos, factorGeneral, factorNomina);
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
    sello: selloDe(giro, conocido, answers.personal),
  };
}
