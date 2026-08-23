'use client';

import { ArrowLeft, Check, ChevronRight, Star } from 'lucide-react';
import { isFreeModule, SAMPLE_LABEL, type AccessLevel } from '@/domain/access';
import type { ModuleProgress, ProjectProgress } from '@/domain/progress';
import { RADIUS } from '@/components/ui';
import { moduleIcon } from './moduleIcons';

/**
 * Mi Ruta, vista de lista: los 14 módulos uno debajo de otro.
 *
 * Es la que se abre con "Ver toda la ruta" desde las etapas, para cuando el
 * usuario quiere ver todo junto en lugar de agrupado.
 */
export function ListaModulos({
  progress,
  level,
  done,
  onSelect,
  onBack,
}: {
  progress: ProjectProgress;
  level: AccessLevel;
  /** Mapa clave de tarea → completada, para saber cuál sigue en cada módulo. */
  done: Readonly<Record<string, boolean>>;
  onSelect: (moduleId: string) => void;
  onBack: () => void;
}) {
  const ruta = progress.modules.filter((m) => !m.course);
  const cursos = progress.modules.filter((m) => m.course);
  const lecciones = cursos.reduce((a, c) => a + c.total, 0);
  // "Vas aquí": el primer módulo no omitido que todavía tiene pendientes.
  const actual = ruta.find((m) => !m.skipped && m.done < m.total)?.id;

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="mrl-hit"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 7,
          padding: '10px 4px',
          border: 'none',
          background: 'none',
          color: 'var(--color-accent-800)',
          fontFamily: 'var(--font-body)',
          fontSize: 13.5,
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        <ArrowLeft size={15} strokeWidth={3} />
        Volver a las etapas
      </button>

      <div
        style={{
          margin: '12px 2px 11px',
          fontSize: 10.5,
          letterSpacing: '.09em',
          textTransform: 'uppercase',
          fontWeight: 700,
          color: 'var(--color-text-2)',
        }}
      >
        Los {ruta.length} módulos de tu ruta
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {ruta.map((mod) => (
          <FilaModulo
            key={mod.id}
            mod={mod}
            level={level}
            done={done}
            current={mod.id === actual}
            onSelect={() => onSelect(mod.id)}
          />
        ))}
      </div>

      <div
        style={{
          marginTop: 18,
          padding: 12,
          borderRadius: RADIUS.card,
          background: 'var(--color-accent-2-900)',
          border: '1px solid var(--color-accent-2-700)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '2px 6px 11px' }}>
          <Star size={14} fill="currentColor" strokeWidth={0} style={{ flex: 'none', color: 'var(--color-accent-2-300)' }} />
          <span
            style={{
              flex: 1,
              fontSize: 10.5,
              letterSpacing: '.09em',
              textTransform: 'uppercase',
              fontWeight: 800,
              color: 'var(--color-accent-2-300)',
            }}
          >
            Puntos extra
          </span>
          <span style={{ fontSize: 11.5, color: 'color-mix(in srgb, var(--color-bg) 62%, transparent)' }}>
            {lecciones} lecciones
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {cursos.map((curso) => (
            <button
              key={curso.id}
              type="button"
              onClick={() => onSelect(curso.id)}
              style={{
                width: '100%',
                minHeight: 44,
                display: 'flex',
                alignItems: 'center',
                gap: 11,
                padding: '13px 14px',
                borderRadius: RADIUS.inner,
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                color: 'var(--color-bg)',
                background: 'color-mix(in srgb, var(--color-bg) 9%, transparent)',
                textAlign: 'left',
              }}
            >
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 14, fontWeight: 800, lineHeight: 1.2 }}>{curso.name}</span>
                <span style={{ display: 'block', marginTop: 4, fontSize: 11.5, opacity: 0.78 }}>
                  {curso.total} lecciones ·{' '}
                  {level === 'licencia' ? (curso.done ? `${curso.done} hechas` : 'sin empezar') : 'lección 1 abierta'}
                </span>
              </span>
              <ChevronRight size={16} strokeWidth={2.8} style={{ flex: 'none', opacity: 0.7 }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function FilaModulo({
  mod,
  level,
  done,
  current,
  onSelect,
}: {
  mod: ModuleProgress;
  level: AccessLevel;
  done: Readonly<Record<string, boolean>>;
  current: boolean;
  onSelect: () => void;
}) {
  const [d1, d2, d3] = moduleIcon(mod.id);
  const terminado = !mod.skipped && mod.total > 0 && mod.done === mod.total;
  // Sin licencia, un módulo que no va completo en la prueba enseña su muestra.
  const muestra = level !== 'licencia' && !isFreeModule(mod.id) && !terminado;
  const pendiente = mod.tasks.find((t) => !done[t.key]);

  const sub = mod.skipped
    ? 'Omitido · no cuenta en tu avance'
    : terminado
      ? `${mod.total} de ${mod.total} pasos · terminado`
      : `${mod.done} de ${mod.total} pasos${pendiente ? ` · sigue: ${pendiente.title.toLowerCase()}` : ''}`;

  return (
    <button
      type="button"
      onClick={onSelect}
      className="mrl-tap"
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 13,
        padding: '14px 15px',
        borderRadius: RADIUS.block,
        cursor: 'pointer',
        fontFamily: 'var(--font-body)',
        color: 'var(--color-text)',
        background: current ? 'var(--color-accent-100)' : 'var(--color-surface)',
        border: `1px solid ${current ? 'var(--color-accent-400)' : 'var(--color-border)'}`,
        opacity: mod.skipped ? 0.6 : 1,
        textAlign: 'left',
      }}
    >
      <span
        style={{
          width: 44,
          height: 44,
          flex: 'none',
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          background: mod.skipped
            ? 'var(--color-neutral-200)'
            : terminado
              ? 'var(--color-accent-2-100)'
              : 'var(--color-accent-100)',
          color: mod.skipped
            ? 'var(--color-neutral-500)'
            : terminado
              ? 'var(--color-accent-2-600)'
              : 'var(--color-accent-600)',
        }}
      >
        <svg width={23} height={23} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d={d1} />
          <path d={d2} />
          <path d={d3} />
        </svg>
      </span>

      <span style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 15.5, fontWeight: 800, lineHeight: 1.15 }}>{mod.name}</span>
          {terminado ? (
            <span
              style={{
                display: 'inline-grid',
                placeItems: 'center',
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: 'var(--color-accent-2-100)',
                color: 'var(--color-accent-2-700)',
              }}
            >
              <Check size={11} strokeWidth={3.4} />
            </span>
          ) : null}
          {current ? <Etiqueta tono="accent">Vas aquí</Etiqueta> : null}
          {muestra ? <Etiqueta tono="accent-2">{SAMPLE_LABEL}</Etiqueta> : null}
        </span>

        {!mod.skipped && mod.done > 0 ? (
          <span
            style={{
              display: 'block',
              height: 5,
              marginTop: 6,
              borderRadius: RADIUS.pill,
              background: 'var(--color-neutral-300)',
              overflow: 'hidden',
            }}
          >
            <span
              style={{
                display: 'block',
                width: `${mod.total ? (mod.done / mod.total) * 100 : 0}%`,
                height: '100%',
                borderRadius: RADIUS.pill,
                background: terminado ? 'var(--color-accent-2-500)' : 'var(--color-accent-500)',
              }}
            />
          </span>
        ) : null}

        <span style={{ display: 'block', marginTop: 5, fontSize: 12, color: 'var(--color-text-2)' }}>{sub}</span>
      </span>

      <ChevronRight
        size={17}
        strokeWidth={2.75}
        style={{ flex: 'none', color: current ? 'var(--color-accent-600)' : 'var(--color-neutral-500)' }}
      />
    </button>
  );
}

function Etiqueta({ tono, children }: { tono: 'accent' | 'accent-2'; children: string }) {
  return (
    <span
      style={{
        padding: '3px 8px',
        borderRadius: RADIUS.pill,
        fontSize: 10,
        fontWeight: 800,
        letterSpacing: '.02em',
        background: `var(--color-${tono}-100)`,
        color: `var(--color-${tono}-800)`,
      }}
    >
      {children}
    </span>
  );
}
