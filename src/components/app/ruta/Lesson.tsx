'use client';

import { Camera, Check } from 'lucide-react';
import { minutosDeLeccion } from '@/content/leccionesMeta';
import { useLeccion } from './useLeccion';
import { type Alcance, type AccessLevel } from '@/domain/access';
import { Candado } from '@/components/app/Candado';
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
 * Lo que se ve mientras llega el contenido.
 *
 * Con la precarga al tocar la fila casi nunca alcanza a aparecer, pero con
 * datos lentos sí, y una pantalla en blanco se siente rota. Repite la forma de
 * la lección —ilustración, pasos, checklist— para que el salto sea mínimo
 * cuando el texto entra.
 */
function Esqueleto() {
  const bloque = (alto: number, ancho = '100%') => (
    <span
      aria-hidden
      style={{
        display: 'block',
        height: alto,
        width: ancho,
        borderRadius: RADIUS.small,
        background: 'var(--color-neutral-200)',
        animation: 'mrlLatido 1.2s ease-in-out infinite',
      }}
    />
  );

  return (
    <div
      role="status"
      aria-label="Cargando la lección"
      style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 12 }}
    >
      {bloque(140)}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 8 }}>
        {bloque(13, '38%')}
        {bloque(13)}
        {bloque(13, '86%')}
        {bloque(13, '64%')}
      </div>
      {bloque(70)}
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
  level,
  alcance,
  moduleId,
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
  level: AccessLevel;
  alcance: Alcance;
  /** El módulo al que pertenece: el servidor valida el nivel contra él. */
  moduleId: string;
  done: boolean;
  onToggle: () => void;
  onOpenPaywall: () => void;
  onDelete?: () => void;
}) {
  /*
    El contenido no viaja en el paquete: se pide a `/api/lecciones`, que revisa
    el nivel antes de contestar. Sólo los minutos vienen del cliente, porque se
    enseñan **antes** de comprar, en el letrero de la lección cerrada.
  */
  const minutos = minutosDeLeccion(title);
  const contenido = useLeccion(moduleId, title, alcance !== 'cerrado');
  const lesson = contenido.estado === 'lista' ? contenido.contenido.leccion : null;
  const art = contenido.estado === 'lista' ? contenido.contenido.arte : null;

  /*
    Cerrada: no se abre el contenido. Se ve el título y el resumen en la lista,
    que es lo que deja entender el alcance de lo que se compra sin regalarlo.
  */
  if (alcance === 'cerrado') {
    return (
      <div style={{ marginTop: 14 }}>
        <Candado
          level={level}
          motivo="contenido"
          detalle={`Toma ${minutos} min y trae sus pasos, el error típico y el checklist.`}
          onOpenPaywall={onOpenPaywall}
        />
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
        <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 700, color: text(55) }}>{minutos} min</span>
      </div>

      {contenido.estado === 'cargando' ? <Esqueleto /> : null}
      {contenido.estado === 'sin-contenido' ? (
        <p style={{ margin: 0, fontSize: 13, color: text(55) }}>
          No pudimos traer esta lección. Revisa tu conexión y vuelve a abrirla.
        </p>
      ) : null}

      {lesson && art ? (
        <div
          className="mrl-illo"
          role="img"
          aria-label={lesson?.img ?? title}
          dangerouslySetInnerHTML={{ __html: art }}
        />
      ) : lesson?.img ? (
        <PhotoSlot hint={lesson.img} />
      ) : null}

      <section style={{ background: 'var(--color-neutral-200)', borderRadius: RADIUS.small, padding: 13 }}>
        <Kicker>Por qué importa</Kicker>
        <p className="mrl-prose" style={{ margin: '5px 0 0', fontSize: 13.2, lineHeight: 1.5 }}>
          {why}
        </p>
      </section>

      {lesson?.s.length ? (
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

      {lesson?.e ? (
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

      {lesson?.d.length ? (
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
      {lesson?.x ? (
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

      {alcance === 'abierto' ? (
        <Button variant={done ? 'secondary' : 'success'} onClick={onToggle}>
          {done ? 'Marcar como pendiente' : 'Ya lo hice, marcar completada'}
        </Button>
      ) : (
        /* Sólo lectura: la lección se lee completa y lo marcado se conserva.
           Lo único que se apaga es el botón. */
        <Candado level={level} motivo="edicion" onOpenPaywall={onOpenPaywall} />
      )}

      {onDelete ? (
        <button
          type="button"
          onClick={onDelete}
          style={{
            border: 'none',
            background: 'transparent',
            color: 'var(--color-accent-800)',
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
