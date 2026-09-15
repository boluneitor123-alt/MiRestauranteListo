import { currentUser } from '@/server/auth';
import { getProjectRepository, hasDatabase } from '@/server/project/repository';
import { getLicenseService } from '@/server/licensing';
import { importBackup } from '@/domain/projectState';
import { aplicarAlcance } from '@/domain/alcance';
import { alDia } from '@/domain/desestimar';
import { sembrarEstimacion } from '@/domain/sembrar';
import { topesDe } from '@/domain/access';
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

  /*
    Cuatro pasos, en este orden. `importBackup` normaliza lo que llegue;
    `aplicarAlcance` deja pasar sólo lo que el nivel permite escribir;
    `sembrarEstimacion` llena por primera vez lo que el diagnóstico ya sabe; y
    `alDia` borra la marca de «estimado» de lo que la persona acaba de
    corregir.

    La siembra va **después** del alcance y la hace el servidor, no el
    navegador. Si la hiciera el cliente, en nivel prueba no serviría de nada:
    Números está en sólo lectura, así que `aplicarAlcance` devolvería los
    estimados a cero en el mismo guardado que los trajo. Lo que se congela son
    las ediciones de la persona; esto no es una edición suya, es lo que la app
    dedujo de sus respuestas.
  */
  const guardado = (await repo.load(user.id)) ?? null;
  const { state, recortado } = aplicarAlcance(level, importBackup(body.state ?? body), guardado);
  const sembrado = sembrarEstimacion(state, topesDe(level));
  const sembro = sembrado !== state;

  /*
    Si esta petición sembró, las marcas son del servidor y van tal cual: nada
    se "tocó" en un estado que acaba de nacer. `alDia` toma las marcas de lo
    guardado —para que el navegador no pueda declarar como estimación un dato
    de la persona— y eso, en el guardado de la siembra, borraba las marcas
    recién puestas: el proyecto ya existía con la lista vacía.
  */
  await repo.save(user.id, sembro ? sembrado : alDia(guardado, sembrado));

  /*
    Cuando la siembra entra, el navegador todavía tiene la pantalla en ceros:
    se le devuelve el estado para que lo adopte y vea sus números sin recargar.
  */
  return json({ ok: true, level, recortado, ...(sembrado !== state ? { state: sembrado } : {}) });
}
