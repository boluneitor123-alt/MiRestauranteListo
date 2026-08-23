'use client';

import type { CSSProperties } from 'react';
import { money, money2, pct } from '@/domain/format';
import { RADIUS } from '@/components/ui';

/**
 * "Resultados clave": las cuatro cifras que resumen el proyecto.
 *
 * La primera va en carbón porque es la que manda —el punto de equilibrio—; las
 * otras tres llevan pastel de categoría. Ninguna cifra se escribe aquí: todas
 * llegan calculadas.
 */
export interface KeyResult {
  label: string;
  value: string;
  /** Unidad al lado del número, si la lleva. */
  unit?: string;
  foot: string;
  /** El pie va como insignia verde en lugar de como texto tenue. */
  chip?: boolean;
  /** Token del pastel, sin el prefijo --cat-. La primera tarjeta no lleva. */
  cat?: string;
  d1: string;
  d2: string;
}

/** Las cuatro tarjetas, ya resueltas a partir de los números del proyecto. */
export function keyResults(input: {
  /** Clientes al día del punto de equilibrio. */
  ticketsPerDay: number;
  /** Venta mensual que hay que hacer para no perder. */
  monthlySales: number;
  /** Ticket promedio capturado. */
  ticket: number;
  /** Costo promedio por porción de los platillos con precio. */
  averageCost: number;
  /** Cuántos platillos entraron en ese promedio. */
  pricedDishes: number;
  /** Margen bruto promedio de la carta, en porcentaje. */
  margin: number;
}): KeyResult[] {
  return [
    {
      label: 'Punto de equilibrio',
      value: `${input.ticketsPerDay}`,
      unit: 'clientes al día',
      foot: `${money(input.monthlySales)} venta mensual`,
      d1: 'M4 20h16M6.5 16.5V11M11.5 16.5V5.5M16.5 16.5v-4',
      d2: 'M12 3v2',
    },
    {
      label: 'Ticket promedio',
      value: money(input.ticket || 0),
      foot: 'Con el que calculas',
      cat: 'recursos',
      d1: 'M3 8.5A1.5 1.5 0 0 1 4.5 7h15A1.5 1.5 0 0 1 21 8.5v7a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 15.5Z',
      d2: 'M8 7v10M16 7v10',
    },
    {
      label: 'Costo de platillo',
      value: input.averageCost ? money2(input.averageCost) : '—',
      foot: input.pricedDishes ? `Promedio de ${input.pricedDishes}` : 'Costea tu primer platillo',
      cat: 'permisos',
      d1: 'M4 11h16a8 8 0 0 0-16 0Z',
      d2: 'M4.5 14.5h15M6 18h12',
    },
    {
      label: 'Margen estimado',
      value: input.margin ? pct(input.margin) : '—',
      foot: input.margin >= 60 ? 'Saludable' : input.margin ? 'Por revisar' : 'Sin datos',
      chip: input.margin > 0,
      cat: 'operacion',
      d1: 'M4 20h16',
      d2: 'M6.5 16.5V11M11.5 16.5V5.5M16.5 16.5v-4',
    },
  ];
}

export function ResultadosClave({ rows }: { rows: KeyResult[] }) {
  return (
    <div
      style={{
        padding: '18px 16px 16px',
        border: '1px solid var(--color-border)',
        borderRadius: RADIUS.card,
        background: 'var(--color-surface)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span
          style={{
            display: 'grid',
            placeItems: 'center',
            width: 26,
            height: 26,
            flex: 'none',
            borderRadius: 8,
            background: 'var(--cat-numeros)',
            color: 'var(--cat-numeros-ink)',
          }}
        >
          <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M4 20h16M6.5 16.5V11M11.5 16.5V5.5M16.5 16.5v-4" />
          </svg>
        </span>
        <h4 style={{ margin: 0, flex: 1, fontSize: 18, letterSpacing: '-.01em', fontFamily: 'var(--font-heading)' }}>
          Resultados clave
        </h4>
        <span style={{ fontSize: 12.5, color: 'var(--color-text-2)' }}>Actualizados hoy</span>
      </div>

      <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
        {rows.map((r) => {
          const card: CSSProperties = {
            padding: '14px 13px',
            borderRadius: RADIUS.inner,
            background: r.cat ? `var(--cat-${r.cat})` : 'var(--color-text)',
            color: r.cat ? `var(--cat-${r.cat}-ink)` : 'var(--color-neutral-100)',
          };
          return (
            <div key={r.label} style={card}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <svg width={15} height={15} style={{ flex: 'none', opacity: 0.75 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d={r.d1} />
                  <path d={r.d2} />
                </svg>
                <span style={{ flex: 1, minWidth: 0, fontSize: 11.5, fontWeight: 700, lineHeight: 1.3 }}>{r.label}</span>
              </span>
              <span style={{ display: 'flex', alignItems: 'baseline', gap: 7, marginTop: 9, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: 25, lineHeight: 1, letterSpacing: '-.02em' }}>
                  {r.value}
                </span>
                {r.unit ? <span style={{ fontSize: 12, opacity: 0.78 }}>{r.unit}</span> : null}
              </span>
              <span
                style={
                  r.chip
                    ? {
                        display: 'inline-block',
                        marginTop: 9,
                        padding: '4px 10px',
                        borderRadius: RADIUS.pill,
                        background: 'var(--color-accent-2-100)',
                        color: 'var(--color-accent-2-700)',
                        fontSize: 11,
                        fontWeight: 700,
                      }
                    : { display: 'block', marginTop: 9, fontSize: 11.5, opacity: 0.78 }
                }
              >
                {r.foot}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
