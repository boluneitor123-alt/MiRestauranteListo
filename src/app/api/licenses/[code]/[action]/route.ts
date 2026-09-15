import { getLicenseService } from '@/server/licensing';
import { isAdmin, json, readJson, str, unauthorized } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * `GET /licenses/:code/devices` — los equipos de una licencia, con su último uso.
 */
export async function GET(request: Request, { params }: { params: Promise<{ code: string; action: string }> }) {
  if (!(await isAdmin(request))) return unauthorized();

  const { code, action } = await params;
  if (action !== 'devices') return json({ ok: false, error: 'accion-desconocida' }, 404);

  const equipos = await (await getLicenseService()).equiposDe(code);
  return equipos ? json({ ok: true, equipos }) : json({ ok: false, error: 'no-existe' }, 404);
}

/**
 * `POST /licenses/:code/<acción>` — operaciones del panel del dueño:
 * `revoke` · `reactivate` · `refund` · `free-devices` · `free-device` · `resend`.
 */
export async function POST(request: Request, { params }: { params: Promise<{ code: string; action: string }> }) {
  if (!(await isAdmin(request))) return unauthorized();

  const { code, action } = await params;
  const service = await getLicenseService();

  if (action === 'free-device') {
    // Uno solo, el que venga en el cuerpo. `free-devices` los quita todos.
    const body = await readJson(request);
    const license = await service.freeDevice(code, str(body.deviceId) ?? "");
    return license ? json({ ok: true, license }) : json({ ok: false, error: 'no-existe' }, 404);
  }

  if (action === 'resend') {
    const sent = await service.resend(code);
    return sent ? json({ ok: true }) : json({ ok: false, error: 'no-existe' }, 404);
  }

  const operation = {
    revoke: () => service.revoke(code),
    reactivate: () => service.reactivate(code),
    refund: () => service.refund(code),
    'free-devices': () => service.freeDevices(code),
  }[action];

  if (!operation) return json({ ok: false, error: 'accion-desconocida' }, 404);

  const license = await operation();
  return license ? json({ ok: true, license }) : json({ ok: false, error: 'no-existe' }, 404);
}
