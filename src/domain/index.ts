/**
 * Dominio de cálculo de MiRestauranteListo (README § 4).
 *
 * Módulos puros, sin estado global ni dependencias de UI. Toda la aritmética
 * del producto —costeo, semáforo, punto de equilibrio, avance, ingeniería de
 * menú, licencias y gating— vive aquí y está cubierta por pruebas unitarias.
 */

export * from './units';
export * from './types';
export * from './costing';
export * from './semaphore';
export * from './aggregates';
export * from './finance';
export * from './progress';
export * from './menu';
export * from './license';
export * from './access';
export * from './format';
export * from './projectState';
export * from './diagnosis';
export * from './landing';
