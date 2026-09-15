'use client';

import { ArrowRight, Clock, Menu, Sparkles } from 'lucide-react';
import { RADIUS } from '@/components/ui';

/**
 * "Tu siguiente paso": la tarjeta que abre Inicio.
 *
 * Dice qué toca, cuánto tarda y en qué etapa va. El rótulo de la etapa sale de
 * `stageLabel()`, el mismo que usa Mi Ruta: las dos pantallas no pueden decir
 * cosas distintas.
 *
 * No lleva pie. Tuvo dos —la barra de avance y la franja de «necesitas tantos
 * clientes al día»— y los dos salieron: el avance se lee completo en Mi Ruta y
 * la cifra se fue al bloque naranja de arriba, que es donde pesa. La tarjeta
 * cierra con su botón, que es lo que viene a pedir.
 */
export function SiguientePaso({
  titulo,
  cuerpo,
  minutos,
  etapa,
  onContinue,
}: {
  titulo: string;
  cuerpo: string;
  /** Minutos de la lección, ya con su unidad. */
  minutos: string;
  /** "Define · etapa 1 de 3". */
  etapa: string;
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
      <picture style={{ display: 'contents' }}>
        <source type="image/avif" srcSet="/img/arnold-cierre-480w.avif 480w, /img/arnold-cierre.avif 800w" sizes="210px" />
        <img
          src="/img/arnold-cierre.webp"
          srcSet="/img/arnold-cierre-480w.webp 480w, /img/arnold-cierre.webp 800w"
          sizes="210px"
          alt=""
          aria-hidden
          width={800}
          height={840}
          loading="lazy"
          decoding="async"
          /* Arnold cede ancho al texto: con el título a dos renglones y la
             columna al 58% se encimaban. Él ilustra, el título manda. */
          style={{ position: 'absolute', right: -10, top: 18, width: '43%', maxWidth: 168, height: 'auto', pointerEvents: 'none' }}
        />
      </picture>

      <div style={{ position: 'relative', padding: '18px 18px 20px' }}>
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

        <div style={{ maxWidth: '64%' }}>
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
            {/* Cada dato con su ícono y sin separador suelto: al partirse en
                dos renglones, el «·» quedaba colgando al final del primero. */}
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
              <Clock size={14} strokeWidth={2.4} style={{ flex: 'none' }} />
              {minutos}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
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

    </div>
  );
}
