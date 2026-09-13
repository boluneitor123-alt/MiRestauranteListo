import { NextResponse } from 'next/server';
import { currentUser } from '@/server/auth';
import { getLicenseService } from '@/server/licensing';
import { leerLeccion } from '@/server/contenido/lecciones';
import { json, str } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * `GET /api/lecciones?modulo=permisos&titulo=…&equipo=…` — el contenido de una
 * lección, y sólo si el nivel de quien pregunta la abre.
 *
 * Contesta 404 cuando está cerrada, igual que cuando no existe: la respuesta no
 * le dice a nadie qué hay del otro lado. El nivel se resuelve con el mismo
 * servicio que contesta el entitlement, para que la API y la pantalla no puedan
 * discrepar.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const moduleId = str(url.searchParams.get('modulo'));
  const titulo = str(url.searchParams.get('titulo'));
  if (!moduleId || !titulo) return json({ ok: false, error: 'faltan-datos' }, 400);

  const user = await currentUser(request);
  if (!user) return json({ ok: false, error: 'sin-sesion' }, 401);

  const service = await getLicenseService();
  const level = await service.nivelParaGuardar({
    deviceId: str(url.searchParams.get('equipo')),
    userId: user.id,
    email: user.email,
  });

  const resultado = leerLeccion(level, moduleId, titulo);
  if (!resultado.ok) return json({ ok: false, error: resultado.motivo }, 404);

  // Contenido de pago: que no se quede en ninguna caché compartida.
  return NextResponse.json(
    { ok: true, ...resultado.leccion },
    { status: 200, headers: { 'Cache-Control': 'private, no-store' } },
  );
}
