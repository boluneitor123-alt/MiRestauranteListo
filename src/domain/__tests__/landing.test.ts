import { describe, expect, it } from 'vitest';
import { calculate } from '../landing';

describe('calculadora de la landing (README § 12.5)', () => {
  it('usa margen fijo de 68%', () => {
    const result = calculate({ rent: 20000, payroll: 30000, other: 10000, ticket: 120 });
    expect(result.fixedExpenses).toBe(60000);
    expect(result.monthlySales).toBeCloseTo(60000 / 0.68, 4);
    expect(result.dailySales).toBeCloseTo(60000 / 0.68 / 30, 4);
    expect(result.ticketsPerDay).toBe(Math.ceil(60000 / 0.68 / 30 / 120));
  });

  it('incluye la meta del dueño como segundo resultado', () => {
    const result = calculate({ rent: 20000, payroll: 30000, other: 10000, ticket: 120, goal: 25000 });
    expect(result.goalMonthlySales).toBeCloseTo(85000 / 0.68, 4);
    expect(result.goalDailySales).toBeGreaterThan(result.dailySales);
    expect(result.minutesBetweenCustomers).toBeGreaterThan(0);
  });

  it('recalcula sobre 26 días con el toggle de día de descanso', () => {
    const abierto = calculate({ rent: 20000, payroll: 0, other: 0, ticket: 120 });
    const cerrado = calculate({ rent: 20000, payroll: 0, other: 0, ticket: 120, closedOneDay: true });
    expect(cerrado.days).toBe(26);
    expect(cerrado.dailySales).toBeGreaterThan(abierto.dailySales);
  });

  it('da una nota neutral con cifras absurdas, no un error', () => {
    const result = calculate({ rent: 90_000_000, payroll: 0, other: 0, ticket: 120 });
    expect(result.note).toContain('se queda corta');
    expect(Number.isFinite(result.dailySales)).toBe(true);
  });

  it('invita a capturar cuando todavía no hay datos', () => {
    const result = calculate({ rent: 0, payroll: 0, other: 0, ticket: 120 });
    expect(result.note).toContain('Captura tu renta');
    expect(result.dailySales).toBe(0);
  });

  it('traduce la renta a lo que hay que vender para pagarla', () => {
    const result = calculate({ rent: 18000, payroll: 0, other: 0, ticket: 120 });
    expect(result.rentCost).toBeCloseTo(18000 / 0.68, 4);
  });

  it('calcula el precio como porcentaje de la inversión típica', () => {
    expect(calculate({ rent: 0, payroll: 0, other: 0, ticket: 120 }).pricePctOfInvestment).toBe('0.9%');
  });
});
