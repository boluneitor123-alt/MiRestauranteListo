/**
 * Ficha técnica de costeo: una hoja por platillo (README § 9).
 *
 * Componente puro: recibe el platillo ya resuelto y no toca estado. Sirve igual
 * para imprimir desde el navegador que para generarlo del lado servidor.
 */

import { dishMetrics, ingredientCost, ingredientUnitPrice, yieldPct, type CostingContext } from '@/domain/costing';
import { money, money2, pct } from '@/domain/format';
import { semaphoreVerdict, semaphoreLevel } from '@/domain/semaphore';
import type { Dish } from '@/domain/types';

export function FichaTecnica({
  dish,
  project,
  ctx,
  date,
  targetFoodCost,
}: {
  dish: Dish;
  project: string;
  ctx: CostingContext;
  date: string;
  targetFoodCost: number;
}) {
  const m = dishMetrics(dish, ctx, { targetFoodCost });
  const level = semaphoreLevel(m.foodCostRounded);

  return (
    <article className="page">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '6mm' }}>
        <div>
          <h1>Ficha técnica de costeo</h1>
          <div style={{ fontSize: '11pt', color: '#6f6963' }}>
            {project} · {date}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '15pt', fontWeight: 800 }}>{dish.name}</div>
          <div style={{ fontSize: '10.5pt', color: '#6f6963' }}>
            {dish.section ?? 'Fuertes'} · rinde {dish.portions ?? 1} porción(es)
          </div>
        </div>
      </header>

      <div className="kpis">
        <div className="kpi">
          <span>Costo por porción</span>
          <strong>{money2(m.costPerPortion)}</strong>
        </div>
        <div className="kpi">
          <span>Food cost</span>
          <strong style={{ color: level === 'peligroso' ? 'var(--red)' : level === 'saludable' ? 'var(--green)' : undefined }}>
            {pct(m.foodCost)}
          </strong>
        </div>
        <div className="kpi">
          <span>Precio de venta</span>
          <strong>{m.hasPrice ? money(m.price) : '—'}</strong>
        </div>
        <div className="kpi">
          <span>Utilidad bruta</span>
          <strong>{m.grossProfit === null ? '—' : money2(m.grossProfit)}</strong>
        </div>
      </div>

      <h2>Receta estándar</h2>
      <table>
        <thead>
          <tr>
            <th>Ingrediente</th>
            <th className="num">Cantidad</th>
            <th>Compra</th>
            <th className="num">Merma</th>
            <th className="num">Costo unit. limpio</th>
            <th className="num">Costo</th>
          </tr>
        </thead>
        <tbody>
          {dish.ingredients.map((ingredient) => {
            const sub = ingredient.subrecipeId
              ? ctx.subrecipes.find((s) => s.id === ingredient.subrecipeId)
              : undefined;
            return (
              <tr key={ingredient.id}>
                <td>{ingredient.name}</td>
                <td className="num">
                  {ingredient.qty} {ingredient.unit}
                </td>
                <td>
                  {sub
                    ? `Sub-receta: ${sub.name}`
                    : ingredient.buyPrice && ingredient.buyQty
                      ? `${money2(ingredient.buyPrice)} por ${ingredient.buyQty} ${ingredient.buyUnit ?? ingredient.unit}`
                      : 'Precio unitario capturado'}
                </td>
                <td className="num">
                  {ingredient.waste ? `${ingredient.waste}% · queda ${Math.round(yieldPct(ingredient.waste) * 100)}%` : '—'}
                </td>
                <td className="num">{money2(ingredientUnitPrice(ingredient, ctx))}</td>
                <td className="num">{money2(ingredientCost(ingredient, ctx))}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <h2>Desglose del costo</h2>
      <table>
        <tbody>
          <tr>
            <td>Ingredientes por porción</td>
            <td className="num">{money2(m.ingredientsCost)}</td>
          </tr>
          <tr>
            <td>Condimentos y varios ({dish.extrasPct ?? 3}%)</td>
            <td className="num">{money2(m.extrasCost)}</td>
          </tr>
          <tr>
            <td>Empaque por porción</td>
            <td className="num">{money2(dish.packaging ?? 0)}</td>
          </tr>
          <tr>
            <td>Mano de obra por porción</td>
            <td className="num">{money2(dish.labor ?? 0)}</td>
          </tr>
          <tr>
            <td>
              <strong>Costo por porción</strong>
            </td>
            <td className="num">
              <strong>{money2(m.costPerPortion)}</strong>
            </td>
          </tr>
        </tbody>
      </table>

      <h2>Precios y rentabilidad</h2>
      <table>
        <tbody>
          <tr>
            <td>Precio de venta {dish.priceIncludesTax ?? true ? '(IVA incluido)' : '(sin IVA)'}</td>
            <td className="num">{m.hasPrice ? money(m.price) : '—'}</td>
          </tr>
          <tr>
            <td>Precio sin IVA</td>
            <td className="num">{m.hasPrice ? money2(m.netPrice) : '—'}</td>
          </tr>
          <tr>
            <td>Utilidad bruta · margen</td>
            <td className="num">
              {m.grossProfit === null ? '—' : `${money2(m.grossProfit)} · ${pct(m.grossMargin)}`}
            </td>
          </tr>
          <tr>
            <td>Precio sugerido (food cost objetivo {targetFoodCost}%)</td>
            <td className="num">{money(m.suggestedPrice)}</td>
          </tr>
          <tr>
            <td>Precio para apps de delivery (comisión {dish.deliveryCommission ?? 28}%)</td>
            <td className="num">{money(m.deliveryPrice)}</td>
          </tr>
        </tbody>
      </table>

      <h2>Lectura del resultado</h2>
      <p className="note">{semaphoreVerdict(m.foodCostRounded)}</p>

      <div className="sign">Preparado por: ____________________ · Autorizado por: ____________________</div>

      <footer>
        <span>MiRestauranteListo · ficha técnica</span>
        <span>{date}</span>
      </footer>
    </article>
  );
}
