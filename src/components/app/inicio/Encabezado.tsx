'use client';

import { ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';
import { RADIUS } from '@/components/ui';

/**
 * Título de pestaña con el rótulo del proyecto a la derecha.
 *
 * En el prototipo el rótulo es un selector de restaurante; aquí cada cuenta
 * tiene un proyecto, así que abre sus datos.
 */
export function Encabezado({
  titulo,
  bajada,
  proyecto,
  onOpenProject,
}: {
  titulo: ReactNode;
  bajada: string;
  proyecto: string;
  onOpenProject: () => void;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3
          style={{
            margin: 0,
            fontFamily: 'var(--font-heading)',
            fontSize: 27,
            lineHeight: 1.08,
            letterSpacing: '-.025em',
          }}
        >
          {titulo}
        </h3>
        <p style={{ margin: '5px 0 0', fontSize: 14, color: 'var(--color-text-2)' }}>{bajada}</p>
      </div>
      <button
        type="button"
        onClick={onOpenProject}
        style={{
          flex: 'none',
          minHeight: 44,
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          padding: '11px 13px',
          border: '1px solid var(--color-border)',
          borderRadius: RADIUS.inner,
          background: 'var(--color-surface)',
          cursor: 'pointer',
          fontFamily: 'var(--font-body)',
          color: 'var(--color-text)',
          maxWidth: '52%',
        }}
      >
        <svg
          width={19}
          height={19}
          style={{ flex: 'none' }}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.9}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M4 9.5 5.5 4h13L20 9.5" />
          <path d="M4 9.5a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0M5.5 11.5V20h13v-8.5M10 20v-5h4v5" />
        </svg>
        <span
          style={{
            flex: 1,
            minWidth: 0,
            fontSize: 14,
            fontWeight: 700,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {proyecto}
        </span>
        <ChevronDown size={15} strokeWidth={2.8} style={{ flex: 'none', color: 'var(--color-text-2)' }} />
      </button>
    </div>
  );
}
