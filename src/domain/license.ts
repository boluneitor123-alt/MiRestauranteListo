/**
 * Licencias, prueba y activación (README § 4 · "Licencias" y § 1.12).
 *
 * Este módulo es puro: describe el contrato y las transiciones válidas. Quién
 * las ejecuta es el servidor — **la validación nunca ocurre en el cliente**.
 */

/** Alfabeto sin caracteres ambiguos: fuera I, L, O, 0 y 1. */
export const LICENSE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export const LICENSE_PREFIX = 'MRL';
const BLOCK_LENGTH = 4;
const BLOCKS = 2;

export const LICENSE_CODE_PATTERN = /^MRL-[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{4}-[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{4}$/;

export type LicenseStatus = 'nueva' | 'activada' | 'revocada' | 'reembolsada';

export const LICENSE_STATUS_LABELS: Record<LicenseStatus, string> = {
  nueva: 'Sin activar',
  activada: 'Activada',
  revocada: 'Revocada',
  reembolsada: 'Reembolsada',
};

export interface License {
  code: string;
  status: LicenseStatus;
  /** Equipos que ya reclamaron esta licencia. */
  devices: string[];
  email?: string;
  name?: string;
  /**
   * Cuenta dueña de la licencia, cuando la compra se hizo con sesión abierta.
   * Es lo que permite que el acceso siga a la persona y no al aparato: sin
   * esto, pagar en el celular dejaba la laptop bloqueada.
   */
  userId?: string;
  /** Equipo desde el que se pagó. Sirve para activar solo, sin teclear nada. */
  originDeviceId?: string;
  /** Origen de la venta (checkout, manual, referido…). */
  source?: string;
  amount?: number;
  /** Referencia del proveedor de pago: evita emitir dos veces por un webhook repetido. */
  paymentRef?: string;
  /** Monto devuelto al marcar reembolso. */
  refundedAmount?: number;
  createdAt: number;
  activatedAt?: number;
  revokedAt?: number;
  refundedAt?: number;
}

/** Valores por defecto de los ajustes del panel del dueño. */
export const LICENSE_DEFAULTS = {
  price: 2450,
  installments: 817,
  installmentCount: 3,
  trialDays: 7,
  maxDevices: 3,
  referralDiscountPct: 20,
  warrantyDays: 14,
  autoActivation: true,
};

type RandomInt = (max: number) => number;

const cryptoRandomInt: RandomInt = (max) => {
  const globalCrypto = globalThis.crypto;
  if (globalCrypto?.getRandomValues) {
    const buf = new Uint32Array(1);
    // Rechazo del residuo para no sesgar el alfabeto.
    const limit = Math.floor(0xffffffff / max) * max;
    let value = 0;
    do {
      globalCrypto.getRandomValues(buf);
      value = buf[0];
    } while (value >= limit);
    return value % max;
  }
  return Math.floor(Math.random() * max);
};

/** Genera un código `MRL-XXXX-XXXX`. */
export function generateLicenseCode(randomInt: RandomInt = cryptoRandomInt): string {
  const blocks: string[] = [];
  for (let b = 0; b < BLOCKS; b++) {
    let block = '';
    for (let i = 0; i < BLOCK_LENGTH; i++) {
      block += LICENSE_ALPHABET[randomInt(LICENSE_ALPHABET.length)];
    }
    blocks.push(block);
  }
  return [LICENSE_PREFIX, ...blocks].join('-');
}

export function isValidLicenseCode(code: string): boolean {
  return LICENSE_CODE_PATTERN.test(code);
}

/**
 * Normaliza lo que el usuario teclea en "Recuperar acceso": acepta minúsculas,
 * espacios y códigos sin guiones. Devuelve `null` si no es un código válido.
 */
export function normalizeLicenseCode(input: string): string | null {
  const raw = (input || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const body = raw.startsWith(LICENSE_PREFIX) ? raw.slice(LICENSE_PREFIX.length) : raw;
  if (body.length !== BLOCK_LENGTH * BLOCKS) return null;
  const code = `${LICENSE_PREFIX}-${body.slice(0, BLOCK_LENGTH)}-${body.slice(BLOCK_LENGTH)}`;
  return isValidLicenseCode(code) ? code : null;
}

/* ─────────────────────────────  Transiciones  ────────────────────────────── */

export type ActivationError = 'codigo-invalido' | 'no-existe' | 'revocada' | 'reembolsada' | 'limite-de-equipos';

export const ACTIVATION_MESSAGES: Record<ActivationError, string> = {
  'codigo-invalido': 'Ese código no tiene el formato MRL-XXXX-XXXX. Revísalo en tu correo de compra.',
  'no-existe': 'No encontramos ese código. Revisa tu correo de compra o escríbenos.',
  revocada: 'Esta licencia fue revocada. Escríbenos para revisarlo.',
  reembolsada: 'Esta compra fue reembolsada, así que la licencia ya no está activa.',
  'limite-de-equipos': 'Esta licencia ya está en el máximo de equipos. Libera uno desde tu panel o escríbenos.',
}

/** ¿Puede este equipo activar la licencia? */
export function canActivate(
  license: License | undefined,
  deviceId: string,
  maxDevices: number = LICENSE_DEFAULTS.maxDevices,
): { ok: true } | { ok: false; error: ActivationError } {
  if (!license) return { ok: false, error: 'no-existe' };
  if (license.status === 'revocada') return { ok: false, error: 'revocada' };
  if (license.status === 'reembolsada') return { ok: false, error: 'reembolsada' };
  // Un equipo ya registrado siempre puede volver a entrar.
  if (license.devices.includes(deviceId)) return { ok: true };
  if (license.devices.length >= maxDevices) return { ok: false, error: 'limite-de-equipos' };
  return { ok: true };
}

/* ──────────────────  Reciclaje de equipos  ─────────────────────────────────

   El tope de 3 equipos existe contra la reventa, no contra quien pagó. Pero
   se consumía con el `deviceId`, que vive en el `localStorage` del navegador y
   muere cuando alguien borra sus datos. Nadie entiende que limpiar su
   navegador le quema un lugar de su propia licencia: tres limpiezas y el
   cliente se quedaba fuera de lo que compró, leyendo «Tu prueba terminó».

   Ahora el tope no rechaza: recicla. Llega un equipo nuevo, sale el que lleva
   más tiempo sin usarse, y la persona entra sin enterarse. Quien comparte su
   licencia con medio pueblo se saca a sí mismo una y otra vez —y el reciclaje
   queda en la bitácora—, que es justo el caso que el tope quería estorbar.  */

/**
 * Cuál de los equipos sale, cuando hay que hacer lugar.
 *
 * El que lleva más tiempo sin abrir la app. Un equipo sin fecha conocida se
 * trata como el más viejo de todos: si no tenemos registro de que se haya
 * usado, es el que menos se va a extrañar. Con empate gana el orden
 * alfabético del id, para que la decisión sea siempre la misma y se pueda
 * probar.
 */
export function equipoAReciclar(
  devices: readonly string[],
  ultimoUso: Readonly<Record<string, number>>,
): string | undefined {
  return delMasVistoAlMasOlvidado(devices, ultimoUso).at(-1);
}

/** Los equipos ordenados del que se usó hace menos al que se usó hace más. */
function delMasVistoAlMasOlvidado(
  devices: readonly string[],
  ultimoUso: Readonly<Record<string, number>>,
): string[] {
  return [...devices].sort((a, b) => (ultimoUso[b] ?? 0) - (ultimoUso[a] ?? 0) || (a < b ? -1 : 1));
}

export interface ActivacionConReciclaje {
  license: License;
  /**
   * Los equipos que salieron para dejar entrar al nuevo. Vacío si había lugar.
   *
   * Normalmente es uno. Son varios sólo si el tope se bajó desde el panel y la
   * licencia traía más equipos de los que el tope nuevo admite.
   */
  reciclados: string[];
}

/**
 * Registra el equipo, reciclando el más viejo si el tope está lleno.
 *
 * No falla nunca por falta de lugar: eso es lo que dejaba fuera a quien pagó.
 * Los estados que sí cierran la puerta —revocada, reembolsada— los sigue
 * revisando `canActivate` antes de llegar aquí; esta función es sólo la del
 * cupo. Es pura: quién se recicla sale de `ultimoUso`, que lo trae quien la
 * llama.
 */
export function activarEquipo(
  license: License,
  deviceId: string,
  now: number,
  maxDevices: number = LICENSE_DEFAULTS.maxDevices,
  ultimoUso: Readonly<Record<string, number>> = {},
): ActivacionConReciclaje {
  const activada = (devices: string[]): License => ({
    ...license,
    status: 'activada',
    devices,
    activatedAt: license.activatedAt ?? now,
  });

  // Un equipo que ya está dentro no gasta lugar ni recicla a nadie.
  if (license.devices.includes(deviceId)) return { license: activada([...license.devices]), reciclados: [] };

  const cupo = Math.max(1, maxDevices);
  if (license.devices.length < cupo) {
    return { license: activada([...license.devices, deviceId]), reciclados: [] };
  }

  /*
    Hay que hacer lugar. Se quedan los `cupo - 1` que se usaron más
    recientemente y el resto sale — siempre por último uso, nunca por el orden
    en que entraron. Salen varios sólo si el tope bajó desde el panel.
  */
  const porFrescura = delMasVistoAlMasOlvidado(license.devices, ultimoUso);
  return {
    license: activada([...porFrescura.slice(0, cupo - 1), deviceId]),
    reciclados: porFrescura.slice(cupo - 1),
  };
}

/** Saca un equipo de la licencia. Lo usa el panel para liberar uno a mano. */
export function liberarEquipo(license: License, deviceId: string): License {
  return { ...license, devices: license.devices.filter((d) => d !== deviceId) };
}

/** Registra el equipo y marca la licencia como activada. Función pura. */
export function activateLicense(
  license: License,
  deviceId: string,
  now: number,
  maxDevices: number = LICENSE_DEFAULTS.maxDevices,
): License {
  const check = canActivate(license, deviceId, maxDevices);
  if (!check.ok) throw new Error(check.error);
  if (license.devices.includes(deviceId)) return license;
  return {
    ...license,
    status: 'activada',
    devices: [...license.devices, deviceId],
    activatedAt: license.activatedAt ?? now,
  };
}

export function revokeLicense(license: License, now: number): License {
  return { ...license, status: 'revocada', revokedAt: now };
}

export function refundLicense(license: License, now: number): License {
  return { ...license, status: 'reembolsada', refundedAt: now };
}

/** Reactivar devuelve la licencia a `activada` si ya tenía equipos, o a `nueva`. */
export function reactivateLicense(license: License): License {
  return {
    ...license,
    status: license.devices.length ? 'activada' : 'nueva',
    revokedAt: undefined,
    refundedAt: undefined,
  };
}

/** "Liberar equipos": deja la licencia lista para un dispositivo nuevo. */
export function freeDevices(license: License): License {
  return { ...license, devices: [], status: license.status === 'activada' ? 'nueva' : license.status };
}

/** Una licencia da acceso completo sólo mientras está activada. */
export function grantsAccess(license: License | undefined): boolean {
  return !!license && license.status === 'activada';
}

/**
 * Licencia candidata para la activación automática: pagada, sin equipos y sin
 * revocar. Al volver del checkout la app la reclama sola.
 */
export function isClaimable(license: License): boolean {
  return license.status === 'nueva' && license.devices.length === 0;
}

/* ────────────────────────────  Prueba de 7 días  ─────────────────────────── */

export const DAY_MS = 86_400_000;

export interface TrialState {
  startedAt: number;
  days: number;
  expiresAt: number;
  expired: boolean;
  /** Días completos que faltan (0 el último día). */
  daysLeft: number;
  /** Etiqueta del banner de prueba. */
  label: string;
}

export function trialState(
  startedAt: number,
  now: number,
  days: number = LICENSE_DEFAULTS.trialDays,
): TrialState {
  const expiresAt = startedAt + days * DAY_MS;
  const remaining = expiresAt - now;
  const expired = remaining <= 0;
  const daysLeft = expired ? 0 : Math.ceil(remaining / DAY_MS);
  return {
    startedAt,
    days,
    expiresAt,
    expired,
    daysLeft,
    label: expired
      ? 'Tu prueba terminó'
      : daysLeft === 1
        ? 'Último día de prueba'
        : `Te quedan ${daysLeft} días de prueba`,
  };
}

/* ─────────────────────  Telemetría de demos (KPI del panel)  ─────────────── */

export interface TrialTelemetry {
  deviceId: string;
  startedAt: number;
  /** Se sella al cumplirse los días de prueba. */
  expiredAt?: number;
  /** Se sella al activar licencia. */
  converted?: boolean;
}

/** Sella `expiredAt` cuando la prueba ya venció. */
export function sealTrial(t: TrialTelemetry, now: number, days: number = LICENSE_DEFAULTS.trialDays): TrialTelemetry {
  if (t.expiredAt) return t;
  const expiresAt = t.startedAt + days * DAY_MS;
  if (now < expiresAt) return t;
  return { ...t, expiredAt: expiresAt };
}

export interface DemoMetrics {
  started: number;
  finished: number;
  finishedWithoutPaying: number;
  /** % de demos concluidas que sí convirtieron. */
  conversionPct: number;
}

export function demoMetrics(trials: readonly TrialTelemetry[]): DemoMetrics {
  const started = trials.length;
  const finished = trials.filter((t) => !!t.expiredAt).length;
  const converted = trials.filter((t) => !!t.expiredAt && t.converted).length;
  return {
    started,
    finished,
    finishedWithoutPaying: finished - converted,
    conversionPct: finished ? Math.round((converted / finished) * 100) : 0,
  };
}
