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

type Pendiente = [
  'track' | 'trackCustom',
  string,
  Record<string, unknown> | undefined,
  { eventID?: string } | undefined,
];

/*
  El código base del píxel entra con `afterInteractive`, así que `fbq` puede no
  existir todavía cuando una pantalla monta y quiere medir algo. Sin esta cola
  esos eventos se perdían en silencio: no falla nada, simplemente no llegan.
  Pasó con `RegistroIniciado`, que dispara al montar `/cuenta#signup`.
*/
const pendientes: Pendiente[] = [];
let reintento: ReturnType<typeof setTimeout> | undefined;
/** ~10 s a 200 ms. Si en ese rato no apareció, hay un bloqueador y no va a haber. */
let intentos = 0;

function vaciar(): void {
  if (typeof window === 'undefined') return;
  if (!window.fbq) {
    if (intentos >= 50 || reintento) return;
    intentos += 1;
    reintento = setTimeout(() => {
      reintento = undefined;
      vaciar();
    }, 200);
    return;
  }
  while (pendientes.length) {
    const [comando, evento, datos, opciones] = pendientes.shift() as Pendiente;
    try {
      window.fbq(comando, evento, datos, opciones);
    } catch {
      // Un error del píxel no es asunto de quien está usando la app.
    }
  }
}

/**
 * Manda un evento al píxel, o lo guarda hasta que el píxel exista.
 *
 * Nunca lanza: la medición no puede tumbar una pantalla. Si el script nunca
 * carga —bloqueador, red caída, alguien sin JavaScript— la cola se abandona.
 */
function enviar(
  comando: 'track' | 'trackCustom',
  evento: string,
  datos?: Record<string, unknown>,
  opciones?: { eventID?: string },
): void {
  if (typeof window === 'undefined') return;
  pendientes.push([comando, evento, datos, opciones]);
  vaciar();
}

/**
 * Evento estándar de Meta. El nombre respeta mayúsculas tal cual.
 *
 * `eventID` sirve para deduplicar contra el mismo evento mandado por el
 * servidor: Meta une los dos y cuenta uno. Tiene que ser idéntico en ambos.
 */
export const evento = (
  nombre: string,
  datos?: Record<string, unknown>,
  opciones?: { eventID?: string },
): void => enviar('track', nombre, datos, opciones);

/** Evento propio. */
export const eventoPropio = (nombre: string, datos?: Record<string, unknown>): void =>
  enviar('trackCustom', nombre, datos);

/* ───────────────────────  Atribución de los anuncios  ─────────────────────── */

const CLAVE_FBCLID = 'mrl.fbclid';

function cookie(nombre: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  return document.cookie.match(`(^|;)\\s*${nombre}\\s*=\\s*([^;]+)`)?.pop();
}

/**
 * Guarda el `fbclid` de la URL en cuanto alguien llega desde un anuncio.
 *
 * Llega en la landing y se pierde al navegar, pero la compra ocurre varias
 * pantallas después. Sin esto, media atribución se va por el caño.
 */
export function recordarFbclid(): void {
  if (typeof window === 'undefined') return;
  try {
    const fbclid = new URLSearchParams(window.location.search).get('fbclid');
    if (fbclid) window.sessionStorage.setItem(CLAVE_FBCLID, fbclid);
  } catch {
    // Sin sessionStorage —ventana privada, almacenamiento bloqueado— se pierde
    // la atribución de esa visita, no la visita.
  }
}

/**
 * `_fbc`: la cookie del clic en el anuncio.
 *
 * Meta no siempre alcanza a escribirla, aunque la persona venga de un anuncio.
 * Cuando falta se arma con el `fbclid`, en el formato que Meta espera.
 */
function fbc(): string | undefined {
  const guardada = cookie('_fbc');
  if (guardada) return guardada;
  try {
    const fbclid =
      new URLSearchParams(window.location.search).get('fbclid') ??
      window.sessionStorage.getItem(CLAVE_FBCLID);
    return fbclid ? `fb.1.${Date.now()}.${fbclid}` : undefined;
  } catch {
    return undefined;
  }
}

export interface DatosDeAtribucion {
  fbp?: string;
  fbc?: string;
  eventSourceUrl?: string;
}

/**
 * Lo que el navegador sabe y el webhook no.
 *
 * A Stripe lo llaman sus propios servidores: ahí no hay cookies ni URL. Estos
 * tres viajan en el `metadata` del cobro y regresan intactos en el webhook. Sin
 * ellos, la compra llega a Meta pero no se atribuye a ninguna campaña.
 */
export function datosDeAtribucion(): DatosDeAtribucion {
  if (typeof window === 'undefined') return {};
  return {
    fbp: cookie('_fbp'),
    fbc: fbc(),
    eventSourceUrl: window.location.href,
  };
}
