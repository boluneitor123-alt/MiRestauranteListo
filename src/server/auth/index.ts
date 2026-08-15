/**
 * Punto de entrada de autenticación.
 *
 * Con `DATABASE_URL` real usa Postgres; sin ella cae a un almacén en memoria
 * para poder desarrollar sin base de datos (se pierde al reiniciar).
 */

import { AuthService, SESSION_COOKIE } from './service';
import { MemoryAuthStore } from './memoryStore';
import type { AuthStore } from './store';

const globalForAuth = globalThis as unknown as { mrlAuthStore?: AuthStore; mrlAuthService?: AuthService };

function hasDatabase(): boolean {
  const url = process.env.DATABASE_URL;
  return !!url && !url.includes('user:password@localhost');
}

export async function getAuthService(): Promise<AuthService> {
  if (globalForAuth.mrlAuthService) return globalForAuth.mrlAuthService;

  let store: AuthStore;
  if (hasDatabase()) {
    const { PrismaAuthStore } = await import('./prismaStore');
    store = new PrismaAuthStore();
  } else {
    console.warn('[cuentas] Sin DATABASE_URL real: usando almacén en memoria. No usar en producción.');
    store = new MemoryAuthStore();
  }

  globalForAuth.mrlAuthStore = store;
  globalForAuth.mrlAuthService = new AuthService(store);
  return globalForAuth.mrlAuthService;
}

/** Lee la cookie de sesión de una petición. */
export function sessionTokenFrom(request: Request): string | undefined {
  const cookie = request.headers.get('cookie');
  if (!cookie) return undefined;
  const match = cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`));
  return match ? decodeURIComponent(match.slice(SESSION_COOKIE.length + 1)) : undefined;
}

/** Usuario de la petición, o `undefined` si no hay sesión vigente. */
export async function currentUser(request: Request) {
  const service = await getAuthService();
  return service.userFromToken(sessionTokenFrom(request));
}

export { AuthService, SESSION_COOKIE, SESSION_DAYS, AUTH_MESSAGES } from './service';
export type { PublicUser } from './service';
