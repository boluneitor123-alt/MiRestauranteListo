'use client';

import { Bell } from 'lucide-react';

/**
 * El encabezado de la app: la marca, la campana de alertas y el avatar.
 *
 * Se repite en las pestañas que lo llevan en la entrega v2, así que vive
 * aparte para que no puedan quedar dos versiones distintas.
 */
export function Chrome({
  initial,
  hasAlerts,
  onOpenAlerts,
  onOpenProfile,
}: {
  /** La inicial que se pinta en el avatar. */
  initial: string;
  /** Hay una alerta que merece el punto naranja. */
  hasAlerts: boolean;
  onOpenAlerts: () => void;
  onOpenProfile: () => void;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span
        style={{
          display: 'grid',
          placeItems: 'center',
          width: 42,
          height: 42,
          flex: 'none',
          borderRadius: 11,
          background: 'var(--color-text)',
          color: 'var(--color-neutral-100)',
          fontFamily: 'var(--font-heading)',
          fontSize: 13,
          letterSpacing: '-.02em',
        }}
      >
        MRL
      </span>
      <div
        style={{
          flex: 1,
          minWidth: 0,
          fontFamily: 'var(--font-heading)',
          fontSize: 17,
          letterSpacing: '-.02em',
        }}
      >
        Mi<span style={{ color: 'var(--color-accent-600)' }}>Restaurante</span>Listo
      </div>
      <button
        type="button"
        onClick={onOpenAlerts}
        aria-label="Alertas"
        style={{
          position: 'relative',
          width: 44,
          height: 44,
          flex: 'none',
          border: 'none',
          borderRadius: '50%',
          background: 'none',
          color: 'var(--color-text)',
          display: 'grid',
          placeItems: 'center',
          cursor: 'pointer',
          padding: 0,
        }}
      >
        <Bell size={21} strokeWidth={2.2} />
        {hasAlerts ? (
          <span
            style={{
              position: 'absolute',
              top: 6,
              right: 7,
              width: 9,
              height: 9,
              borderRadius: '50%',
              background: 'var(--color-accent)',
              border: '1.5px solid var(--color-bg)',
            }}
          />
        ) : null}
      </button>
      <button
        type="button"
        onClick={onOpenProfile}
        aria-label="Mi perfil"
        style={{
          width: 44,
          height: 44,
          flex: 'none',
          border: 'none',
          borderRadius: '50%',
          background: 'var(--color-accent-2-200)',
          color: 'var(--color-accent-2-900)',
          display: 'grid',
          placeItems: 'center',
          fontFamily: 'var(--font-heading)',
          fontSize: 16,
          cursor: 'pointer',
        }}
      >
        {initial}
      </button>
    </div>
  );
}
