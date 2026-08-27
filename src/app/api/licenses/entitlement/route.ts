import { getLicenseService } from '@/server/licensing';
import { currentUser } from '@/server/auth';
import { badRequest, json, readJson, str } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * `POST /licenses/entitlement` `{ deviceId }` → nivel de acceso y alcance.
 *
 * Es la única fuente de verdad del gating: la app no decide por su cuenta si
 * está en prueba, bloqueada o con licencia. También arranca la prueba en el
 * primer arranque del equipo y sella la demo cuando vence.
 */
export async function POST(request: Request) {
  const body = await readJson(request);
  const deviceId = str(body.deviceId);
  if (!deviceId) return badRequest('Falta el identificador del equipo.');

  // Quién pregunta sale de la sesión: si esta persona ya compró, su acceso
  // vale en este equipo aunque el pago se haya hecho en otro.
  const user = await currentUser(request);

  const service = await getLicenseService();
  const entitlement = await service.entitlement({
    deviceId,
    code: str(body.code),
    userId: user?.id,
    email: user?.email,
  });
  const settings = await service.settings();

  return json({
    ok: true,
    ...entitlement,
    price: settings.price,
    warrantyDays: settings.warrantyDays,
    trialDays: settings.trialDays,
  });
}
