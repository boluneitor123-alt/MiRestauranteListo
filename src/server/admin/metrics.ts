/**
 * KPIs del panel del dueño (README § 2 · "Resumen").
 *
 * Todo se calcula sobre el periodo elegido; los importes son de las licencias
 * emitidas dentro del rango y los reembolsos se descuentan del bruto.
 */

import { demoMetrics, type License } from '@/domain/license';
import { isWithin, type PeriodRange } from '@/domain/period';
import type { AdminSettings, TrialRecord } from '../licensing/store';

export interface RevenueBySource {
  source: string;
  gross: number;
  refunded: number;
  net: number;
  count: number;
}

export interface AttentionItem {
  kind: 'sin-activar' | 'equipos-al-limite' | 'garantia-activa';
  title: string;
  detail: string;
  codes: string[];
}

export interface AdminSummary {
  period: PeriodRange;
  /** Ingresos netos del periodo, con su bruto y lo reembolsado. */
  gross: number;
  refunded: number;
  net: number;
  /** Licencias emitidas en el periodo. */
  issued: number;
  activated: number;
  notActivated: number;
  /** % de reembolsos por monto y por número de órdenes. */
  refundRatePct: number;
  refundedOrdersPct: number;
  /** Rojo si pasa del 10%. */
  refundAlert: boolean;
  demos: ReturnType<typeof demoMetrics>;
  /** % de demos concluidas que no convirtieron. */
  finishedWithoutPayingPct: number;
  conversionReading: string;
  revenueBySource: RevenueBySource[];
  attention: AttentionItem[];
  latest: License[];
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Lectura accionable según el rango de conversión. */
export function conversionReading(pct: number, finished: number): string {
  if (!finished) return 'Todavía no hay demos concluidas: espera a que cierre la primera prueba.';
  if (pct >= 25) return 'Conversión alta: la demo está haciendo su trabajo. Mete más tráfico a la landing.';
  if (pct >= 12) return 'Conversión sana. Prueba subir el recordatorio del día 6 antes de tocar el precio.';
  if (pct >= 5) return 'Conversión baja: revisa que el punto de equilibrio se vea completo durante la prueba.';
  return 'Casi nadie convierte: revisa el paywall y qué tanto valor ve el usuario antes del día 7.';
}

export function buildSummary(input: {
  licenses: readonly License[];
  trials: readonly TrialRecord[];
  period: PeriodRange;
  settings: AdminSettings;
  now: number;
}): AdminSummary {
  const { period, settings, now } = input;

  const inPeriod = input.licenses.filter((l) => isWithin(l.createdAt, period));
  const refundedInPeriod = input.licenses.filter((l) => isWithin(l.refundedAt, period));

  const gross = inPeriod.reduce((a, l) => a + (l.amount ?? 0), 0);
  const refunded = refundedInPeriod.reduce((a, l) => a + (l.refundedAmount ?? l.amount ?? 0), 0);
  const net = gross - refunded;

  const activated = inPeriod.filter((l) => l.status === 'activada').length;
  const notActivated = inPeriod.filter((l) => l.status === 'nueva').length;

  // Ingresos por origen: las filas suman exactamente el neto del encabezado.
  const sources = new Map<string, RevenueBySource>();
  const bucket = (source: string) => {
    const key = source || 'checkout';
    if (!sources.has(key)) sources.set(key, { source: key, gross: 0, refunded: 0, net: 0, count: 0 });
    return sources.get(key) as RevenueBySource;
  };
  for (const l of inPeriod) {
    const row = bucket(l.source ?? 'checkout');
    row.gross += l.amount ?? 0;
    row.count += 1;
  }
  for (const l of refundedInPeriod) {
    bucket(l.source ?? 'checkout').refunded += l.refundedAmount ?? l.amount ?? 0;
  }
  for (const row of sources.values()) row.net = round(row.gross - row.refunded);

  const trialsInPeriod = input.trials.filter((t) => isWithin(t.startedAt, period));
  const demos = demoMetrics(trialsInPeriod);

  const warrantyWindow = settings.warrantyDays * 86_400_000;
  const attention: AttentionItem[] = [];

  const sinActivar = input.licenses.filter((l) => l.status === 'nueva');
  if (sinActivar.length) {
    attention.push({
      kind: 'sin-activar',
      title: `${sinActivar.length} código(s) pagados sin activar`,
      detail: 'Pagaron y todavía no entran. Reenvíales el código o escríbeles.',
      codes: sinActivar.map((l) => l.code),
    });
  }

  const alLimite = input.licenses.filter((l) => l.devices.length >= settings.maxDevices);
  if (alLimite.length) {
    attention.push({
      kind: 'equipos-al-limite',
      title: `${alLimite.length} licencia(s) con equipos al límite`,
      detail: `Llegaron a ${settings.maxDevices} equipos. Si cambiaron de teléfono, libera sus equipos.`,
      codes: alLimite.map((l) => l.code),
    });
  }

  const enGarantia = input.licenses.filter(
    (l) => l.status !== 'reembolsada' && now - l.createdAt <= warrantyWindow,
  );
  if (enGarantia.length) {
    attention.push({
      kind: 'garantia-activa',
      title: `${enGarantia.length} compra(s) dentro de la garantía`,
      detail: `Todavía pueden pedir reembolso (garantía de ${settings.warrantyDays} días).`,
      codes: enGarantia.map((l) => l.code),
    });
  }

  return {
    period,
    gross: round(gross),
    refunded: round(refunded),
    net: round(net),
    issued: inPeriod.length,
    activated,
    notActivated,
    refundRatePct: gross > 0 ? Math.round((refunded / gross) * 100) : 0,
    refundedOrdersPct: inPeriod.length ? Math.round((refundedInPeriod.length / inPeriod.length) * 100) : 0,
    refundAlert: gross > 0 && refunded / gross > 0.1,
    demos,
    finishedWithoutPayingPct: demos.finished
      ? Math.round((demos.finishedWithoutPaying / demos.finished) * 100)
      : 0,
    conversionReading: conversionReading(demos.conversionPct, demos.finished),
    revenueBySource: [...sources.values()].sort((a, b) => b.net - a.net),
    attention,
    latest: [...input.licenses].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5),
  };
}
