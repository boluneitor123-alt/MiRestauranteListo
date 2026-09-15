'use client';

import { Sparkles } from 'lucide-react';
import { RADIUS } from '@/components/ui';

/**
 * «Esto lo estimamos nosotros, no lo dijiste tú.»
 *
 * Va pegada a cualquier cifra que salga del diagnóstico y no de la persona. No
 * es un adorno: sin ella, la app estaría enseñándole números inventados como
 * si fueran suyos, que es justo lo que este producto no hace. Por eso dice
 * también de dónde salieron — «estimado para taquería con equipo de 1 a 2
 * personas» se puede discutir; «$18,000» a secas, no.
 */
export function EtiquetaEstimado({ sello, compacta = false }: { sello: string; compacta?: boolean }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: compacta ? '3px 9px' : '5px 11px',
        borderRadius: RADIUS.pill,
        background: 'var(--color-accent-2-100)',
        color: 'var(--color-accent-2-800)',
        fontSize: compacta ? 10.5 : 11.5,
        fontWeight: 700,
        lineHeight: 1.35,
      }}
    >
      <Sparkles size={compacta ? 11 : 12} strokeWidth={2.6} style={{ flex: 'none' }} />
      {sello}
    </span>
  );
}

/**
 * El aviso de arriba de un módulo con cifras estimadas.
 *
 * Dice qué son y qué pasa al corregirlas, que es la parte que quita el miedo:
 * nadie edita un número si cree que la app se lo va a volver a cambiar.
 */
export function AvisoDeEstimado({ sello, cuantos }: { sello: string; cuantos: number }) {
  if (!cuantos) return null;
  return (
    <div
      style={{
        padding: '12px 14px',
        borderRadius: RADIUS.small,
        background: 'var(--color-accent-2-100)',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr)',
        gap: 7,
      }}
    >
      <EtiquetaEstimado sello={sello} />
      <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.5, color: 'var(--color-accent-2-900)' }}>
        Son un punto de partida para que veas tus números desde hoy, no datos tuyos. Corrige el que quieras y se
        queda como tuyo: no lo volvemos a tocar.
      </p>
    </div>
  );
}
