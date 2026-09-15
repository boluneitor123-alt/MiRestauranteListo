'use client';

import type { NumbersView } from '@/components/app/tabs/Numeros';
import { RADIUS } from '@/components/ui';

/**
 * Las cuatro vistas de Números como pestañas.
 *
 * Presupuesto tiene la suya y no vive sólo en la lista de calculadoras:
 * «cuánto necesito para abrir» es la primera pregunta de quien descarga esta
 * app, y enterrar el módulo que la contesta le quita peso a lo que más vende
 * — sobre todo en prueba, que es cuando se ve completo en modo ejemplo con la
 * cifra de inversión bloqueada al lado.
 */
export const PESTANAS: Array<{ id: NumbersView; label: string }> = [
  { id: 'home', label: 'Resumen' },
  { id: 'presupuesto', label: 'Presupuesto' },
  { id: 'fijos', label: 'Gastos fijos' },
  { id: 'equilibrio', label: 'Punto de equilibrio' },
];

export function PestanasDeNumeros({
  activa,
  onCambiar,
}: {
  activa: NumbersView;
  onCambiar: (view: NumbersView) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Vistas de Números"
      style={{
        display: 'flex',
        gap: 7,
        overflowX: 'auto',
        // La tira se desliza a propósito: «Punto de equilibrio» no cabe en
        // cuatro columnas a 360px sin partirse en dos renglones.
        scrollbarWidth: 'none',
        paddingBottom: 2,
      }}
    >
      {PESTANAS.map((p) => {
        const on = p.id === activa;
        return (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onCambiar(p.id)}
            style={{
              flex: 'none',
              minHeight: 44,
              padding: '0 15px',
              borderRadius: RADIUS.pill,
              border: `1.5px solid ${on ? 'var(--color-accent)' : 'var(--color-divider)'}`,
              background: on ? 'var(--color-accent-100)' : 'var(--color-surface)',
              color: on ? 'var(--color-accent-900)' : 'var(--color-text)',
              fontFamily: 'var(--font-body)',
              fontSize: 13.5,
              fontWeight: on ? 800 : 600,
              whiteSpace: 'nowrap',
              cursor: 'pointer',
            }}
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
}
