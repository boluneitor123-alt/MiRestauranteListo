import { getAuthService, SESSION_COOKIE, sessionTokenFrom } from '@/server/auth';
import { json } from '@/server/http';
import { clearedSessionCookie } from '@/server/auth/cookie';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** `POST /api/auth/logout` — borra la sesión del servidor, no sólo la cookie. */
export async function POST(request: Request) {
  const service = await getAuthService();
  await service.logout(sessionTokenFrom(request) ?? '');

  const response = json({ ok: true });
  response.headers.append('Set-Cookie', clearedSessionCookie(SESSION_COOKIE));
  return response;
}
