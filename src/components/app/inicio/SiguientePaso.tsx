'use client';

import { ArrowRight, Clock, Menu, Sparkles } from 'lucide-react';
import { RADIUS } from '@/components/ui';

/**
 * "Tu siguiente paso": la tarjeta que abre Inicio.
 *
 * Dice qué toca, cuánto tarda y en qué etapa va, y su pie lleva la barra de
 * avance. El rótulo de la etapa sale de `stageLabel()`, el mismo que usa Mi
 * Ruta: las dos pantallas no pueden decir cosas distintas.
 */
export function SiguientePaso({
  titulo,
  cuerpo,
  minutos,
  etapa,
  pct,
  ritmo,
  onContinue,
}: {
  titulo: string;
  cuerpo: string;
  /** Minutos de la lección, ya con su unidad. */
  minutos: string;
  /** "Define · etapa 1 de 3". */
  etapa: string;
  pct: number;
  /** Proyección de ritmo, o null mientras no haya de dónde sacarla. */
  ritmo: string | null;
  onContinue: () => void;
}) {
  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: RADIUS.card,
        background: 'var(--color-accent-100)',
        border: '1px solid var(--color-accent-200)',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/img/arnold-cierre.webp"
        alt=""
        aria-hidden
        style={{ position: 'absolute', right: -14, top: 6, width: '52%', maxWidth: 210, height: 'auto', pointerEvents: 'none' }}
      />

      <div style={{ position: 'relative', padding: '18px 18px 0' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            padding: '6px 12px',
            borderRadius: RADIUS.pill,
            background: 'var(--color-surface)',
            fontSize: 10.5,
            letterSpacing: '.08em',
            fontWeight: 800,
            textTransform: 'uppercase',
            color: 'var(--color-text)',
          }}
        >
          <Sparkles size={13} fill="var(--color-accent)" strokeWidth={0} style={{ flex: 'none' }} />
          Tu siguiente paso
        </span>

        <div style={{ maxWidth: '58%' }}>
          <div
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 21,
              lineHeight: 1.16,
              marginTop: 12,
              color: 'var(--color-text)',
            }}
          >
            {titulo}
          </div>
          <p
            className="mrl-prose"
            style={{ margin: '8px 0 0', fontSize: 13.5, lineHeight: 1.45, color: 'var(--color-text-2)' }}
          >
            {cuerpo}
          </p>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              marginTop: 12,
              fontSize: 12.5,
              fontWeight: 600,
              color: 'var(--color-text-2)',
              flexWrap: 'wrap',
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Clock size={14} strokeWidth={2.4} style={{ flex: 'none' }} />
              {minutos}
            </span>
            <span style={{ opacity: 0.5 }}>·</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Menu size={14} strokeWidth={2.4} style={{ flex: 'none' }} />
              {etapa}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onContinue}
          style={{
            marginTop: 16,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 11,
            height: 52,
            paddingInline: 24,
            border: 'none',
            borderRadius: RADIUS.control,
            background: 'var(--color-accent)',
            color: 'var(--on-accent)',
            fontFamily: 'var(--font-heading)',
            fontSize: 16,
            letterSpacing: '-.01em',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          Continuar mi ruta
          <ArrowRight size={18} strokeWidth={2.8} />
        </button>
      </div>

      <div
        style={{
          position: 'relative',
          marginTop: 16,
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          borderTop: '1px solid var(--color-accent-200)',
        }}
      >
        <span
          style={{
            flex: 1,
            height: 9,
            borderRadius: RADIUS.pill,
            background: 'var(--color-neutral-100)',
            overflow: 'hidden',
          }}
        >
          <span
            style={{
              display: 'block',
              width: `${pct}%`,
              height: '100%',
              borderRadius: RADIUS.pill,
              background: 'var(--color-accent)',
            }}
          />
        </span>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)', whiteSpace: 'nowrap' }}>
          {pct}% completado
        </span>
      </div>

      {ritmo ? (
        <p
          className="mrl-prose"
          style={{
            position: 'relative',
            margin: 0,
            padding: '0 18px 14px',
            fontSize: 12,
            lineHeight: 1.45,
            color: 'var(--color-text-2)',
          }}
        >
          {ritmo}
        </p>
      ) : null}
    </div>
  );
}
