/**
 * Medición de Meta (píxel + API de Conversiones). Ver `MEDICION.md`.
 *
 * El id del píxel va escrito aquí: no es un secreto —viaja en cada carga de la
 * página— y con valor por omisión la medición no se apaga porque a alguien se
 * le haya olvidado capturar una variable. `NEXT_PUBLIC_FB_PIXEL_ID` lo
 * sustituye si algún día hay que cambiarlo sin tocar el código.
 *
 * El token de la API de Conversiones NO va aquí: es secreto, vive sólo en el
 * servidor y nunca lleva el prefijo `NEXT_PUBLIC_`.
 */

export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID || '1291572841589508';

/** Eventos personalizados. Renombrarlos rompe el historial acumulado en Meta. */
export const EVENTOS_PROPIOS = {
  registroIniciado: 'RegistroIniciado',
  diagnosticoCompletado: 'DiagnosticoCompletado',
} as const;

type Fbq = (
  comando: 'track' | 'trackCustom' | 'init',
  evento: string,
  datos?: Record<string, unknown>,
  opciones?: { eventID?: string },
) => void;

declare global {
  interface Window {
    fbq?: Fbq;
  }
}

/**
 * Manda un evento al píxel.
 *
 * Nunca lanza: la medición no puede tumbar una pantalla. Si el script no cargó
 * —bloqueador, red caída, alguien sin JavaScript— simplemente no pasa nada.
 */
function enviar(comando: 'track' | 'trackCustom', evento: string, datos?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  try {
    window.fbq?.(comando, evento, datos);
  } catch {
    // Un error del píxel no es asunto de quien está usando la app.
  }
}

/** Evento estándar de Meta. El nombre respeta mayúsculas tal cual. */
export const evento = (nombre: string, datos?: Record<string, unknown>): void =>
  enviar('track', nombre, datos);

/** Evento propio. */
export const eventoPropio = (nombre: string, datos?: Record<string, unknown>): void =>
  enviar('trackCustom', nombre, datos);
