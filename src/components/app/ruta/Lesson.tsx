'use client';

import { Camera, Check, Lock } from 'lucide-react';
import { getLesson } from '@/content/lessons';
import { lessonArt } from '@/content/illustrations';
import { SAMPLE_LABEL, type TaskAccess } from '@/domain/access';
import { Button, RADIUS, text } from '@/components/ui';

/** Encabezado de sección dentro de la lección. */
function Kicker({ children }: { children: string }) {
  return (
    <div style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 800, color: text(55) }}>
      {children}
    </div>
  );
}

/**
 * El hueco de imagen de una lección que todavía no trae ilustración.
 *
 * No se deja vacío ni se pinta una imagen rota: se muestra el encargo de la
 * foto, tal cual viene del campo `img` de la lección. Ese texto le dice al
 * dueño qué retratar, así que vale por sí solo.
 */
function PhotoSlot({ hint }: { hint: string }) {
  return (
    <div
      style={{
        borderRadius: RADIUS.small,
        background: 'var(--color-accent-100)',
        border: '2px dashed var(--color-accent-300)',
        padding: 14,
        display: 'flex',
        gap: 11,
        alignItems: 'flex-start',
      }}
    >
      <Camera size={18} color="var(--color-accent-700)" strokeWidth={2.4} style={{ flex: 'none', marginTop: 2 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 11,
            letterSpacing: '.08em',
            textTransform: 'uppercase',
            fontWeight: 800,
            color: 'var(--color-accent-800)',
          }}
        >
          La foto de esta lección
        </div>
        <p
          className="mrl-prose"
          style={{ margin: '5px 0 0', fontSize: 13.2, lineHeight: 1.5, color: 'var(--color-accent-900)' }}
        >
          {hint}
        </p>
      </div>
    </div>
  );
}

/**
 * Una lección completa (mensaje 2, § 4).
 *
 * Estructura fija: número y total, minutos, ilustración, por qué importa,
 * cómo hacerlo, el error típico, "ya quedó cuando…", un ejemplo con números
 * y la tarea de hoy.
 *
 * La ilustración y la tabla de ejemplo son condicionales: no todas las
 * lecciones las traen y no se inventa ninguna.
 */
export function Lesson({
  title,
  why,
  next,
  index,
  total,
  access,
  done,
  onToggle,
  onOpenPaywall,
  onDelete,
}: {
  title: string;
  /** Por qué importa: vive en la tarea (CATS), no en la lección. */
  why: string;
  /** Tu tarea de hoy: también vive en la tarea. */
  next: string;
  /** Posición de la lección dentro del módulo, empezando en 0. */
  index: number;
  total: number;
  access: TaskAccess;
  done: boolean;
  onToggle: () => void;
  onOpenPaywall: () => void;
  onDelete?: () => void;
}) {
  const lesson = getLesson(title);
  const art = lessonArt(title);

  if (access === 'bloqueada') {
    return (
      <div
        style={{
          marginTop: 14,
          padding: 16,
          borderRadius: RADIUS.small,
          background: 'var(--color-accent-100)',
          animation: 'mrlUp .2s ease both',
        }}
      >
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <Lock size={17} color="var(--color-accent-700)" strokeWidth={2.6} style={{ flex: 'none', marginTop: 2 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-accent-900)' }}>
              Esta lección se abre con el pago único
            </div>
            <p style={{ margin: '4px 0 0', fontSize: 12.8, lineHeight: 1.5, color: 'var(--color-accent-900)' }}>
              Toma {lesson.m} min y trae sus pasos, el error típico y el checklist, igual que la que ya abriste.
            </p>
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <Button onClick={onOpenPaywall}>Ver el pago único</Button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        marginTop: 14,
        animation: 'mrlUp .2s ease both',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr)',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: text(55) }}>
          Lección {index + 1} de {total}
        </span>
        {access === 'muestra' ? (
          <span
            style={{
              padding: '3px 10px',
              borderRadius: RADIUS.pill,
              background: 'var(--color-accent-2-100)',
              color: 'var(--color-accent-2-800)',
              fontSize: 11,
              fontWeight: 800,
            }}
          >
            {SAMPLE_LABEL}
          </span>
        ) : null}
        <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 700, color: text(55) }}>{lesson.m} min</span>
      </div>

      {art ? (
        <div
          className="mrl-illo"
          role="img"
          aria-label={lesson.img ?? title}
          dangerouslySetInnerHTML={{ __html: art }}
        />
      ) : lesson.img ? (
        <PhotoSlot hint={lesson.img} />
      ) : null}

      <section style={{ background: 'var(--color-neutral-200)', borderRadius: RADIUS.small, padding: 13 }}>
        <Kicker>Por qué importa</Kicker>
        <p className="mrl-prose" style={{ margin: '5px 0 0', fontSize: 13.2, lineHeight: 1.5 }}>
          {why}
        </p>
      </section>

      {lesson.s.length ? (
        <section>
          <Kicker>Cómo hacerlo</Kicker>
          <ol style={{ margin: '8px 0 0', padding: 0, listStyle: 'none', display: 'grid', gap: 10 }}>
            {lesson.s.map((step, i) => (
              <li key={i} style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
                <span
                  style={{
                    width: 24,
                    height: 24,
                    flex: 'none',
                    borderRadius: '50%',
                    background: 'var(--color-accent)',
                    color: 'var(--color-bg)',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {i + 1}
                </span>
                <span className="mrl-prose" style={{ fontSize: 13.2, lineHeight: 1.5 }}>
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {lesson.e ? (
        <section
          style={{
            borderRadius: RADIUS.small,
            padding: 13,
            background: 'var(--color-accent-100)',
            color: 'var(--color-accent-900)',
          }}
        >
          <Kicker>Un detalle que se pasa por alto</Kicker>
          <p className="mrl-prose" style={{ margin: '5px 0 0', fontSize: 13, lineHeight: 1.5 }}>
            {lesson.e}
          </p>
        </section>
      ) : null}

      {lesson.d.length ? (
        <section>
          <Kicker>Ya quedó cuando…</Kicker>
          <ul style={{ margin: '8px 0 0', padding: 0, listStyle: 'none', display: 'grid', gap: 8 }}>
            {lesson.d.map((item, i) => (
              <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span
                  style={{
                    width: 20,
                    height: 20,
                    flex: 'none',
                    borderRadius: '50%',
                    background: 'var(--color-accent-2-100)',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <Check size={12} strokeWidth={3} color="var(--color-accent-2-700)" />
                </span>
                <span className="mrl-prose" style={{ fontSize: 13, lineHeight: 1.45 }}>
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Solo 44 de las 90 lecciones traen tabla de ejemplo. Si no la trae, no se pinta. */}
      {lesson.x ? (
        <section
          style={{
            borderRadius: RADIUS.small,
            padding: 13,
            background: 'var(--color-neutral-100)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ fontSize: 13.5, fontWeight: 800 }}>{lesson.x.t}</div>
          <div style={{ marginTop: 8 }}>
            {lesson.x.r.map(([k, v], i) => (
              <div
                key={i}
                className="mrl-amount"
                style={{
                  padding: '8px 0',
                  fontSize: 12.5,
                  borderTop: i ? '1px solid color-mix(in srgb, var(--color-text) 8%, transparent)' : 'none',
                  fontWeight: i === lesson.x!.r.length - 1 ? 700 : 400,
                }}
              >
                <span>{k}</span>
                <span>{v}</span>
              </div>
            ))}
          </div>
          <p
            className="mrl-prose"
            style={{ margin: '10px 0 0', fontSize: 12.3, lineHeight: 1.5, color: text(60) }}
          >
            {lesson.x.n}
          </p>
        </section>
      ) : null}

      <section style={{ background: 'var(--color-neutral-200)', borderRadius: RADIUS.small, padding: 13 }}>
        <Kicker>Tu tarea de hoy</Kicker>
        <p className="mrl-prose" style={{ margin: '5px 0 0', fontSize: 13.2, lineHeight: 1.5 }}>
          {next}
        </p>
      </section>

      <Button variant={done ? 'secondary' : 'success'} onClick={onToggle}>
        {done ? 'Marcar como pendiente' : 'Ya lo hice, marcar completada'}
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
  );
}
