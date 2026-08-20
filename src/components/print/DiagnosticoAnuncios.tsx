/**
 * Diagnóstico de anuncios imprimible.
 *
 * Es el Analizador de anuncios en papel: los cinco números que el dueño copió
 * del Administrador de Meta, las cuatro lecturas con su veredicto y el plan de
 * inversión del primer mes. Está pensado para revisarse cada lunes, así que
 * lleva la fecha del análisis bien visible.
 *
 * No hay archivo de diseño para este documento; sigue la hoja de estilo de los
 * otros entregables y usa las mismas lecturas que la herramienta de la app.
 */

import { adsBudgetPlan, adsHeadline, adsMetrics, adsReadings, adsVerdict, type AdsInput } from '@/domain/ads';
import { fixedExpensesTotal } from '@/domain/finance';
import { money, pct } from '@/domain/format';
import type { ProjectState } from '@/domain/projectState';

const BAND_LABEL = { bien: 'Bien', medio: 'Ajustable', mal: 'Hay que cambiarlo' } as const;

export function DiagnosticoAnuncios({ state, date }: { state: ProjectState; date: string }) {
  const input: AdsInput = {
    spend: state.ads.spend,
    days: state.ads.days || 5,
    reach: state.ads.reach,
    results: state.ads.results,
    visits: state.ads.visits,
    ticket: state.ticket,
    marginPct: state.margin,
  };
  const m = adsMetrics(input);
  const verdict = adsVerdict(input, m);
  const headline = adsHeadline(input, m, verdict, money);
  const readings = adsReadings(input, m, money);
  const plan = adsBudgetPlan(fixedExpensesTotal(state.fixed));

  return (
    <article>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '6mm' }}>
        <div>
          <h1>Diagnóstico de anuncios</h1>
          <div style={{ fontSize: '11pt', color: '#6f6963' }}>
            {state.project.name} · anuncio de {input.days} {input.days === 1 ? 'día' : 'días'} · {date}
          </div>
        </div>
      </header>

      <h2>El veredicto</h2>
      <p className="note">
        <strong>{headline.head}. </strong>
        {headline.sub}
      </p>

      <h2>Lo que capturaste</h2>
      <table>
        <tbody>
          <tr>
            <td>Lo que llevas invertido</td>
            <td className="num">{money(state.ads.spend)}</td>
          </tr>
          <tr>
            <td>Días que lleva corriendo</td>
            <td className="num">{input.days}</td>
          </tr>
          <tr>
            <td>Cuántas personas lo vieron</td>
            <td className="num">{state.ads.reach.toLocaleString('es-MX')}</td>
          </tr>
          <tr>
            <td>Mensajes o clics que trajo</td>
            <td className="num">{state.ads.results.toLocaleString('es-MX')}</td>
          </tr>
          <tr>
            <td>De esos, cuántos llegaron</td>
            <td className="num">{state.ads.visits.toLocaleString('es-MX')}</td>
          </tr>
          <tr>
            <td>Inversión diaria</td>
            <td className="num">{money(m.perDay)}</td>
          </tr>
        </tbody>
      </table>

      {readings.length ? (
        <>
          <h2>Las cuatro lecturas</h2>
          <table>
            <thead>
              <tr>
                <th>Indicador</th>
                <th className="num">Valor</th>
                <th>Cómo está</th>
              </tr>
            </thead>
            <tbody>
              {readings.map((row) => (
                <tr key={row.label}>
                  <td>
                    <strong>{row.label}</strong>
                    <div style={{ fontSize: '9.5pt', color: '#6f6963', marginTop: '1mm' }}>{row.read}</div>
                    {row.fix ? (
                      <div style={{ fontSize: '9.5pt', marginTop: '1mm' }}>
                        <strong>Qué hacer: </strong>
                        {row.fix}
                      </div>
                    ) : null}
                  </td>
                  <td className="num">{row.value}</td>
                  <td>{BAND_LABEL[row.band]}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2>La cuenta del anuncio</h2>
          <table>
            <tbody>
              <tr>
                <td>Venta que trajo</td>
                <td className="num">{money(m.income)}</td>
              </tr>
              <tr>
                <td>Utilidad de esa venta (margen {pct(state.margin)})</td>
                <td className="num">{money(m.income * (state.margin / 100))}</td>
              </tr>
              <tr>
                <td>Menos lo que invertiste</td>
                <td className="num">−{money(state.ads.spend)}</td>
              </tr>
              <tr>
                <td>
                  <strong>Te queda</strong>
                </td>
                <td className="num">
                  <strong>{money(m.profit)}</strong>
                </td>
              </tr>
              <tr>
                <td>Utilidad que deja un cliente</td>
                <td className="num">{money(m.profitPerCustomer)}</td>
              </tr>
              <tr>
                <td>Hasta aquí conviene pagar por traer a alguien</td>
                <td className="num">{money(m.maxCostPerVisit)}</td>
              </tr>
            </tbody>
          </table>
        </>
      ) : (
        <p className="note">
          Todavía no hay números que analizar. Abre el Administrador de anuncios de Meta, copia los cinco datos en la
          app y vuelve a generar esta hoja.
        </p>
      )}

      <h2>Tu presupuesto del primer mes</h2>
      <table>
        <tbody>
          <tr>
            <td>Días 1 a 5, para aprender</td>
            <td className="num">{money(plan.base)} al día</td>
          </tr>
          <tr>
            <td>Días 6 a 12, si el costo por mensaje aguanta</td>
            <td className="num">{money(plan.week2)} al día</td>
          </tr>
          <tr>
            <td>Días 13 a 30, con el anuncio que mejor funcionó</td>
            <td className="num">{money(plan.week34)} al día</td>
          </tr>
          <tr>
            <td>
              <strong>Total del mes</strong>
            </td>
            <td className="num">
              <strong>{money(plan.month)}</strong>
            </td>
          </tr>
        </tbody>
      </table>
      <p className="note">
        La base sale del 6% de tus gastos fijos diarios. Sube el presupuesto sólo cuando el costo por cliente que
        llegó siga por debajo de {money(m.maxCostPerVisit)}: ese es el techo que hace que el anuncio se pague solo.
      </p>

      <footer>
        <span>MiRestauranteListo · diagnóstico de anuncios</span>
        <span>{date}</span>
      </footer>
    </article>
  );
}
