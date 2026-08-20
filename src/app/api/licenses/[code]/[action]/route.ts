import { getLicenseService } from '@/server/licensing';
import { isAdmin, json, unauthorized } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * `POST /licenses/:code/<acción>` — operaciones del panel del dueño:
 * `revoke` · `reactivate` · `refund` · `free-devices` · `resend`.
 */
export async function POST(request: Request, { params }: { params: Promise<{ code: string; action: string }> }) {
  if (!(await isAdmin(request))) return unauthorized();

  const { code, action } = await params;
  const service = await getLicenseService();

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
