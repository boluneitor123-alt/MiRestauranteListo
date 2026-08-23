'use client';

import { ArrowRight, ChevronDown, ChevronRight, Sparkles, Star } from 'lucide-react';
import type { CSSProperties } from 'react';
import { ETAPAS } from '@/content/route';
import type { ModuleProgress, ProjectProgress, StageProgress, StageState } from '@/domain/progress';
import { stageProgress } from '@/domain/progress';
import type { AccessLevel } from '@/domain/access';
import { RADIUS } from '@/components/ui';

/**
 * Mi Ruta, vista de etapas: los 10 módulos de la ruta agrupados en Define,
 * Construye y Abre, con los cuatro mini cursos debajo.
 *
 * La agrupación no se escribe aquí: sale de `ETAPAS`, que es su única fuente
 * de verdad (entrega-v2 § "Mi Ruta").
 */

/** Tinta del estado, relleno de la insignia y tinta de la insignia. */
const COLOR: Record<StageState, [string, string, string]> = {
  Completado: ['var(--color-accent-2-600)', 'var(--color-accent-2-100)', 'var(--color-accent-2-700)'],
  'En progreso': ['var(--color-accent-600)', 'var(--color-accent-100)', 'var(--color-accent-800)'],
  Pendiente: ['var(--color-text-2)', 'var(--color-neutral-200)', 'var(--color-text-2)'],
};

/** Los dos trazos del icono de cada mini curso. */
const CURSO_ART: Record<string, [string, string]> = {
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

/** Pastel de categoría de cada mini curso: relleno y tinta. */
const CURSO_PASTEL: Record<string, [string, string]> = {
  ventas: ['var(--cat-marketing)', 'var(--cat-marketing-ink)'],
  maps: ['var(--cat-permisos)', 'var(--cat-permisos-ink)'],
  delivery: ['var(--cat-numeros)', 'var(--cat-numeros-ink)'],
  contratar: ['var(--cat-operacion)', 'var(--cat-operacion-ink)'],
};

/** El icono de dos trazos que comparten etapas y cursos. */
function Trazos({ d1, d2, size, width = 1.8 }: { d1: string; d2: string; size: number; width?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={d1} />
      <path d={d2} />
    </svg>
  );
}

export function Etapas({
  progress,
  level,
  stageOpen,
  onToggleStage,
  onSelectModule,
  onOpenList,
  onOpenNext,
}: {
  progress: ProjectProgress;
  level: AccessLevel;
  /** Etapa desplegada, o null si están las tres cerradas. */
  stageOpen: string | null;
  onToggleStage: (id: string | null) => void;
  onSelectModule: (id: string) => void;
  onOpenList: () => void;
  onOpenNext: () => void;
}) {
  const etapas = stageProgress(ETAPAS, progress.modules);
  const cursos = progress.modules.filter((m) => m.course);
  const lecciones = cursos.reduce((a, c) => a + c.total, 0);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 0 }}>
      <ProgresoGeneral progress={progress} etapas={etapas} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '26px 2px 12px' }}>
        <h4 style={{ margin: 0, flex: 1, fontSize: 19, letterSpacing: '-.01em', fontFamily: 'var(--font-heading)' }}>
          Tus etapas
        </h4>
        <button
          type="button"
          onClick={onOpenList}
          className="mrl-hit"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '10px 4px',
            border: 'none',
            background: 'none',
            color: 'var(--color-accent-700)',
            fontFamily: 'var(--font-body)',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Ver toda la ruta
          <ArrowRight size={14} strokeWidth={3} />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {etapas.map((etapa) => (
          <TarjetaEtapa
            key={etapa.id}
            etapa={etapa}
            open={stageOpen === etapa.id}
            onToggle={() => onToggleStage(stageOpen === etapa.id ? null : etapa.id)}
            onSelectModule={onSelectModule}
          />
        ))}
      </div>

      <SiguienteAccion progress={progress} onOpen={onOpenNext} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '26px 2px 12px' }}>
        <span
          style={{
            display: 'grid',
            placeItems: 'center',
            width: 26,
            height: 26,
            flex: 'none',
            borderRadius: 8,
            background: 'var(--color-accent-2-100)',
            color: 'var(--color-accent-2-700)',
          }}
        >
          <Star size={15} fill="currentColor" strokeWidth={0} />
        </span>
        <h4 style={{ margin: 0, flex: 1, fontSize: 19, letterSpacing: '-.01em', fontFamily: 'var(--font-heading)' }}>
          Puntos extra
        </h4>
        <span style={{ fontSize: 12.5, color: 'var(--color-text-2)', whiteSpace: 'nowrap' }}>
          {lecciones} lecciones
        </span>
      </div>
      <p style={{ margin: '0 2px 12px', fontSize: 13.5, lineHeight: 1.45, color: 'var(--color-text-2)' }}>
        Cuatro mini cursos para cuando ya vendes. Tómalos en cualquier orden — no hace falta terminarlos para abrir.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {cursos.map((curso) => (
          <FichaCurso key={curso.id} curso={curso} level={level} onSelect={() => onSelectModule(curso.id)} />
        ))}
      </div>
    </div>
  );
}

/** La tarjeta de arriba: avance general y las tres etapas de un vistazo. */
function ProgresoGeneral({ progress, etapas }: { progress: ProjectProgress; etapas: StageProgress[] }) {
  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: '18px 18px 16px',
        border: '1px solid var(--color-border)',
        borderRadius: RADIUS.card,
        background: 'var(--color-surface)',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/img/arnold-tres.webp"
        alt=""
        aria-hidden
        style={{ position: 'absolute', right: -10, top: 8, width: '46%', maxWidth: 190, height: 'auto', pointerEvents: 'none' }}
      />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 11 }}>
        <span
          style={{
            display: 'grid',
            placeItems: 'center',
            width: 38,
            height: 38,
            flex: 'none',
            borderRadius: '50%',
            background: 'var(--color-accent-100)',
            color: 'var(--color-accent-700)',
          }}
        >
          <Trazos
            size={20}
            width={2.1}
            d1="M7 4h10v5a5 5 0 0 1-10 0Z"
            d2="M7 5.5H4.5v1A3.5 3.5 0 0 0 8 10M17 5.5h2.5v1A3.5 3.5 0 0 1 16 10M9.5 14h5l-.6 4h-3.8ZM8 21h8"
          />
        </span>
        <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-.01em' }}>Tu progreso general</span>
      </div>

      <div style={{ position: 'relative', marginTop: 14, maxWidth: '52%' }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: 46, lineHeight: 1, letterSpacing: '-.035em' }}>
          {progress.pct}%
        </div>
        <div style={{ fontSize: 15, color: 'var(--color-text-2)', marginTop: 2 }}>completado</div>
      </div>

      <div
        style={{
          position: 'relative',
          marginTop: 18,
          height: 11,
          borderRadius: RADIUS.pill,
          background: 'var(--color-neutral-200)',
          overflow: 'hidden',
        }}
      >
        <span
          style={{
            display: 'block',
            width: `${progress.pct}%`,
            height: '100%',
            borderRadius: RADIUS.pill,
            background: 'var(--color-accent)',
          }}
        />
      </div>

      <div
        style={{
          position: 'relative',
          marginTop: 18,
          paddingTop: 18,
          borderTop: '1px solid var(--color-border)',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 4,
        }}
      >
        {etapas.map((etapa) => {
          const col = COLOR[etapa.state];
          return (
            <div key={etapa.id} style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <span
                  style={{
                    display: 'grid',
                    placeItems: 'center',
                    width: 26,
                    height: 26,
                    flex: 'none',
                    borderRadius: '50%',
                    background: col[0],
                    color: '#fff',
                    fontFamily: 'var(--font-heading)',
                    fontSize: 13,
                  }}
                >
                  {etapa.n}
                </span>
                <span
                  style={{
                    display: 'grid',
                    placeItems: 'center',
                    width: 46,
                    height: 46,
                    flex: 'none',
                    borderRadius: '50%',
                    background: etapa.tint,
                    color: etapa.ink,
                  }}
                >
                  <Trazos size={22} d1={etapa.d1} d2={etapa.d2} />
                </span>
              </div>
              <div style={{ display: 'block', marginTop: 9, fontSize: 11.5, fontWeight: 800, letterSpacing: '.05em', color: col[0] }}>
                {etapa.name}
              </div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 19, marginTop: 3, letterSpacing: '-.02em' }}>
                {etapa.done}/{etapa.total}
              </div>
              <div style={{ marginTop: 2, fontSize: 11.5, color: col[0] }}>{etapa.state}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Una etapa que se despliega para ver sus módulos. */
function TarjetaEtapa({
  etapa,
  open,
  onToggle,
  onSelectModule,
}: {
  etapa: StageProgress;
  open: boolean;
  onToggle: () => void;
  onSelectModule: (id: string) => void;
}) {
  const col = COLOR[etapa.state];

  return (
    <div
      style={{
        border: '1px solid var(--color-border)',
        borderRadius: RADIUS.block,
        background: 'var(--color-surface)',
        overflow: 'hidden',
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'stretch',
          border: 'none',
          background: 'none',
          padding: 0,
          cursor: 'pointer',
          fontFamily: 'var(--font-body)',
          textAlign: 'left',
          color: 'var(--color-text)',
        }}
      >
        <span
          style={{
            position: 'relative',
            display: 'grid',
            placeItems: 'center',
            width: 92,
            flex: 'none',
            background: etapa.tint,
            color: etapa.ink,
          }}
        >
          <Trazos size={34} width={1.6} d1={etapa.d1} d2={etapa.d2} />
          {etapa.state === 'Completado' ? (
            <span
              style={{
                position: 'absolute',
                top: 9,
                right: 9,
                display: 'grid',
                placeItems: 'center',
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: 'var(--color-accent-2-500)',
                color: '#fff',
              }}
            >
              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </span>
          ) : null}
        </span>

        <span style={{ flex: 1, minWidth: 0, padding: '16px 14px' }}>
          <span style={{ display: 'block', fontFamily: 'var(--font-heading)', fontSize: 17, letterSpacing: '-.01em', color: col[0] }}>
            {etapa.n}. {etapa.name}
          </span>
          <span style={{ display: 'block', marginTop: 6, fontSize: 13.5, lineHeight: 1.45, color: 'var(--color-text-2)' }}>
            {etapa.desc}
          </span>
        </span>

        <span
          style={{
            flex: 'none',
            padding: '16px 14px 16px 0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            justifyContent: 'center',
            gap: 7,
          }}
        >
          <span
            style={{
              padding: '5px 11px',
              borderRadius: RADIUS.pill,
              background: col[1],
              color: col[2],
              fontSize: 11.5,
              fontWeight: 700,
              whiteSpace: 'nowrap',
            }}
          >
            {etapa.state}
          </span>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: 16, letterSpacing: '-.02em' }}>
            {etapa.done}/{etapa.total}
          </span>
          <span
            style={{
              display: 'grid',
              placeItems: 'center',
              color: 'var(--color-text-2)',
              transform: open ? 'rotate(180deg)' : 'none',
              transition: 'transform .2s',
            }}
          >
            <ChevronDown size={17} strokeWidth={2.6} />
          </span>
        </span>
      </button>

      {open ? (
        <div style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: 7 }}>
          {etapa.modules.map((mod) => (
            <FilaModulo key={mod.id} mod={mod} onSelect={() => onSelectModule(mod.id)} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function FilaModulo({ mod, onSelect }: { mod: ModuleProgress; onSelect: () => void }) {
  const punto = mod.skipped
    ? 'var(--color-neutral-400)'
    : mod.done === mod.total && mod.total > 0
      ? 'var(--color-accent-2-500)'
      : mod.done
        ? 'var(--color-accent)'
        : 'var(--color-neutral-400)';

  return (
    <button
      type="button"
      onClick={onSelect}
      style={{
        width: '100%',
        minHeight: 44,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '11px 12px',
        border: '1px solid var(--color-border)',
        borderRadius: RADIUS.small,
        background: 'var(--color-neutral-200)',
        cursor: 'pointer',
        fontFamily: 'var(--font-body)',
        color: 'var(--color-text)',
      }}
    >
      <span style={{ display: 'block', width: 10, height: 10, flex: 'none', borderRadius: '50%', background: punto }} />
      <span style={{ flex: 1, minWidth: 0, textAlign: 'left', fontSize: 13.5, fontWeight: 700 }}>{mod.name}</span>
      <span style={{ fontSize: 12, color: 'var(--color-text-2)', whiteSpace: 'nowrap' }}>
        {mod.skipped ? 'Omitido' : `${mod.done}/${mod.total}`}
      </span>
      <ChevronRight size={15} strokeWidth={2.6} style={{ flex: 'none', color: 'var(--color-text-2)' }} />
    </button>
  );
}

/** "Tu siguiente acción": la primera tarea pendiente, con un botón que la abre. */
function SiguienteAccion({ progress, onOpen }: { progress: ProjectProgress; onOpen: () => void }) {
  const tarea = progress.nextTask;
  if (!tarea) return null;

  return (
    <div style={{ marginTop: 22, padding: '18px 16px', borderRadius: RADIUS.card, background: 'var(--color-accent-100)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <Sparkles size={17} fill="var(--color-accent-600)" strokeWidth={0} style={{ flex: 'none' }} />
        <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-.01em', color: 'var(--color-accent-900)' }}>
          Tu siguiente acción
        </span>
      </div>
      <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 13, flexWrap: 'wrap' }}>
        <span
          style={{
            display: 'grid',
            placeItems: 'center',
            width: 66,
            height: 66,
            flex: 'none',
            borderRadius: RADIUS.inner,
            background: 'var(--cat-menu)',
            color: 'var(--cat-menu-ink)',
          }}
        >
          <Trazos size={32} d1="M4 11h16a8 8 0 0 0-16 0Z" d2="M4.5 14.5h15M6 18h12" />
        </span>
        <span style={{ flex: 1, minWidth: 150 }}>
          <span style={{ display: 'block', fontFamily: 'var(--font-heading)', fontSize: 19, lineHeight: 1.15, letterSpacing: '-.02em' }}>
            {tarea.title}
          </span>
          <span style={{ display: 'block', marginTop: 5, fontSize: 13.5, lineHeight: 1.45, color: 'var(--color-text-2)' }}>
            {tarea.next}
          </span>
        </span>
        <button
          type="button"
          onClick={onOpen}
          style={{
            flex: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            height: 52,
            paddingInline: 22,
            border: 'none',
            borderRadius: RADIUS.control,
            background: 'var(--color-accent)',
            color: 'var(--on-accent)',
            fontFamily: 'var(--font-heading)',
            fontSize: 16,
            letterSpacing: '-.01em',
            cursor: 'pointer',
          }}
        >
          Continuar
          <ArrowRight size={18} strokeWidth={2.8} />
        </button>
      </div>
    </div>
  );
}

/** Una de las cuatro fichas de mini curso. */
function FichaCurso({ curso, level, onSelect }: { curso: ModuleProgress; level: AccessLevel; onSelect: () => void }) {
  const art = CURSO_ART[curso.id] ?? CURSO_ART.ventas;
  const pastel = CURSO_PASTEL[curso.id] ?? CURSO_PASTEL.ventas;
  // Sin licencia el curso se enseña completo pero sólo se abre su lección 1:
  // ver lo que hay adentro es lo que empuja al pago.
  const libre = level !== 'licencia';
  const sub = libre
    ? `${curso.total} lecciones · lección 1 abierta`
    : curso.done
      ? `${curso.done} de ${curso.total} lecciones`
      : `${curso.total} lecciones · sin empezar`;

  const tile: CSSProperties = {
    display: 'grid',
    placeItems: 'center',
    width: 40,
    height: 40,
    flex: 'none',
    borderRadius: 12,
    background: pastel[0],
    color: pastel[1],
  };

  return (
    <button
      type="button"
      onClick={onSelect}
      style={{
        textAlign: 'left',
        padding: '15px 14px',
        border: '1px solid var(--color-border)',
        borderRadius: RADIUS.block,
        background: 'var(--color-surface)',
        cursor: 'pointer',
        fontFamily: 'var(--font-body)',
        color: 'var(--color-text)',
      }}
    >
      <span style={tile}>
        <Trazos size={21} width={2.2} d1={art[0]} d2={art[1]} />
      </span>
      <span style={{ display: 'block', marginTop: 11, fontSize: 14, fontWeight: 800, lineHeight: 1.22 }}>{curso.name}</span>
      <span style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginTop: 6 }}>
        <span style={{ flex: 1, minWidth: 0, fontSize: 12, lineHeight: 1.35, color: 'var(--color-text-2)' }}>{sub}</span>
        <ChevronRight size={15} strokeWidth={2.8} style={{ flex: 'none', color: 'var(--color-text-2)' }} />
      </span>
      {!libre && curso.done > 0 ? (
        <span
          style={{
            display: 'block',
            marginTop: 10,
            height: 5,
            borderRadius: RADIUS.pill,
            background: 'var(--color-neutral-300)',
            overflow: 'hidden',
          }}
        >
          <span
            style={{
              display: 'block',
              width: `${curso.total ? (curso.done / curso.total) * 100 : 0}%`,
              height: '100%',
              borderRadius: RADIUS.pill,
              background: 'var(--color-accent-2-500)',
            }}
          />
        </span>
      ) : null}
    </button>
  );
}
