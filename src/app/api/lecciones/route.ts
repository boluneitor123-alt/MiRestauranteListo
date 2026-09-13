import { NextResponse } from 'next/server';
import { currentUser } from '@/server/auth';
import { getLicenseService } from '@/server/licensing';
import { leerLeccion } from '@/server/contenido/lecciones';
import { json, str } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** La misma respuesta para todo lo que no se puede dar. */
const noEncontrada = () =>
  NextResponse.json(
    { ok: false, error: 'no-encontrada' },
    { status: 404, headers: { 'Cache-Control': 'private, no-store' } },
  );

/**
 * `GET /api/lecciones?modulo=permisos&titulo=…&equipo=…` — el contenido de una
 * lección, y sólo si el nivel de quien pregunta la abre.
 *
 * **Lo que no se da, se niega siempre igual.** Cerrada, inexistente, de otro
 * módulo o de un módulo que no existe: el mismo 404, el mismo cuerpo, las
 * mismas cabeceras. Antes contestaba `error: "cerrada"` en un caso y
 * `"no-existe"` en el otro, y esa diferencia le confirmaba a quien probara que
 * detrás de ese título sí hay algo: el endpoint servía de índice de lo que hay
 * del otro lado del pago.
 *
 * El nivel se resuelve con el mismo servicio que contesta el entitlement, para
 * que la API y la pantalla no puedan discrepar.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const moduleId = str(url.searchParams.get('modulo'));
  const titulo = str(url.searchParams.get('titulo'));
  // Una petición sin datos no llegó a preguntar por ningún título: no hay nada
  // que delatar, y decirlo ayuda a quien está integrando.
  if (!moduleId || !titulo) return json({ ok: false, error: 'faltan-datos' }, 400);

  /*
    Sin sesión se niega antes de mirar nada, así que la respuesta es la misma
    para un título real y para uno inventado. Es un 401 y no el 404 de arriba a
    propósito: quien no ha entrado no aprende nada del catálogo por saber que
    le falta la sesión, y la app necesita distinguirlo para mandarlo a entrar.
  */
  const user = await currentUser(request);
  if (!user) return json({ ok: false, error: 'sin-sesion' }, 401);

  const service = await getLicenseService();
  const level = await service.nivelParaGuardar({
    deviceId: str(url.searchParams.get('equipo')),
    userId: user.id,
    email: user.email,
  });

  const resultado = leerLeccion(level, moduleId, titulo);
  if (!resultado.ok) return noEncontrada();

  // Contenido de pago: que no se quede en ninguna caché compartida.
  return NextResponse.json(
    { ok: true, ...resultado.leccion },
    { status: 200, headers: { 'Cache-Control': 'private, no-store' } },
  );
}
