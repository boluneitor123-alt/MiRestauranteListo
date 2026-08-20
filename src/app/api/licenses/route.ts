import { getLicenseService, getLicenseStore } from '@/server/licensing';
import type { LicenseFilter } from '@/server/licensing/store';
import { badRequest, isAdmin, json, num, readJson, str, unauthorized } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * `POST /licenses` — emite una licencia. Sólo desde el panel del dueño; el
 * webhook de cobro tiene su propia ruta con verificación de firma.
 */
export async function POST(request: Request) {
  if (!(await isAdmin(request))) return unauthorized();

  const body = await readJson(request);
  const email = str(body.email);
  if (!email || !email.includes('@')) return badRequest('Falta el correo del cliente.');

  const service = await getLicenseService();
  const { code, alreadyIssued } = await service.issue({
    email,
    name: str(body.name),
    source: str(body.source) ?? 'manual',
    amount: num(body.amount),
    paymentRef: str(body.paymentRef),
  });

  return json({ ok: true, code, alreadyIssued }, alreadyIssued ? 200 : 201);
}

/** `GET /licenses` — listado para el panel. */
export async function GET(request: Request) {
  if (!(await isAdmin(request))) return unauthorized();

  const url = new URL(request.url);
  const service = await getLicenseService();
  const store = await getLicenseStore();
  const licenses = await store.listLicenses({
    query: url.searchParams.get('q') ?? undefined,
    status: (url.searchParams.get('status') as LicenseFilter['status']) ?? undefined,
    limit: Number(url.searchParams.get('limit')) || undefined,
  });

  return json({ ok: true, licenses, settings: await service.settings() });
}
