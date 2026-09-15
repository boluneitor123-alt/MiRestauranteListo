'use client';

import { ArrowRight, TriangleAlert } from 'lucide-react';
import type { Diagnosis, Target } from '@/domain/diagnosis';
import { RADIUS } from '@/components/ui';

/**
 * La alerta que toca hoy, con su color propio.
 *
 * Inicio llevaba «No olvides esto» con hasta tres recomendaciones en tarjetas
 * blancas iguales entre sí. Tres avisos del mismo peso no son tres avisos: son
 * ninguno. Aquí va **una**, la más grave, en rojo si es alta y en ámbar si no,
 * para que se lea como lo que es — algo que va a costar caro si se deja.
 *
 * Las demás siguen completas en Más › Alertas del mentor. Ninguna se pierde.
 */
export function AlertaDelMentor({
  recomendacion,
  onGo,
}: {
  recomendacion: Diagnosis['recommendations'][number] | undefined;
  onGo: (target: Target) => void;
}) {
  if (!recomendacion) return null;

  const grave = recomendacion.severity === 'alta';
  const tinta = grave ? 'var(--color-danger-700)' : 'var(--color-accent-800)';
  const fondo = grave ? 'var(--color-danger-100)' : 'var(--color-accent-100)';

  return (
    <div style={{ padding: '15px 16px', borderRadius: RADIUS.card, background: fondo }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <span
          style={{
            display: 'grid',
            placeItems: 'center',
            width: 28,
            height: 28,
            flex: 'none',
            borderRadius: 9,
            background: 'var(--color-surface)',
            color: tinta,
          }}
        >
          <TriangleAlert size={16} strokeWidth={2.75} />
        </span>
        <span
          style={{
            fontSize: 10.5,
            letterSpacing: '.09em',
            textTransform: 'uppercase',
            fontWeight: 800,
            color: tinta,
          }}
        >
          No lo dejes para el final
        </span>
      </div>

      <div style={{ fontFamily: 'var(--font-heading)', fontSize: 18, lineHeight: 1.18, marginTop: 10 }}>
        {recomendacion.title}
      </div>
      <p className="mrl-prose" style={{ margin: '7px 0 0', fontSize: 12.8, lineHeight: 1.5, color: 'var(--color-text-2)' }}>
        {recomendacion.body}
      </p>

      <button
        type="button"
        onClick={() => onGo(recomendacion.target)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 9,
          width: '100%',
          minHeight: 48,
          marginTop: 12,
          padding: '0 18px',
          border: 'none',
          borderRadius: RADIUS.control,
          background: 'var(--color-surface)',
          color: tinta,
          fontFamily: 'var(--font-body)',
          fontSize: 14.5,
          fontWeight: 800,
          cursor: 'pointer',
        }}
      >
        {recomendacion.cta}
        <ArrowRight size={17} strokeWidth={2.8} />
      </button>
    </div>
  );
}
