/**
 * La respuesta de `/api/licenses/entitlement`, validada antes de creerle.
 *
 * El nivel de acceso lo decide el servidor, pero el cliente no puede obedecer
 * a ciegas: una respuesta a medias, un HTML de error con 200, o un cuerpo de
 * otra versión del servidor dejarían el candado en un estado indefinido. Aquí
 * se revisa la forma y, si algo no cuadra, la respuesta se descarta completa.
 * Descartarla significa quedarse **sin** acceso, nunca con todo abierto.
 */

import { type AccessLevel, type Capabilities, capabilities as capabilitiesFor } from './access';

export const ACCESS_LEVELS = ['prueba', 'licencia', 'bloqueado'] as const;

/** El nivel más restringido. Es el valor por omisión ante cualquier duda. */
export const NIVEL_MAS_RESTRINGIDO: AccessLevel = 'bloqueado';

export interface Entitlement {
  level: AccessLevel;
  licensed: boolean;
  code?: string;
  status?: string;
  trial: { startedAt: number; expiresAt: number; daysLeft: number; expired: boolean; label: string };
  capabilities: Capabilities;
  devices?: { used: number; max: number };
  price: number;
  warrantyDays: number;
  trialDays: number;
}

export function esNivelDeAcceso(valor: unknown): valor is AccessLevel {
  return typeof valor === 'string' && (ACCESS_LEVELS as readonly string[]).includes(valor);
}

const esObjeto = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;

const numero = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);

function leerPrueba(v: unknown): Entitlement['trial'] | null {
  if (!esObjeto(v)) return null;
  const startedAt = numero(v.startedAt);
  const expiresAt = numero(v.expiresAt);
  const daysLeft = numero(v.daysLeft);
  if (startedAt === null || expiresAt === null || daysLeft === null) return null;
  if (typeof v.expired !== 'boolean' || typeof v.label !== 'string') return null;
  return { startedAt, expiresAt, daysLeft, expired: v.expired, label: v.label };
}

/**
 * El alcance de un nivel **no** se lee de la respuesta: se deriva del nivel.
 *
 * El servidor manda `capabilities` y antes se copiaban tal cual. Con eso, una
 * respuesta con `level: 'prueba'` pero el alcance de una licencia abría todo,
 * y un alcance a medias dejaba llaves en `undefined`, que en un `if` se lee
 * como "no" y en un límite como "sin límite". El servidor sigue mandando quién
 * eres; qué te toca lo calcula el mismo dominio en los dos lados.
 */
function capacidadesDe(level: AccessLevel): Capabilities {
  return capabilitiesFor(level);
}

/**
 * Convierte la respuesta cruda en un acceso confiable, o `null` si no se
 * entiende. `null` es "no sabemos", y no saber se trata como bloqueado.
 */
export function leerEntitlement(data: unknown): Entitlement | null {
  if (!esObjeto(data)) return null;
  // Las rutas de error contestan `{ ok: false, ... }`, a veces con 200.
  if (data.ok === false) return null;
  if (!esNivelDeAcceso(data.level)) return null;

  const trial = leerPrueba(data.trial);
  if (!trial) return null;

  const price = numero(data.price);
  const warrantyDays = numero(data.warrantyDays);
  const trialDays = numero(data.trialDays);
  if (price === null || warrantyDays === null || trialDays === null) return null;

  const level = data.level;
  return {
    level,
    // Sólo un `true` explícito cuenta como licencia pagada.
    licensed: data.licensed === true && level === 'licencia',
    ...(typeof data.code === 'string' ? { code: data.code } : {}),
    ...(typeof data.status === 'string' ? { status: data.status } : {}),
    trial,
    capabilities: capacidadesDe(level),
    ...(esObjeto(data.devices) && numero(data.devices.used) !== null && numero(data.devices.max) !== null
      ? { devices: { used: data.devices.used as number, max: data.devices.max as number } }
      : {}),
    price,
    warrantyDays,
    trialDays,
  };
}

/** El nivel vigente: el del servidor si se entendió, bloqueado si no. */
export function nivelDeAcceso(entitlement: Entitlement | null): AccessLevel {
  return entitlement ? entitlement.level : NIVEL_MAS_RESTRINGIDO;
}
