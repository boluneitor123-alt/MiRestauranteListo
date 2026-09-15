'use client';

import type { DishMetrics } from '@/domain/costing';
import { money, money2, pct } from '@/domain/format';
import { semaphoreLevel, type SemaphoreLevel } from '@/domain/semaphore';
import { resolveDish, type Dish, type MenuSection } from '@/domain/types';
import { RADIUS } from '@/components/ui';

/**
 * Un platillo en la lista: ícono de su sección, nombre y las tres cifras.
 *
 * El ícono va por sección de la carta —entradas, fuertes, bebidas, postres— y
 * no es una foto. Una foto de banco de imágenes en un platillo que la persona
 * nombró resta credibilidad: el taco de la foto no es su taco, y el resto de
 * la pantalla son números suyos.
 *
 * Costo, precio y food cost en columnas, con el food cost en el color del
 * semáforo. Antes iban los tres en una línea corrida separados por puntos y
 * había que leerla entera para encontrar el que importa.
 */

const COLOR_DEL_SEMAFORO: Record<SemaphoreLevel, string> = {
  saludable: 'var(--color-accent-2-700)',
  revisar: 'var(--color-warn)',
  peligroso: 'var(--color-danger-700)',
  'sin-precio': 'var(--color-neutral-600)',
};

/** Pastel y tinta de cada sección de la carta. Salen de la paleta de categorías. */
const PASTEL: Record<MenuSection, [string, string]> = {
  Entradas: ['var(--cat-marketing)', 'var(--cat-marketing-ink)'],
  Fuertes: ['var(--cat-menu)', 'var(--cat-menu-ink)'],
  Bebidas: ['var(--cat-permisos)', 'var(--cat-permisos-ink)'],
  Postres: ['var(--cat-operacion)', 'var(--cat-operacion-ink)'],
};

/** Los dos trazos del ícono de cada sección. */
const TRAZOS: Record<MenuSection, [string, string]> = {
  // Un tazón con vapor.
  Entradas: ['M4 11.5h16a8 8 0 0 1-16 0Z', 'M3 15.5h18M9 7.5c0-1 1-1.3 1-2.3M13.5 7.5c0-1 1-1.3 1-2.3'],
  // Un plato con cubiertos.
  Fuertes: ['M7 3v8a2 2 0 0 0 4 0V3M9 11v10', 'M17 3c-1.5 1.5-2 3.5-2 5.5s.7 3 2 3.5v9'],
  // Un vaso con popote.
  Bebidas: ['M6 7h12l-1.4 12.2a2 2 0 0 1-2 1.8H9.4a2 2 0 0 1-2-1.8Z', 'M9.5 7 14 2.5M6.6 11.5h10.8'],
  // Un helado en copa.
  Postres: ['M6.5 9.5h11L12 20.5Z', 'M8.5 9.5a3.5 3.5 0 0 1 7 0M10 6a2.8 2.8 0 0 1 4.6-1'],
};

export function FilaDePlatillo({
  dish,
  metrics,
  onOpen,
}: {
  dish: Dish;
  metrics: DishMetrics;
  onOpen: () => void;
}) {
  const seccion = resolveDish(dish).section;
  const [fondo, tinta] = PASTEL[seccion];
  const [d1, d2] = TRAZOS[seccion];
  const nivel = semaphoreLevel(metrics.foodCostRounded);

  return (
    <button
      type="button"
      onClick={onOpen}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 13px',
        border: 'none',
        borderRadius: RADIUS.block,
        background: 'var(--color-surface)',
        boxShadow: 'var(--shadow-sm)',
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
          width: 44,
          height: 44,
          flex: 'none',
          borderRadius: 13,
          background: fondo,
          color: tinta,
        }}
      >
        <svg
          width={23}
          height={23}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d={d1} />
          <path d={d2} />
        </svg>
      </span>

      <span style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            display: 'block',
            fontSize: 14.5,
            fontWeight: 700,
            lineHeight: 1.2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {dish.name}
        </span>
        {/*
          Tres columnas con su rótulo debajo. El food cost lleva el color del
          semáforo: es el único de los tres que dice si el platillo está bien.
        */}
        <span style={{ display: 'flex', gap: 14, marginTop: 5 }}>
          <Cifra valor={money2(metrics.costPerPortion)} rotulo="Costo" />
          <Cifra valor={metrics.hasPrice ? money(metrics.price) : '—'} rotulo="Precio" />
          <Cifra
            valor={metrics.hasPrice ? pct(metrics.foodCost) : 'sin precio'}
            rotulo="Food cost"
            color={COLOR_DEL_SEMAFORO[nivel]}
          />
        </span>
      </span>
    </button>
  );
}

function Cifra({ valor, rotulo, color }: { valor: string; rotulo: string; color?: string }) {
  return (
    <span style={{ minWidth: 0 }}>
      <span
        style={{
          display: 'block',
          fontSize: 13.5,
          fontWeight: 800,
          lineHeight: 1.15,
          color: color ?? 'var(--color-text)',
          whiteSpace: 'nowrap',
        }}
      >
        {valor}
      </span>
      <span style={{ display: 'block', fontSize: 10.5, color: 'var(--color-text-2)', marginTop: 1 }}>{rotulo}</span>
    </span>
  );
}
