import { getAuthService, SESSION_COOKIE } from '@/server/auth';
import { json, readJson, str } from '@/server/http';
import { sessionCookie } from '@/server/auth/cookie';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** `POST /api/auth/login` */
export async function POST(request: Request) {
  const body = await readJson(request);
  const service = await getAuthService();

  const result = await service.login({
    email: str(body.email) ?? '',
    password: typeof body.password === 'string' ? body.password : '',
    deviceId: str(body.deviceId),
  });

  if (!result.ok) return json({ ok: false, error: result.error, message: result.message }, 401);

  const response = json({ ok: true, user: result.user });
  response.headers.append('Set-Cookie', sessionCookie(SESSION_COOKIE, result.token, result.expiresAt));
  return response;
}
