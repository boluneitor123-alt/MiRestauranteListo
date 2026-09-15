import { currentUser } from '@/server/auth';
import { getProjectRepository, hasDatabase } from '@/server/project/repository';
import { getLicenseService } from '@/server/licensing';
import { importBackup } from '@/domain/projectState';
import { aplicarAlcance } from '@/domain/alcance';
import { alDia } from '@/domain/desestimar';
import { sembrarEstimacion } from '@/domain/sembrar';
import { afinarEstimacion } from '@/domain/afinar';
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
  const conMarcasAlDia = sembro ? sembrado : alDia(guardado, sembrado);

  /*
    La afinación va **después** de `alDia`, y el orden no es negociable. Si
    fuera antes, los montos que ella misma acaba de reescribir se verían como
    una edición de la persona y perderían su marca de estimado: la app se
    habría "corregido" a sí misma y no volvería a tocar esos campos nunca.
    Aquí, con las marcas ya resueltas, sólo reescribe lo que sigue estimado.

    Y la hace el servidor por la misma razón que la siembra: en prueba Números
    está en sólo lectura, así que el navegador no podría guardar estos montos
    aunque los calculara. Contestar la tarjeta no es editar una cifra — es
    contestar una pregunta, y eso la prueba sí lo abre.
  */
  const afinado = afinarEstimacion(conMarcasAlDia);
  const afino = afinado !== conMarcasAlDia;

  await repo.save(user.id, afinado);

  /*
    Cuando la siembra o la afinación entran, el navegador todavía tiene los
    montos viejos: se le devuelve el estado para que lo adopte y vea sus
    números cambiar sin recargar.
  */
  return json({ ok: true, level, recortado, ...(sembro || afino ? { state: afinado } : {}) });
}
