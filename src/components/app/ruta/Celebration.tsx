'use client';

import { useEffect } from 'react';

export interface CelebrationState {
  task: string;
  /** Avance antes y después, en porcentaje. */
  from: number;
  to: number;
  /** El módulo quedó completo con esta tarea. */
  moduleDone: boolean;
  /** "3 de 6 en Concepto" o "Terminaste el módulo Concepto completo". */
  sub: string;
}

/** Confeti: 22 piezas, igual que el prototipo. */
const CONFETTI = Array.from({ length: 22 }, (_, i) => i);

const COLORS = [
  'var(--color-accent)',
  'var(--color-accent-400)',
  'var(--color-accent-2-500)',
  'var(--color-accent-2-300)',
  'var(--color-warn)',
];

/**
 * Celebración al completar una tarea (mensaje 2, § 4): animación corta,
 * confeti y el salto de porcentaje. Se cierra sola a los 2.6 s.
 */
export function Celebration({ state, onClose }: { state: CelebrationState; onClose: () => void }) {
  useEffect(() => {
    const id = setTimeout(onClose, 2600);
    return () => clearTimeout(id);
  }, [onClose, state]);

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 80,
        display: 'grid',
        placeItems: 'center',
        background: 'color-mix(in srgb, var(--color-text) 42%, transparent)',
        animation: 'mrlFade .18s ease both',
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      {CONFETTI.map((i) => (
        <span
          key={i}
          aria-hidden
          style={{
            position: 'absolute',
            top: '32%',
            left: `${6 + ((i * 37) % 88)}%`,
            width: i % 3 === 0 ? 7 : 5,
            height: i % 3 === 0 ? 11 : 8,
            borderRadius: 2,
            background: COLORS[i % COLORS.length],
            animation: `mrlConf ${(1.5 + (i % 5) * 0.18).toFixed(2)}s ease-in ${((i % 7) * 0.06).toFixed(2)}s both`,
          }}
        />
      ))}

      <div
        style={{
          width: 'min(300px, 82%)',
          padding: '26px 22px',
          borderRadius: 32,
          background: 'var(--color-neutral-100)',
          boxShadow: 'var(--shadow-lg)',
          textAlign: 'center',
          animation: 'mrlPop .3s cubic-bezier(.2,1.4,.4,1) both',
        }}
      >
        <div style={{ display: 'grid', placeItems: 'center', marginBottom: 14 }}>
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: '50%',
              display: 'grid',
              placeItems: 'center',
              background: `conic-gradient(var(--color-accent-2-500) ${state.to * 3.6}deg, var(--color-neutral-300) 0)`,
            }}
          >
            <div
              style={{
                width: 76,
                height: 76,
                borderRadius: '50%',
                background: 'var(--color-neutral-100)',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: 24, color: 'var(--color-accent-2-800)' }}>
                {state.to}%
              </span>
            </div>
          </div>
        </div>

        <div style={{ fontFamily: 'var(--font-heading)', fontSize: 20, lineHeight: 1.15 }}>
          {state.moduleDone ? '¡Módulo completo!' : '¡Una menos!'}
        </div>
        <p style={{ margin: '7px 0 0', fontSize: 13, lineHeight: 1.45, color: 'var(--color-neutral-700)' }}>
          {state.task}
        </p>
        <p style={{ margin: '9px 0 0', fontSize: 12.3, fontWeight: 700, color: 'var(--color-accent-2-700)' }}>
          {state.sub}
        </p>
        {state.to > state.from ? (
          <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--color-neutral-600)' }}>
            Tu avance subió de {state.from}% a {state.to}%
          </p>
        ) : null}
      </div>
    </div>
  );
}
