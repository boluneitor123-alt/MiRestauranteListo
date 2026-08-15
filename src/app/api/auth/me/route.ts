import { currentUser } from '@/server/auth';
import { json } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** `GET /api/auth/me` — quién está en sesión. */
export async function GET(request: Request) {
  const user = await currentUser(request);
  return json({ ok: true, user: user ?? null });
}
