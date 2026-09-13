import { currentUser } from '@/server/auth';
import { getProjectRepository, hasDatabase } from '@/server/project/repository';
import { getLicenseService } from '@/server/licensing';
import { importBackup } from '@/domain/projectState';
import { aplicarAlcance } from '@/domain/alcance';
import { json, readJson, str } from '@/server/http';

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
 * Dos filtros antes de tocar la base. El primero, `importBackup`, es el mismo
 * del respaldo `.json`: normaliza lo que llegue incompleto o manipulado. El
 * segundo, `aplicarAlcance`, es el que faltaba: esconder un botón no impedía
 * nada a quien llamara esta ruta a mano, así que el tercer platillo y las
 * cifras de Números se guardaban igual.
 *
 * Recorta en vez de rechazar, y devuelve en `recortado` qué se ignoró. Un
 * `PUT` trae el estado entero: un 400 tiraría también las ediciones legítimas
 * que vinieran en el mismo cuerpo.
 */
export async function PUT(request: Request) {
  const user = await currentUser(request);
  if (!user) return noSession();
  if (!hasDatabase()) return noDatabase();

  const body = await readJson(request);
  const repo = getProjectRepository();

  // El nivel lo resuelve el mismo servicio que contesta el entitlement: una
  // sola regla, para que la API y la pantalla no puedan discrepar.
  const service = await getLicenseService();
  const level = await service.nivelParaGuardar({
    deviceId: str(body.deviceId),
    userId: user.id,
    email: user.email,
  });

  const { state, recortado } = aplicarAlcance(level, importBackup(body.state ?? body), (await repo.load(user.id)) ?? null);
  await repo.save(user.id, state);

  return json({ ok: true, level, recortado });
}
