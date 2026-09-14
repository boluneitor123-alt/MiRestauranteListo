import { describe, expect, it } from 'vitest';
import { titularDeEquilibrio } from '../titular';
import { breakeven } from '../finance';

const base = { grossMargin: 68, ticket: 130, ownerGoal: 25000, hours: 8, closedOneDay: false };

describe('la frase grande de Inicio', () => {
  it('dice cuántos clientes al día, con la venta mensual detrás', () => {
    const t = titularDeEquilibrio({ ...base, fixedExpenses: 67_500 });
    expect(t.listo).toBe(true);
    if (!t.listo) return;
    expect(t.antes).toBe('Necesitas');
    expect(t.unidad).toBe('clientes al día');
    expect(t.despues).toBe('para no perder dinero.');
    expect(t.numero).toBe(26);
    expect(Math.round(t.ventaMensual)).toBe(99_265);
  });

  it('el número es el del punto de equilibrio, no otro', () => {
    const entrada = { ...base, fixedExpenses: 42_600 };
    const t = titularDeEquilibrio(entrada);
    expect(t.listo && t.numero).toBe(breakeven(entrada).ticketsPerDay);
  });

  it('concuerda en singular', () => {
    const t = titularDeEquilibrio({ ...base, fixedExpenses: 1, ticket: 100_000 });
    expect(t.listo && t.unidad).toBe('cliente al día');
  });

  it('sin gastos fijos no inventa un número ni dice «0 clientes»', () => {
    // Decir «0 clientes al día para no perder dinero» sería falso y además
    // sonaría a que no necesita vender nada.
    const t = titularDeEquilibrio({ ...base, fixedExpenses: 0 });
    expect(t.listo).toBe(false);
    if (t.listo) return;
    expect(t.falta).toBe('gastos-fijos');
    expect(t.mensaje).not.toMatch(/\b0\b/);
    expect(t.mensaje).toMatch(/gastos fijos/i);
  });

  it('un gasto negativo se trata como sin capturar', () => {
    expect(titularDeEquilibrio({ ...base, fixedExpenses: -5 }).listo).toBe(false);
  });

  it('sube cuando suben los gastos: es lo que la persona debe ver moverse', () => {
    const antes = titularDeEquilibrio({ ...base, fixedExpenses: 40_000 });
    const despues = titularDeEquilibrio({ ...base, fixedExpenses: 80_000 });
    expect(antes.listo && despues.listo).toBe(true);
    if (!antes.listo || !despues.listo) return;
    expect(despues.numero).toBeGreaterThan(antes.numero);
  });

  it('baja cuando sube el ticket', () => {
    const barato = titularDeEquilibrio({ ...base, fixedExpenses: 67_500, ticket: 90 });
    const caro = titularDeEquilibrio({ ...base, fixedExpenses: 67_500, ticket: 260 });
    expect(barato.listo && caro.listo && caro.numero < barato.numero).toBe(true);
  });
});
