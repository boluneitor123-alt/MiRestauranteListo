/**
 * Detección de plataforma (README § 11).
 *
 * El layout NO se decide con esto: eso lo resuelven las media queries. La UA
 * sólo alimenta el texto de instalación y la etiqueta "Equipo detectado" de
 * Ajustes.
 */

export type OsName = 'iOS' | 'iPadOS' | 'Android' | 'Windows' | 'macOS' | 'ChromeOS' | 'Linux' | 'Desconocido';
export type DeviceKind = 'phone' | 'tablet' | 'desktop';

export interface PlatformInfo {
  os: OsName;
  kind: DeviceKind;
  browser: string;
  /** Corre instalada como PWA. */
  installed: boolean;
  /** Texto de la tarjeta "Instala la app". */
  installHint: string;
  /** Etiqueta de Ajustes: "iPhone · teléfono · Safari". */
  label: string;
}

const KIND_LABELS: Record<DeviceKind, string> = {
  phone: 'teléfono',
  tablet: 'tablet',
  desktop: 'computadora',
};

function detectOs(ua: string, maxTouchPoints: number): OsName {
  if (/iPhone|iPod/.test(ua)) return 'iOS';
  if (/iPad/.test(ua)) return 'iPadOS';
  // iPadOS se anuncia como Mac, pero un Mac no tiene pantalla táctil.
  if (/Macintosh/.test(ua) && maxTouchPoints > 1) return 'iPadOS';
  if (/Android/.test(ua)) return 'Android';
  if (/CrOS/.test(ua)) return 'ChromeOS';
  if (/Windows/.test(ua)) return 'Windows';
  if (/Macintosh|Mac OS X/.test(ua)) return 'macOS';
  if (/Linux/.test(ua)) return 'Linux';
  return 'Desconocido';
}

function detectBrowser(ua: string): string {
  if (/Edg\//.test(ua)) return 'Edge';
  if (/OPR\//.test(ua)) return 'Opera';
  if (/Firefox\//.test(ua)) return 'Firefox';
  if (/Chrome\//.test(ua)) return 'Chrome';
  if (/Safari\//.test(ua)) return 'Safari';
  return 'tu navegador';
}

function detectKind(os: OsName, ua: string, width: number, maxTouchPoints: number): DeviceKind {
  if (os === 'iOS') return 'phone';
  if (os === 'iPadOS') return 'tablet';
  if (os === 'Android') return /Mobile/.test(ua) ? 'phone' : 'tablet';
  if (maxTouchPoints > 1 && width < 900) return width < 760 ? 'phone' : 'tablet';
  return 'desktop';
}

function installHint(os: OsName, installed: boolean): string {
  if (installed) return 'Ya la tienes instalada en este equipo.';
  if (os === 'iOS' || os === 'iPadOS') return 'Toca Compartir → Agregar a inicio.';
  if (os === 'Android') return 'Abre el menú del navegador → Instalar app.';
  return 'Usa el icono de instalar en la barra de direcciones.';
}

export function detectPlatform(): PlatformInfo {
  if (typeof window === 'undefined') {
    return {
      os: 'Desconocido',
      kind: 'phone',
      browser: 'tu navegador',
      installed: false,
      installHint: 'Instálala desde el menú de tu navegador.',
      label: 'Equipo por detectar',
    };
  }

  const ua = navigator.userAgent;
  const maxTouchPoints = navigator.maxTouchPoints ?? 0;
  const os = detectOs(ua, maxTouchPoints);
  const kind = detectKind(os, ua, window.innerWidth, maxTouchPoints);
  const browser = detectBrowser(ua);
  const installed =
    window.matchMedia?.('(display-mode: standalone)').matches ||
    (navigator as { standalone?: boolean }).standalone === true;

  return {
    os,
    kind,
    browser,
    installed,
    installHint: installHint(os, installed),
    label: `${os} · ${KIND_LABELS[kind]} · ${installed ? 'instalada' : browser}`,
  };
}

const DEVICE_KEY = 'mrl.device.v1';

/**
 * Identificador estable del equipo. Es lo que cuenta contra el límite de 3
 * equipos por licencia.
 */
export function getDeviceId(): string {
  if (typeof window === 'undefined') return '';
  const stored = window.localStorage.getItem(DEVICE_KEY);
  if (stored) return stored;
  const id =
    globalThis.crypto?.randomUUID?.() ??
    `dev-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
  window.localStorage.setItem(DEVICE_KEY, id);
  return id;
}
