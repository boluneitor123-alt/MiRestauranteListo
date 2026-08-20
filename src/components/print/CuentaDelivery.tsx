/**
 * Cuenta real de delivery imprimible.
 *
 * Es la calculadora de delivery en papel: qué se lleva la app, qué te queda a
 * ti, qué te dejaría el mismo platillo en mostrador y qué precio deberías
 * poner. Sirve para sentarse a negociar con Rappi o UberEats con números.
 *
 * No hay archivo de diseño para este documento; sigue la hoja de estilo de los
 * otros entregables y usa el mismo cálculo que la herramienta de la app.
 */

import { calculateDelivery, deliveryActions, DELIVERY_VERDICTS } from '@/domain/delivery';
import { money, money2, pct } from '@/domain/format';
import type { ProjectState } from '@/domain/projectState';

export function CuentaDelivery({ state, date }: { state: ProjectState; date: string }) {
  const input = state.delivery;
  const result = calculateDelivery(input);
  const verdict = DELIVERY_VERDICTS[result.level];
  const actions = deliveryActions(input, result, money, money2);

  return (
    <article>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '6mm' }}>
        <div>
          <h1>Cuenta real de delivery</h1>
          <div style={{ fontSize: '11pt', color: '#6f6963' }}>
            {state.project.name} · comisión {pct(input.commissionPct)} · {input.ordersPerDay} pedidos al día · {date}
          </div>
        </div>
      </header>

      <h2>El veredicto</h2>
      <p className="note">
        <strong>
          {verdict.kicker}: {verdict.title}.{' '}
        </strong>
        De los {money(input.appPrice)} que paga el cliente en la app te quedan {money2(result.keptOnApp)} por pedido,
        que son el {pct(result.appMarginPct)} del precio. El mismo platillo en tu mostrador te deja{' '}
        {money2(result.keptOnCounter)}.
      </p>

      <div className="kpis">
        <div className="kpi">
          <span>Te queda por pedido</span>
          <strong>{money2(result.keptOnApp)}</strong>
        </div>
        <div className="kpi">
          <span>En mostrador</span>
          <strong>{money2(result.keptOnCounter)}</strong>
        </div>
        <div className="kpi">
          <span>Precio que deberías poner</span>
          <strong>{money(result.suggestedRounded)}</strong>
        </div>
        <div className="kpi">
          <span>Diferencia al mes</span>
          <strong>{money(result.monthlyGap)}</strong>
        </div>
      </div>

      <h2>La cuenta pedido por pedido</h2>
      <table>
        <tbody>
          <tr>
            <td>Lo que paga el cliente en la app</td>
            <td className="num">{money(input.appPrice)}</td>
          </tr>
          <tr>
            <td>Menos la comisión de la app ({pct(input.commissionPct)})</td>
            <td className="num">−{money2(result.commissionAmount)}</td>
          </tr>
          <tr>
            <td>Menos el costo del platillo</td>
            <td className="num">−{money2(input.cost)}</td>
          </tr>
          <tr>
            <td>Menos el empaque</td>
            <td className="num">−{money2(input.packaging)}</td>
          </tr>
          <tr>
            <td>
              <strong>Te queda</strong>
            </td>
            <td className="num">
              <strong>{money2(result.keptOnApp)}</strong>
            </td>
          </tr>
        </tbody>
      </table>

      <h2>Contra tu mostrador</h2>
      <table>
        <tbody>
          <tr>
            <td>Precio en tu local</td>
            <td className="num">{money(input.counterPrice)}</td>
          </tr>
          <tr>
            <td>Menos el costo del platillo</td>
            <td className="num">−{money2(input.cost)}</td>
          </tr>
          <tr>
            <td>Te queda en mostrador</td>
            <td className="num">{money2(result.keptOnCounter)}</td>
          </tr>
          <tr>
            <td>
              <strong>Diferencia por pedido</strong>
            </td>
            <td className="num">
              <strong>{money2(result.perOrderGap)}</strong>
            </td>
          </tr>
          <tr>
            <td>La misma diferencia al mes, con {input.ordersPerDay} pedidos al día</td>
            <td className="num">{money(result.monthlyGap)}</td>
          </tr>
        </tbody>
      </table>

      <h2>El precio que deberías poner en la app</h2>
      <p className="note">
        Para que el pedido de app te deje lo mismo que tu mostrador, el precio en la aplicación tendría que ser{' '}
        {money(result.suggestedRounded)}. Sale de sumar costo, empaque y la utilidad de mostrador, y dividir entre lo
        que queda después de la comisión.
      </p>

      {actions.length ? (
        <>
          <h2>Qué hacer con esto</h2>
          <ol style={{ margin: 0, paddingLeft: '6mm', fontSize: '11pt', lineHeight: 1.5 }}>
            {actions.map((action) => (
              <li key={action} style={{ marginBottom: '1.5mm' }}>
                {action}
              </li>
            ))}
          </ol>
        </>
      ) : null}

      <p className="note" style={{ marginTop: '6mm' }}>
        Lleva esta hoja a la junta con la app. La comisión se negocia, y el argumento no es que te cobran mucho: es
        que con {pct(input.commissionPct)} el platillo te deja {money2(result.keptOnApp)} y no aguanta el volumen que
        te piden.
      </p>

      <footer>
        <span>MiRestauranteListo · cuenta real de delivery</span>
        <span>{date}</span>
      </footer>
    </article>
  );
}
