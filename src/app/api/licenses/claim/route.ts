import { getLicenseService } from '@/server/licensing';
import { currentUser } from '@/server/auth';
import { badRequest, json, readJson, str } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * `POST /licenses/claim` `{ deviceId }` → `{ ok, code }`
 *
 * Activación automática: al volver del pago la app pregunta cada 2.5 s hasta
 * ~100 s buscando la licencia de esta persona, y la reclama sola.
 *
 * De quién es la licencia lo dice **la sesión**, no el cuerpo de la petición.
 * Antes bastaba con mandar un `deviceId` y el servidor entregaba la licencia
 * sin dueño más reciente: con dos compras seguidas, un equipo podía quedarse
 * con la licencia de otra persona. Un correo en el cuerpo aquí sería lo mismo
 * escrito de otra forma, así que se ignora.
 */
export async function POST(request: Request) {
  const body = await readJson(request);
  const deviceId = str(body.deviceId);
  if (!deviceId) return badRequest('Falta el identificador del equipo.');

  const user = await currentUser(request);
  if (!user) return json({ ok: false, error: 'sin-sesion' });

  const service = await getLicenseService();
  return json(await service.claim({ deviceId, userId: user.id, email: user.email }));
}
