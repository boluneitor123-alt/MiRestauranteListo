/**
 * Formato de números y moneda.
 *
 * Regla de captura del README § 6: **nunca reformatear el valor mientras se
 * escribe**. El símbolo "$" va fuera del input; estas funciones son sólo para
 * mostrar, no para el `value` de un campo activo.
 */

export type Currency = 'MXN' | 'USD';

export const CURRENCY_LOCALE: Record<Currency, string> = {
  MXN: 'es-MX',
  USD: 'en-US',
};

/** Moneda redondeada al peso: "$2,450". */
export function money(value: number, currency: Currency = 'MXN'): string {
  if (!Number.isFinite(value)) return '$0';
  return `$${Math.round(value).toLocaleString(CURRENCY_LOCALE[currency])}`;
}

/** Moneda con dos decimales: "$142.30". Se usa en costos por porción. */
export function money2(value: number, currency: Currency = 'MXN'): string {
  if (!Number.isFinite(value)) return '$0.00';
  return `$${value.toLocaleString(CURRENCY_LOCALE[currency], {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Porcentaje redondeado, o "—" cuando no hay dato (platillo sin precio). */
export function pct(value: number | null, suffix = '%'): string {
  if (value === null || !Number.isFinite(value)) return '—';
  return `${Math.round(value)}${suffix}`;
}

/** Valor de moneda, o "—" cuando no hay dato. */
export function moneyOrDash(value: number | null, currency: Currency = 'MXN'): string {
  if (value === null || !Number.isFinite(value)) return '—';
  return money(value, currency);
}

/** Lee un número de lo que el usuario tecleó, sin romperle la captura. */
export function parseNumber(input: string | number | null | undefined): number {
  if (typeof input === 'number') return Number.isFinite(input) ? input : 0;
  const parsed = parseFloat(String(input ?? '').replace(/[^0-9.-]/g, ''));
  return Number.isNaN(parsed) ? 0 : parsed;
}

/** Precio unitario legible: "$0.09 por g". */
export function unitPriceLabel(value: number, unit: string): string {
  return `${money2(value)} por ${unit}`;
}
