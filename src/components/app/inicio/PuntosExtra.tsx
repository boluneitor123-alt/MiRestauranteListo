'use client';

import { ArrowRight } from 'lucide-react';
import type { ModuleProgress } from '@/domain/progress';
import { RADIUS } from '@/components/ui';

/**
 * "Haz crecer tu restaurante": los cuatro mini cursos, en una tira que se
 * desliza.
 *
 * Se ven con licencia y sin ella. En prueba el botón dice "Ver temario" en
 * lugar de "Empezar": el prototipo los enseña a propósito, porque ver lo que
 * hay adentro es lo que empuja al pago.
 */

/** Los dos trazos del icono de cada curso. */
const ART: Record<string, [string, string]> = {
  ventas: ['M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1Z', 'M15.5 8.5a5 5 0 0 1 0 7'],
  maps: ['M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11Z', 'M12 7.4a2.6 2.6 0 1 0 0 5.2 2.6 2.6 0 0 0 0-5.2'],
  delivery: [
    'M5 17.5a2.5 2.5 0 1 0 5 0 2.5 2.5 0 1 0-5 0M14 17.5a2.5 2.5 0 1 0 5 0 2.5 2.5 0 1 0-5 0',
    'M9.8 17.5h4.4M7.5 15 10 7h4l2.5 8M8.5 7h7',
  ],
  contratar: [
    'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2',
    'M9 3.5a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 0 0 0-7.2M18 8v6M21 11h-6',
  ],
};

const ESTRELLA = 'M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.8L5.8 21l1.6-7L2 9.2l7.1-.6Z';

export function PuntosExtra({
  courses,
  licensed,
  onOpen,
}: {
  courses: ModuleProgress[];
  licensed: boolean;
  onOpen: (moduleId: string) => void;
}) {
  if (!courses.length) return null;

  return (
    <div className="mrl-scroll" style={{ display: 'flex', gap: 11, overflowX: 'auto', padding: '2px 2px 5px' }}>
      {courses.map((course) => {
        const [d1, d2] = ART[course.id] ?? [ESTRELLA, ESTRELLA];
        return (
          <button
            key={course.id}
            type="button"
            onClick={() => onOpen(course.id)}
            style={{
              flex: 'none',
              width: 162,
              textAlign: 'left',
              padding: 16,
              borderRadius: RADIUS.card,
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
            }}
          >
            <span
              style={{
                display: 'grid',
                placeItems: 'center',
                width: 42,
                height: 42,
                borderRadius: '50%',
                background: 'var(--color-accent-100)',
                color: 'var(--color-accent-800)',
              }}
            >
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d={d1} />
                <path d={d2} />
              </svg>
            </span>
            <span
              style={{
                display: 'block',
                fontFamily: 'var(--font-heading)',
                fontSize: 16,
                lineHeight: 1.15,
                marginTop: 12,
              }}
            >
              {course.name}
            </span>
            <span style={{ display: 'block', fontSize: 12, lineHeight: 1.35, color: 'var(--color-text-2)', marginTop: 4 }}>
              {course.done ? `${course.done} de ${course.total} lecciones` : `${course.total} lecciones`}
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                marginTop: 12,
                fontSize: 12.5,
                fontWeight: 700,
                color: 'var(--color-accent-800)',
              }}
            >
              {licensed ? 'Empezar' : 'Ver temario'}
              <ArrowRight size={13} strokeWidth={3} />
            </span>
          </button>
        );
      })}
    </div>
  );
}
