'use client';

import { Check } from 'lucide-react';
import { ONBOARDING_QUESTIONS } from '@/content/onboarding';
import { Button, H, Kicker, Muted, RADIUS, Row, text } from '@/components/ui';

/** Onboarding: 12 preguntas, una por pantalla (README § 1.3). */
export function Onboarding({
  step,
  answers,
  onAnswer,
  onBack,
  onNext,
}: {
  step: number;
  answers: Record<string, string>;
  onAnswer: (id: string, option: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const question = ONBOARDING_QUESTIONS[step];
  const selected = answers[question.id];
  const last = step === ONBOARDING_QUESTIONS.length - 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <div className="mrl-measure" style={{ padding: '18px 22px 0', width: '100%' }}>
        <Row gap={12}>
          <button
            type="button"
            onClick={onBack}
            aria-label="Atrás"
            style={{
              width: 36,
              height: 36,
              borderRadius: RADIUS.pill,
              border: 'none',
              background: 'var(--color-neutral-200)',
              color: 'var(--color-text)',
              cursor: 'pointer',
              fontSize: 17,
            }}
          >
            ‹
          </button>
          <div style={{ flex: 1, minWidth: 0, height: 8, borderRadius: RADIUS.pill, background: 'var(--color-neutral-300)' }}>
            <div
              style={{
                width: `${((step + 1) / ONBOARDING_QUESTIONS.length) * 100}%`,
                height: '100%',
                borderRadius: RADIUS.pill,
                background: 'var(--color-accent)',
                transition: 'width .3s',
              }}
            />
          </div>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: text(60) }}>
            {step + 1}/{ONBOARDING_QUESTIONS.length}
          </span>
        </Row>
      </div>

      <div className="mrl-measure" style={{ padding: '26px 22px 0', flex: 1, minWidth: 0, width: '100%' }}>
        <Kicker>{question.kicker}</Kicker>
        <H size={26} style={{ marginTop: 8 }}>
          {question.question}
        </H>
        {question.help ? <Muted style={{ marginTop: 8 }}>{question.help}</Muted> : null}

        <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 10 }}>
          {question.options.map((option) => {
            const active = selected === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => onAnswer(question.id, option)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  padding: '15px 18px',
                  borderRadius: RADIUS.pill,
                  border: `1.5px solid ${active ? 'var(--color-accent)' : 'var(--color-divider)'}`,
                  background: active ? 'var(--color-accent-100)' : 'var(--color-surface)',
                  color: 'var(--color-text)',
                  fontFamily: 'var(--font-body)',
                  fontSize: 15,
                  fontWeight: active ? 700 : 500,
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                {option}
                {active ? <Check size={20} color="var(--color-accent)" strokeWidth={3} /> : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mrl-measure" style={{ padding: '18px 22px 26px', width: '100%' }}>
        <Button disabled={!selected} onClick={onNext}>
          {last ? 'Ver mi diagnóstico' : 'Continuar'}
        </Button>
      </div>
    </div>
  );
}
