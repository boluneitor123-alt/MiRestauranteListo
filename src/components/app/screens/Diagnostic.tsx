'use client';

import { AlertTriangle } from 'lucide-react';
import type { Diagnosis } from '@/domain/diagnosis';
import { Button, Card, H, Kicker, Muted, ProgressRing, RADIUS, Row, text } from '@/components/ui';

/** Resultado del diagnóstico (README § 1.4). */
export function Diagnostic({
  diagnosis,
  giro,
  hasTemplate,
  onEnter,
  onLoadTemplate,
}: {
  diagnosis: Diagnosis;
  giro: string;
  hasTemplate: boolean;
  onEnter: () => void;
  onLoadTemplate: () => void;
}) {
  const { progress, gaps, risks, nextStep } = diagnosis;

  return (
    <div className="mrl-measure" style={{ padding: '28px 22px 40px' }}>
      <Kicker>Tu diagnóstico</Kicker>
      <H size={30} style={{ marginTop: 8 }}>
        Tu proyecto está
        <br />
        {progress.pct}% listo para abrir
      </H>

      <Card style={{ marginTop: 18 }}>
        <Row gap={16}>
          <ProgressRing pct={progress.pct} />
          <div>
            <H size={17}>{progress.level}</H>
            <Muted size={13} style={{ marginTop: 4 }}>
              {progress.done} de {progress.total} tareas completadas
            </Muted>
          </div>
        </Row>
      </Card>

      <H size={18} style={{ marginTop: 24 }}>
        Lo que más te falta
      </H>
      <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 10 }}>
        {gaps.map((gap) => (
          <Card key={gap.n} radius={RADIUS.block} style={{ padding: 16 }}>
            <Row gap={12} align="flex-start">
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: RADIUS.pill,
                  background: 'var(--color-neutral-200)',
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 800,
                  fontSize: 13,
                  flexShrink: 0,
                }}
              >
                {gap.n}
              </span>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{gap.title}</div>
                <Muted size={12.5} style={{ marginTop: 3 }}>
                  {gap.body}
                </Muted>
              </div>
            </Row>
          </Card>
        ))}
      </div>

      {risks.length > 0 ? (
        <>
          <H size={18} style={{ marginTop: 24 }}>
            Riesgos detectados
          </H>
          <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 8 }}>
            {risks.map((risk) => (
              <div
                key={risk}
                style={{
                  background: 'var(--color-accent-100)',
                  borderRadius: RADIUS.inner,
                  padding: 14,
                  display: 'flex',
                  gap: 10,
                  alignItems: 'flex-start',
                }}
              >
                <AlertTriangle size={18} color="var(--color-accent-700)" strokeWidth={2.6} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 13.5, lineHeight: 1.45, color: 'var(--color-accent-900)' }}>{risk}</span>
              </div>
            ))}
          </div>
        </>
      ) : null}

      <div
        style={{
          marginTop: 24,
          background: 'var(--color-accent)',
          color: '#fff',
          borderRadius: RADIUS.card,
          padding: 20,
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', opacity: 0.85 }}>
          Tu siguiente paso
        </div>
        <H size={21} style={{ marginTop: 6, color: '#fff' }}>
          {nextStep.title}
        </H>
        <div style={{ fontSize: 13, marginTop: 6, opacity: 0.92, lineHeight: 1.45 }}>{nextStep.body}</div>
        <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 8 }}>
          <Button variant="light" height={48} onClick={onEnter}>
            Entrar a mi tablero
          </Button>
          {hasTemplate ? (
            <button
              type="button"
              onClick={onLoadTemplate}
              style={{
                height: 44,
                borderRadius: RADIUS.pill,
                border: '1.5px solid rgba(255,255,255,.5)',
                background: 'transparent',
                color: '#fff',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
              }}
            >
              Cargar plantilla de {giro}
            </button>
          ) : null}
        </div>
      </div>

      <Muted size={11.5} style={{ marginTop: 16, color: text(45) }}>
        Tu diagnóstico se recalcula solo cada vez que completas una tarea o capturas un número.
      </Muted>
    </div>
  );
}
