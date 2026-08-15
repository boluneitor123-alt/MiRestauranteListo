/**
 * Contenido de la landing de venta (README § 12).
 *
 * La urgencia sale toda de `LAUNCH`: si la fecha venció o el cupo se agota,
 * desaparece sola en las cuatro superficies donde aparece.
 */

import { ROUTE_MODULES } from './route';

export interface Launch {
  deadline: string;
  spotsTotal: number;
  spotsLeft: number;
  listPrice: number;
  price: number;
  installments: number;
  installmentAmount: number;
  warrantyDays: number;
  trialDays: number;
}

export const LAUNCH: Launch = {
  deadline: '2026-09-15',
  spotsTotal: 100,
  spotsLeft: 23,
  listPrice: 3900,
  price: 2450,
  installments: 3,
  installmentAmount: 817,
  warrantyDays: 14,
  trialDays: 7,
};

/** Inversión típica para abrir, contra la que se compara el precio. */
export const TYPICAL_INVESTMENT = 263500;

/** Ticket promedio por defecto de la calculadora. */
export const DEFAULT_TICKET = 120;

export const GIROS_LANDING = [
  'Taquería',
  'Cafetería',
  'Food truck',
  'Restaurante',
  'Fonda / cocina económica',
  'Otro',
] as const;

export interface LandingStep {
  title: string;
  /** Qué hacer exactamente: mismo texto que la app. */
  instruction: string;
  /** Por qué importa: mismo texto que la app. */
  why: string;
}

/**
 * Los primeros pasos de la ruta. Se derivan de la ruta del producto en lugar de
 * copiarse: así el texto de la landing y el de la app **no pueden** separarse.
 */
export const LANDING_ROUTE: readonly LandingStep[] = ROUTE_MODULES.flatMap((module) =>
  module.tasks.map((task) => ({ title: task.title, instruction: task.next, why: task.why })),
).slice(0, 8);

/** Total de pasos de la ruta completa del producto. */
export const TOTAL_STEPS = 43;

export interface StartingPoint {
  label: string;
  /** Paso en el que queda el usuario. */
  step: number;
  /** Índice del siguiente paso dentro de LANDING_ROUTE. */
  nextIndex: number;
  /** Se saltó pasos por buscar o tener local. */
  skipped: boolean;
}

export const STARTING_POINTS: readonly StartingPoint[] = [
  { label: 'Solo tengo la idea', step: 1, nextIndex: 0, skipped: false },
  { label: 'Ya sé qué voy a vender', step: 3, nextIndex: 1, skipped: false },
  { label: 'Estoy buscando local', step: 4, nextIndex: 2, skipped: true },
  { label: 'Ya tengo el local', step: 6, nextIndex: 4, skipped: true },
];

export interface CostRow {
  label: string;
  cost: string;
  note: string;
  /** Fila destacada en rojo. */
  highlight?: boolean;
}

/** Comparativa de costos (README § 3, sección 5). */
export const COST_COMPARISON: readonly CostRow[] = [
  { label: 'Un curso para abrir tu restaurante', cost: '$2,490 – $3,960', note: 'Te enseña; no te hace los números.' },
  { label: 'Software de restaurante', cost: 'desde $811/mes', note: '$9,732 al año, para siempre.' },
  { label: 'Un asesor gastronómico', cost: '$15,000 – $30,000', note: 'Por un proyecto, una sola vez.' },
  { label: 'MiRestauranteListo', cost: '$2,450 una vez', note: 'Sin mensualidades. Acceso de por vida.', highlight: true },
];

export const OBJECTIONS = [
  {
    id: 'obj-0',
    title: '¿Por qué pago único y no mensualidad?',
    summary:
      'Un software de restaurante te cobraría todos los meses para siempre. Aquí pagas una vez porque abrir es un proyecto, no una suscripción.',
  },
  {
    id: 'obj-1',
    title: 'No soy bueno con los números',
    summary:
      'No tienes que serlo. Capturas lo que pagas por tus insumos y la app hace las cuentas: costo por porción, precio sugerido y cuánto vender al día.',
  },
  {
    id: 'obj-2',
    title: '¿Reemplaza a un asesor?',
    summary:
      'Reemplaza la parte que un asesor haría en Excel: ruta, costeo y números. Para negociar tu renta o tu contrato, sigue buscando a un humano.',
  },
  {
    id: 'obj-3',
    title: '¿Y si no me sirve?',
    summary: `Pruébala ${LAUNCH.trialDays} días gratis y, si pagas, tienes ${LAUNCH.warrantyDays} días de garantía completa.`,
  },
] as const;

export const INCLUDED = [
  'Tu ruta de 43 pasos, en orden y con fechas',
  'Costeador de platillos con sub-recetas y merma',
  'Precio sugerido y precio para apps de delivery',
  'Presupuesto de apertura con subconceptos',
  'Punto de equilibrio con tu meta de ganancia',
  'Ficha técnica y resumen financiero para imprimir',
] as const;

export const TOOLS = [
  {
    slot: 'shot-ruta',
    title: 'Mi Ruta',
    body: '43 pasos en 10 etapas. Cada uno te dice por qué importa y qué hacer exactamente.',
  },
  {
    slot: 'shot-costeador',
    title: 'Costeador de platillos',
    body: 'Captura lo que pagas por tus insumos y ve tu costo real por porción, con merma incluida.',
  },
  {
    slot: 'shot-numeros',
    title: 'Números',
    body: 'Cuánto necesitas para abrir y cuánto tienes que vender al día para no perder dinero.',
  },
] as const;
