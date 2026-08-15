/**
 * Medición de la landing (README § 12 · "Eventos").
 *
 * Cada evento va al Pixel y al dataLayer. `Purchase` se dispara en el retorno
 * del checkout; la API de Conversiones del lado servidor lo complementa.
 */

export type TrackEvent =
  | 'DiagnosticoCompletado'
  | 'LeadIntent'
  | 'Lead'
  | 'CalculadoraUsada'
  | 'InicioPrueba'
  | 'InitiateCheckout'
  | 'VideoDemo25'
  | 'VideoDemo50'
  | 'VideoDemo75'
  | 'VideoObjecion'
  | 'ContactoWhatsApp'
  | 'Purchase';

/** Eventos estándar del Pixel: van con `track`, no con `trackCustom`. */
const STANDARD: ReadonlySet<TrackEvent> = new Set(['Lead', 'InitiateCheckout', 'Purchase']);

interface Fbq {
  (command: 'track' | 'trackCustom', event: string, params?: Record<string, unknown>): void;
}

const fired = new Set<string>();

export function track(event: TrackEvent, params: Record<string, unknown> = {}, once = false): void {
  if (typeof window === 'undefined') return;
  const key = `${event}:${JSON.stringify(params)}`;
  if (once) {
    if (fired.has(event)) return;
    fired.add(event);
  }

  const fbq = (window as unknown as { fbq?: Fbq }).fbq;
  fbq?.(STANDARD.has(event) ? 'track' : 'trackCustom', event, params);

  const dataLayer = ((window as unknown as { dataLayer?: unknown[] }).dataLayer ??= []);
  dataLayer.push({ event, ...params });

  if (process.env.NODE_ENV !== 'production') console.debug('[medición]', key);
}
