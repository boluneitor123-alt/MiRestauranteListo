'use client';

import { ArrowRight, ChevronRight, FileText, Sprout, TriangleAlert } from 'lucide-react';
import type { Diagnosis, Target } from '@/domain/diagnosis';
import { breakeven, fixedExpensesTotal } from '@/domain/finance';
import { dishMetrics } from '@/domain/costing';
import { menuAggregates } from '@/domain/aggregates';
import { money, pct as pctLabel } from '@/domain/format';
import { semaphoreLevel } from '@/domain/semaphore';
import { paceProjection, stageLabel } from '@/domain/progress';
import { getLesson } from '@/content/lessons';
import { DEMO_DISHES } from '@/content/demo';
import { ETAPAS } from '@/content/route';
import type { ProjectState } from '@/domain/projectState';
import { Button, Card, H, Muted, ProgressBar, RADIUS, Row, text } from '@/components/ui';
import { Chrome } from '../inicio/Chrome';
import { Encabezado } from '../inicio/Encabezado';
import { SiguientePaso } from '../inicio/SiguientePaso';
import { HerramientasRapidas } from '../inicio/HerramientasRapidas';
import { TareasDeTuRuta } from '../inicio/TareasDeTuRuta';
import { keyResults, ResultadosClave } from '../inicio/ResultadosClave';
import { PuntosExtra } from '../inicio/PuntosExtra';

/** Los platillos de la plantilla, para reconocer que el ejemplo sigue puesto. */
const DEMO_DISH_IDS = new Set(DEMO_DISHES.map((d) => d.id));

const FOOD_COST_COLOR = {
  saludable: 'var(--color-accent-2-700)',
  revisar: 'var(--color-warn-700)',
  peligroso: 'var(--color-danger-700)',
  'sin-precio': 'var(--color-neutral-600)',
} as const;

/** Tablero de Inicio (README § 1.5, entrega-v2 § "Inicio"). */
export function Inicio({
  state,
  diagnosis,
  licensed,
  trial,
  startedAt,
  hasAlerts,
  onGo,
  onOpenProfile,
  onOpenAlerts,
  onOpenProject,
  onOpenPaywall,
  onOpenDoc,
  onNewDish,
  onKeepExample,
  onClearExample,
}: {
  state: ProjectState;
  diagnosis: Diagnosis;
  /** Pagó. Decide el documento y el texto del botón de los cursos. */
  licensed: boolean;
  /** Días que le quedan de prueba. `null` con licencia: el aviso desaparece. */
  trial: { daysLeft: number; expired: boolean } | null;
  /** Cuándo empezó a usar la app. Alimenta la proyección de fecha de apertura. */
  startedAt: number | null;
  /** Hay una alerta que merece el punto naranja de la campana. */
  hasAlerts: boolean;
  onGo: (target: Target) => void;
  onOpenProfile: () => void;
  onOpenAlerts: () => void;
  /** Abre los datos del proyecto desde el rótulo del encabezado. */
  onOpenProject: () => void;
  onOpenPaywall: () => void;
  /** Abre el Plan de apertura imprimible. */
  onOpenDoc: () => void;
  onNewDish: (id?: string) => void;
  onKeepExample: () => void;
  onClearExample: () => void;
}) {
  const name = (state.profile.name || 'Tu proyecto').split(' ')[0];
  const fixed = fixedExpensesTotal(state.fixed);
  const be = breakeven({
    fixedExpenses: fixed,
    grossMargin: state.margin,
    ticket: state.ticket,
    ownerGoal: state.ownerGoal,
    hours: state.hours,
    closedOneDay: state.closedOneDay,
  });
  // Costo y margen promedio de la carta: sólo cuentan los platillos con precio.
  const conPrecio = state.dishes
    .map((d) => dishMetrics(d, { subrecipes: state.subrecipes }))
    .filter((m) => m.hasPrice);
  const costoPromedio = conPrecio.length
    ? conPrecio.reduce((a, m) => a + m.costPerPortion, 0) / conPrecio.length
    : 0;
  const carta = menuAggregates(state.dishes, { subrecipes: state.subrecipes });
  const recent = state.dishes.slice(-6).reverse();
  const courses = diagnosis.progress.modules.filter((m) => m.course);
  const nextLesson = getLesson(diagnosis.nextStep.title);
  // El ejemplo de la plantilla sigue cargado y todavía no decide qué hacer con él.
  const exampleOn = !state.settings.exampleHidden && state.dishes.some((d) => DEMO_DISH_IDS.has(d.id));
  // La proyección la ve todo el mundo, haya pagado o no.
  const pace = startedAt
    ? paceProjection({
        pending: diagnosis.progress.total - diagnosis.progress.done,
        done: diagnosis.progress.done,
        startedAt,
        now: Date.now(),
      })
    : null;

  return (
    <div
      className="mrl-measure"
      style={{ padding: '18px 20px 20px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 22 }}
    >
      <Chrome
        initial={name.slice(0, 1).toUpperCase()}
        hasAlerts={hasAlerts}
        onOpenAlerts={onOpenAlerts}
        onOpenProfile={onOpenProfile}
      />

      <Encabezado
        titulo={<>¡Hola, {name}! 👋</>}
        bajada="Sigamos construyendo tu restaurante."
        proyecto={state.project.name}
        onOpenProject={onOpenProject}
      />

      {trial ? <AvisoDePrueba trial={trial} onOpenPaywall={onOpenPaywall} /> : null}

      <SiguientePaso
        titulo={diagnosis.nextStep.title}
        cuerpo={diagnosis.nextStep.body}
        minutos={`${nextLesson.m} min`}
        etapa={stageLabel(ETAPAS, diagnosis.progress.nextTask)}
        pct={diagnosis.progress.pct}
        ritmo={pace}
        onContinue={() => onGo(diagnosis.nextStep.target)}
      />

      <HerramientasRapidas onGo={onGo} />

      <TareasDeTuRuta
        progress={diagnosis.progress}
        done={state.done}
        onGo={onGo}
        onOpenTask={(module, task) => onGo({ tab: 'ruta', module, task })}
      />

      <ResultadosClave
        rows={keyResults({
          ticketsPerDay: be.ticketsPerDay,
          monthlySales: be.monthlySales,
          ticket: state.ticket,
          averageCost: costoPromedio,
          pricedDishes: conPrecio.length,
          margin: carta.suggestedMargin ?? 0,
        })}
      />

      <NoOlvides recomendaciones={diagnosis.recommendations.slice(0, 3)} onGo={onGo} />

      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '0 2px 11px' }}>
          <Sprout size={17} strokeWidth={2.6} style={{ flex: 'none', color: 'var(--color-accent-2-600)' }} />
          <h4 style={{ margin: 0, fontSize: 19, flex: 1, letterSpacing: '-.01em', fontFamily: 'var(--font-heading)' }}>
            Haz crecer tu restaurante
          </h4>
          <span style={{ fontSize: 12.5, color: 'var(--color-text-2)', whiteSpace: 'nowrap' }}>
            {courses.reduce((a, c) => a + c.total, 0)} lecciones
          </span>
        </div>
        <PuntosExtra courses={courses} licensed={licensed} onOpen={(module) => onGo({ tab: 'ruta', module })} />
      </div>

      {exampleOn ? <AvisoDeEjemplo onKeep={onKeepExample} onClear={onClearExample} /> : null}

      {/* El documento que se lleva al banco. Con licencia abre; sin ella, al pago. */}
      <button
        type="button"
        onClick={licensed ? onOpenDoc : onOpenPaywall}
        style={{
          width: '100%',
          textAlign: 'left',
          padding: '17px 19px',
          borderRadius: RADIUS.card,
          border: '1px solid var(--color-accent-300)',
          cursor: 'pointer',
          fontFamily: 'var(--font-body)',
          background: 'var(--color-surface)',
          color: 'var(--color-text)',
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
            style={{ display: 'block', fontSize: 12.3, lineHeight: 1.4, color: 'var(--color-text-2)', marginTop: 2 }}
          >
            {licensed
              ? 'Tu documento para el banco, un socio o el arrendador · se actualiza con tus datos'
              : 'Documento para el banco o un socio · se abre con el pago único'}
          </span>
        </span>
        <ChevronRight size={18} strokeWidth={2.9} color="var(--color-accent-700)" style={{ flex: 'none' }} />
      </button>

      <div>
        <H size={19} style={{ margin: '0 2px 11px' }}>
          Progreso por módulo
        </H>
        <Card style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 11 }}>
          {diagnosis.progress.modules.map((module) => (
            <Row key={module.id} gap={10}>
              <span style={{ flex: '0 1 104px', minWidth: 0, fontSize: 13.5 }}>{module.name}</span>
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
          <H size={19} style={{ margin: '0 2px 11px' }}>
            Últimos platillos costeados
          </H>
          <div className="mrl-scroll" style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
            {recent.map((dish) => {
              const m = dishMetrics(dish, { subrecipes: state.subrecipes }, { targetFoodCost: state.fcTarget });
              return (
                <button
                  key={dish.id}
                  type="button"
                  onClick={() => onNewDish(dish.id)}
                  style={{
                    flex: 'none',
                    width: 150,
                    textAlign: 'left',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: RADIUS.block,
                    padding: 14,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                    color: 'var(--color-text)',
                  }}
                >
                  <div style={{ fontSize: 13.5, fontWeight: 700, lineHeight: 1.2 }}>{dish.name}</div>
                  <Muted size={11.5} style={{ marginTop: 2 }}>
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
    </div>
  );
}

/** El aviso de la prueba, que lleva al pago único. */
function AvisoDePrueba({
  trial,
  onOpenPaywall,
}: {
  trial: { daysLeft: number; expired: boolean };
  onOpenPaywall: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpenPaywall}
      style={{
        width: '100%',
        border: 'none',
        textAlign: 'left',
        background: 'var(--color-accent-100)',
        borderRadius: RADIUS.inner,
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
  );
}

/** "No olvides esto": las alertas del mentor, con su acción a la derecha. */
function NoOlvides({
  recomendaciones,
  onGo,
}: {
  recomendaciones: Diagnosis['recommendations'];
  onGo: (target: Target) => void;
}) {
  if (!recomendaciones.length) return null;

  return (
    <div>
      <H size={19} style={{ margin: '0 2px 11px' }}>
        No olvides esto
      </H>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {recomendaciones.map((rec) => (
          <div
            key={rec.id}
            style={{
              padding: '14px 15px',
              border: '1px solid var(--color-border)',
              borderRadius: RADIUS.block,
              background: 'var(--color-surface)',
            }}
          >
            {/*
              Se envuelve a propósito: nuestras llamadas a la acción son más
              largas que las del prototipo ("Costear mi primer platillo" contra
              "Ver el cálculo") y en línea le comen el ancho al título.
            */}
            <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <span
                style={{
                  display: 'grid',
                  placeItems: 'center',
                  width: 34,
                  height: 34,
                  flex: 'none',
                  borderRadius: 11,
                  background: rec.severity === 'alta' ? 'var(--color-accent-100)' : 'var(--color-neutral-200)',
                  color: rec.severity === 'alta' ? 'var(--color-accent-800)' : 'var(--color-text-2)',
                }}
              >
                <TriangleAlert size={17} strokeWidth={2.75} />
              </span>
              <div style={{ flex: 1, minWidth: 150 }}>
                <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.25 }}>{rec.title}</div>
                <div style={{ fontSize: 12.5, marginTop: 3, lineHeight: 1.4, color: 'var(--color-text-2)' }}>
                  {rec.body}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onGo(rec.target)}
                className="mrl-hit"
                style={{
                  flex: 'none',
                  marginLeft: 45,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  border: 'none',
                  background: 'none',
                  padding: '10px 0',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: 'var(--color-accent-600)',
                }}
              >
                {rec.cta}
                <ArrowRight size={13} strokeWidth={3} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** La plantilla de ejemplo sigue cargada: se edita o se limpia. */
function AvisoDeEjemplo({ onKeep, onClear }: { onKeep: () => void; onClear: () => void }) {
  return (
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
        Hay 3 platillos costeados, un presupuesto de apertura y gastos fijos de una cafetería real. Sirven para que veas
        cómo se ve todo funcionando. Edítalos con tus datos o empieza en blanco.
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Button height={44} style={{ flex: 1, minWidth: 190, fontSize: 13.5 }} onClick={onKeep}>
          Los edito con mis datos
        </Button>
        <Button variant="secondary" height={44} style={{ paddingInline: 16, fontSize: 13.5 }} onClick={onClear}>
          Empezar en blanco
        </Button>
      </div>
    </div>
  );
}
