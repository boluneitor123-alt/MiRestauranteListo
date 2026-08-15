/**
 * Unidades de medida y conversión (README § 4 · "Unidades y conversión").
 *
 * Cada unidad pertenece a una familia y tiene un factor contra la unidad base
 * de esa familia (g para masa, ml para volumen, pz para pieza). Sólo se puede
 * convertir dentro de la misma familia: no existe una conversión honesta entre
 * gramos y mililitros sin conocer la densidad del insumo.
 */

export const UNIT_CODES = ['g', 'kg', 'oz', 'lb', 'ml', 'l', 'taza', 'cda', 'pz', 'manojo'] as const;

export type UnitCode = (typeof UNIT_CODES)[number];

export type UnitFamily = 'masa' | 'volumen' | 'pieza';

interface UnitDef {
  /** Factor contra la unidad base de la familia. */
  factor: number;
  family: UnitFamily;
  /** Etiqueta que se muestra al usuario. */
  label: string;
}

export const UNITS: Record<UnitCode, UnitDef> = {
  g: { factor: 1, family: 'masa', label: 'gramos (g)' },
  kg: { factor: 1000, family: 'masa', label: 'kilogramos (kg)' },
  oz: { factor: 28.35, family: 'masa', label: 'onzas (oz)' },
  lb: { factor: 453.6, family: 'masa', label: 'libras (lb)' },
  ml: { factor: 1, family: 'volumen', label: 'mililitros (ml)' },
  l: { factor: 1000, family: 'volumen', label: 'litros (l)' },
  taza: { factor: 240, family: 'volumen', label: 'tazas' },
  cda: { factor: 15, family: 'volumen', label: 'cucharadas' },
  pz: { factor: 1, family: 'pieza', label: 'piezas (pz)' },
  manojo: { factor: 1, family: 'pieza', label: 'manojos' },
};

/** Unidad por defecto cuando llega un código desconocido (dato viejo o importado). */
const FALLBACK: UnitCode = 'g';

export function isUnitCode(value: unknown): value is UnitCode {
  return typeof value === 'string' && value in UNITS;
}

/** Factor de la unidad contra la base de su familia. */
export function unitFactor(unit: string | undefined): number {
  return UNITS[isUnitCode(unit) ? unit : FALLBACK].factor;
}

/** Familia de la unidad. */
export function unitFamily(unit: string | undefined): UnitFamily {
  return UNITS[isUnitCode(unit) ? unit : FALLBACK].family;
}

export function sameFamily(a: string | undefined, b: string | undefined): boolean {
  return unitFamily(a) === unitFamily(b);
}

/**
 * Convierte una cantidad entre dos unidades de la misma familia.
 * Entre familias distintas devuelve la cantidad sin tocar: el llamador decide
 * qué hacer (en el costeo se cae a "precio por unidad de compra").
 */
export function convert(qty: number, from: string | undefined, to: string | undefined): number {
  if (!sameFamily(from, to)) return qty;
  return (qty * unitFactor(from)) / unitFactor(to);
}

/** Opciones para el select de unidades, en el orden del prototipo. */
export const UNIT_OPTIONS: ReadonlyArray<{ code: UnitCode; label: string; family: UnitFamily }> =
  UNIT_CODES.map((code) => ({ code, label: UNITS[code].label, family: UNITS[code].family }));
