'use client';

import { useState } from 'react';
import { ArrowLeft, Bike, Check, ChevronDown, ChevronRight, Lock, Megaphone, Star } from 'lucide-react';
import { ROUTE_MODULES, SKIP_REASONS } from '@/content/route';
import { projectProgress, progressWithoutModule, type ModuleProgress, type RouteTask } from '@/domain/progress';
import {
  routeTaskAccess,
  SAMPLE_COURSE_HINT,
  SAMPLE_COURSE_TITLE,
  SAMPLE_LABEL,
  SAMPLE_MODULE_HINT,
  type AccessLevel,
  type TaskAccess,
} from '@/domain/access';
import type { ProjectState } from '@/domain/projectState';
import { Button, Card, Field, H, Muted, ProgressBar, RADIUS, Row, text } from '@/components/ui';
import { Lesson } from '../ruta/Lesson';
import { Etapas } from '../ruta/Etapas';
import { ListaModulos } from '../ruta/ListaModulos';
import { moduleIcon } from '../ruta/moduleIcons';

type SkipFlow = { moduleId: string; step: 'motivo' | 'confirmar'; reason: string } | null;

/** El icono de tres trazos del módulo. */
function IconoModulo({ id }: { id: string }) {
  const [d1, d2, d3] = moduleIcon(id);
  return (
    <svg width={23} height={23} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d1} />
      <path d={d2} />
      <path d={d3} />
    </svg>
  );
}

/** Mi Ruta: 14 módulos, 90 lecciones. */
export function Ruta({
  state,
  level,
  moduleId,
  openTaskKey,
  formOpen,
  onSelectModule,
  onOpenProject,
  onToggleTask,
  onSkipModule,
  onRestoreModule,
  onAddTask,
  onDeleteTask,
  onOpenTask,
  onOpenPaywall,
  onOpenOverview,
  onOpenTool,
}: {
  state: ProjectState;
  level: AccessLevel;
  /** Módulo abierto, o null cuando se ven las etapas o la lista completa. */
  moduleId: string | null;
  openTaskKey: string | null;
  formOpen: boolean;
  onSelectModule: (id: string | null) => void;
  /** Abre los datos del proyecto desde el rótulo del encabezado. */
  onOpenProject: () => void;
  onToggleTask: (key: string) => void;
  onSkipModule: (id: string, reason: string) => void;
  onRestoreModule: (id: string) => void;
  onAddTask: (moduleId: string, title: string, hint: string) => void;
  onDeleteTask: (id: string) => void;
  onOpenTask: (key: string | null) => void;
  onOpenPaywall: () => void;
  onOpenOverview: () => void;
  /** Abre la herramienta que acompaña a un curso. */
  onOpenTool: (tool: 'delivery' | 'anuncios') => void;
}) {
  const [skipFlow, setSkipFlow] = useState<SkipFlow>(null);
  const [showForm, setShowForm] = useState(formOpen);
  const [title, setTitle] = useState('');
  const [hint, setHint] = useState('');
  // Vista de lista completa; con moduleId en null la alterna con las etapas.
  const [lista, setLista] = useState(false);
  const [stageOpen, setStageOpen] = useState<string | null>(null);

  const progress = projectProgress({
    modules: ROUTE_MODULES,
    done: state.done,
    skipped: state.skipped,
    extraTasks: state.extraTasks,
  });
  const current = progress.modules.find((m) => m.id === moduleId);

  const abrirModulo = (id: string) => {
    onSelectModule(id);
    onOpenTask(null);
    setLista(false);
  };

  // ── Etapas y lista completa: las dos vistas sin módulo abierto ──────────
  if (!current) {
    return (
      <div className="mrl-measure" style={{ padding: '18px 20px' }}>
        <Encabezado
          titulo="Mi ruta"
          bajada="Tu plan paso a paso para abrir tu restaurante."
          proyecto={state.project.name}
          onOpenProject={onOpenProject}
        />
        <div style={{ marginTop: 18 }}>
          {lista ? (
            <ListaModulos
              progress={progress}
              level={level}
              done={state.done}
              onSelect={abrirModulo}
              onBack={() => setLista(false)}
            />
          ) : (
            <Etapas
              progress={progress}
              level={level}
              stageOpen={stageOpen}
              onToggleStage={setStageOpen}
              onSelectModule={abrirModulo}
              onOpenList={() => setLista(true)}
              onOpenNext={() => {
                const siguiente = progress.nextTask;
                if (!siguiente) return;
                onSelectModule(siguiente.moduleId);
                onOpenTask(siguiente.key);
                setLista(false);
              }}
            />
          )}
        </div>
      </div>
    );
  }

  // ── Un módulo abierto: sus lecciones ───────────────────────────────────
  return (
    <div className="mrl-measure" style={{ padding: '18px 20px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 14 }}>
      <button
        type="button"
        onClick={() => {
          onSelectModule(null);
          onOpenTask(null);
        }}
        className="mrl-hit"
        style={{
          justifySelf: 'start',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 7,
          padding: '10px 4px',
          border: 'none',
          background: 'none',
          color: 'var(--color-accent-700)',
          fontFamily: 'var(--font-body)',
          fontSize: 13.5,
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        <ArrowLeft size={15} strokeWidth={3} />
        Mi ruta
      </button>

      <ModuleCard
        module={current}
        onSkip={() => setSkipFlow({ moduleId: current.id, step: 'motivo', reason: SKIP_REASONS[0] })}
        onRestore={() => onRestoreModule(current.id)}
      />

      {/* Aviso de muestra: distinto para un módulo de ruta que para un curso. */}
      <SampleNotice level={level} module={current} onOpenPaywall={onOpenPaywall} />

      {/*
        Dos cursos traen su herramienta. Se ofrece aquí, junto a las lecciones
        que la explican, no sólo enterrada en Más.
      */}
      <ModuleTool moduleId={current.id} onOpen={onOpenTool} />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 10 }}>
        {current.tasks.map((task, index) => {
          const access = routeTaskAccess(level, current.id, index);
          return (
            <TaskCard
              key={task.key}
              task={task}
              index={index}
              total={current.tasks.length}
              access={access}
              done={!!state.done[task.key]}
              open={openTaskKey === task.key}
              onOpen={() => onOpenTask(openTaskKey === task.key ? null : task.key)}
              onToggle={() => onToggleTask(task.key)}
              onOpenPaywall={onOpenPaywall}
              onDelete={task.customId ? () => onDeleteTask(task.customId as string) : undefined}
            />
          );
        })}
      </div>

      {showForm ? (
        <Card style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 12 }}>
          <H size={16}>Agregar tarea a {current.name}</H>
          <Field label="Qué tienes que hacer" value={title} onChange={setTitle} placeholder="Ej. Cotizar el letrero" />
          <Field label="Pista corta (opcional)" value={hint} onChange={setHint} placeholder="Con dos proveedores" />
          <Row gap={10}>
            <Button variant="secondary" onClick={() => setShowForm(false)}>
              Cancelar
            </Button>
            <Button
              disabled={!title.trim()}
              onClick={() => {
                onAddTask(current.id, title.trim(), hint.trim());
                setTitle('');
                setHint('');
                setShowForm(false);
              }}
            >
              Agregar
            </Button>
          </Row>
        </Card>
      ) : (
        <Button variant="secondary" onClick={() => setShowForm(true)}>
          Agregar tarea a este módulo
        </Button>
      )}

      {skipFlow ? (
        <SkipDialog
          flow={skipFlow}
          state={state}
          onChange={setSkipFlow}
          onConfirm={() => {
            onSkipModule(skipFlow.moduleId, skipFlow.reason);
            setSkipFlow(null);
          }}
          onCancel={() => setSkipFlow(null)}
        />
      ) : null}
    </div>
  );
}

/**
 * Encabezado de Mi Ruta: título, bajada y el rótulo del proyecto, que abre
 * sus datos. En el prototipo el rótulo es un selector de restaurante; aquí
 * cada cuenta tiene un proyecto, así que lleva a editarlo.
 */
function Encabezado({
  titulo,
  bajada,
  proyecto,
  onOpenProject,
}: {
  titulo: string;
  bajada: string;
  proyecto: string;
  onOpenProject: () => void;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <H size={27}>{titulo}</H>
        <p style={{ margin: '5px 0 0', fontSize: 14, color: 'var(--color-text-2)' }}>{bajada}</p>
      </div>
      <button
        type="button"
        onClick={onOpenProject}
        style={{
          flex: 'none',
          minHeight: 44,
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          padding: '11px 13px',
          border: '1px solid var(--color-border)',
          borderRadius: RADIUS.inner,
          background: 'var(--color-surface)',
          cursor: 'pointer',
          fontFamily: 'var(--font-body)',
          color: 'var(--color-text)',
          maxWidth: '52%',
        }}
      >
        <svg width={19} height={19} style={{ flex: 'none' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M4 9.5 5.5 4h13L20 9.5" />
          <path d="M4 9.5a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0M5.5 11.5V20h13v-8.5M10 20v-5h4v5" />
        </svg>
        <span style={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {proyecto}
        </span>
        <ChevronDown size={15} strokeWidth={2.8} style={{ flex: 'none', color: 'var(--color-text-2)' }} />
      </button>
    </div>
  );
}

/** Tarjeta del módulo activo: nombre, descripción, avance y el botón de omitir. */
function ModuleCard({
  module,
  onSkip,
  onRestore,
}: {
  module: ModuleProgress;
  onSkip: () => void;
  onRestore: () => void;
}) {
  return (
    <Card style={module.course ? { borderColor: 'var(--color-accent-2-300)' } : undefined}>
      {module.course ? (
        <Row gap={7} style={{ marginBottom: 8 }}>
          <Star size={13} fill="currentColor" strokeWidth={2.6} color="var(--color-accent-2-600)" />
          <span
            style={{
              fontSize: 10.5,
              letterSpacing: '.09em',
              textTransform: 'uppercase',
              fontWeight: 800,
              color: 'var(--color-accent-2-700)',
            }}
          >
            Punto extra · Mini curso
          </span>
        </Row>
      ) : null}

      <Row gap={12} align="flex-start">
        <span
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: module.course ? 'var(--color-accent-2-100)' : 'var(--color-accent-100)',
            color: module.course ? 'var(--color-accent-2-700)' : 'var(--color-accent-600)',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
          }}
        >
          <IconoModulo id={module.id} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <H size={19}>{module.name}</H>
          <Muted size={12.5} style={{ marginTop: 3 }}>
            {module.desc}
          </Muted>
          <Row gap={10} style={{ marginTop: 12 }}>
            <span style={{ flex: 1, minWidth: 0 }}>
              <ProgressBar pct={module.skipped ? 0 : module.pct} />
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-accent-700)' }}>
              {module.skipped ? 'omitido' : `${module.pct}%`}
            </span>
          </Row>
        </div>
      </Row>

      {module.skipped ? (
        <div style={{ marginTop: 14 }}>
          <Muted size={12.5}>Motivo: {module.reason}</Muted>
          <div style={{ marginTop: 10 }}>
            <Button variant="secondary" onClick={onRestore}>
              Reactivar este módulo
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={onSkip}
          style={{
            marginTop: 12,
            border: 'none',
            background: 'transparent',
            padding: 0,
            color: text(55),
            fontSize: 12.5,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
          }}
        >
          No usaré este módulo
        </button>
      )}
    </Card>
  );
}

/** Los dos cursos que tienen herramienta, y cómo se anuncia cada una. */
const MODULE_TOOLS: Record<string, { tool: 'delivery' | 'anuncios'; title: string; body: string; cta: string }> = {
  delivery: {
    tool: 'delivery',
    title: 'Saca tus números de delivery',
    body: 'Con lo que aprendes en este curso, la calculadora te dice cuánto te queda por pedido después de la comisión y a cuánto deberías vender en la app.',
    cta: 'Abrir la calculadora de delivery',
  },
  ventas: {
    tool: 'anuncios',
    title: 'Revisa tu anuncio con números',
    body: 'Cuando ya tengas un anuncio corriendo, captura aquí los cinco datos del Administrador de Meta y te digo si deja dinero y qué cambiar primero.',
    cta: 'Abrir el analizador de anuncios',
  },
};

/** La herramienta que acompaña al curso, ofrecida junto a sus lecciones. */
function ModuleTool({
  moduleId,
  onOpen,
}: {
  moduleId: string;
  onOpen: (tool: 'delivery' | 'anuncios') => void;
}) {
  const entry = MODULE_TOOLS[moduleId];
  if (!entry) return null;

  return (
    <Card style={{ background: 'var(--color-neutral-200)' }}>
      <Row gap={11} align="flex-start">
        <span
          style={{
            width: 38,
            height: 38,
            flex: 'none',
            borderRadius: 13,
            display: 'grid',
            placeItems: 'center',
            background: 'var(--color-accent)',
            color: 'var(--color-bg)',
          }}
        >
          {entry.tool === 'delivery' ? (
            <Bike size={19} strokeWidth={2.6} />
          ) : (
            <Megaphone size={19} strokeWidth={2.6} />
          )}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14.5, fontWeight: 800 }}>{entry.title}</div>
          <p className="mrl-prose" style={{ margin: '4px 0 0', fontSize: 12.6, lineHeight: 1.5, color: text(70) }}>
            {entry.body}
          </p>
        </div>
      </Row>
      <div style={{ marginTop: 12 }}>
        <Button variant="secondary" onClick={() => onOpen(entry.tool)}>
          {entry.cta}
        </Button>
      </div>
    </Card>
  );
}

/**
 * Aviso de "muestra gratis" al pie del módulo. El texto del prototipo cambia
 * según sea un módulo de la ruta o uno de los cuatro mini cursos.
 */
function SampleNotice({
  level,
  module,
  onOpenPaywall,
}: {
  level: AccessLevel;
  module: ModuleProgress;
  onOpenPaywall: () => void;
}) {
  if (routeTaskAccess(level, module.id, 0) !== 'muestra') return null;

  return (
    <Card style={{ background: 'var(--color-accent-2-100)' }}>
      <Row gap={10} align="flex-start">
        <span
          style={{
            width: 22,
            height: 22,
            flex: 'none',
            borderRadius: '50%',
            background: 'var(--color-accent-2-600)',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <Check size={13} strokeWidth={3} color="var(--color-bg)" />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          {module.course ? (
            <>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-accent-2-800)' }}>
                {SAMPLE_COURSE_TITLE}
              </div>
              <p
                className="mrl-prose"
                style={{ margin: '5px 0 0', fontSize: 12.4, lineHeight: 1.45, color: 'var(--color-accent-2-800)' }}
              >
                {SAMPLE_COURSE_HINT}
              </p>
            </>
          ) : (
            <span style={{ fontSize: 12.5, color: 'var(--color-accent-2-800)' }}>{SAMPLE_MODULE_HINT}</span>
          )}
        </div>
      </Row>
      <div style={{ marginTop: 12 }}>
        <Button onClick={onOpenPaywall}>Ver el pago único</Button>
      </div>
    </Card>
  );
}

function TaskCard({
  task,
  index,
  total,
  access,
  done,
  open,
  onOpen,
  onToggle,
  onOpenPaywall,
  onDelete,
}: {
  task: RouteTask;
  index: number;
  total: number;
  access: TaskAccess;
  done: boolean;
  open: boolean;
  onOpen: () => void;
  onToggle: () => void;
  onOpenPaywall: () => void;
  onDelete?: () => void;
}) {
  const locked = access === 'bloqueada';

  return (
    <Card radius={RADIUS.block} style={{ padding: 14 }}>
      <Row gap={12} align="flex-start">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (!locked) onToggle();
          }}
          aria-label={done ? 'Marcar como pendiente' : 'Marcar como completada'}
          className="mrl-inline mrl-hit"
          style={{
            width: 28,
            height: 28,
            borderRadius: RADIUS.pill,
            border: `2px solid ${done ? 'var(--color-accent-2-600)' : 'var(--color-neutral-400)'}`,
            background: done ? 'var(--color-accent-2-600)' : 'transparent',
            display: 'grid',
            placeItems: 'center',
            cursor: locked ? 'not-allowed' : 'pointer',
            flexShrink: 0,
            animation: done ? 'mrlPop .2s ease' : undefined,
          }}
        >
          {done ? <Check size={16} color="#fff" strokeWidth={3} /> : null}
        </button>

        <button
          type="button"
          onClick={onOpen}
          aria-expanded={open}
          style={{
            flex: 1,
            minWidth: 0,
            textAlign: 'left',
            border: 'none',
            background: 'transparent',
            padding: 0,
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            color: 'var(--color-text)',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: 14.5,
                fontWeight: 700,
                textDecoration: done ? 'line-through' : 'none',
                opacity: done ? 0.55 : 1,
              }}
            >
              {task.title}
            </span>
            {access === 'muestra' ? (
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: RADIUS.pill,
                  background: 'var(--color-accent-2-100)',
                  color: 'var(--color-accent-2-800)',
                  fontSize: 10.5,
                  fontWeight: 800,
                }}
              >
                {SAMPLE_LABEL}
              </span>
            ) : null}
            {locked ? <Lock size={13} strokeWidth={2.8} color={text(45)} /> : null}
          </span>
          <Muted size={12.5} style={{ marginTop: 2 }}>
            {task.hint}
          </Muted>
        </button>

        <ChevronDown
          size={18}
          strokeWidth={2.6}
          color={text(45)}
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s ease', flexShrink: 0 }}
        />
      </Row>

      {open ? (
        <Lesson
          title={task.title}
          why={task.why}
          next={task.next}
          index={index}
          total={total}
          access={access}
          done={done}
          onToggle={onToggle}
          onOpenPaywall={onOpenPaywall}
          onDelete={onDelete}
        />
      ) : null}
    </Card>
  );
}

/** Flujo de omisión en 3 pasos, obligatorio en ese orden (README § 1.6). */
function SkipDialog({
  flow,
  state,
  onChange,
  onConfirm,
  onCancel,
}: {
  flow: NonNullable<SkipFlow>;
  state: ProjectState;
  onChange: (flow: SkipFlow) => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const module = ROUTE_MODULES.find((m) => m.id === flow.moduleId);
  const simulated = progressWithoutModule(
    { modules: ROUTE_MODULES, done: state.done, skipped: state.skipped, extraTasks: state.extraTasks },
    flow.moduleId,
  );

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 55,
        background: 'rgba(0,0,0,.35)',
        display: 'flex',
        alignItems: 'flex-end',
      }}
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          background: flow.step === 'confirmar' ? 'var(--color-accent-100)' : 'var(--color-surface)',
          borderRadius: `${RADIUS.sheet}px ${RADIUS.sheet}px 0 0`,
          padding: '22px 20px 28px',
          animation: 'mrlUp .22s ease both',
          maxHeight: '86%',
          overflowY: 'auto',
        }}
      >
        {flow.step === 'motivo' ? (
          <>
            <H size={19}>¿Por qué no usarás {module?.name}?</H>
            <Muted size={13} style={{ marginTop: 6 }}>
              Nos sirve para no volver a recomendártelo.
            </Muted>
            <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 8 }}>
              {SKIP_REASONS.map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => onChange({ ...flow, reason })}
                  style={{
                    textAlign: 'left',
                    padding: '13px 16px',
                    borderRadius: RADIUS.pill,
                    border: `1.5px solid ${flow.reason === reason ? 'var(--color-accent)' : 'var(--color-divider)'}`,
                    background: flow.reason === reason ? 'var(--color-accent-100)' : 'transparent',
                    color: 'var(--color-text)',
                    fontSize: 14,
                    fontWeight: flow.reason === reason ? 700 : 500,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {reason}
                </button>
              ))}
            </div>
            <Row gap={10} style={{ marginTop: 16 }}>
              <Button variant="secondary" height={46} onClick={onCancel}>
                Cancelar
              </Button>
              <Button height={46} onClick={() => onChange({ ...flow, step: 'confirmar' })}>
                Continuar
              </Button>
            </Row>
          </>
        ) : (
          <>
            <H size={19}>¿Seguro que quieres quitar este módulo?</H>
            <Muted size={13.5} style={{ marginTop: 8, color: 'var(--color-accent-900)' }}>
              Sacaremos sus {simulated.removedTasks} tareas de tu avance. Motivo: {flow.reason}. Tu avance quedaría en{' '}
              {simulated.pct}%.
            </Muted>
            <Row gap={10} style={{ marginTop: 18 }}>
              <Button variant="secondary" height={46} onClick={onCancel}>
                No
              </Button>
              <Button height={46} onClick={onConfirm}>
                Sí, quitarlo
              </Button>
            </Row>
          </>
        )}
      </div>
    </div>
  );
}
