import { describe, expect, it } from 'vitest';
import { money, money2, moneyOrDash, parseNumber, pct, unitPriceLabel } from '../format';

describe('formato de moneda y números', () => {
  it('redondea al peso con separador de miles', () => {
    expect(money(2450)).toBe('$2,450');
    expect(money(117352.94)).toBe('$117,353');
    expect(money(0)).toBe('$0');
  });

  it('usa dos decimales donde el centavo importa', () => {
    expect(money2(142.2953)).toBe('$142.30');
    expect(money2(9.1155)).toBe('$9.12');
    expect(money2(0)).toBe('$0.00');
  });

  it('muestra "—" cuando no hay dato', () => {
    expect(pct(null)).toBe('—');
    expect(moneyOrDash(null)).toBe('—');
    expect(pct(37.76)).toBe('38%');
    expect(moneyOrDash(15.02)).toBe('$15');
  });

  it('no se rompe con valores no finitos', () => {
    expect(money(Number.NaN)).toBe('$0');
    expect(money2(Number.POSITIVE_INFINITY)).toBe('$0.00');
    expect(pct(Number.NaN)).toBe('—');
  });

  it('lee números de lo que el usuario teclea', () => {
    expect(parseNumber('1,200')).toBe(1200);
    expect(parseNumber('$18,000')).toBe(18000);
    expect(parseNumber('0.09')).toBe(0.09);
    expect(parseNumber('')).toBe(0);
    expect(parseNumber('abc')).toBe(0);
    expect(parseNumber(42)).toBe(42);
  });

  it('etiqueta el precio unitario sin abreviaturas raras', () => {
    expect(unitPriceLabel(0.09, 'g')).toBe('$0.09 por g');
  });
});
