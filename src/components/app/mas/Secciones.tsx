'use client';

import { ChevronRight } from 'lucide-react';
import { ROUTE_MODULES } from '@/content/route';
import type { ModuleProgress } from '@/domain/progress';
import { courseState, type AccessLevel } from '@/domain/access';
import { RADIUS } from '@/components/ui';

/**
 * Las tres secciones de arriba de Más, y los temas destacados.
 *
 * Aprende, Permisos y Recursos con su encabezado, su descripción y un ícono de
 * color. Debajo, los mini cursos con sus lecciones y su estado.
 *
 * Los cursos llevan ícono de color, no fotos de personas. Es el mismo criterio
 * que en los platillos: una foto de banco al lado de contenido propio resta
 * más de lo que adorna.
 *
 * Y ningún conteo se teclea: las lecciones salen del progreso y los archivos
 * de la lista de recursos.
 */

/** Los dos trazos del ícono de cada mini curso, por id de módulo. */
const ARTE_DE_CURSO: Record<string, [string, string]> = {
  ventas: ['M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1Z', 'M15.5 8.5a5 5 0 0 1 0 7'],
  maps: ['M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11Z', 'M12 7.4a2.6 2.6 0 1 0 0 5.2 2.6 2.6 0 0 0 0-5.2'],
  // Una mochila de repartidor. La moto de dos ruedas que probé primero se veía
  // como un frasco a 21px: a este tamaño sólo sobrevive una silueta simple.
  delivery: ['M5 8h14l-1.1 12.5H6.1Z', 'M9 8V6a3 3 0 0 1 6 0v2M9.5 12.5h5'],
  contratar: [
    'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2',
    'M9 3.5a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 0 0 0-7.2M18 8v6M21 11h-6',
  ],
};

const PASTEL_DE_CURSO: Record<string, [string, string]> = {
  ventas: ['var(--cat-marketing)', 'var(--cat-marketing-ink)'],
  maps: ['var(--cat-permisos)', 'var(--cat-permisos-ink)'],
  delivery: ['var(--cat-numeros)', 'var(--cat-numeros-ink)'],
  contratar: ['var(--cat-operacion)', 'var(--cat-operacion-ink)'],
};

export function SeccionesDeMas({
  cursos,
  recursos,
  level,
  onAbrirModulo,
  onAbrirRecursos,
}: {
  /** Los cuatro mini cursos, con su avance. */
  cursos: ModuleProgress[];
  /** Cuántos archivos descargables hay. */
  recursos: number;
  level: AccessLevel;
  onAbrirModulo: (moduleId: string) => void;
  onAbrirRecursos: () => void;
}) {
  const lecciones = cursos.reduce((a, c) => a + c.total, 0);
  /*
    Permisos apunta al módulo real de la ruta, con su propia descripción. La
    maqueta prometía un «checklist por estado» que no existe: son 32 conjuntos
    de requisitos que además cambian por municipio, y ofrecerlo sin tenerlo
    sería vender algo que la app no da.
  */
  const permisos = ROUTE_MODULES.find((m) => m.id === 'permisos');

  const primerCurso = cursos[0];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 10 }}>
      {primerCurso ? (
        <Seccion
          titulo="Aprende"
          meta={`${lecciones} lecciones`}
          cuerpo={`Estrategias, consejos y casos reales, en ${conteo(cursos.length, 'mini curso', 'mini cursos')}.`}
          pastel="var(--cat-marketing)"
          tinta="var(--cat-marketing-ink)"
          d1="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5Z"
          d2="M20 5.5A1.5 1.5 0 0 0 18.5 4H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5Z"
          onClick={() => onAbrirModulo(primerCurso.id)}
        />
      ) : null}

      {permisos ? (
        <Seccion
          titulo="Permisos"
          meta={`${permisos.tasks.length} trámites`}
          cuerpo={permisos.desc}
          pastel="var(--cat-permisos)"
          tinta="var(--cat-permisos-ink)"
          d1="M6 3h8l4 4v14H6Z"
          d2="M14 3v4h4M9 12h6M9 16h4"
          onClick={() => onAbrirModulo('permisos')}
        />
      ) : null}

      <Seccion
        titulo="Recursos"
        meta={`${recursos} archivos`}
        cuerpo="Plantillas, guías y documentos listos para usar."
        pastel="var(--cat-recursos)"
        tinta="var(--cat-recursos-ink)"
        d1="M3 7.5A1.5 1.5 0 0 1 4.5 6h4L10 8h9.5A1.5 1.5 0 0 1 21 9.5v8a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5Z"
        d2="M3 11h18"
        onClick={onAbrirRecursos}
      />

      {primerCurso ? (
        <div style={{ marginTop: 6 }}>
          <h4
            style={{
              margin: '0 2px 10px',
              fontSize: 19,
              letterSpacing: '-.01em',
              fontFamily: 'var(--font-heading)',
            }}
          >
            Temas destacados
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 9 }}>
            {cursos.map((curso) => (
              <FilaDeCurso key={curso.id} curso={curso} level={level} onAbrir={() => onAbrirModulo(curso.id)} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** «1 mini curso» / «4 mini cursos». */
function conteo(n: number, uno: string, varios: string): string {
  return `${n} ${n === 1 ? uno : varios}`;
}

function Seccion({
  titulo,
  meta,
  cuerpo,
  pastel,
  tinta,
  d1,
  d2,
  onClick,
}: {
  titulo: string;
  meta: string;
  cuerpo: string;
  pastel: string;
  tinta: string;
  d1: string;
  d2: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 13,
        padding: '15px 15px',
        border: 'none',
        borderRadius: RADIUS.card,
        background: pastel,
        color: 'var(--color-text)',
        cursor: 'pointer',
        fontFamily: 'var(--font-body)',
        textAlign: 'left',
      }}
    >
      <span
        style={{
          display: 'grid',
          placeItems: 'center',
          width: 42,
          height: 42,
          flex: 'none',
          borderRadius: 13,
          background: 'var(--color-surface)',
          color: tinta,
        }}
      >
        <Trazos d1={d1} d2={d2} size={22} />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: 18, lineHeight: 1.15 }}>{titulo}</span>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: tinta }}>{meta}</span>
        </span>
        <span
          className="mrl-prose"
          style={{ display: 'block', fontSize: 12.5, lineHeight: 1.4, color: 'var(--color-text-2)', marginTop: 3 }}
        >
          {cuerpo}
        </span>
      </span>
      <ChevronRight size={18} strokeWidth={2.8} style={{ flex: 'none', color: tinta }} />
    </button>
  );
}

function FilaDeCurso({
  curso,
  level,
  onAbrir,
}: {
  curso: ModuleProgress;
  level: AccessLevel;
  onAbrir: () => void;
}) {
  const [pastel, tinta] = PASTEL_DE_CURSO[curso.id] ?? ['var(--color-neutral-200)', 'var(--color-text-2)'];
  const [d1, d2] = ARTE_DE_CURSO[curso.id] ?? ['M12 3v18', 'M3 12h18'];

  return (
    <button
      type="button"
      onClick={onAbrir}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 13px',
        border: '1px solid var(--color-border)',
        borderRadius: RADIUS.block,
        background: 'var(--color-surface)',
        color: 'var(--color-text)',
        cursor: 'pointer',
        fontFamily: 'var(--font-body)',
        textAlign: 'left',
      }}
    >
      <span
        style={{
          display: 'grid',
          placeItems: 'center',
          width: 40,
          height: 40,
          flex: 'none',
          borderRadius: 12,
          background: pastel,
          color: tinta,
        }}
      >
        <Trazos d1={d1} d2={d2} size={21} />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: 14, fontWeight: 700, lineHeight: 1.25 }}>{curso.name}</span>
        {/*
          El estado sale de `courseState`, el mismo que usa Mi Ruta al pie: en
          prueba los mini cursos están cerrados enteros, sin lección de muestra.
        */}
        <span style={{ display: 'block', fontSize: 12, color: 'var(--color-text-2)', marginTop: 2 }}>
          {curso.total} lecciones · {courseState(level, curso.done)}
        </span>
      </span>
      <ChevronRight size={16} strokeWidth={2.7} style={{ flex: 'none', color: 'var(--color-text-2)' }} />
    </button>
  );
}

function Trazos({ d1, d2, size }: { d1: string; d2: string; size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.85}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={d1} />
      <path d={d2} />
    </svg>
  );
}
