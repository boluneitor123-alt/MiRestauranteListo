'use client';

import { ArrowRight, Check, ChevronRight } from 'lucide-react';
import type { Target } from '@/domain/diagnosis';
import { taskWindow, type ProjectProgress } from '@/domain/progress';
import { RADIUS } from '@/components/ui';

/**
 * "Tareas de tu ruta": las cuatro que importan hoy, no la lista entera.
 *
 * La ventana se centra en la primera pendiente, con una hecha antes para que
 * se vea de dónde viene el avance.
 */

/** Los cuatro iconos que rotan por las filas. */
const ART: [string, string][] = [
  ['M9 18h6M10 21.5h4', 'M12 2.5a7 7 0 0 0-4 12.7V18h8v-2.8A7 7 0 0 0 12 2.5Z'],
  ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'M12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6M12 11.4a.6.6 0 1 0 0 1.2.6.6 0 0 0 0-1.2'],
  ['M4 20h16', 'M6.5 16.5V11M11.5 16.5V5.5M16.5 16.5v-4'],
  ['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z', 'M14 2v6h6M9 13h6M9 17h4'],
];

/** Los cuatro pasteles que rotan con los iconos. */
const PASTEL: [string, string][] = [
  ['var(--cat-numeros)', 'var(--cat-numeros-ink)'],
  ['var(--cat-menu)', 'var(--cat-menu-ink)'],
  ['var(--cat-permisos)', 'var(--cat-permisos-ink)'],
  ['var(--cat-marketing)', 'var(--cat-marketing-ink)'],
];

export function TareasDeTuRuta({
  progress,
  done,
  onGo,
  onOpenTask,
}: {
  progress: ProjectProgress;
  done: Readonly<Record<string, boolean>>;
  onGo: (target: Target) => void;
  /** Abre la tarea dentro de su módulo. */
  onOpenTask: (moduleId: string, key: string) => void;
}) {
  const todas = progress.modules.filter((m) => !m.skipped).flatMap((m) => m.tasks);
  const ventana = taskWindow(todas, progress.nextTask);
  if (!ventana.length) return null;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '0 2px 12px' }}>
        <span
          style={{
            display: 'grid',
            placeItems: 'center',
            width: 26,
            height: 26,
            flex: 'none',
            borderRadius: 8,
            background: 'var(--cat-numeros)',
            color: 'var(--cat-numeros-ink)',
          }}
        >
          <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M4 20h16M6.5 16.5V11M11.5 16.5V5.5M16.5 16.5v-4" />
          </svg>
        </span>
        <h4 style={{ margin: 0, flex: 1, fontSize: 19, letterSpacing: '-.01em', fontFamily: 'var(--font-heading)' }}>
          Tareas de tu ruta
        </h4>
        <button
          type="button"
          onClick={() => onGo({ tab: 'ruta' })}
          className="mrl-hit"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '10px 4px',
            border: 'none',
            background: 'none',
            color: 'var(--color-accent-800)',
            fontFamily: 'var(--font-body)',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Ver ruta completa
          <ArrowRight size={14} strokeWidth={3} />
        </button>
      </div>

      <div
        style={{
          border: '1px solid var(--color-border)',
          borderRadius: RADIUS.block,
          background: 'var(--color-surface)',
          overflow: 'hidden',
        }}
      >
        {ventana.map((task, i) => {
          const hecha = !!done[task.key];
          const actual = !hecha && progress.nextTask?.key === task.key;
          const estado = hecha ? 'Completado' : actual ? 'En progreso' : 'Pendiente';
          const insignia = hecha
            ? ['var(--color-accent-2-100)', 'var(--color-accent-2-700)']
            : actual
              ? ['var(--color-accent-100)', 'var(--color-accent-800)']
              : ['var(--color-neutral-200)', 'var(--color-text-2)'];

          return (
            <button
              key={task.key}
              type="button"
              onClick={() => onOpenTask(task.moduleId, task.key)}
              className="mrl-fila-tarea"
              style={{
                padding: 14,
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                color: 'var(--color-text)',
                background: actual ? 'var(--color-accent-100)' : 'transparent',
                borderTop: i ? '1px solid var(--color-border)' : 'none',
              }}
            >
              <span
                style={{
                  display: 'grid',
                  placeItems: 'center',
                  width: 26,
                  height: 26,
                  flex: 'none',
                  borderRadius: '50%',
                  background: hecha ? 'var(--color-accent-2-500)' : 'transparent',
                  border: hecha ? 'none' : `2.5px solid ${actual ? 'var(--color-accent)' : 'var(--color-neutral-400)'}`,
                  color: '#fff',
                }}
              >
                {hecha ? <Check size={14} strokeWidth={3.4} /> : null}
              </span>

              <span
                style={{
                  display: 'grid',
                  placeItems: 'center',
                  width: 38,
                  height: 38,
                  flex: 'none',
                  borderRadius: 11,
                  background: PASTEL[i % PASTEL.length][0],
                  color: PASTEL[i % PASTEL.length][1],
                }}
              >
                <svg width={19} height={19} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d={ART[i % ART.length][0]} />
                  <path d={ART[i % ART.length][1]} />
                </svg>
              </span>

              <span className="mrl-fila-texto" style={{ textAlign: 'left' }}>
                <span style={{ display: 'block', fontSize: 14.5, fontWeight: 800, lineHeight: 1.25 }}>{task.title}</span>
                <span style={{ display: 'block', fontSize: 12.5, lineHeight: 1.35, color: 'var(--color-text-2)', marginTop: 2 }}>
                  {task.hint}
                </span>
              </span>

              <span
                style={{
                  flex: 'none',
                  padding: '6px 11px',
                  borderRadius: RADIUS.pill,
                  background: insignia[0],
                  color: insignia[1],
                  fontSize: 11.5,
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                }}
              >
                {estado}
              </span>

              {actual ? (
                <span
                  style={{
                    display: 'grid',
                    placeItems: 'center',
                    width: 40,
                    height: 40,
                    flex: 'none',
                    borderRadius: 12,
                    background: 'var(--color-accent)',
                    color: 'var(--on-accent)',
                  }}
                >
                  <ArrowRight size={18} strokeWidth={2.8} />
                </span>
              ) : (
                <ChevronRight size={16} strokeWidth={2.6} style={{ flex: 'none', color: 'var(--color-text-2)' }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
