'use client';

import { money } from '@/domain/format';
import {
  STRESS_CONTROLS,
  STRESS_STEPS,
  WEEKLY_HOURS_RANGE,
  type SurvivalResult,
} from '@/domain/survival';
import type { StressTest } from '@/domain/projectState';
import { Card, H, Muted, RADIUS, ScreenHeader, text } from '@/components/ui';

/**
 * "Lo que este negocio te va a dar".
 *
 * Cuatro tarjetas que responden a dónde te lleva tu esfuerzo, la rampa de los
 * primeros cuatro meses, cuatro números de operación y una prueba de estrés.
 *
 * Los textos vienen literales del prototipo: están escritos para un dueño de
 * fonda y el tono es deliberado — cuando un número sale mal, la nota dice qué
 * mover, no que va a fracasar.
 */
export function Aguante({
  result,
  weeklyHours,
  prepMinutes,
  stress,
  goalTicketsPerDay,
  onBack,
  onChangeWeeklyHours,
  onChangePrepMinutes,
  onChangeStress,
}: {
  result: SurvivalResult;
  weeklyHours: number;
  prepMinutes: number;
  stress: StressTest;
  goalTicketsPerDay: number;
  onBack: () => void;
  onChangeWeeklyHours: (hours: number) => void;
  onChangePrepMinutes: (minutes: number) => void;
  onChangeStress: (stress: StressTest) => void;
}) {
  return (
    <div>
      <ScreenHeader
        title="Lo que este negocio te va a dar"
        subtitle="Cuatro números que te dicen a dónde te lleva tu esfuerzo. En pesos y en meses, para que los puedas usar."
        onBack={onBack}
      />

      <div
        className="mrl-measure"
        style={{ padding: '10px 20px 30px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 14 }}
      >
        {/* ── Las cuatro tarjetas ─────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 10 }}>
          {result.cards.map((card) => (
            <div
              key={card.kicker}
              style={{
                padding: '17px 18px',
                borderRadius: 26,
                boxShadow: 'var(--shadow-sm)',
                background: card.ok ? 'var(--color-accent-2-100)' : 'var(--color-accent-100)',
                color: card.ok ? 'var(--color-accent-2-900)' : 'var(--color-accent-900)',
              }}
            >
              <div style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', opacity: 0.75 }}>
                {card.kicker}
              </div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 28, lineHeight: 1.05, marginTop: 3 }}>
                {card.big}
              </div>
              <p className="mrl-prose" style={{ margin: '7px 0 0', fontSize: 12.8, lineHeight: 1.5 }}>
                {card.note}
              </p>
            </div>
          ))}
        </div>

        {/* Control de horas: mueve "Lo que vale tu hora". */}
        <Card>
          <div className="mrl-amount">
            <span style={{ fontSize: 13.5, fontWeight: 700 }}>Horas que trabajas a la semana</span>
            <Stepper
              value={weeklyHours}
              min={WEEKLY_HOURS_RANGE.min}
              max={WEEKLY_HOURS_RANGE.max}
              step={5}
              suffix="h"
              label="Horas por semana"
              onChange={onChangeWeeklyHours}
            />
          </div>
          <Muted size={12} style={{ marginTop: 8 }}>
            Cuéntalas honesto, incluyendo compras, caja y limpieza. Es lo que hace real el número de arriba.
          </Muted>
        </Card>

        {/* ── La rampa de los primeros cuatro meses ───────────────────── */}
        <Card>
          <div className="mrl-amount">
            <H size={17}>Los primeros cuatro meses</H>
            <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-accent-700)' }}>
              {result.cushionLabel}
            </span>
          </div>
          <Muted size={12.5} style={{ marginTop: 4 }}>
            Nadie vende al 100% desde el día uno. Así se ve la subida real.
          </Muted>

          <div style={{ marginTop: 10 }}>
            {result.ramp.map((row, i) => (
              <div
                key={row.label}
                className="mrl-amount"
                style={{
                  paddingBlock: 11,
                  fontSize: 12.8,
                  borderTop: i ? '1px solid color-mix(in srgb, var(--color-text) 8%, transparent)' : 'none',
                }}
              >
                <span style={{ minWidth: 0 }}>
                  <span style={{ fontWeight: 700 }}>{row.label}</span>
                  <span style={{ color: text(60) }}> · {row.pct}</span>
                </span>
                <span style={{ display: 'flex', gap: 10, alignItems: 'baseline', flexWrap: 'wrap' }}>
                  <span style={{ color: text(60) }}>{money(row.sales)}</span>
                  <span
                    style={{
                      fontWeight: 700,
                      color: row.result >= 0 ? 'var(--color-accent-2-800)' : 'var(--color-accent-800)',
                    }}
                  >
                    {row.result >= 0 ? '+' : '−'}
                    {money(Math.abs(row.result))}
                  </span>
                </span>
              </div>
            ))}
          </div>

          <p
            className="mrl-prose"
            style={{
              margin: '11px 0 0',
              paddingTop: 11,
              borderTop: '1px solid color-mix(in srgb, var(--color-text) 10%, transparent)',
              fontSize: 12.6,
              lineHeight: 1.5,
            }}
          >
            {result.rampNote}
          </p>
        </Card>

        {/* ── Los cuatro números de operación ─────────────────────────── */}
        <div>
          <Muted size={11.5} style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em' }}>
            Tu operación, en números
          </Muted>
          <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 10 }}>
            {result.ops.map((row) => (
              <Card key={row.label} radius={RADIUS.block} style={{ padding: 15 }}>
                <div className="mrl-amount">
                  <span style={{ fontSize: 13.5, fontWeight: 700 }}>{row.label}</span>
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: 20 }}>{row.value}</span>
                </div>
                <p className="mrl-prose" style={{ margin: '7px 0 0', fontSize: 12.5, lineHeight: 1.5, color: text(70) }}>
                  {row.note}
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* Control de minutos: mueve "Utilidad por minuto de cocina". */}
        <Card>
          <div className="mrl-amount">
            <span style={{ fontSize: 13.5, fontWeight: 700 }}>Minutos de tu platillo promedio</span>
            <Stepper
              value={prepMinutes}
              min={1}
              max={120}
              step={1}
              suffix="min"
              label="Minutos de preparación"
              onChange={onChangePrepMinutes}
            />
          </div>
          <Muted size={12} style={{ marginTop: 8 }}>
            Del momento en que entra la comanda al momento en que sale el plato.
          </Muted>
        </Card>

        {/* ── Prueba de estrés ────────────────────────────────────────── */}
        <Card>
          <H size={17}>Prueba de estrés</H>
          <Muted size={12.5} style={{ marginTop: 4 }}>
            ¿Qué pasa si las cosas se ponen más caras o vendes menos? Muévele y mira.
          </Muted>

          <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 14 }}>
            {STRESS_CONTROLS.map((control) => (
              <div key={control.key}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{control.label}</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                  {STRESS_STEPS.map((step) => {
                    const selected = stress[control.key] === step;
                    return (
                      <button
                        key={step}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => onChangeStress({ ...stress, [control.key]: step })}
                        style={{
                          minHeight: 44,
                          padding: '0 16px',
                          borderRadius: RADIUS.pill,
                          border: `1.5px solid ${selected ? 'var(--color-accent)' : 'var(--color-divider)'}`,
                          background: selected ? 'var(--color-accent-100)' : 'transparent',
                          color: selected ? 'var(--color-accent-800)' : 'var(--color-text)',
                          fontWeight: selected ? 800 : 600,
                          fontSize: 13.5,
                          cursor: 'pointer',
                          fontFamily: 'var(--font-body)',
                        }}
                      >
                        {control.sign}
                        {step}%
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {result.stressOn ? (
            <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 10 }}>
              <div className="mrl-duo">
                <div style={{ padding: 14, borderRadius: 20, background: 'var(--color-neutral-200)' }}>
                  <Muted size={11.5}>Tendrías que vender</Muted>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: 20, marginTop: 3 }}>
                    {result.stressTicketsPerDay} tickets al día
                  </div>
                  <Muted size={11.8} style={{ marginTop: 2 }}>
                    en lugar de {goalTicketsPerDay}
                  </Muted>
                </div>
                <div style={{ padding: 14, borderRadius: 20, background: 'var(--color-neutral-200)' }}>
                  <Muted size={11.5}>Te quedaría</Muted>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: 20, marginTop: 3 }}>
                    {money(result.stressOwnerSalary)}
                  </div>
                  <Muted size={11.8} style={{ marginTop: 2 }}>
                    al mes
                  </Muted>
                </div>
              </div>

              <p
                className="mrl-prose"
                style={{
                  margin: 0,
                  padding: '15px 17px',
                  borderRadius: 22,
                  fontSize: 12.8,
                  lineHeight: 1.5,
                  background: result.stressOwnerSalary > 0 ? 'var(--color-accent-2-100)' : 'var(--color-accent-100)',
                  color: result.stressOwnerSalary > 0 ? 'var(--color-accent-2-900)' : 'var(--color-accent-900)',
                }}
              >
                {result.stressNote}
              </p>
            </div>
          ) : (
            <Muted size={12.5} style={{ marginTop: 14, display: 'block' }}>
              Todo en cero: estás viendo tu plan tal como lo capturaste.
            </Muted>
          )}
        </Card>
      </div>
    </div>
  );
}

/**
 * Control de más/menos. Es un par de botones de 44px en vez de un campo de
 * texto: se ajusta con el pulgar y no abre el teclado.
 */
function Stepper({
  value,
  min,
  max,
  step,
  suffix,
  label,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  label: string;
  onChange: (value: number) => void;
}) {
  const clamp = (n: number) => Math.max(min, Math.min(max, n));

  const button = (delta: number, sign: string, aria: string) => (
    <button
      type="button"
      aria-label={aria}
      disabled={delta < 0 ? value <= min : value >= max}
      onClick={() => onChange(clamp(value + delta))}
      style={{
        width: 44,
        height: 44,
        flex: 'none',
        borderRadius: RADIUS.pill,
        border: '1.5px solid var(--color-divider)',
        background: 'var(--color-surface)',
        color: 'var(--color-text)',
        fontSize: 19,
        fontWeight: 700,
        cursor: 'pointer',
        fontFamily: 'var(--font-body)',
      }}
    >
      {sign}
    </button>
  );

  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }} role="group" aria-label={label}>
      {button(-step, '−', `Bajar ${label.toLowerCase()}`)}
      <span
        aria-live="polite"
        style={{ minWidth: 62, textAlign: 'center', fontFamily: 'var(--font-heading)', fontSize: 18 }}
      >
        {value} {suffix}
      </span>
      {button(step, '+', `Subir ${label.toLowerCase()}`)}
    </span>
  );
}
