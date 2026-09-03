/**
 * Lee de Postgres lo que la sección de Cuentas necesita.
 *
 * Va en pocas consultas y se cruza en memoria: son cientos de filas, no
 * millones, y así el cálculo queda en `accounts.ts`, que se puede probar sin
 * base de datos.
 */

import { getPrisma } from '../licensing/prismaStore';
import { buildAccounts, type AccountInput, type AccountRow } from './accounts';

export async function readAccounts(opts: { now: number; trialDays: number }): Promise<AccountRow[]> {
  const db = getPrisma();

  const [users, projects, licenses] = await Promise.all([
    db.user.findMany({
      select: { id: true, email: true, name: true, createdAt: true, lastLoginAt: true },
    }),
    db.project.findMany({
      select: {
        userId: true,
        giro: true,
        budgetCap: true,
        answers: true,
        trialStartedAt: true,
        completedTasks: { select: { taskKey: true } },
      },
    }),
    db.license.findMany({
      select: { code: true, status: true, email: true, userId: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  // La prueba vive en el equipo. Para la persona vale la más antigua de sus
  // equipos: es cuando de verdad empezó a usar el producto.
  const trials = await db.trial.findMany({
    select: { startedAt: true, device: { select: { userId: true } } },
  });
  const inicioPrueba = new Map<string, number>();
  for (const t of trials) {
    const uid = t.device?.userId;
    if (!uid) continue;
    const ms = t.startedAt.getTime();
    const previo = inicioPrueba.get(uid);
    if (previo === undefined || ms < previo) inicioPrueba.set(uid, ms);
  }

  const porUsuario = new Map(projects.map((p) => [p.userId, p]));

  // La licencia se busca por cuenta y, si no, por correo: las compras viejas
  // se emitieron antes de que la licencia se atara al `userId`.
  const porId = new Map<string, { code: string; status: string }>();
  const porCorreo = new Map<string, { code: string; status: string }>();
  for (const l of licenses) {
    if (l.userId) porId.set(l.userId, { code: l.code, status: l.status });
    if (l.email) porCorreo.set(l.email.trim().toLowerCase(), { code: l.code, status: l.status });
  }

  const entradas: AccountInput[] = users.map((u) => {
    const proyecto = porUsuario.get(u.id);
    const prueba = inicioPrueba.get(u.id) ?? proyecto?.trialStartedAt.getTime();
    /*
      El proyecto se crea en cuanto alguien abre la app, con `giro: "Otro"` y
      `budgetCap: 250000` de fábrica. Enseñar eso sería inventar: diría que
      contestó el diagnóstico quien nunca lo abrió. Sólo hay dato si contestó.
    */
    const respuestas = (proyecto?.answers ?? {}) as Record<string, unknown>;
    const contesto = Object.keys(respuestas).length > 0;
    return {
      userId: u.id,
      email: u.email,
      name: u.name,
      createdAt: u.createdAt.getTime(),
      lastLoginAt: u.lastLoginAt ? u.lastLoginAt.getTime() : undefined,
      license: porId.get(u.id) ?? porCorreo.get(u.email.trim().toLowerCase()),
      doneKeys: proyecto?.completedTasks.map((t) => t.taskKey) ?? [],
      giro: contesto ? proyecto?.giro : undefined,
      presupuesto: contesto ? proyecto?.budgetCap : undefined,
      trialStartedAt: prueba,
    };
  });

  return buildAccounts(entradas, opts);
}
