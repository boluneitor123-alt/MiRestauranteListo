import { getLicenseStore } from '@/server/licensing';
import { isAdmin, json, unauthorized } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** `GET /licenses/:code` — detalle para el panel del dueño. */
export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  if (!(await isAdmin(request))) return unauthorized();

  const { code } = await params;
  const store = await getLicenseStore();
  const license = await store.findLicense(code);
  return license ? json({ ok: true, license }) : json({ ok: false, error: 'no-existe' }, 404);
}
