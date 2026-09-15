'use client';

import { ChevronRight } from 'lucide-react';
import type { ModuleProgress, StageProgress, StageState } from '@/domain/progress';
import { RADIUS } from '@/components/ui';

/**
 * Las tres etapas como pestañas, con los módulos de la que esté activa.
 *
 * Antes eran un acordeón: tres tarjetas que se abrían y cerraban, y con las
 * tres cerradas la pantalla no decía qué hacer. Con pestañas siempre hay una
 * etapa abierta y los módulos de las otras dos no estorban.
 *
 * Ningún conteo se teclea. Las tareas, los módulos y las etapas salen de
 * `ETAPAS` y del progreso; escribirlos a mano es lo que dejó la app diciendo
 * «14 módulos y 90 tareas» cuando la ruta ya eran 10 y 43.
 */
export function PestanasDeEtapa({
  etapas,
  activa,
  onCambiar,
  onSelectModule,
}: {
  etapas: StageProgress[];
  /** Id de la etapa abierta. */
  activa: string;
  onCambiar: (id: string) => void;
  onSelectModule: (id: string) => void;
}) {
  const etapa = etapas.find((e) => e.id === activa) ?? etapas[0];
  if (!etapa) return null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 14 }}>
      <div
        role="tablist"
        aria-label="Etapas de la ruta"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${etapas.length}, minmax(0, 1fr))`,
          gap: 4,
          padding: 4,
          borderRadius: RADIUS.block,
          background: 'var(--color-neutral-200)',
        }}
      >
        {etapas.map((e) => {
          const on = e.id === etapa.id;
          return (
            <button
              key={e.id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => onCambiar(e.id)}
              style={{
                minHeight: 48,
                padding: '6px 4px',
                border: on ? '1.5px solid var(--color-accent)' : '1.5px solid transparent',
                borderRadius: RADIUS.small,
                background: on ? 'var(--color-surface)' : 'transparent',
                color: 'var(--color-text)',
                fontFamily: 'var(--font-body)',
                cursor: 'pointer',
                display: 'grid',
                placeItems: 'center',
                gap: 1,
              }}
            >
              <span style={{ fontSize: 11.5, fontWeight: 700, color: on ? 'var(--color-accent-800)' : 'var(--color-text-2)' }}>
                Etapa {e.n}
              </span>
              <span style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: '.02em' }}>{e.name}</span>
            </button>
          );
        })}
      </div>

      {/* El encabezado de la etapa abierta: su cuenta de tareas y para qué es. */}
      <div style={{ padding: '15px 16px', borderRadius: RADIUS.card, background: etapa.tint }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <span
            style={{
              display: 'grid',
              placeItems: 'center',
              width: 38,
              height: 38,
              flex: 'none',
              borderRadius: 12,
              background: 'var(--color-surface)',
              color: etapa.ink,
            }}
          >
            <Trazos d1={etapa.d1} d2={etapa.d2} size={20} />
          </span>
          <span style={{ minWidth: 0 }}>
            <span style={{ display: 'block', fontFamily: 'var(--font-heading)', fontSize: 18, lineHeight: 1.15 }}>
              Etapa {etapa.n}: {etapa.name}
            </span>
            <span style={{ display: 'block', fontSize: 12.5, color: 'var(--color-text-2)', marginTop: 2 }}>
              {conteo(etapa.modules.length, 'módulo', 'módulos')} · {conteo(etapa.total, 'tarea', 'tareas')} ·{' '}
              <span style={{ color: TINTA[etapa.state], fontWeight: 700 }}>{etapa.state}</span>
            </span>
          </span>
        </div>
        <p className="mrl-prose" style={{ margin: '10px 0 0', fontSize: 13, lineHeight: 1.5, color: 'var(--color-text-2)' }}>
          {etapa.desc}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 9 }}>
        {etapa.modules.map((mod, i) => (
          <ModuloNumerado key={mod.id} n={i + 1} mod={mod} onSelect={() => onSelectModule(mod.id)} />
        ))}
      </div>
    </div>
  );
}

/** Tinta del estado de la etapa. La traía el pie de tres columnas que sustituyó esto. */
const TINTA: Record<StageState, string> = {
  Completado: 'var(--color-accent-2-700)',
  'En progreso': 'var(--color-accent-800)',
  Pendiente: 'var(--color-text-2)',
};

/** «1 módulo» / «11 tareas»: el singular importa cuando la etapa trae uno solo. */
function conteo(n: number, uno: string, varios: string): string {
  return `${n} ${n === 1 ? uno : varios}`;
}

/** Un módulo de la etapa: número en círculo, nombre, para qué es y su avance. */
function ModuloNumerado({ n, mod, onSelect }: { n: number; mod: ModuleProgress; onSelect: () => void }) {
  const completo = mod.total > 0 && mod.done === mod.total;
  const circulo = mod.skipped
    ? ['var(--color-neutral-300)', 'var(--color-text-2)']
    : completo
      ? ['var(--color-accent-2-500)', '#fff']
      : mod.done
        ? ['var(--color-accent)', 'var(--on-accent)']
        : ['var(--color-accent-100)', 'var(--color-accent-800)'];

  return (
    <button
      type="button"
      onClick={onSelect}
      style={{
        width: '100%',
        minHeight: 60,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '13px 14px',
        border: '1px solid var(--color-border)',
        borderRadius: RADIUS.block,
        background: 'var(--color-surface)',
        cursor: 'pointer',
        fontFamily: 'var(--font-body)',
        color: 'var(--color-text)',
        textAlign: 'left',
      }}
    >
      <span
        style={{
          display: 'grid',
          placeItems: 'center',
          width: 32,
          height: 32,
          flex: 'none',
          borderRadius: '50%',
          background: circulo[0],
          color: circulo[1],
          fontSize: 14,
          fontWeight: 800,
        }}
      >
        {n}
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: 14.5, fontWeight: 700, lineHeight: 1.2 }}>{mod.name}</span>
        <span
          className="mrl-prose"
          style={{ display: 'block', fontSize: 12.2, lineHeight: 1.4, color: 'var(--color-text-2)', marginTop: 2 }}
        >
          {mod.skipped ? `Omitido · ${mod.reason ?? 'sin motivo'}` : mod.desc}
        </span>
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 'none' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-2)', whiteSpace: 'nowrap' }}>
          {mod.skipped ? '—' : `${mod.done}/${mod.total}`}
        </span>
        <ChevronRight size={16} strokeWidth={2.7} style={{ color: 'var(--color-text-2)' }} />
      </span>
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
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={d1} />
      <path d={d2} />
    </svg>
  );
}
