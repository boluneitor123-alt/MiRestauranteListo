/**
 * Una fila por persona registrada, para la sección de Cuentas del panel.
 *
 * El panel se construía sólo con licencias y pruebas, así que quien se
 * registraba y no pagaba no aparecía en ninguna parte. Aquí la lista arranca
 * de la tabla de cuentas: todo el que creó una cuenta sale, haya pagado o no.
 *
 * Regla de la casa: si un dato no existe para alguien, va vacío. Nunca un cero
 * ni una fecha de relleno que se lea como información.
 */

import { CATS, TOTAL_TASKS, taskKey } from '@/content/route';

const DAY_MS = 86_400_000;

export type EstadoCuenta = 'pago' | 'en-prueba' | 'prueba-vencida' | 'sin-actividad';

export const ESTADO_LABELS: Record<EstadoCuenta, string> = {
  pago: 'Pagó',
  'en-prueba': 'En prueba',
  'prueba-vencida': 'Prueba vencida',
  'sin-actividad': 'Sin actividad',
};

export interface AccountRow {
  userId: string;
  email: string;
  name: string;
  /** Fecha de registro. Siempre existe. */
  createdAt: number;
  estado: EstadoCuenta;
  /** Código de la licencia, sólo si pagó. */
  code?: string;
  hechos: number;
  total: number;
  /** Primer paso pendiente: dónde se quedó. Ausente si ya terminó todo. */
  pasoPendiente?: string;
  /** Del diagnóstico. Ausentes mientras no haya proyecto. */
  giro?: string;
  presupuesto?: number;
  /** Ausente en las cuentas que no han entrado desde que se registra el dato. */
  lastLoginAt?: number;
  /** Se le acabó la prueba sin pagar y sin terminar la ruta. */
  abandonada: boolean;
}

export interface AccountInput {
  userId: string;
  email: string;
  name: string;
  createdAt: number;
  lastLoginAt?: number;
  /** Licencia viva de esta persona, si compró. */
  license?: { code: string; status: string };
  /** Llaves de tarea completadas, tal como las guarda el proyecto. */
  doneKeys: readonly string[];
  giro?: string;
  presupuesto?: number;
  /** Inicio de la prueba: lo más antiguo que se sepa de esta persona. */
  trialStartedAt?: number;
}

/** Las llaves de las 90 tareas, en el orden en que se recorren. */
const ORDEN: ReadonlyArray<readonly [string, string]> = CATS.flatMap((c) =>
  c.tasks.map((t, i) => [taskKey(c.id, i), t.t] as const),
);

/** Una licencia revocada o reembolsada ya no da acceso: no cuenta como pago. */
const daAcceso = (status: string): boolean => status !== 'revocada' && status !== 'reembolsada';

export function estadoDe(input: {
  license?: { status: string };
  trialStartedAt?: number;
  now: number;
  trialDays: number;
}): EstadoCuenta {
  if (input.license && daAcceso(input.license.status)) return 'pago';
  // Sin prueba empezada no se sabe nada: no se le llama "en prueba" a quien
  // creó la cuenta y nunca abrió la app.
  if (input.trialStartedAt === undefined) return 'sin-actividad';
  return input.now - input.trialStartedAt < input.trialDays * DAY_MS ? 'en-prueba' : 'prueba-vencida';
}

export function buildAccount(input: AccountInput, opts: { now: number; trialDays: number }): AccountRow {
  const hechas = new Set(input.doneKeys);
  const hechos = ORDEN.filter(([key]) => hechas.has(key)).length;
  const pendiente = ORDEN.find(([key]) => !hechas.has(key));
  const estado = estadoDe({ license: input.license, trialStartedAt: input.trialStartedAt, ...opts });

  return {
    userId: input.userId,
    email: input.email,
    name: input.name,
    createdAt: input.createdAt,
    estado,
    code: input.license && daAcceso(input.license.status) ? input.license.code : undefined,
    hechos,
    total: TOTAL_TASKS,
    pasoPendiente: pendiente?.[1],
    giro: input.giro,
    presupuesto: input.presupuesto,
    lastLoginAt: input.lastLoginAt,
    abandonada: estado === 'prueba-vencida' && hechos < TOTAL_TASKS,
  };
}

export function buildAccounts(
  entradas: readonly AccountInput[],
  opts: { now: number; trialDays: number },
): AccountRow[] {
  return entradas
    .map((e) => buildAccount(e, opts))
    .sort((a, b) => b.createdAt - a.createdAt);
}

/** Filtro del panel. Sin criterios devuelve todo. */
export function filterAccounts(
  filas: readonly AccountRow[],
  filtro: { query?: string; estado?: EstadoCuenta; soloAbandonadas?: boolean },
): AccountRow[] {
  const q = (filtro.query ?? '').trim().toLowerCase();
  return filas.filter((f) => {
    if (q && !f.email.toLowerCase().includes(q) && !f.name.toLowerCase().includes(q)) return false;
    if (filtro.estado && f.estado !== filtro.estado) return false;
    if (filtro.soloAbandonadas && !f.abandonada) return false;
    return true;
  });
}
