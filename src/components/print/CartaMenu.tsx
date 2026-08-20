/**
 * Carta de menú imprimible (`CartaMenu.dc.html`).
 *
 * No es la carta final: es la hoja que se lleva al impresor o al diseñador con
 * el acomodo ya resuelto — qué platillo va en cada cara y en qué orden, sacado
 * de la utilidad y la popularidad capturadas en el Costeador.
 */

import {
  LAYOUT_PRINT_GUIDES,
  MENU_PRINT_RULES,
  menuPrintTag,
  planMenuLayout,
  PANEL_CAPACITY,
} from '@/domain/menu';
import { menuAggregates } from '@/domain/aggregates';
import { money, pct } from '@/domain/format';
import type { ProjectState } from '@/domain/projectState';

export function CartaMenu({ state, date }: { state: ProjectState; date: string }) {
  const plan = planMenuLayout(state.dishes, state.layout, { subrecipes: state.subrecipes });
  const guide = LAYOUT_PRINT_GUIDES[plan.format.id] ?? LAYOUT_PRINT_GUIDES.p2;
  // El food cost del encabezado es el de la carta que se va a imprimir, así que
  // sólo cuenta los platillos que entraron: los que dejamos fuera no se venden.
  const placedIds = new Set(plan.panels.flatMap((p) => p.sections.flatMap((s) => s.items.map((i) => i.id))));
  const aggregates = menuAggregates(
    state.dishes.filter((d) => placedIds.has(d.id)),
    { subrecipes: state.subrecipes },
  );

  return (
    <article>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '6mm' }}>
        <div>
          <h1>Carta de menú</h1>
          <div style={{ fontSize: '11pt', color: '#6f6963' }}>
            {state.project.name} · {plan.format.name} · {plan.placed}{' '}
            {plan.placed === 1 ? 'platillo' : 'platillos'} en {plan.format.panels}{' '}
            {plan.format.panels === 1 ? 'cara' : 'caras'}
          </div>
        </div>
        <div style={{ textAlign: 'right', fontSize: '10.5pt', color: '#6f6963' }}>
          <div style={{ fontWeight: 800, color: '#14110f' }}>
            Food cost {pct(aggregates.weightedFoodCost)}
          </div>
          <div>{date}</div>
        </div>
      </header>

      <p className="note" style={{ marginTop: '6mm' }}>
        Este documento te dice exactamente qué platillo va en cada cara de tu carta y en qué orden, calculado con la
        utilidad y la popularidad de cada uno. Llévalo al impresor o al diseñador tal cual: el acomodo ya está
        resuelto.
      </p>

      <h2>1 · Cómo se arma la hoja</h2>
      <p style={{ fontSize: '10.5pt', color: '#6f6963', margin: '0 0 3mm' }}>
        {guide.caption} · la línea punteada es el doblez.
      </p>
      <ol style={{ margin: 0, paddingLeft: '6mm', fontSize: '11pt', lineHeight: 1.5 }}>
        {guide.steps.map((step) => (
          <li key={step} style={{ marginBottom: '1.5mm' }}>
            {step}
          </li>
        ))}
      </ol>

      <h2>2 · Qué va en cada cara</h2>
      <p className="note">
        El orden dentro de cada cara no es alfabético ni por precio: va de mayor a menor utilidad, porque el cliente
        lee de arriba hacia abajo y pide entre los primeros tres.
      </p>

      {plan.panels.map((panel, i) => (
        <section key={panel.label} style={{ marginTop: '6mm', breakInside: 'avoid' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '3mm',
              paddingBottom: '2mm',
              borderBottom: `2px solid ${panel.golden ? '#c67139' : 'rgb(20 17 15 / 0.35)'}`,
            }}
          >
            <strong style={{ fontSize: '12pt' }}>
              {i + 1} · {panel.label}
            </strong>
            <span style={{ marginLeft: 'auto', fontSize: '10pt', color: '#6f6963' }}>
              {panel.used} {panel.used === 1 ? 'platillo' : 'platillos'}
            </span>
          </div>

          {panel.golden && panel.used > 0 ? (
            <p className="note" style={{ marginTop: '3mm' }}>
              <strong>Zona de oro. </strong>
              Aquí cae la vista primero. Los dos platillos de arriba son los que más se van a pedir, así que son los
              de mayor utilidad, no los más baratos.
            </p>
          ) : null}

          {panel.used === 0 ? (
            <p style={{ fontSize: '11pt', color: '#6f6963', fontStyle: 'italic', marginTop: '3mm' }}>
              Esta cara queda libre. Úsala para tu historia, tus datos de contacto o una foto grande de tu platillo
              estrella.
            </p>
          ) : null}

          {panel.sections.map((section) => (
            <div key={`${panel.label}-${section.section}`} style={{ marginTop: '4mm' }}>
              <div style={{ fontSize: '11pt', fontWeight: 800, color: '#9e4e18' }}>
                {section.section}
                {section.continued ? ' (continúa)' : ''}
              </div>
              <table>
                <tbody>
                  {section.items.map((item, idx) => {
                    const tag = menuPrintTag(item.klass, idx === 0);
                    return (
                      <tr key={item.id}>
                        <td style={{ width: '6mm' }}>{idx < 2 ? '★' : '·'}</td>
                        <td>
                          <strong>{item.name}</strong>
                          {tag ? <span style={{ color: '#6f6963' }}> · {tag}</span> : null}
                          <div style={{ fontSize: '9.5pt', color: '#6f6963' }}>
                            utilidad {money(item.grossProfit ?? 0)} · food cost {pct(item.foodCost)}
                          </div>
                        </td>
                        <td className="num">
                          <strong>{money(item.price)}</strong>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}
        </section>
      ))}

      <h2>3 · Reglas al mandarla a imprimir</h2>
      <ul style={{ margin: 0, paddingLeft: '6mm', fontSize: '11pt', lineHeight: 1.5 }}>
        {MENU_PRINT_RULES.map((rule) => (
          <li key={rule} style={{ marginBottom: '1.5mm' }}>
            {rule}
          </li>
        ))}
      </ul>

      {plan.warnings.length ? (
        <>
          <h2>Antes de imprimir, revisa esto</h2>
          <ul style={{ margin: 0, paddingLeft: '6mm', fontSize: '11pt', lineHeight: 1.5 }}>
            {plan.warnings.map((warning) => (
              <li key={warning} style={{ marginBottom: '1.5mm' }}>
                {warning}
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {plan.excluded.length ? (
        <>
          <h2>4 · Lo que dejamos fuera</h2>
          <p className="note">
            Estos platillos no entraron: se venden poco y su insumo se lleva demasiado del precio. Antes de sacarlos
            definitivamente, prueba subirles el precio o cambiar un ingrediente caro.
          </p>
          <table>
            <tbody>
              {plan.excluded.map((dish) => (
                <tr key={dish.id}>
                  <td>
                    <strong>{dish.name}</strong>
                  </td>
                  <td>
                    food cost {pct(dish.foodCost)} · rotación {dish.popularity}
                  </td>
                  <td className="num">{money(dish.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : null}

      <p className="note" style={{ marginTop: '6mm' }}>
        Documento generado con MiRestauranteListo. El acomodo sale de la popularidad y el margen de cada platillo
        capturados en el Costeador: si cambias un precio o una porción, vuelve a generar esta hoja antes de mandarla
        al impresor. Cada cara admite hasta {PANEL_CAPACITY} platillos.
      </p>

      <footer>
        <span>MiRestauranteListo · carta de menú</span>
        <span>{date}</span>
      </footer>
    </article>
  );
}
