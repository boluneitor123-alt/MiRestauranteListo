import { currentUser } from '@/server/auth';
import { enviarACapi } from '@/server/medicion/capi';
import { json, readJson, str } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * `POST /api/capi/registration` — la otra mitad de `CompleteRegistration`.
 *
 * El navegador ya mandó el suyo con el mismo `eventId`; Meta los une y cuenta
 * uno. Ir por los dos lados es lo que rescata a quien tiene bloqueador.
 *
 * Quién es se lee de la sesión, no del cuerpo: si viniera del cliente,
 * cualquiera podría mandar registros con el correo de otra persona.
 */
export async function POST(request: Request) {
  const user = await currentUser(request);
  if (!user) return json({ ok: false, error: 'sin-sesion' }, 401);

  const body = await readJson(request);
  const eventId = str(body.eventId);
  if (!eventId) return json({ ok: false, error: 'falta-event-id' }, 400);

  const resultado = await enviarACapi({
    nombre: 'CompleteRegistration',
    eventId,
    cuando: Date.now(),
    urlDeOrigen: str(body.eventSourceUrl),
    persona: {
      email: user.email,
      nombre: user.name,
      userId: user.id,
      // Las cookies de Meta llegan en la petición: esta sí la hace el navegador.
      fbp: request.headers.get('cookie')?.match(/(?:^|;)\s*_fbp\s*=\s*([^;]+)/)?.[1],
      fbc: str(body.fbc) ?? request.headers.get('cookie')?.match(/(?:^|;)\s*_fbc\s*=\s*([^;]+)/)?.[1],
      ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? undefined,
      userAgent: request.headers.get('user-agent') ?? undefined,
    },
  });

  // Un fallo de medición no es un fallo del registro: la cuenta ya existe.
  return json({ ok: true, medicion: resultado.ok ? 'enviado' : resultado.motivo });
}
