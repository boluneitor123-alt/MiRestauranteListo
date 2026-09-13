/**
 * Punto de entrada de autenticación.
 *
 * Con `DATABASE_URL` real usa Postgres. Sin ella, en desarrollo cae a un
 * almacén en memoria; en producción falla, igual que las licencias: una base
 * de cuentas que se vacía en cada arranque en frío es peor que no arrancar.
 */

import { AuthService, SESSION_COOKIE } from './service';
import { MemoryAuthStore } from './memoryStore';
import type { AuthStore } from './store';
import { permiteAlmacenEnMemoria } from '../db';

const globalForAuth = globalThis as unknown as { mrlAuthStore?: AuthStore; mrlAuthService?: AuthService };

export async function getAuthService(): Promise<AuthService> {
  if (globalForAuth.mrlAuthService) return globalForAuth.mrlAuthService;

  let store: AuthStore;
  if (permiteAlmacenEnMemoria('cuentas')) {
    store = new MemoryAuthStore();
  } else {
    const { PrismaAuthStore } = await import('./prismaStore');
    store = new PrismaAuthStore();
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
