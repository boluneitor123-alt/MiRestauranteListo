/**
 * Cookie de sesión.
 *
 * `HttpOnly` para que ningún script pueda leerla, `SameSite=Lax` para que
 * sobreviva al regreso del checkout de Stripe, y `Secure` en producción.
 */

const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';

export function sessionCookie(name: string, token: string, expiresAt: number): string {
  const maxAge = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
  return `${name}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

export function clearedSessionCookie(name: string): string {
  return `${name}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}
