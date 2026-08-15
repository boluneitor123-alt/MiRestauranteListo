'use client';

import { TOUR_STEPS } from '@/content/onboarding';
import { Button, H, Muted, RADIUS, Row } from '@/components/ui';

/** Recorrido guiado que sigue al diagnóstico (README § 1 · flujo de pantallas). */
export function Tour({
  step,
  onNext,
  onSkip,
}: {
  step: number;
  onNext: () => void;
  onSkip: () => void;
}) {
  const current = TOUR_STEPS[step];
  const last = step === TOUR_STEPS.length - 1;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 65,
        background: 'rgba(0,0,0,.45)',
        display: 'flex',
        alignItems: 'flex-end',
      }}
    >
      <div
        style={{
          width: '100%',
          background: 'var(--color-surface)',
          borderRadius: `${RADIUS.sheet}px ${RADIUS.sheet}px 0 0`,
          padding: '22px 22px 28px',
          animation: 'mrlUp .22s ease both',
        }}
      >
        <Row style={{ justifyContent: 'space-between' }}>
          <Muted size={11.5} style={{ fontWeight: 800 }}>
            {step + 1} de {TOUR_STEPS.length}
          </Muted>
          <button
            type="button"
            onClick={onSkip}
            style={{
              border: 'none',
              background: 'transparent',
              color: 'var(--color-accent-700)',
              fontSize: 12.5,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
            }}
          >
            Saltar
          </button>
        </Row>

        <H size={21} style={{ marginTop: 10 }}>
          {current.title}
        </H>
        <Muted size={14} style={{ marginTop: 8 }}>
          {current.body}
        </Muted>
        <Muted size={12.5} style={{ marginTop: 10, color: 'var(--color-accent-700)' }}>
          {current.tip}
        </Muted>

        <Row gap={6} style={{ marginTop: 16, justifyContent: 'center' }}>
          {TOUR_STEPS.map((_, i) => (
            <span
              key={i}
              style={{
                width: i === step ? 18 : 6,
                height: 6,
                borderRadius: RADIUS.pill,
                background: i === step ? 'var(--color-accent)' : 'var(--color-neutral-300)',
                transition: 'all .2s ease',
              }}
            />
          ))}
        </Row>

        <div style={{ marginTop: 16 }}>
          <Button onClick={onNext}>{last ? 'Empezar a usar la app' : 'Siguiente'}</Button>
        </div>
      </div>
    </div>
  );
}
