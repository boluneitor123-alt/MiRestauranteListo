import { getLicenseService, getLicenseStore } from '@/server/licensing';
import { leerHuerfanas } from '@/server/admin/licenciasHuerfanas';
import { badRequest, isAdmin, json, readJson, str, unauthorized } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** `GET /api/admin/licencias-huerfanas` — las que abren por equipo por no tener dueño. */
export async function GET(request: Request) {
  if (!(await isAdmin(request))) return unauthorized();
  const { huerfanas, resumen } = await leerHuerfanas(await getLicenseStore());
  return json({ ok: true, huerfanas, resumen });
}

/**
 * `POST /api/admin/licencias-huerfanas` — dos acciones del panel:
 * `{ code, email }` le pone dueño a una licencia; `{ revocarCorreo }` revoca
 * todas las de un correo.
 */
export async function POST(request: Request) {
  if (!(await isAdmin(request))) return unauthorized();

  const body = await readJson(request);
  const service = await getLicenseService();

  const revocarCorreo = str(body.revocarCorreo);
  if (revocarCorreo) {
    if (!revocarCorreo.includes('@')) return badRequest('Ese correo no se ve bien.');
    const { codes } = await service.revokeByEmail(revocarCorreo);
    return json({ ok: true, revocadas: codes });
  }

  const code = str(body.code);
  const email = str(body.email);
  if (!code || !email) return badRequest('Falta el código o el correo.');

  const result = await service.asignarDueno(code, email);
  if (!result.ok) {
    const mensajes = {
      'no-existe': 'No encontramos esa licencia.',
      'correo-invalido': 'Ese correo no se ve bien.',
      'sin-cuenta': 'Ese correo no tiene cuenta todavía. Que la persona se registre y vuelve a intentar.',
    };
    return badRequest(mensajes[result.error]);
  }
  return json({ ok: true, license: result.license });
}
