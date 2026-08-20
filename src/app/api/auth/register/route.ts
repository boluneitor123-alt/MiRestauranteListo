import { getAuthService, SESSION_COOKIE } from '@/server/auth';
import { json, readJson, str } from '@/server/http';
import { sessionCookie } from '@/server/auth/cookie';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** `POST /api/auth/register` — crea la cuenta y deja la sesión abierta. */
export async function POST(request: Request) {
  const body = await readJson(request);
  const service = await getAuthService();

  const result = await service.register({
    name: str(body.name) ?? '',
    email: str(body.email) ?? '',
    password: typeof body.password === 'string' ? body.password : '',
    deviceId: str(body.deviceId),
  });

  if (!result.ok) return json({ ok: false, error: result.error, message: result.message }, 400);

  const response = json({ ok: true, user: result.user, redirectTo: result.user.role === 'admin' ? '/admin' : '/app' }, 201);
  response.headers.append('Set-Cookie', sessionCookie(SESSION_COOKIE, result.token, result.expiresAt));
  return response;
}
