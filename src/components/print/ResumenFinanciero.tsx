/**
 * Resumen financiero imprimible (README § 9): documento fluido con 4 KPIs,
 * presupuesto con subconceptos y % del total, gastos fijos con %, punto de
 * equilibrio con lectura simple y cuatro escenarios de venta.
 */

import { breakeven, fixedExpensesTotal, investment, salesScenarios } from '@/domain/finance';
import { menuAggregates } from '@/domain/aggregates';
import { money, pct } from '@/domain/format';
import type { ProjectState } from '@/domain/projectState';

export function ResumenFinanciero({ state, date }: { state: ProjectState; date: string }) {
  const invest = investment({
    concepts: state.budget,
    subconcepts: state.budgetSub,
    budgetCap: state.project.budgetCap,
  });
  const fixed = fixedExpensesTotal(state.fixed);
  const input = {
    fixedExpenses: fixed,
    grossMargin: state.margin,
    ticket: state.ticket,
    ownerGoal: state.ownerGoal,
    hours: state.hours,
    closedOneDay: state.closedOneDay,
  };
  const be = breakeven(input);
  const scenarios = salesScenarios(be, input);
  const aggregates = menuAggregates(state.dishes, { subrecipes: state.subrecipes });

  const share = (amount: number, total: number) => (total > 0 ? `${Math.round((amount / total) * 100)}%` : '—');

  return (
    <article>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '6mm' }}>
        <div>
          <h1>Resumen financiero</h1>
          <div style={{ fontSize: '11pt', color: '#6f6963' }}>
            {state.project.name} · {state.project.giro} · {date}
          </div>
        </div>
      </header>

      <div className="kpis">
        <div className="kpi">
          <span>Inversión estimada</span>
          <strong>{money(invest.total)}</strong>
        </div>
        <div className="kpi">
          <span>Presupuesto tope</span>
          <strong>{money(invest.budgetCap)}</strong>
        </div>
        <div className="kpi">
          <span>Gastos fijos al mes</span>
          <strong>{money(fixed)}</strong>
        </div>
        <div className="kpi">
          <span>Venta diaria de equilibrio</span>
          <strong>{money(be.dailySales)}</strong>
        </div>
      </div>

      <h2>Presupuesto de apertura</h2>
      <table>
        <thead>
          <tr>
            <th>Concepto</th>
            <th className="num">Monto</th>
            <th className="num">% del total</th>
          </tr>
        </thead>
        <tbody>
          {invest.byConcept
            .filter((concept) => concept.total > 0)
            .map((concept) => (
              <tr key={concept.key}>
                <td>
                  {concept.label}
                  {concept.breakdown.length ? (
                    <div style={{ fontSize: '9.5pt', color: '#6f6963', marginTop: '1mm' }}>
                      {concept.breakdown.map((sub) => `${sub.label} ${money(sub.amount)}`).join(' · ')}
                    </div>
                  ) : null}
                </td>
                <td className="num">{money(concept.total)}</td>
                <td className="num">{share(concept.total, invest.total)}</td>
              </tr>
            ))}
          <tr>
            <td>
              <strong>Total</strong>
            </td>
            <td className="num">
              <strong>{money(invest.total)}</strong>
            </td>
            <td className="num">100%</td>
          </tr>
        </tbody>
      </table>
      <p className="note">
        {invest.exceeded
          ? `Tu inversión estimada supera tu presupuesto por ${money(Math.abs(invest.difference))}. Recorta conceptos o consigue más capital antes de firmar.`
          : `Te quedan ${money(invest.difference)} de margen contra tu presupuesto. Deja al menos ${money(invest.suggestedEmergencyFund)} como fondo de emergencia.`}
      </p>

      <h2>Gastos fijos mensuales</h2>
      <table>
        <thead>
          <tr>
            <th>Concepto</th>
            <th className="num">Monto</th>
            <th className="num">% del total</th>
          </tr>
        </thead>
        <tbody>
          {state.fixed
            .filter((concept) => concept.amount > 0)
            .map((concept) => (
              <tr key={concept.key}>
                <td>{concept.label}</td>
                <td className="num">{money(concept.amount)}</td>
                <td className="num">{share(concept.amount, fixed)}</td>
              </tr>
            ))}
          <tr>
            <td>
              <strong>Total</strong>
            </td>
            <td className="num">
              <strong>{money(fixed)}</strong>
            </td>
            <td className="num">100%</td>
          </tr>
        </tbody>
      </table>

      <h2>Punto de equilibrio</h2>
      <table>
        <tbody>
          <tr>
            <td>Margen bruto usado</td>
            <td className="num">
              {state.margin}%{aggregates.suggestedMargin !== null ? ` (tu costeador sugiere ${aggregates.suggestedMargin}%)` : ''}
            </td>
          </tr>
          <tr>
            <td>Ticket promedio</td>
            <td className="num">{money(state.ticket)}</td>
          </tr>
          <tr>
            <td>Días de venta al mes</td>
            <td className="num">{be.days}</td>
          </tr>
          <tr>
            <td>Venta mensual para no perder</td>
            <td className="num">{money(be.monthlySales)}</td>
          </tr>
          <tr>
            <td>Venta diaria para no perder</td>
            <td className="num">
              {money(be.dailySales)} · {be.ticketsPerDay} tickets
            </td>
          </tr>
          <tr>
            <td>Para ganar {money(state.ownerGoal)} al mes</td>
            <td className="num">
              {money(be.goalDailySales)} al día · {be.goalTicketsPerDay} tickets
            </td>
          </tr>
        </tbody>
      </table>
      <p className="note">
        Con {money(fixed)} de gastos fijos y un margen de {state.margin}%, necesitas vender {money(be.dailySales)} cada
        día sólo para no perder dinero: {be.ticketsPerDay} tickets, o un cliente cada {be.minutesBetweenCustomers}{' '}
        minutos en un turno de {state.hours} horas si quieres alcanzar tu meta.
      </p>

      <h2>Escenarios de venta</h2>
      <table>
        <thead>
          <tr>
            <th>Escenario</th>
            <th className="num">Venta mensual</th>
            <th className="num">Venta diaria</th>
            <th className="num">Clientes por día</th>
            <th className="num">Utilidad estimada</th>
          </tr>
        </thead>
        <tbody>
          {scenarios.map((scenario) => (
            <tr key={scenario.key}>
              <td>{scenario.label}</td>
              <td className="num">{money(scenario.monthlySales)}</td>
              <td className="num">{money(scenario.dailySales)}</td>
              <td className="num">{scenario.customersPerDay}</td>
              <td className="num" style={{ color: scenario.estimatedProfit < 0 ? 'var(--red)' : undefined }}>
                {money(scenario.estimatedProfit)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {aggregates.priced > 0 ? (
        <>
          <h2>Tu carta</h2>
          <table>
            <tbody>
              <tr>
                <td>Platillos con precio</td>
                <td className="num">
                  {aggregates.priced} de {aggregates.total}
                </td>
              </tr>
              <tr>
                <td>Food cost promedio · ponderado</td>
                <td className="num">
                  {pct(aggregates.averageFoodCost)} · {pct(aggregates.weightedFoodCost)}
                </td>
              </tr>
              <tr>
                <td>Ticket promedio de carta</td>
                <td className="num">{aggregates.averageTicket === null ? '—' : money(aggregates.averageTicket)}</td>
              </tr>
            </tbody>
          </table>
        </>
      ) : null}

      <footer>
        <span>MiRestauranteListo · resumen financiero</span>
        <span>{date}</span>
      </footer>
    </article>
  );
}
