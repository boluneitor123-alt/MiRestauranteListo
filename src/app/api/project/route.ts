import { currentUser } from '@/server/auth';
import { getProjectRepository, hasDatabase } from '@/server/project/repository';
import { importBackup } from '@/domain/projectState';
import { json, readJson } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function noSession() {
  return json({ ok: false, error: 'sin-sesion', message: 'Inicia sesión para guardar tu proyecto.' }, 401);
}

function noDatabase() {
  return json(
    { ok: false, error: 'sin-base-de-datos', message: 'Falta configurar DATABASE_URL en el servidor.' },
    503,
  );
}

/** `GET /api/project` — el proyecto del usuario en sesión. */
export async function GET(request: Request) {
  const user = await currentUser(request);
  if (!user) return noSession();
  if (!hasDatabase()) return noDatabase();

  const state = await getProjectRepository().load(user.id);
  return json({ ok: true, state: state ?? null });
}

/**
 * `PUT /api/project` — guarda el proyecto completo.
 *
 * El cuerpo pasa por el mismo importador que el respaldo `.json`: lo que llegue
 * incompleto o manipulado se normaliza antes de tocar la base.
 */
export async function PUT(request: Request) {
  const user = await currentUser(request);
  if (!user) return noSession();
  if (!hasDatabase()) return noDatabase();

  const body = await readJson(request);
  const state = importBackup(body.state ?? body);
  await getProjectRepository().save(user.id, state);

  return json({ ok: true });
}
