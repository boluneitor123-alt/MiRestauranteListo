import { getLicenseService } from '@/server/licensing';
import { badRequest, json, readJson, str } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * `POST /licenses/validate` `{ code, deviceId }` → `{ ok, status }`
 *
 * Se llama en cada arranque: si la licencia fue revocada o reembolsada, la app
 * vuelve a prueba con aviso.
 */
export async function POST(request: Request) {
  const body = await readJson(request);
  const code = str(body.code);
  const deviceId = str(body.deviceId);
  if (!code || !deviceId) return badRequest('Faltan el código y el identificador del equipo.');

  const service = await getLicenseService();
  return json(await service.validate({ code, deviceId }));
}
