'use client';

import { BarChart3, Bell, Check, ChevronRight, Clock, FileText } from 'lucide-react';
import type { Diagnosis, Target } from '@/domain/diagnosis';
import type { Capabilities } from '@/domain/access';
import { INVESTMENT_HIDDEN_LABEL } from '@/domain/access';
import { breakeven, fixedExpensesTotal, investment } from '@/domain/finance';
import { dishMetrics } from '@/domain/costing';
import { money, pct as pctLabel } from '@/domain/format';
import { semaphoreLevel } from '@/domain/semaphore';
import { paceProjection } from '@/domain/progress';
import { getLesson } from '@/content/lessons';
import { DEMO_DISHES } from '@/content/demo';
import { PuntosExtra } from '@/components/app/inicio/PuntosExtra';
import type { ProjectState } from '@/domain/projectState';
import { Button, Card, H, Muted, ProgressBar, ProgressRing, RADIUS, Row, text } from '@/components/ui';

/** Los platillos de la plantilla, para reconocer que el ejemplo sigue puesto. */
const DEMO_DISH_IDS = new Set(DEMO_DISHES.map((d) => d.id));

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
  licensed,
  trial,
  startedAt,
  onGo,
  onOpenProfile,
  onOpenAlerts,
  onOpenPaywall,
  onOpenDoc,
  onNewDish,
  onKeepExample,
  onClearExample,
}: {
  state: ProjectState;
  diagnosis: Diagnosis;
  can: Capabilities;
  /** Pagó. Decide el documento y el texto del botón de los cursos. */
  licensed: boolean;
  /** Días que le quedan de prueba. `null` con licencia: el aviso desaparece. */
  trial: { daysLeft: number; expired: boolean } | null;
  /** Cuándo empezó a usar la app. Alimenta la proyección de fecha de apertura. */
  startedAt: number | null;
  onGo: (target: Target) => void;
  onOpenProfile: () => void;
  onOpenAlerts: () => void;
  onOpenPaywall: () => void;
  /** Abre el Plan de apertura imprimible. */
  onOpenDoc: () => void;
  onNewDish: (id?: string) => void;
  onKeepExample: () => void;
  onClearExample: () => void;
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
  const courses = diagnosis.progress.modules.filter((m) => m.course);
  const nextLesson = getLesson(diagnosis.nextStep.title);
  // El ejemplo de la plantilla sigue cargado y todavía no decide qué hacer con él.
  const exampleOn =
    !state.settings.exampleHidden && state.dishes.some((d) => DEMO_DISH_IDS.has(d.id));
  // La proyección la ve todo el mundo, haya pagado o no: el prototipo no la
  // condiciona a la licencia.
  const pace = startedAt
    ? paceProjection({
        pending: diagnosis.progress.total - diagnosis.progress.done,
        done: diagnosis.progress.done,
        startedAt,
        now: Date.now(),
      })
    : null;

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
          style={{
            position: 'relative',
            width: 44,
            height: 44,
            flex: 'none',
            display: 'grid',
            placeItems: 'center',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            padding: 0,
          }}
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

      {trial ? (
        <button
          type="button"
          onClick={onOpenPaywall}
          style={{
            width: '100%',
            border: 'none',
            textAlign: 'left',
            background: 'var(--color-accent-100)',
            borderRadius: RADIUS.block,
            padding: '14px 16px',
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', fontWeight: 700, fontSize: 13.5, color: 'var(--color-accent-900)' }}>
              Versión de prueba
            </span>
            <span
              className="mrl-prose"
              style={{ display: 'block', fontSize: 12, lineHeight: 1.45, color: 'var(--color-accent-800)', marginTop: 1 }}
            >
              {trial.expired
                ? 'La app quedó bloqueada. Desbloquéala con un solo pago y recupera todo tu avance.'
                : `Prueba gratis: ${
                    trial.daysLeft === 1 ? 'te queda 1 día' : `te quedan ${trial.daysLeft} días`
                  }. Trabajas Concepto y Local completos, abres la primera lección de los otros 12 módulos, costeas 3 platillos y ves tu punto de equilibrio.`}
            </span>
          </span>
          <ChevronRight size={17} strokeWidth={2.75} color="var(--color-accent-800)" style={{ flex: 'none' }} />
        </button>
      ) : null}

      <Card>
        <Row gap={16}>
          <ProgressRing pct={diagnosis.progress.pct} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <Muted size={12}>Tu proyecto está</Muted>
            <H size={23} style={{ lineHeight: 1.1 }}>
              {diagnosis.progress.pct}% listo
            </H>
            <Muted size={12.5} style={{ marginTop: 2 }}>
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

      {/* El documento que se lleva al banco. Con licencia abre; sin ella, al pago. */}
      <button
        type="button"
        onClick={licensed ? onOpenDoc : onOpenPaywall}
        style={{
          width: '100%',
          textAlign: 'left',
          padding: '17px 19px',
          borderRadius: RADIUS.card,
          border: '1.5px solid var(--color-accent-300)',
          cursor: 'pointer',
          fontFamily: 'var(--font-body)',
          background: 'var(--color-surface)',
          color: 'var(--color-text)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          alignItems: 'center',
          gap: 13,
        }}
      >
        <span
          style={{
            width: 42,
            height: 42,
            flex: 'none',
            borderRadius: 14,
            background: 'var(--color-accent-100)',
            color: 'var(--color-accent-700)',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <FileText size={21} strokeWidth={2.6} />
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', fontFamily: 'var(--font-heading)', fontSize: 17, lineHeight: 1.15 }}>
            Plan de apertura
          </span>
          <span
            className="mrl-prose"
            style={{ display: 'block', fontSize: 12.3, lineHeight: 1.4, color: text(70), marginTop: 2 }}
          >
            {licensed
              ? 'Tu documento para el banco, un socio o el arrendador · se actualiza con tus datos'
              : 'Documento para el banco o un socio · se abre con el pago único'}
          </span>
        </span>
        <ChevronRight size={18} strokeWidth={2.9} color="var(--color-accent-700)" style={{ flex: 'none' }} />
      </button>

      <PuntosExtra courses={courses} licensed={licensed} onOpen={(module) => onGo({ tab: 'ruta', module })} />

      {/* Hoy toca: la lección de hoy, con sus minutos y la proyección de fecha. */}
      <div
        style={{
          background: 'var(--color-accent)',
          color: 'var(--on-accent)',
          borderRadius: RADIUS.card,
          padding: 18,
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', opacity: 0.85 }}>
            Hoy toca
          </span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '3px 9px',
              borderRadius: RADIUS.pill,
              background: 'color-mix(in srgb, #fff 22%, transparent)',
              fontSize: 10.5,
              fontWeight: 700,
            }}
          >
            <Clock size={11} strokeWidth={2.9} />
            {nextLesson.m} min
          </span>
        </div>
        <H size={21} style={{ lineHeight: 1.15, color: 'var(--on-accent)' }}>
          {diagnosis.nextStep.title}
        </H>
        <p className="mrl-prose" style={{ margin: '6px 0 12px', fontSize: 13, opacity: 0.92, lineHeight: 1.45 }}>
          {diagnosis.nextStep.body}
        </p>
        <Button variant="light" height={44} onClick={() => onGo(diagnosis.nextStep.target)}>
          Abrir la lección
        </Button>
        {pace ? (
          <p
            className="mrl-prose"
            style={{
              margin: '12px 0 0',
              paddingTop: 11,
              borderTop: '1px solid color-mix(in srgb, #fff 28%, transparent)',
              fontSize: 12,
              lineHeight: 1.45,
              opacity: 0.92,
            }}
          >
            {pace}
          </p>
        ) : null}
      </div>

      {/* Las dos cifras de cabecera, como en el diseño: tarjetas claras. */}
      <div className="mrl-duo">
        <button
          type="button"
          onClick={() => (can.budget ? onGo({ tab: 'numeros', view: 'presupuesto' }) : onOpenPaywall())}
          style={{
            textAlign: 'left',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            background: 'var(--color-surface)',
            color: 'var(--color-text)',
            borderRadius: RADIUS.block,
            padding: 16,
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', color: text(55) }}>
            Inversión vs presupuesto
          </div>
          <div
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: can.showsInvestmentFigures ? 22 : 15,
              marginTop: 6,
              lineHeight: 1.2,
              color: can.showsInvestmentFigures ? 'var(--color-text)' : 'var(--color-accent-800)',
            }}
          >
            {can.showsInvestmentFigures ? money(invest.total) : INVESTMENT_HIDDEN_LABEL}
          </div>
          <div style={{ fontSize: 11.5, color: text(58) }}>Inversión estimada</div>
          <div
            style={{
              marginTop: 10,
              height: 7,
              borderRadius: RADIUS.pill,
              background: 'var(--color-neutral-300)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${can.showsInvestmentFigures ? invest.usedPct : 22}%`,
                height: '100%',
                borderRadius: RADIUS.pill,
                background: invest.exceeded ? 'var(--color-accent-700)' : 'var(--color-accent-2-500)',
                transition: 'width .3s ease',
              }}
            />
          </div>
          <div
            style={{
              marginTop: 6,
              fontSize: 11.5,
              fontWeight: 700,
              color: invest.exceeded ? 'var(--color-accent-800)' : 'var(--color-accent-2-800)',
            }}
          >
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
            borderRadius: RADIUS.block,
            padding: 16,
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', color: text(55) }}>
            Punto de equilibrio
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 22, marginTop: 6 }}>{money(be.dailySales)}</div>
          <div style={{ fontSize: 11.5, color: text(58) }}>Ventas por día</div>
          <div
            style={{
              marginTop: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--color-accent-700)',
            }}
          >
            <BarChart3 size={15} strokeWidth={2.75} />
            {fixed > 0 ? `${be.ticketsPerDay} tickets al día` : 'Captura tus gastos fijos'}
          </div>
        </button>
      </div>

      {/* La plantilla de ejemplo sigue cargada: se edita o se limpia. */}
      {exampleOn ? (
        <div style={{ padding: '16px 18px', borderRadius: RADIUS.card, background: 'var(--color-accent-2-100)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span
              style={{
                padding: '3px 10px',
                borderRadius: RADIUS.pill,
                background: 'var(--color-accent-2-200)',
                color: 'var(--color-accent-2-900)',
                fontSize: 10,
                fontWeight: 800,
              }}
            >
              Ejemplo
            </span>
            <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-accent-2-900)' }}>
              Llenamos tu proyecto con un ejemplo
            </span>
          </div>
          <p
            className="mrl-prose"
            style={{ margin: '7px 0 12px', fontSize: 12.8, lineHeight: 1.5, color: 'var(--color-accent-2-900)' }}
          >
            Hay 3 platillos costeados, un presupuesto de apertura y gastos fijos de una cafetería real. Sirven para que
            veas cómo se ve todo funcionando. Edítalos con tus datos o empieza en blanco.
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Button height={44} style={{ flex: 1, minWidth: 190, fontSize: 13.5 }} onClick={onKeepExample}>
              Los edito con mis datos
            </Button>
            <Button variant="secondary" height={44} style={{ paddingInline: 16, fontSize: 13.5 }} onClick={onClearExample}>
              Empezar en blanco
            </Button>
          </div>
        </div>
      ) : null}

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
