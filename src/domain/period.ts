/**
 * Selector de periodo del panel del dueño (README § 2 · "Resumen").
 *
 * Hoy · Ayer · Esta semana · Este mes · Mes pasado · Todo · Personalizado.
 * Los rangos son semiabiertos `[from, to)` y la semana empieza en lunes.
 */

export const PERIODS = ['hoy', 'ayer', 'semana', 'mes', 'mes-pasado', 'todo', 'personalizado'] as const;

export type PeriodId = (typeof PERIODS)[number];

export const PERIOD_LABELS: Record<PeriodId, string> = {
  hoy: 'Hoy',
  ayer: 'Ayer',
  semana: 'Esta semana',
  mes: 'Este mes',
  'mes-pasado': 'Mes pasado',
  todo: 'Todo',
  personalizado: 'Personalizado',
};

export interface PeriodRange {
  id: PeriodId;
  from: number;
  /** Exclusivo. */
  to: number;
  label: string;
  /** "Mostrando {periodo} · {fecha} a {fecha}". */
  description: string;
}

const DAY = 86_400_000;

function startOfDay(time: number): number {
  const d = new Date(time);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function startOfWeek(time: number): number {
  const d = new Date(startOfDay(time));
  // getDay(): 0 = domingo. La semana del negocio empieza el lunes.
  const offset = (d.getDay() + 6) % 7;
  return d.getTime() - offset * DAY;
}

function startOfMonth(time: number, monthOffset = 0): number {
  const d = new Date(time);
  return new Date(d.getFullYear(), d.getMonth() + monthOffset, 1).getTime();
}

/** Parsea un `<input type="date">` (`YYYY-MM-DD`) como fecha local. */
export function parseDateInput(value: string | undefined | null): number | undefined {
  if (!value) return undefined;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return undefined;
  const [, y, m, d] = match;
  const time = new Date(Number(y), Number(m) - 1, Number(d)).getTime();
  return Number.isNaN(time) ? undefined : time;
}

export function formatDate(time: number): string {
  return new Date(time).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function resolvePeriod(
  id: PeriodId,
  now: number,
  custom: { from?: string; to?: string } = {},
): PeriodRange {
  const today = startOfDay(now);
  let from: number;
  let to: number;

  switch (id) {
    case 'hoy':
      from = today;
      to = today + DAY;
      break;
    case 'ayer':
      from = today - DAY;
      to = today;
      break;
    case 'semana':
      from = startOfWeek(now);
      to = today + DAY;
      break;
    case 'mes':
      from = startOfMonth(now);
      to = today + DAY;
      break;
    case 'mes-pasado':
      from = startOfMonth(now, -1);
      to = startOfMonth(now);
      break;
    case 'personalizado': {
      const start = parseDateInput(custom.from);
      const end = parseDateInput(custom.to);
      from = start ?? today;
      // El día final se incluye completo.
      to = (end ?? today) + DAY;
      if (to <= from) to = from + DAY;
      break;
    }
    case 'todo':
    default:
      from = 0;
      to = today + DAY;
      break;
  }

  const label = PERIOD_LABELS[id];
  const description =
    id === 'todo'
      ? 'Mostrando todo el historial'
      : `Mostrando ${label.toLowerCase()} · ${formatDate(from)} a ${formatDate(to - DAY)}`;

  return { id, from, to, label, description };
}

export function isWithin(time: number | undefined, range: PeriodRange): boolean {
  if (time === undefined) return false;
  return time >= range.from && time < range.to;
}
