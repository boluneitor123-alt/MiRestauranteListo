'use client';

import { ArrowRight, Star } from 'lucide-react';
import type { ModuleProgress } from '@/domain/progress';
import { RADIUS } from '@/components/ui';

/**
 * "Tus puntos extra": los mini cursos, con su tarjeta a todo color.
 *
 * Se ven con licencia y sin ella. En prueba el botón dice "Ver el temario" en
 * lugar de "Abrir el curso": el prototipo los enseña a propósito, porque ver lo
 * que hay adentro es lo que empuja al pago.
 */
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
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '6px 4px 2px' }}>
        <Star size={15} fill="currentColor" color="var(--color-accent)" />
        <h4 style={{ margin: 0, fontSize: 18, flex: 1, fontFamily: 'var(--font-heading)' }}>Tus puntos extra</h4>
        <Star size={15} fill="currentColor" color="var(--color-accent-2-600)" />
      </div>
      <p
        className="mrl-prose"
        style={{
          margin: '0 4px 10px',
          fontSize: 12.5,
          lineHeight: 1.45,
          color: 'color-mix(in srgb, var(--color-text) 60%, transparent)',
        }}
      >
        Dos mini cursos aparte de tu ruta, para cuando ya estés vendiendo. A estos vas a volver cada semana.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 11 }}>
        {courses.map((course) => (
          <button
            key={course.id}
            type="button"
            onClick={() => onOpen(course.id)}
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '19px 20px',
              borderRadius: 30,
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              border: '2px dashed var(--color-accent-2-400)',
              background: `var(--color-${course.col})`,
              color: 'var(--color-bg)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span
                style={{
                  padding: '4px 11px',
                  borderRadius: RADIUS.pill,
                  background: 'var(--color-accent-2-300)',
                  color: 'var(--color-accent-2-900)',
                  fontSize: 10,
                  letterSpacing: '.09em',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                }}
              >
                Punto extra
              </span>
              <span style={{ fontSize: 11.5, opacity: 0.8 }}>
                {course.done} de {course.total} lecciones
              </span>
            </span>
            <span
              style={{
                display: 'block',
                fontFamily: 'var(--font-heading)',
                fontSize: 22,
                lineHeight: 1.1,
                marginTop: 9,
              }}
            >
              {course.name}
            </span>
            <span
              className="mrl-prose"
              style={{ display: 'block', margin: '7px 0 0', fontSize: 12.8, lineHeight: 1.5, opacity: 0.85 }}
            >
              {course.desc}
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                marginTop: 12,
                padding: '9px 16px',
                borderRadius: RADIUS.pill,
                background: licensed ? 'var(--color-accent-2-300)' : 'color-mix(in srgb, var(--color-bg) 18%, transparent)',
                color: licensed ? 'var(--color-accent-2-900)' : 'var(--color-bg)',
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              {licensed ? 'Abrir el curso' : 'Ver el temario'}
              <ArrowRight size={13} strokeWidth={3} />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
