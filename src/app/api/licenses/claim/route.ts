import { getLicenseService } from '@/server/licensing';
import { badRequest, json, readJson, str } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * `POST /licenses/claim` `{ deviceId }` → `{ ok, code }`
 *
 * Activación automática: al volver del checkout la app pregunta cada 2.5 s
 * hasta ~100 s buscando una licencia nueva sin equipos, y la reclama sola.
 */
export async function POST(request: Request) {
  const body = await readJson(request);
  const deviceId = str(body.deviceId);
  if (!deviceId) return badRequest('Falta el identificador del equipo.');

  const service = await getLicenseService();
  return json(await service.claim({ deviceId, email: str(body.email) }));
}
