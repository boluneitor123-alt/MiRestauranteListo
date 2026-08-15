import { describe, expect, it } from 'vitest';
import { buildSummary } from '../metrics';
import { resolvePeriod, parseDateInput, PERIODS } from '@/domain/period';
import { DAY_MS, LICENSE_DEFAULTS, type License } from '@/domain/license';
import type { AdminSettings, TrialRecord } from '@/server/licensing/store';

const NOW = new Date(2026, 5, 15, 12, 0, 0).getTime(); // lunes 15 de junio de 2026

const settings: AdminSettings = {
  price: LICENSE_DEFAULTS.price,
  trialDays: 7,
  maxDevices: 3,
  referralDiscountPct: 20,
  warrantyDays: 14,
  autoActivation: true,
};

const license = (over: Partial<License> & { code: string }): License => ({
  status: 'nueva',
  devices: [],
  email: 'cliente@correo.com',
  source: 'checkout',
  amount: 2450,
  createdAt: NOW,
  ...over,
});

describe('selector de periodo (README § 2)', () => {
  it('ofrece los siete periodos documentados', () => {
    expect(PERIODS).toEqual(['hoy', 'ayer', 'semana', 'mes', 'mes-pasado', 'todo', 'personalizado']);
  });

  it('acota hoy y ayer al día natural', () => {
    const hoy = resolvePeriod('hoy', NOW);
    expect(new Date(hoy.from).getDate()).toBe(15);
    expect(hoy.to - hoy.from).toBe(DAY_MS);

    const ayer = resolvePeriod('ayer', NOW);
    expect(new Date(ayer.from).getDate()).toBe(14);
    expect(ayer.to).toBe(hoy.from);
  });

  it('empieza la semana en lunes', () => {
    // El 15 de junio de 2026 es lunes: la semana empieza ese mismo día.
    expect(new Date(resolvePeriod('semana', NOW).from).getDate()).toBe(15);
    // Y desde el domingo siguiente, la semana sigue siendo la del lunes 15.
    const domingo = new Date(2026, 5, 21, 10).getTime();
    expect(new Date(resolvePeriod('semana', domingo).from).getDate()).toBe(15);
  });

  it('acota este mes y el mes pasado', () => {
    const mes = resolvePeriod('mes', NOW);
    expect(new Date(mes.from).getMonth()).toBe(5);
    expect(new Date(mes.from).getDate()).toBe(1);

    const pasado = resolvePeriod('mes-pasado', NOW);
    expect(new Date(pasado.from).getMonth()).toBe(4);
    expect(pasado.to).toBe(mes.from);
  });

  it('incluye el día final completo en el periodo personalizado', () => {
    const rango = resolvePeriod('personalizado', NOW, { from: '2026-06-01', to: '2026-06-10' });
    expect(new Date(rango.from).getDate()).toBe(1);
    expect(new Date(rango.to - 1).getDate()).toBe(10);
  });

  it('no deja un rango personalizado invertido o vacío', () => {
    const rango = resolvePeriod('personalizado', NOW, { from: '2026-06-10', to: '2026-06-01' });
    expect(rango.to).toBeGreaterThan(rango.from);
    expect(parseDateInput('no-es-fecha')).toBeUndefined();
  });

  it('describe el periodo mostrado', () => {
    expect(resolvePeriod('todo', NOW).description).toBe('Mostrando todo el historial');
    expect(resolvePeriod('hoy', NOW).description).toContain('Mostrando hoy');
  });
});

describe('KPIs del resumen (README § 2)', () => {
  const period = resolvePeriod('mes', NOW);

  it('resta los reembolsos de los ingresos netos', () => {
    const summary = buildSummary({
      licenses: [
        license({ code: 'MRL-AAAA-2222' }),
        license({ code: 'MRL-BBBB-3333', status: 'reembolsada', refundedAt: NOW, refundedAmount: 2450 }),
      ],
      trials: [],
      period,
      settings,
      now: NOW,
    });

    expect(summary.gross).toBe(4900);
    expect(summary.refunded).toBe(2450);
    expect(summary.net).toBe(2450);
    expect(summary.issued).toBe(2);
    expect(summary.refundRatePct).toBe(50);
    expect(summary.refundedOrdersPct).toBe(50);
    expect(summary.refundAlert).toBe(true);
  });

  it('no marca alerta de reembolsos por debajo del 10%', () => {
    const licenses = Array.from({ length: 20 }, (_, i) => license({ code: `MRL-AAAA-${1000 + i}` }));
    licenses[0] = { ...licenses[0], status: 'reembolsada', refundedAt: NOW, refundedAmount: 2450 };
    const summary = buildSummary({ licenses, trials: [], period, settings, now: NOW });
    expect(summary.refundRatePct).toBe(5);
    expect(summary.refundAlert).toBe(false);
  });

  it('deja fuera lo que ocurrió antes del periodo', () => {
    const summary = buildSummary({
      licenses: [
        license({ code: 'MRL-AAAA-2222', createdAt: new Date(2026, 3, 2).getTime() }),
        license({ code: 'MRL-BBBB-3333' }),
      ],
      trials: [],
      period,
      settings,
      now: NOW,
    });
    expect(summary.issued).toBe(1);
    expect(summary.gross).toBe(2450);
  });

  it('las filas por origen suman exactamente el neto del encabezado', () => {
    const summary = buildSummary({
      licenses: [
        license({ code: 'MRL-AAAA-2222', source: 'checkout' }),
        license({ code: 'MRL-BBBB-3333', source: 'referido', amount: 1960 }),
        license({
          code: 'MRL-CCCC-4444',
          source: 'checkout',
          status: 'reembolsada',
          refundedAt: NOW,
          refundedAmount: 2450,
        }),
      ],
      trials: [],
      period,
      settings,
      now: NOW,
    });

    const suma = summary.revenueBySource.reduce((a, r) => a + r.net, 0);
    expect(suma).toBeCloseTo(summary.net, 6);
    expect(summary.revenueBySource.map((r) => r.source).sort()).toEqual(['checkout', 'referido']);
  });

  it('cuenta el embudo de códigos emitidos, activados y sin activar', () => {
    const summary = buildSummary({
      licenses: [
        license({ code: 'MRL-AAAA-2222', status: 'activada', devices: ['eq-1'] }),
        license({ code: 'MRL-BBBB-3333' }),
      ],
      trials: [],
      period,
      settings,
      now: NOW,
    });
    expect(summary.issued).toBe(2);
    expect(summary.activated).toBe(1);
    expect(summary.notActivated).toBe(1);
  });

  it('mide las demos concluidas sin pagar', () => {
    const trials: TrialRecord[] = [
      { deviceId: '1', startedAt: NOW, expiredAt: NOW + 7 * DAY_MS, converted: true },
      { deviceId: '2', startedAt: NOW, expiredAt: NOW + 7 * DAY_MS, converted: false },
      { deviceId: '3', startedAt: NOW, expiredAt: NOW + 7 * DAY_MS, converted: false },
      { deviceId: '4', startedAt: NOW, converted: false },
    ];
    const summary = buildSummary({ licenses: [], trials, period, settings, now: NOW });

    expect(summary.demos).toEqual({ started: 4, finished: 3, finishedWithoutPaying: 2, conversionPct: 33 });
    expect(summary.finishedWithoutPayingPct).toBe(67);
    expect(summary.conversionReading).toContain('Conversión alta');
  });

  it('avisa de lo que requiere atención del dueño', () => {
    const summary = buildSummary({
      licenses: [
        license({ code: 'MRL-AAAA-2222' }),
        license({ code: 'MRL-BBBB-3333', status: 'activada', devices: ['a', 'b', 'c'] }),
        license({ code: 'MRL-CCCC-4444', createdAt: NOW - 60 * DAY_MS }),
      ],
      trials: [],
      period: resolvePeriod('todo', NOW),
      settings,
      now: NOW,
    });

    const kinds = summary.attention.map((a) => a.kind);
    expect(kinds).toContain('sin-activar');
    expect(kinds).toContain('equipos-al-limite');
    expect(kinds).toContain('garantia-activa');
    // La compra de hace 60 días ya salió de la ventana de garantía.
    expect(summary.attention.find((a) => a.kind === 'garantia-activa')?.codes).not.toContain('MRL-CCCC-4444');
  });

  it('no divide entre cero sin ventas ni demos', () => {
    const summary = buildSummary({ licenses: [], trials: [], period, settings, now: NOW });
    expect(summary.net).toBe(0);
    expect(summary.refundRatePct).toBe(0);
    expect(summary.demos.conversionPct).toBe(0);
    expect(summary.attention).toEqual([]);
    expect(summary.conversionReading).toContain('Todavía no hay demos');
  });

  it('lista las 5 licencias más recientes', () => {
    const licenses = Array.from({ length: 8 }, (_, i) =>
      license({ code: `MRL-AAAA-${2000 + i}`, createdAt: NOW - i * DAY_MS }),
    );
    const summary = buildSummary({ licenses, trials: [], period: resolvePeriod('todo', NOW), settings, now: NOW });
    expect(summary.latest).toHaveLength(5);
    expect(summary.latest[0].code).toBe('MRL-AAAA-2000');
  });
});
