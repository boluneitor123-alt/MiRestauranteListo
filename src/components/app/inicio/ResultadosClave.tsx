'use client';

import type { CSSProperties } from 'react';
import { Lock } from 'lucide-react';
import { money, money2, pct } from '@/domain/format';
import { INVESTMENT_HIDDEN_LABEL } from '@/domain/access';
import type { Titular } from '@/domain/titular';
import { RADIUS } from '@/components/ui';
import { NumeroAnimado } from './NumeroAnimado';

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
  /** Token del pastel, sin el prefijo --cat-. */
  cat?: string;
  /** Va apagada y con candado: el dato existe pero no se enseña todavía. */
  bajoCandado?: boolean;
  d1: string;
  d2: string;
}

/** Las cuatro tarjetas, ya resueltas a partir de los números del proyecto. */
export function keyResults(input: {
  /** Ticket promedio capturado. */
  ticket: number;
  /** Costo promedio por porción de los platillos con precio. */
  averageCost: number;
  /** Cuántos platillos entraron en ese promedio. */
  pricedDishes: number;
  /** Margen bruto promedio de la carta, en porcentaje. */
  margin: number;
  /** Lo que cuesta abrir, sumado del presupuesto. */
  inversion: number;
  /**
   * ¿Se puede enseñar la cifra de inversión?
   *
   * En prueba no. La tarjeta se queda en su lugar con el candado, al lado de
   * las que sí se ven: es más claro —y mejor argumento— que esconderla.
   */
  muestraInversion: boolean;
}): KeyResult[] {
  return [
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
    {
      label: 'Inversión para abrir',
      value: input.muestraInversion ? money(input.inversion) : INVESTMENT_HIDDEN_LABEL,
      foot: input.muestraInversion
        ? input.inversion
          ? 'Suma de tu presupuesto'
          : 'Captura tu presupuesto'
        : 'Se abre con el pago único',
      bajoCandado: !input.muestraInversion,
      cat: 'local',
      d1: 'M3 10.5 12 4l9 6.5',
      d2: 'M5.5 10v10h13V10M10 20v-6h4v6',
    },
  ];
}

/**
 * La frase, en tamaño de conclusión.
 *
 * Se arma de tres piezas —«Necesitas», el número, «clientes al día para no
 * perder dinero»— para que el número pueda ir grande y animarse sin partir la
 * oración a mano. Se lee como algo que alguien te dice, no como una métrica.
 */
function Frase({ titular }: { titular: Titular }) {
  if (!titular.listo) {
    return (
      <p
        className="mrl-prose"
        style={{
          margin: '10px 0 0',
          fontFamily: 'var(--font-heading)',
          fontSize: 21,
          lineHeight: 1.25,
          letterSpacing: '-.02em',
          color: 'var(--color-text-2)',
        }}
      >
        {titular.mensaje}
      </p>
    );
  }

  return (
    <>
      <p
        className="mrl-prose"
        style={{
          margin: '10px 0 0',
          fontFamily: 'var(--font-heading)',
          fontSize: 26,
          lineHeight: 1.2,
          letterSpacing: '-.025em',
        }}
      >
        {titular.antes}{' '}
        <span style={{ color: 'var(--color-accent-800)', fontSize: 40, letterSpacing: '-.03em' }}>
          <NumeroAnimado valor={titular.numero} />
        </span>{' '}
        {titular.unidad} {titular.despues}
      </p>
      <p style={{ margin: '8px 0 0', fontSize: 13, color: 'var(--color-text-2)' }}>
        {money(titular.ventaMensual)} de venta al mes
      </p>
    </>
  );
}

export function ResultadosClave({ titular, rows }: { titular: Titular; rows: KeyResult[] }) {
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
        <h4 style={{ margin: 0, flex: 1, fontSize: 13, letterSpacing: '.06em', textTransform: 'uppercase', fontWeight: 800, color: 'var(--color-text-2)' }}>
          Tus números
        </h4>
      </div>

      <Frase titular={titular} />

      <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
        {rows.map((r) => {
          const card: CSSProperties = {
            padding: '14px 13px',
            borderRadius: RADIUS.inner,
            background: r.cat ? `var(--cat-${r.cat})` : 'var(--color-text)',
            color: r.cat ? `var(--cat-${r.cat}-ink)` : 'var(--color-neutral-100)',
            // Bajo candado se apaga, pero se queda en su lugar y del mismo
            // tamaño: el hueco al lado de las que sí se ven es el argumento.
            ...(r.bajoCandado ? { opacity: 0.72 } : {}),
          };
          return (
            <div key={r.label} style={card}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <svg width={15} height={15} style={{ flex: 'none', opacity: 0.75 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d={r.d1} />
                  <path d={r.d2} />
                </svg>
                <span style={{ flex: 1, minWidth: 0, fontSize: 11.5, fontWeight: 700, lineHeight: 1.3 }}>{r.label}</span>
                {r.bajoCandado ? <Lock size={13} strokeWidth={2.8} style={{ flex: 'none', opacity: 0.8 }} /> : null}
              </span>
              <span style={{ display: 'flex', alignItems: 'baseline', gap: 7, marginTop: 9, flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: r.bajoCandado ? 17 : 25,
                    lineHeight: 1.15,
                    letterSpacing: '-.02em',
                  }}
                >
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
