/**
 * Plan de apertura imprimible (`PlanDeApertura.dc.html`).
 *
 * Es el documento que el dueño lleva al banco, al arrendador o a un socio:
 * concepto, inversión, gastos fijos, punto de equilibrio, menú costeado, el
 * calendario de los próximos 30 días y las firmas. Todas las cifras salen de
 * lo que capturó en la app.
 */

import { breakeven, fixedExpensesTotal, investment } from '@/domain/finance';
import { menuAggregates } from '@/domain/aggregates';
import { dishMetrics } from '@/domain/costing';
import { money, pct } from '@/domain/format';
import { openingCalendar } from '@/domain/openingPlan';
import { projectProgress } from '@/domain/progress';
import { ROUTE_MODULES } from '@/content/route';
import type { ProjectState } from '@/domain/projectState';

/** Texto que se imprime cuando el dueño todavía no capturó ese dato. */
const PENDIENTE = {
  propuesta: 'Describe en una frase qué vendes, a quién y en cuánto tiempo lo entregas.',
  cliente: 'Describe a una persona concreta: edad, ocupación, cuánto puede pagar y a qué hora tiene hambre.',
};

export function PlanDeApertura({ state, date, today }: { state: ProjectState; date: string; today: Date }) {
  const invest = investment({
    concepts: state.budget,
    subconcepts: state.budgetSub,
    budgetCap: state.project.budgetCap,
  });
  const fixed = fixedExpensesTotal(state.fixed);
  const be = breakeven({
    fixedExpenses: fixed,
    grossMargin: state.margin,
    ticket: state.ticket,
    ownerGoal: state.ownerGoal,
    hours: state.hours,
    closedOneDay: state.closedOneDay,
  });
  const aggregates = menuAggregates(state.dishes, { subrecipes: state.subrecipes });

  // Meses de retorno: cuánto tarda la inversión en volver con la meta del dueño.
  const retorno = state.ownerGoal > 0 ? Math.ceil(invest.total / state.ownerGoal) : null;

  const dishes = state.dishes
    .map((dish) => ({ dish, m: dishMetrics(dish, { subrecipes: state.subrecipes }) }))
    .filter((row) => row.m.hasPrice);

  const progress = projectProgress({
    modules: ROUTE_MODULES,
    done: state.done,
    skipped: state.skipped,
    extraTasks: state.extraTasks,
  });
  const calendar = openingCalendar(progress, today, state.done);

  const contacto = [state.profile.email, state.profile.phone].filter(Boolean).join(' · ');
  const apertura = state.project.openDate || 'por confirmar';

  return (
    <article>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '6mm' }}>
        <div>
          <h1>Plan de apertura</h1>
          <div style={{ fontSize: '11pt', color: '#6f6963' }}>
            {state.project.name} · {state.project.giro} · apertura estimada {apertura}
          </div>
        </div>
        <div style={{ textAlign: 'right', fontSize: '10.5pt', color: '#6f6963' }}>
          <div style={{ fontWeight: 800, color: '#14110f' }}>{state.profile.name || 'Nombre del responsable'}</div>
          <div>{contacto || 'correo · teléfono'}</div>
          <div>{date}</div>
        </div>
      </header>

      <p className="note" style={{ marginTop: '6mm' }}>
        Este documento reúne la inversión, los gastos fijos, el punto de equilibrio y el menú costeado del proyecto,
        con el calendario de los siguientes 30 días. Está pensado para presentarse a un socio, a un arrendador o a
        una institución financiera: cada cifra viene de cotizaciones y recetas capturadas una por una, no de
        estimaciones generales.
      </p>

      <div className="kpis">
        <div className="kpi">
          <span>Inversión total</span>
          <strong>{money(invest.total)}</strong>
        </div>
        <div className="kpi">
          <span>Venta mensual meta</span>
          <strong>{money(be.goalMonthlySales)}</strong>
        </div>
        <div className="kpi">
          <span>Clientes al día</span>
          <strong>{be.goalTicketsPerDay}</strong>
        </div>
        <div className="kpi">
          <span>Retorno</span>
          <strong>{retorno === null ? '—' : `Mes ${retorno}`}</strong>
        </div>
      </div>

      <h2>1 · El negocio y su cliente</h2>
      <table>
        <tbody>
          <tr>
            <td>Propuesta</td>
            <td>{PENDIENTE.propuesta}</td>
          </tr>
          <tr>
            <td>Cliente ideal</td>
            <td>{PENDIENTE.cliente}</td>
          </tr>
          <tr>
            <td>Formato de operación</td>
            <td>
              {state.project.giro} · {state.hours} h de operación · {be.days} días de venta al mes
            </td>
          </tr>
          <tr>
            <td>Local</td>
            <td>{state.answers.localq || 'Por confirmar'}</td>
          </tr>
          <tr>
            <td>Equipo inicial</td>
            <td>{state.project.people || 'Por definir'}</td>
          </tr>
        </tbody>
      </table>

      <h2>2 · Inversión de apertura</h2>
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
                <td>{concept.label}</td>
                <td className="num">{money(concept.total)}</td>
                <td className="num">
                  {invest.total > 0 ? `${Math.round((concept.total / invest.total) * 100)}%` : '—'}
                </td>
              </tr>
            ))}
          <tr>
            <td>
              <strong>Inversión total estimada</strong>
            </td>
            <td className="num">
              <strong>{money(invest.total)}</strong>
            </td>
            <td className="num">100%</td>
          </tr>
        </tbody>
      </table>
      <p className="note">
        Los primeros meses la venta sube por escalones, así que el capital de trabajo de esta lista no es un extra:
        es lo que permite operar mientras la venta toma vuelo.
      </p>

      <h2>3 · Gastos fijos mensuales</h2>
      <table>
        <thead>
          <tr>
            <th>Concepto</th>
            <th className="num">Monto</th>
          </tr>
        </thead>
        <tbody>
          {state.fixed
            .filter((concept) => concept.amount > 0)
            .map((concept) => (
              <tr key={concept.key}>
                <td>{concept.label}</td>
                <td className="num">{money(concept.amount)}</td>
              </tr>
            ))}
          <tr>
            <td>
              <strong>Total de gastos fijos al mes</strong>
            </td>
            <td className="num">
              <strong>{money(fixed)}</strong>
            </td>
          </tr>
        </tbody>
      </table>

      <h2>4 · Punto de equilibrio</h2>
      <div className="kpis">
        <div className="kpi">
          <span>Venta mensual para no perder</span>
          <strong>{money(be.monthlySales)}</strong>
        </div>
        <div className="kpi">
          <span>Venta diaria</span>
          <strong>{money(be.dailySales)}</strong>
        </div>
        <div className="kpi">
          <span>Tickets al día</span>
          <strong>{be.ticketsPerDay}</strong>
        </div>
      </div>
      <p className="note">
        Calculado con un margen de contribución de {pct(state.margin)}, ticket promedio de {money(state.ticket)} y{' '}
        {be.days} días de venta al mes. Equivale a un cliente cada {be.minutesBetweenCustomers} minutos durante las
        horas de operación.
      </p>
      <table>
        <tbody>
          <tr>
            <td>Para no perder nada</td>
            <td className="num">{money(be.monthlySales)} al mes</td>
          </tr>
          <tr>
            <td>Para que al dueño le queden {money(state.ownerGoal)}</td>
            <td className="num">{money(be.goalMonthlySales)} al mes</td>
          </tr>
          <tr>
            <td>Tickets diarios en ese escenario</td>
            <td className="num">{be.goalTicketsPerDay} tickets</td>
          </tr>
        </tbody>
      </table>

      <h2>5 · Menú costeado</h2>
      {dishes.length ? (
        <>
          <table>
            <thead>
              <tr>
                <th>Platillo</th>
                <th className="num">Precio</th>
                <th className="num">Costo</th>
                <th className="num">F. cost</th>
                <th className="num">Utilidad</th>
              </tr>
            </thead>
            <tbody>
              {dishes.map(({ dish, m }) => (
                <tr key={dish.id}>
                  <td>{dish.name}</td>
                  <td className="num">{money(m.price)}</td>
                  <td className="num">{money(m.costPerPortion)}</td>
                  <td className="num">{pct(m.foodCostRounded)}</td>
                  <td className="num">
                    <strong>{money(m.grossProfit ?? 0)}</strong>
                  </td>
                </tr>
              ))}
              <tr>
                <td>
                  <strong>Food cost de la carta, ponderado por venta</strong>
                </td>
                <td className="num" colSpan={4}>
                  <strong>{pct(aggregates.weightedFoodCost)}</strong>
                </td>
              </tr>
            </tbody>
          </table>
          <p className="note">
            El food cost se calcula sobre el precio sin IVA e incluye merma, empaque y sub-recetas. El rango sano en
            comida en México va de 28 a 32%; los platillos por arriba de esa marca conviene revisarlos en precio o en
            porción.
          </p>
        </>
      ) : (
        <p className="note">
          Todavía no hay platillos con precio en el Costeador. Cuesta al menos tus tres platillos estrella antes de
          presentar este plan: es la sección que más se revisa.
        </p>
      )}

      <h2>6 · Calendario de los próximos 30 días</h2>
      {calendar.length ? (
        <table>
          <thead>
            <tr>
              <th>Semana</th>
              <th>Foco</th>
              <th>Tareas</th>
              <th className="num">Cuántas</th>
            </tr>
          </thead>
          <tbody>
            {calendar.map((week) => (
              <tr key={week.week}>
                <td>
                  <strong>{week.week}</strong>
                  <div style={{ fontSize: '9.5pt', color: '#6f6963' }}>{week.range}</div>
                </td>
                <td>{week.focus}</td>
                <td>{week.tasks}</td>
                <td className="num">{week.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="note">
          No te quedan tareas pendientes en Mi Ruta: ya cubriste la ruta de apertura completa.
        </p>
      )}

      <h2>7 · Acuerdos y firmas</h2>
      <div className="sign">
        {state.profile.name || 'Responsable del proyecto'}: ____________________ · Nombre y firma:
        ____________________
      </div>

      <p className="note" style={{ marginTop: '6mm' }}>
        Documento generado con MiRestauranteListo a partir de los datos capturados en la app. Las cifras son
        estimaciones basadas en cotizaciones y supuestos del propio proyecto; conviene revisarlas cada mes conforme se
        confirmen precios de compra y renta.
      </p>

      <footer>
        <span>MiRestauranteListo · plan de apertura</span>
        <span>{date}</span>
      </footer>
    </article>
  );
}
