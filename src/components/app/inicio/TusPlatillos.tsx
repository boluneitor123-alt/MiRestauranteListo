'use client';

import { ArrowRight, ChevronRight } from 'lucide-react';
import { dishMetrics } from '@/domain/costing';
import type { Dish, Subrecipe } from '@/domain/types';
import { FilaDePlatillo } from '@/components/app/costeador/FilaDePlatillo';
import { RADIUS } from '@/components/ui';

/** Cuántos platillos caben en Inicio sin volverlo el Costeador. */
const CUANTOS = 3;

/**
 * «Tus platillos» en Inicio: las últimas filas del Costeador.
 *
 * La fila es la misma que usa el Costeador —ícono por sección, costo, precio y
 * food cost en el color del semáforo—, no una copia: si allá cambia el
 * criterio de un color, aquí cambia solo.
 *
 * Sin platillos no se deja el hueco. Quien todavía no costeó nada es
 * exactamente a quien hay que decirle para qué sirve costear, y la invitación
 * ocupa el lugar que ocuparían las filas.
 */
export function TusPlatillos({
  dishes,
  subrecipes,
  onAbrir,
  onVerTodos,
  onCostearPrimero,
}: {
  dishes: Dish[];
  subrecipes: Subrecipe[];
  onAbrir: (id: string) => void;
  onVerTodos: () => void;
  onCostearPrimero: () => void;
}) {
  // Los últimos que tocó, arriba: son los que está trabajando.
  const visibles = dishes.slice(-CUANTOS).reverse();

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, margin: '0 2px 11px' }}>
        <h4 style={{ margin: 0, flex: 1, minWidth: 0, fontFamily: 'var(--font-heading)', fontSize: 19, letterSpacing: '-.01em' }}>
          Tus platillos
        </h4>
        {dishes.length > CUANTOS ? (
          <button
            type="button"
            onClick={onVerTodos}
            className="mrl-hit"
            style={{
              flex: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 3,
              border: 'none',
              background: 'none',
              padding: 0,
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              fontSize: 12.5,
              fontWeight: 800,
              color: 'var(--color-accent-800)',
            }}
          >
            Ver los {dishes.length}
            <ChevronRight size={14} strokeWidth={3} />
          </button>
        ) : null}
      </div>

      {visibles.length ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 8 }}>
          {visibles.map((dish) => (
            <FilaDePlatillo
              key={dish.id}
              dish={dish}
              metrics={dishMetrics(dish, { subrecipes })}
              onOpen={() => onAbrir(dish.id)}
            />
          ))}
        </div>
      ) : (
        /*
          Fondo neutro y borde punteado, no el pastel de la carta: justo arriba
          va la alerta del mentor, que también es rosa, y las dos juntas se
          leían como un solo bloque de aviso.
        */
        <div
          style={{
            padding: '17px 17px 16px',
            borderRadius: RADIUS.card,
            background: 'var(--color-surface)',
            border: '1.5px dashed var(--color-divider)',
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 800, lineHeight: 1.25 }}>
            Todavía no has costeado un platillo
          </div>
          <p
            className="mrl-prose"
            style={{ margin: '6px 0 13px', fontSize: 13, lineHeight: 1.45, color: 'var(--color-text-2)' }}
          >
            Cuesta uno y te digo, al peso, cuánto te deja y si su precio aguanta. Es lo que le falta a casi todos los
            que cierran el primer año.
          </p>
          <button
            type="button"
            onClick={onCostearPrimero}
            style={{
              minHeight: 46,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 9,
              paddingInline: 18,
              border: 'none',
              borderRadius: RADIUS.control,
              background: 'var(--color-accent)',
              color: 'var(--on-accent)',
              fontFamily: 'var(--font-heading)',
              fontSize: 15,
              cursor: 'pointer',
            }}
          >
            Costear mi primer platillo
            <ArrowRight size={17} strokeWidth={2.8} />
          </button>
        </div>
      )}
    </div>
  );
}
