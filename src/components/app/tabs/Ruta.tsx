'use client';

import { useState } from 'react';
import { Check, ChevronDown, Lock, Star, Target as TargetIcon } from 'lucide-react';
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
import { RouteMenus, type MenuOpen } from '../ruta/RouteMenus';
import { Lesson } from '../ruta/Lesson';

type SkipFlow = { moduleId: string; step: 'motivo' | 'confirmar'; reason: string } | null;

/** Token de color de un módulo, listo para CSS. */
const cv = (col: string) => `var(--color-${col || 'accent-500'})`;

/** Mi Ruta: 14 módulos, 90 lecciones. */
export function Ruta({
  state,
  level,
  moduleId,
  openTaskKey,
  formOpen,
  onSelectModule,
  onToggleTask,
  onSkipModule,
  onRestoreModule,
  onAddTask,
  onDeleteTask,
  onOpenTask,
  onOpenPaywall,
  onOpenOverview,
}: {
  state: ProjectState;
  level: AccessLevel;
  moduleId: string;
  openTaskKey: string | null;
  formOpen: boolean;
  onSelectModule: (id: string) => void;
  onToggleTask: (key: string) => void;
  onSkipModule: (id: string, reason: string) => void;
  onRestoreModule: (id: string) => void;
  onAddTask: (moduleId: string, title: string, hint: string) => void;
  onDeleteTask: (id: string) => void;
  onOpenTask: (key: string | null) => void;
  onOpenPaywall: () => void;
  onOpenOverview: () => void;
}) {
  const [skipFlow, setSkipFlow] = useState<SkipFlow>(null);
  const [showForm, setShowForm] = useState(formOpen);
  const [title, setTitle] = useState('');
  const [hint, setHint] = useState('');
  const [menu, setMenu] = useState<MenuOpen>(null);
  // En cuanto abre el menú de la ruta una vez, sus animaciones se apagan.
  const [rutaSeen, setRutaSeen] = useState(false);

  const progress = projectProgress({
    modules: ROUTE_MODULES,
    done: state.done,
    skipped: state.skipped,
    extraTasks: state.extraTasks,
  });
  const rutaModules = progress.modules.filter((m) => !m.course);
  const cursoModules = progress.modules.filter((m) => m.course);
  const current = progress.modules.find((m) => m.id === moduleId) ?? progress.modules[0];

  return (
    <div className="mrl-measure" style={{ padding: '18px 20px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 14 }}>
      <Row style={{ justifyContent: 'space-between' }}>
        <div>
          <H size={25}>Mi Ruta</H>
          <Muted size={12.5}>{progress.pct}% completado</Muted>
        </div>
        <button
          type="button"
          onClick={onOpenOverview}
          style={{
            height: 44,
            padding: '0 14px',
            borderRadius: RADIUS.pill,
            border: '1.5px solid var(--color-divider)',
            background: 'transparent',
            color: 'var(--color-text)',
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
          }}
        >
          Vista general
        </button>
      </Row>

      <RouteMenus
        level={level}
        rutaModules={rutaModules}
        cursoModules={cursoModules}
        current={current}
        open={menu}
        rutaSeen={rutaSeen}
        onToggle={(which) => {
          if (which === 'ruta') setRutaSeen(true);
          setMenu((prev) => (prev === which ? null : which));
        }}
        onSelect={(id) => {
          onSelectModule(id);
          onOpenTask(null);
          setMenu(null);
        }}
      />

      <ModuleCard
        module={current}
        onSkip={() => setSkipFlow({ moduleId: current.id, step: 'motivo', reason: SKIP_REASONS[0] })}
        onRestore={() => onRestoreModule(current.id)}
      />

      {/* Aviso de muestra: distinto para un módulo de ruta que para un curso. */}
      <SampleNotice level={level} module={current} onOpenPaywall={onOpenPaywall} />

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
    <Card style={module.course ? { border: `2px dashed ${cv(module.col)}` } : undefined}>
      {module.course ? (
        <Row gap={7} style={{ marginBottom: 8 }}>
          <Star size={13} fill="currentColor" strokeWidth={2.6} color={cv(module.col)} />
          <span
            style={{
              fontSize: 10.5,
              letterSpacing: '.09em',
              textTransform: 'uppercase',
              fontWeight: 800,
              color: cv(module.col),
            }}
          >
            Punto extra · Mini curso
          </span>
        </Row>
      ) : null}

      <Row gap={12} align="flex-start">
        <span
          style={{
            width: 42,
            height: 42,
            borderRadius: RADIUS.small,
            background: cv(module.col),
            color: 'var(--color-bg)',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
          }}
        >
          {module.course ? (
            <Star size={20} fill="currentColor" strokeWidth={2.6} />
          ) : (
            <TargetIcon size={22} strokeWidth={2.6} />
          )}
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
            <span style={{ fontSize: 12, fontWeight: 700, color: cv(module.col) }}>
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
