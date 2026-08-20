import { getLicenseStore } from '@/server/licensing';
import { isAdmin, json, unauthorized } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** `GET /api/admin/events` — bitácora del panel. */
export async function GET(request: Request) {
  if (!(await isAdmin(request))) return unauthorized();

  const limit = Number(new URL(request.url).searchParams.get('limit')) || 100;
  const store = await getLicenseStore();
  return json({ ok: true, events: await store.listEvents(limit) });
}

/** `DELETE /api/admin/events` — zona de riesgo: borra la bitácora. */
export async function DELETE(request: Request) {
  if (!(await isAdmin(request))) return unauthorized();

  const store = await getLicenseStore();
  await store.deleteAllEvents();
  return json({ ok: true });
}
