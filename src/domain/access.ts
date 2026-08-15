/**
 * Prueba, bloqueo y activación: qué puede ver el usuario en cada momento
 * (README § 1.12). Es la regla de negocio del producto, no un detalle de UI:
 * vive aquí para que la app, la API y las pruebas usen la misma verdad.
 */

import { grantsAccess, trialState, type License, LICENSE_DEFAULTS } from './license';

export type AccessLevel =
  /** Prueba vigente: alcance recortado. */
  | 'prueba'
  /** Licencia activada: todo abierto. */
  | 'licencia'
  /** Prueba terminada sin pago: sólo la pestaña "Más". */
  | 'bloqueado';

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

/** Módulos de Mi Ruta abiertos durante la prueba. */
export const TRIAL_OPEN_MODULES = ['concepto', 'local'] as const;

/** Máximo de platillos que se pueden costear en prueba. */
export const TRIAL_DISH_LIMIT = 3;

export interface Capabilities {
  /** Pestañas navegables. */
  tabs: { inicio: boolean; ruta: boolean; costeador: boolean; numeros: boolean; mas: boolean };
  /** Módulos de Mi Ruta con contenido abierto. */
  openRouteModules: 'todos' | readonly string[];
  /** Límite de platillos del costeador (`null` = sin límite). */
  dishLimit: number | null;
  menu: boolean;
  budget: boolean;
  fixedExpenses: boolean;
  breakeven: boolean;
  resources: boolean;
  /**
   * Se puede mostrar la cifra de inversión y el excedente de presupuesto.
   * En prueba **nunca**: ni en Inicio, ni en Números, ni en el mentor, ni en Alertas.
   */
  showsInvestmentFigures: boolean;
  printableDocuments: boolean;
}

export function capabilities(level: AccessLevel): Capabilities {
  if (level === 'licencia') {
    return {
      tabs: { inicio: true, ruta: true, costeador: true, numeros: true, mas: true },
      openRouteModules: 'todos',
      dishLimit: null,
      menu: true,
      budget: true,
      fixedExpenses: true,
      breakeven: true,
      resources: true,
      showsInvestmentFigures: true,
      printableDocuments: true,
    };
  }

  if (level === 'bloqueado') {
    return {
      tabs: { inicio: false, ruta: false, costeador: false, numeros: false, mas: true },
      openRouteModules: [],
      dishLimit: 0,
      menu: false,
      budget: false,
      fixedExpenses: false,
      breakeven: false,
      resources: false,
      showsInvestmentFigures: false,
      printableDocuments: false,
    };
  }

  // Prueba: se abre justo lo que hace ver el valor sin regalar la cifra de inversión.
  return {
    tabs: { inicio: true, ruta: true, costeador: true, numeros: true, mas: true },
    openRouteModules: TRIAL_OPEN_MODULES,
    dishLimit: TRIAL_DISH_LIMIT,
    menu: false,
    budget: false,
    fixedExpenses: true,
    breakeven: true,
    resources: false,
    showsInvestmentFigures: false,
    printableDocuments: false,
  };
}

export function canOpenRouteModule(level: AccessLevel, moduleId: string): boolean {
  const open = capabilities(level).openRouteModules;
  return open === 'todos' ? true : open.includes(moduleId);
}

export function canCreateDish(level: AccessLevel, currentDishCount: number): boolean {
  const limit = capabilities(level).dishLimit;
  return limit === null ? true : currentDishCount < limit;
}

/** Aviso del límite de prueba en la vista de Platillos. */
export function dishLimitNotice(level: AccessLevel, currentDishCount: number): string | null {
  const limit = capabilities(level).dishLimit;
  if (limit === null) return null;
  if (level === 'bloqueado') return 'Tu prueba terminó. Desbloquea con el pago único para seguir costeando.';
  const left = Math.max(0, limit - currentDishCount);
  return left > 0
    ? `En la prueba puedes costear ${limit} platillos. Te ${left === 1 ? 'queda 1' : `quedan ${left}`}.`
    : `Llegaste a los ${limit} platillos de la prueba. Desbloquea con el pago único para seguir.`;
}

/** Texto único para todo lo que está detrás del pago. */
export const PAYWALL_HINT = 'Se abre con el pago único';

/** La tarjeta de inversión en prueba no revela montos. */
export const INVESTMENT_HIDDEN_LABEL = 'Con el pago único';
