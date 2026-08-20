import { describe, expect, it } from 'vitest';
import { adsBands, adsBudgetPlan, adsMetrics, adsVerdict, type AdsInput } from '../ads';

/** Una semana de anuncio que sí funciona. */
const bueno: AdsInput = {
  spend: 700,
  days: 5,
  reach: 12000,
  results: 240,
  visits: 90,
  ticket: 150,
  marginPct: 68,
};

describe('analizador de anuncios', () => {
  it('saca los cinco números que decide el anuncio', () => {
    const m = adsMetrics(bueno);
    expect(m.perDay).toBe(140);
    expect(m.costPerResult).toBeCloseTo(2.9167, 3);
    expect(m.costPerVisit).toBeCloseTo(7.7778, 3);
    expect(m.showRate).toBeCloseTo(2, 3);
    expect(m.closeRate).toBeCloseTo(37.5, 3);
    expect(m.income).toBe(13500);
    expect(m.roas).toBeCloseTo(19.2857, 3);
  });

  it('mide la utilidad contra lo invertido', () => {
    const m = adsMetrics(bueno);
    // 13,500 × 68% − 700
    expect(m.profit).toBeCloseTo(8480, 6);
    expect(m.profitPerCustomer).toBeCloseTo(102, 6);
    expect(m.maxCostPerVisit).toBeCloseTo(102, 6);
  });

  it('nunca divide entre cero días', () => {
    expect(adsMetrics({ ...bueno, days: 0 }).perDay).toBe(700);
  });

  it('deja los números en cero cuando no hay datos', () => {
    const m = adsMetrics({ ...bueno, spend: 0, results: 0, reach: 0, visits: 0 });
    expect(m.hasData).toBe(false);
    expect(m.costPerResult).toBe(0);
    expect(m.costPerVisit).toBe(0);
    expect(m.showRate).toBe(0);
    expect(m.roas).toBe(0);
  });
});

describe('bandas del diagnóstico', () => {
  it('clasifica un anuncio sano', () => {
    expect(adsBands(adsMetrics(bueno))).toEqual({
      costPerResult: 'bien',
      showRate: 'bien',
      closeRate: 'bien',
      costPerVisit: 'bien',
    });
  });

  it('marca el costo por mensaje en sus tres tramos', () => {
    const con = (results: number) => adsBands(adsMetrics({ ...bueno, spend: 1000, results }));
    expect(con(40).costPerResult).toBe('bien'); // $25
    expect(con(30).costPerResult).toBe('medio'); // $33.3
    expect(con(20).costPerResult).toBe('mal'); // $50
  });

  it('marca la respuesta y el cierre en sus tramos', () => {
    const respuesta = (results: number) => adsBands(adsMetrics({ ...bueno, results })).showRate;
    expect(respuesta(180)).toBe('bien'); // 1.5%
    expect(respuesta(100)).toBe('medio'); // 0.83%
    expect(respuesta(50)).toBe('mal'); // 0.42%

    const cierre = (visits: number) => adsBands(adsMetrics({ ...bueno, visits })).closeRate;
    expect(cierre(72)).toBe('bien'); // 30%
    expect(cierre(40)).toBe('medio'); // 16.7%
    expect(cierre(20)).toBe('mal'); // 8.3%
  });
});

describe('veredicto', () => {
  it('pide capturar cuando no hay datos', () => {
    const input = { ...bueno, spend: 0, results: 0 };
    expect(adsVerdict(input, adsMetrics(input))).toBe('sin-datos');
  });

  it('pide el dato que decide cuando faltan las visitas', () => {
    const input = { ...bueno, visits: 0 };
    expect(adsVerdict(input, adsMetrics(input))).toBe('falta-visitas');
  });

  it('dice que sirve cuando la utilidad supera la inversión', () => {
    expect(adsVerdict(bueno, adsMetrics(bueno))).toBe('sirve');
  });

  it('dice que todavía no sirve cuando no la supera', () => {
    const input = { ...bueno, spend: 12000 };
    expect(adsVerdict(input, adsMetrics(input))).toBe('no-sirve');
  });
});

describe('plan de inversión del primer mes', () => {
  it('sale del 6% de tus gastos fijos diarios', () => {
    // 80,000 / 30 × 6% = 160
    const plan = adsBudgetPlan(80000);
    expect(plan.base).toBe(160);
    expect(plan.week2).toBe(320);
    expect(plan.week34).toBeCloseTo(384, 6);
    expect(plan.month).toBeCloseTo(160 * 5 + 320 * 7 + 384 * 14, 6);
  });

  it('nunca baja de $80 al día', () => {
    expect(adsBudgetPlan(0).base).toBe(80);
    expect(adsBudgetPlan(5000).base).toBe(80);
  });
});
