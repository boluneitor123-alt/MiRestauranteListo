'use client';

import { Bell, Check, ChevronRight } from 'lucide-react';
import type { Diagnosis, Target } from '@/domain/diagnosis';
import type { Capabilities } from '@/domain/access';
import { INVESTMENT_HIDDEN_LABEL } from '@/domain/access';
import { breakeven, fixedExpensesTotal, investment } from '@/domain/finance';
import { dishMetrics } from '@/domain/costing';
import { money, pct as pctLabel } from '@/domain/format';
import { semaphoreLevel } from '@/domain/semaphore';
import type { ProjectState } from '@/domain/projectState';
import { Button, Card, H, Muted, ProgressBar, ProgressRing, RADIUS, Row, text } from '@/components/ui';

const SEVERITY_COLOR = {
  alta: 'var(--color-accent)',
  media: 'var(--color-warn)',
  baja: 'var(--color-accent-2-500)',
} as const;

const FOOD_COST_COLOR = {
  saludable: 'var(--color-accent-2-700)',
  revisar: 'var(--color-warn)',
  peligroso: 'var(--color-accent-800)',
  'sin-precio': 'var(--color-neutral-600)',
} as const;

/** Tablero de Inicio (README § 1.5). */
export function Inicio({
  state,
  diagnosis,
  can,
  trialLabel,
  onGo,
  onOpenProfile,
  onOpenAlerts,
  onOpenPaywall,
  onNewDish,
}: {
  state: ProjectState;
  diagnosis: Diagnosis;
  can: Capabilities;
  trialLabel: string | null;
  onGo: (target: Target) => void;
  onOpenProfile: () => void;
  onOpenAlerts: () => void;
  onOpenPaywall: () => void;
  onNewDish: (id?: string) => void;
}) {
  const name = (state.profile.name || 'Tu proyecto').split(' ')[0];
  const invest = investment({
    concepts: state.budget,
    subconcepts: state.budgetSub,
    budgetCap: state.project.budgetCap,
  });
  const fixed = fixedExpensesTotal(state.fixed);
  const be = breakeven({
    fixedExpenses: fixed,
    grossMargin: state.margin,
    ticket: state.ticket,
    ownerGoal: state.ownerGoal,
    hours: state.hours,
    closedOneDay: state.closedOneDay,
  });
  const recent = state.dishes.slice(-6).reverse();

  return (
    <div className="mrl-measure" style={{ padding: '18px 20px 20px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 16 }}>
      <Row style={{ justifyContent: 'space-between' }}>
        <Row gap={12}>
          <button
            type="button"
            onClick={onOpenProfile}
            aria-label="Mi perfil"
            style={{
              width: 44,
              height: 44,
              borderRadius: RADIUS.pill,
              border: 'none',
              background: 'var(--color-accent-100)',
              color: 'var(--color-accent-700)',
              fontWeight: 800,
              fontSize: 17,
              cursor: 'pointer',
            }}
          >
            {name.slice(0, 1).toUpperCase()}
          </button>
          <div>
            <H size={20}>¡Hola, {name}!</H>
            <Muted size={12.5}>
              {state.project.name} · {state.project.giro}
            </Muted>
          </div>
        </Row>
        <button
          type="button"
          onClick={onOpenAlerts}
          aria-label="Alertas"
          style={{ position: 'relative', border: 'none', background: 'transparent', cursor: 'pointer', padding: 4 }}
        >
          <Bell size={22} strokeWidth={2.6} color="var(--color-text)" />
          {diagnosis.recommendations.some((r) => r.severity === 'alta') ? (
            <span
              style={{
                position: 'absolute',
                top: 2,
                right: 2,
                width: 9,
                height: 9,
                borderRadius: RADIUS.pill,
                background: 'var(--color-accent)',
              }}
            />
          ) : null}
        </button>
      </Row>

      {trialLabel ? (
        <button
          type="button"
          onClick={onOpenPaywall}
          style={{
            border: 'none',
            textAlign: 'left',
            background: 'var(--color-accent-100)',
            color: 'var(--color-accent-900)',
            borderRadius: RADIUS.inner,
            padding: '12px 16px',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
          }}
        >
          {trialLabel} · desbloquea con un solo pago →
        </button>
      ) : null}

      <Card>
        <Row gap={16}>
          <ProgressRing pct={diagnosis.progress.pct} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <H size={17}>{diagnosis.progress.level}</H>
            <Muted size={12.5} style={{ marginTop: 3 }}>
              {diagnosis.progress.done} de {diagnosis.progress.total} tareas completadas
            </Muted>
            <button
              type="button"
              onClick={() => onGo({ tab: 'ruta' })}
              style={{
                marginTop: 8,
                border: 'none',
                background: 'transparent',
                color: 'var(--color-accent-700)',
                fontWeight: 800,
                fontSize: 13,
                padding: 0,
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
              }}
            >
              Ver mi progreso →
            </button>
          </div>
        </Row>
      </Card>

      <div
        style={{
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
          {diagnosis.nextStep.title}
        </H>
        <div style={{ fontSize: 13, marginTop: 6, opacity: 0.92, lineHeight: 1.45 }}>{diagnosis.nextStep.body}</div>
        <div style={{ marginTop: 14 }}>
          <Button variant="light" height={44} onClick={() => onGo(diagnosis.nextStep.target)}>
            Continuar
          </Button>
        </div>
      </div>

      <div className="mrl-duo">
        <button
          type="button"
          onClick={() => (can.budget ? onGo({ tab: 'numeros', view: 'presupuesto' }) : onOpenPaywall())}
          style={{
            textAlign: 'left',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            color: 'var(--color-bg)',
            borderRadius: RADIUS.card,
            padding: 18,
            boxShadow: 'var(--shadow-md)',
            background: invest.exceeded ? 'var(--color-accent-700)' : 'var(--color-accent-2-600)',
          }}
        >
          <div style={{ fontSize: 11.5, fontWeight: 800, opacity: 0.9 }}>Inversión vs presupuesto</div>
          <div
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: can.showsInvestmentFigures ? 22 : 15,
              marginTop: 6,
              lineHeight: 1.2,
            }}
          >
            {can.showsInvestmentFigures ? money(invest.total) : INVESTMENT_HIDDEN_LABEL}
          </div>
          <div style={{ height: 6, borderRadius: RADIUS.pill, background: 'rgba(255,255,255,.3)', marginTop: 10 }}>
            <div
              style={{
                width: `${can.showsInvestmentFigures ? invest.usedPct : 22}%`,
                height: '100%',
                borderRadius: RADIUS.pill,
                background: 'var(--color-bg)',
                transition: 'width .3s ease',
              }}
            />
          </div>
          <div style={{ marginTop: 6, fontSize: 11.5, fontWeight: 700, opacity: 0.95 }}>
            {can.showsInvestmentFigures
              ? invest.exceeded
                ? `Te excedes ${money(Math.abs(invest.difference))}`
                : `Te quedan ${money(invest.difference)}`
              : 'Presupuesto de apertura completo'}
          </div>
        </button>

        <button
          type="button"
          onClick={() => onGo({ tab: 'numeros', view: 'equilibrio' })}
          style={{
            textAlign: 'left',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            background: 'var(--color-surface)',
            color: 'var(--color-text)',
            borderRadius: RADIUS.card,
            padding: 18,
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ fontSize: 11.5, fontWeight: 800, color: text(60) }}>Punto de equilibrio</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 22, marginTop: 6 }}>{money(be.dailySales)}</div>
          <Muted size={11.5} style={{ marginTop: 4 }}>
            al día · {be.ticketsPerDay} tickets
          </Muted>
          <Muted size={11} style={{ marginTop: 8 }}>
            {fixed > 0 ? `${money(fixed)} de gastos fijos` : 'Captura tus gastos fijos'}
          </Muted>
        </button>
      </div>

      <div>
        <H size={18}>Pendientes críticos</H>
        <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 10 }}>
          {diagnosis.recommendations.slice(0, 3).map((rec) => (
            <Card key={rec.id} radius={RADIUS.block} style={{ padding: 16 }}>
              <Row gap={10} align="flex-start">
                <span
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: RADIUS.pill,
                    background: SEVERITY_COLOR[rec.severity],
                    marginTop: 6,
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700 }}>{rec.title}</div>
                  <Muted size={12.5} style={{ marginTop: 4 }}>
                    {rec.body}
                  </Muted>
                  <button
                    type="button"
                    onClick={() => onGo(rec.target)}
                    style={{
                      marginTop: 8,
                      border: 'none',
                      background: 'transparent',
                      padding: 0,
                      color: 'var(--color-accent-700)',
                      fontWeight: 800,
                      fontSize: 12.5,
                      cursor: 'pointer',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    {rec.cta} →
                  </button>
                </div>
              </Row>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <H size={18}>Progreso por módulo</H>
        <Card style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 10 }}>
          {diagnosis.progress.modules.map((module) => (
            <Row key={module.id} gap={10}>
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: RADIUS.pill,
                  display: 'grid',
                  placeItems: 'center',
                  background: module.pct === 100 ? 'var(--color-accent-2-100)' : 'var(--color-neutral-200)',
                  flexShrink: 0,
                }}
              >
                <Check
                  size={13}
                  strokeWidth={3}
                  color={module.pct === 100 ? 'var(--color-accent-2-600)' : 'var(--color-neutral-500)'}
                />
              </span>
              <span style={{ flex: '0 1 104px', minWidth: 0, fontSize: 13, fontWeight: 600 }}>{module.name}</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <ProgressBar pct={module.skipped ? 0 : module.pct} />
              </span>
              <span
                style={{
                  width: 48,
                  textAlign: 'right',
                  fontSize: 12,
                  fontWeight: 700,
                  color: module.skipped ? text(45) : 'var(--color-accent-700)',
                }}
              >
                {module.skipped ? 'omitido' : `${module.pct}%`}
              </span>
            </Row>
          ))}
        </Card>
      </div>

      {recent.length > 0 ? (
        <div>
          <H size={18}>Últimos platillos costeados</H>
          <div style={{ marginTop: 10, display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
            {recent.map((dish) => {
              const m = dishMetrics(dish, { subrecipes: state.subrecipes }, { targetFoodCost: state.fcTarget });
              return (
                <button
                  key={dish.id}
                  type="button"
                  onClick={() => onNewDish(dish.id)}
                  style={{
                    minWidth: 150,
                    textAlign: 'left',
                    background: 'var(--color-surface)',
                    border: 'none',
                    borderRadius: RADIUS.block,
                    boxShadow: 'var(--shadow-sm)',
                    padding: 14,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                    color: 'var(--color-text)',
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{dish.name}</div>
                  <Muted size={11.5} style={{ marginTop: 4 }}>
                    Costo {money(m.costPerPortion)} · Precio {money(m.price)}
                  </Muted>
                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 11.5,
                      fontWeight: 800,
                      color: FOOD_COST_COLOR[semaphoreLevel(m.foodCostRounded)],
                    }}
                  >
                    {m.hasPrice ? `Food cost ${pctLabel(m.foodCost)}` : 'Sin precio'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div>
        <H size={18}>Accesos rápidos</H>
        <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
          {[
            { label: 'Nuevo platillo', action: () => onNewDish() },
            { label: 'Mi Ruta', action: () => onGo({ tab: 'ruta' }) },
            { label: 'Punto de equilibrio', action: () => onGo({ tab: 'numeros', view: 'equilibrio' }) },
            { label: 'Mis notas', action: () => onGo({ tab: 'mas', view: 'notas' }) },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={item.action}
              style={{
                height: 56,
                borderRadius: RADIUS.inner,
                border: '1.5px solid var(--color-divider)',
                background: 'var(--color-surface)',
                color: 'var(--color-text)',
                fontWeight: 700,
                fontSize: 13.5,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 14px',
                fontFamily: 'var(--font-body)',
              }}
            >
              {item.label}
              <ChevronRight size={16} strokeWidth={2.6} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
