/**
 * Medición de Meta (píxel + API de Conversiones). Ver `MEDICION.md`.
 *
 * El id del píxel sale **sólo** de la variable de entorno, sin valor por
 * omisión. Antes había uno escrito aquí, y resultó pertenecer al portafolio de
 * otra persona: si la variable faltaba o venía mal escrita, el sitio le habría
 * mandado el comportamiento de nuestros visitantes a un desconocido, en
 * silencio. Sin id no se mide, que es el fallo correcto.
 *
 * El token de la API de Conversiones NO va aquí: es secreto, vive sólo en el
 * servidor y nunca lleva el prefijo `NEXT_PUBLIC_`.
 */

export const pixelId = (): string => (process.env.NEXT_PUBLIC_FB_PIXEL_ID ?? '').trim();

/** Sin id no hay a dónde medir. */
export const pixelConfigurado = (): boolean => pixelId().length > 0;

/**
 * Todo lo que medimos, en un solo lugar.
 *
 * Había dos módulos de medición conviviendo —éste y `src/lib/track.ts`— y según
 * por dónde entrara la persona medía uno u otro. Sólo éste tenía la cola que
 * espera al píxel, así que la landing perdía eventos y el resto de la app no.
 * Ahora es uno.
 */
export const EVENTOS = {
  /* Estándar de Meta: el nombre respeta mayúsculas y va con `track`. */
  pageView: 'PageView',
  lead: 'Lead',
  startTrial: 'StartTrial',
  completeRegistration: 'CompleteRegistration',
  initiateCheckout: 'InitiateCheckout',
  purchase: 'Purchase',
  /* Propios. Renombrarlos rompe el historial acumulado en Meta. */
  leadIntent: 'LeadIntent',
  registroIniciado: 'RegistroIniciado',
  calculadoraUsada: 'CalculadoraUsada',
  diagnosticoCompletado: 'DiagnosticoCompletado',
  videoDemo25: 'VideoDemo25',
  videoDemo50: 'VideoDemo50',
  videoDemo75: 'VideoDemo75',
  videoObjecion: 'VideoObjecion',
  contactoWhatsApp: 'ContactoWhatsApp',
} as const;

export type EventoMedicion = (typeof EVENTOS)[keyof typeof EVENTOS];

/**
 * Cuáles son estándar de Meta.
 *
 * La diferencia importa: un estándar va con `track` y Meta lo entiende para
 * optimizar campañas; con `trackCustom` queda como personalizado aunque se
 * llame igual, y no sirve para optimizar. Es el error que se hace solo al
 * renombrar un evento sin mover de lista.
 */
const ESTANDAR: ReadonlySet<string> = new Set<EventoMedicion>([
  EVENTOS.pageView,
  EVENTOS.lead,
  EVENTOS.startTrial,
  EVENTOS.completeRegistration,
  EVENTOS.initiateCheckout,
  EVENTOS.purchase,
]);

export const esEstandar = (evento: string): boolean => ESTANDAR.has(evento);

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

/** Los que ya se contaron en esta carga, para los que van una sola vez. */
const yaMedidos = new Set<string>();

/**
 * Mide un evento. Es la única puerta: no hay otro módulo de medición.
 *
 * `track` o `trackCustom` lo decide la lista de estándar, no quien llama: así
 * un evento no puede quedar como personalizado por descuido al renombrarlo.
 *
 * `eventID` sirve para deduplicar contra el mismo evento mandado por el
 * servidor: Meta une los dos y cuenta uno. Tiene que ser idéntico en ambos.
 *
 * `unaVez` evita repetirlo dentro de la misma carga de página. No protege entre
 * recargas: para eso está la marca en el proyecto, o el servidor.
 */
export function medir(
  nombre: EventoMedicion,
  datos: Record<string, unknown> = {},
  opciones: { eventID?: string; unaVez?: boolean } = {},
): void {
  if (typeof window === 'undefined') return;
  if (opciones.unaVez) {
    if (yaMedidos.has(nombre)) return;
    yaMedidos.add(nombre);
  }

  enviar(esEstandar(nombre) ? 'track' : 'trackCustom', nombre, datos, { eventID: opciones.eventID });

  // El dataLayer sigue para lo que se conecte después (Tag Manager, Analytics).
  try {
    const w = window as unknown as { dataLayer?: unknown[] };
    (w.dataLayer ??= []).push({ event: nombre, ...datos });
  } catch {
    // Igual que el píxel: la medición no interrumpe nada.
  }
}

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
