import { getLicenseStore } from '@/server/licensing';
import { isAdmin, json, num, readJson, unauthorized } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!isAdmin(request)) return unauthorized();
  const store = await getLicenseStore();
  return json({ ok: true, settings: await store.getSettings() });
}

/** `PATCH /api/admin/settings` — precio, días de prueba, equipos, garantía… */
export async function PATCH(request: Request) {
  if (!isAdmin(request)) return unauthorized();

  const body = await readJson(request);
  const store = await getLicenseStore();

  const patch = {
    ...(num(body.price) !== undefined ? { price: Math.max(0, num(body.price) as number) } : {}),
    ...(num(body.trialDays) !== undefined ? { trialDays: Math.max(1, num(body.trialDays) as number) } : {}),
    ...(num(body.maxDevices) !== undefined ? { maxDevices: Math.max(1, num(body.maxDevices) as number) } : {}),
    ...(num(body.referralDiscountPct) !== undefined
      ? { referralDiscountPct: Math.min(100, Math.max(0, num(body.referralDiscountPct) as number)) }
      : {}),
    ...(num(body.warrantyDays) !== undefined ? { warrantyDays: Math.max(0, num(body.warrantyDays) as number) } : {}),
    ...(typeof body.autoActivation === 'boolean' ? { autoActivation: body.autoActivation } : {}),
  };

  const settings = await store.updateSettings(patch);
  await store.appendEvent({ kind: 'ajustes-actualizados', message: 'Ajustes del panel actualizados', meta: patch });

  return json({ ok: true, settings });
}
