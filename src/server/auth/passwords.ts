/**
 * Hash de contraseñas con scrypt (Node nativo, sin dependencias binarias).
 *
 * Formato guardado: `scrypt$N$r$p$salt$hash`, todo en base64url. Guardar los
 * parámetros permite subirlos después sin invalidar las contraseñas viejas.
 */

import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback) as (
  password: string,
  salt: Buffer,
  keylen: number,
  options: { N: number; r: number; p: number; maxmem: number },
) => Promise<Buffer>;

const PARAMS = { N: 16_384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
const KEY_LENGTH = 32;

export const MIN_PASSWORD_LENGTH = 8;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scrypt(password.normalize('NFKC'), salt, KEY_LENGTH, PARAMS);
  return ['scrypt', PARAMS.N, PARAMS.r, PARAMS.p, salt.toString('base64url'), key.toString('base64url')].join('$');
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = (stored || '').split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false;

  const [, n, r, p, salt, hash] = parts;
  const expected = Buffer.from(hash, 'base64url');
  if (expected.length !== KEY_LENGTH) return false;

  try {
    const key = await scrypt(password.normalize('NFKC'), Buffer.from(salt, 'base64url'), KEY_LENGTH, {
      N: Number(n),
      r: Number(r),
      p: Number(p),
      maxmem: PARAMS.maxmem,
    });
    return timingSafeEqual(key, expected);
  } catch {
    return false;
  }
}

/** Token de sesión: 32 bytes aleatorios, suficientes para no adivinarse. */
export function newSessionToken(): string {
  return randomBytes(32).toString('base64url');
}

/** Normaliza el correo para que "Ana@Correo.com " y "ana@correo.com" sean el mismo. */
export function normalizeEmail(email: string): string {
  return (email || '').trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalizeEmail(email));
}
