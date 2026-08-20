'use client';

import { useState } from 'react';
import { Check, ChevronDown, Lock, Target as TargetIcon } from 'lucide-react';
import { ROUTE_MODULES, SKIP_REASONS } from '@/content/route';
import { projectProgress, progressWithoutModule, type RouteTask } from '@/domain/progress';
import { canOpenRouteModule, PAYWALL_HINT, type AccessLevel } from '@/domain/access';
import type { ProjectState } from '@/domain/projectState';
import { Button, Card, Field, H, Muted, Pill, ProgressBar, RADIUS, Row, text } from '@/components/ui';

type SkipFlow = { moduleId: string; step: 'motivo' | 'confirmar'; reason: string } | null;

/** Mi Ruta (README § 1.6). */
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

  const progress = projectProgress({
    modules: ROUTE_MODULES,
    done: state.done,
    skipped: state.skipped,
    extraTasks: state.extraTasks,
  });
  const current = progress.modules.find((m) => m.id === moduleId) ?? progress.modules[0];
  const unlocked = canOpenRouteModule(level, current.id);

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
            height: 40,
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

      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
        {progress.modules.map((module) => (
          <Pill key={module.id} selected={module.id === current.id} onClick={() => onSelectModule(module.id)}>
            {module.name} · {module.skipped ? 'omitido' : `${module.done}/${module.total}`}
          </Pill>
        ))}
      </div>

      <Card>
        <Row gap={12} align="flex-start">
          <span
            style={{
              width: 42,
              height: 42,
              borderRadius: RADIUS.small,
              background: 'var(--color-accent-100)',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
            }}
          >
            <TargetIcon size={22} color="var(--color-accent)" strokeWidth={2.6} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <H size={19}>{current.name}</H>
            <Muted size={12.5} style={{ marginTop: 3 }}>
              {current.desc}
            </Muted>
            <Row gap={10} style={{ marginTop: 12 }}>
              <span style={{ flex: 1, minWidth: 0 }}>
                <ProgressBar pct={current.skipped ? 0 : current.pct} />
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-accent-700)' }}>
                {current.skipped ? 'omitido' : `${current.pct}%`}
              </span>
            </Row>
          </div>
        </Row>

        {current.skipped ? (
          <div style={{ marginTop: 14 }}>
            <Muted size={12.5}>Motivo: {current.reason}</Muted>
            <div style={{ marginTop: 10 }}>
              <Button variant="secondary" height={44} onClick={() => onRestoreModule(current.id)}>
                Reactivar este módulo
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setSkipFlow({ moduleId: current.id, step: 'motivo', reason: SKIP_REASONS[0] })}
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

      {!unlocked ? (
        <Card style={{ background: 'var(--color-accent-100)' }}>
          <Row gap={10}>
            <Lock size={18} color="var(--color-accent-700)" strokeWidth={2.6} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-accent-900)' }}>{PAYWALL_HINT}</div>
              <Muted size={12.5} style={{ marginTop: 3 }}>
                En la prueba están abiertos Concepto y Local. Los otros 8 módulos los ves completos aquí y se abren con
                el pago único.
              </Muted>
            </div>
          </Row>
          <div style={{ marginTop: 12 }}>
            <Button height={46} onClick={onOpenPaywall}>
              Desbloquear con un solo pago
            </Button>
          </div>
        </Card>
      ) : null}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 10 }}>
        {current.tasks.map((task) => (
          <TaskCard
            key={task.key}
            task={task}
            done={!!state.done[task.key]}
            open={openTaskKey === task.key}
            locked={!unlocked}
            onOpen={() => (unlocked ? onOpenTask(openTaskKey === task.key ? null : task.key) : onOpenPaywall())}
            onToggle={() => onToggleTask(task.key)}
            onDelete={task.customId ? () => onDeleteTask(task.customId as string) : undefined}
          />
        ))}
      </div>

      {showForm ? (
        <Card style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 12 }}>
          <H size={16}>Agregar tarea a {current.name}</H>
          <Field label="Qué tienes que hacer" value={title} onChange={setTitle} placeholder="Ej. Cotizar el letrero" />
          <Field label="Pista corta (opcional)" value={hint} onChange={setHint} placeholder="Con dos proveedores" />
          <Row gap={10}>
            <Button variant="secondary" height={44} onClick={() => setShowForm(false)}>
              Cancelar
            </Button>
            <Button
              height={44}
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
        <Button variant="secondary" height={46} onClick={() => setShowForm(true)}>
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

function TaskCard({
  task,
  done,
  open,
  locked,
  onOpen,
  onToggle,
  onDelete,
}: {
  task: RouteTask;
  done: boolean;
  open: boolean;
  locked: boolean;
  onOpen: () => void;
  onToggle: () => void;
  onDelete?: () => void;
}) {
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
          style={{
            flex: 1, minWidth: 0,
            textAlign: 'left',
            border: 'none',
            background: 'transparent',
            padding: 0,
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            color: 'var(--color-text)',
          }}
        >
          <div
            style={{
              fontSize: 14.5,
              fontWeight: 700,
              textDecoration: done ? 'line-through' : 'none',
              opacity: done ? 0.55 : 1,
            }}
          >
            {task.title}
          </div>
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
        <div style={{ marginTop: 14, animation: 'mrlUp .2s ease both', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 10 }}>
          <div style={{ background: 'var(--color-neutral-200)', borderRadius: RADIUS.small, padding: 12 }}>
            <div style={{ fontSize: 11.5, fontWeight: 800, color: text(55) }}>Por qué importa</div>
            <div style={{ fontSize: 13, marginTop: 4, lineHeight: 1.45 }}>{task.why}</div>
          </div>
          <div style={{ background: 'var(--color-neutral-200)', borderRadius: RADIUS.small, padding: 12 }}>
            <div style={{ fontSize: 11.5, fontWeight: 800, color: text(55) }}>Qué sigue</div>
            <div style={{ fontSize: 13, marginTop: 4, lineHeight: 1.45 }}>{task.next}</div>
          </div>
          <Button variant={done ? 'secondary' : 'success'} height={46} onClick={onToggle}>
            {done ? 'Marcar como pendiente' : 'Marcar como completada'}
          </Button>
          {onDelete ? (
            <button
              type="button"
              onClick={onDelete}
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
              Eliminar esta tarea
            </button>
          ) : null}
        </div>
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
