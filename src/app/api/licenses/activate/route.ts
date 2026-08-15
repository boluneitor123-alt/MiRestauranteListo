import { getLicenseService } from '@/server/licensing';
import { badRequest, json, readJson, str } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * `POST /licenses/activate` `{ code, deviceId }` → `{ ok, devices, max }`
 *
 * Se usa desde Más › Recuperar acceso, cuando el usuario cambia de equipo.
 */
export async function POST(request: Request) {
  const body = await readJson(request);
  const code = str(body.code);
  const deviceId = str(body.deviceId);
  if (!code) return badRequest('Falta el código.');
  if (!deviceId) return badRequest('Falta el identificador del equipo.');

  const service = await getLicenseService();
  const result = await service.activate({ code, deviceId });

  return json(result, result.ok ? 200 : 409);
}
