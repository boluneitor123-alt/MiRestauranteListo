'use client';

import { Lock } from 'lucide-react';
import { textoDeCandado, type AccessLevel } from '@/domain/access';
import { Button, RADIUS } from '@/components/ui';

/**
 * El único letrero de «esto se abre con el pago».
 *
 * Había ocho textos distintos en tres formas visuales —«Se abre con el pago
 * único», «Esta lección se abre…», «Mi Menú se abre…», «Los abres con…»— y
 * cada pantalla resolvía el suyo. Un solo producto no puede decirle a la misma
 * persona cuatro cosas parecidas pero distintas.
 *
 * `motivo` separa los dos casos que no son iguales: `contenido` es lo que no se
 * puede ver todavía; `edicion` es lo que sí se ve y no se puede cambiar. Al
 * vencer la prueba los dos dicen lo mismo, porque lo que importa entonces es
 * que los 7 días acabaron y nada se borró.
 */
export function Candado({
  level,
  motivo = 'contenido',
  detalle,
  onOpenPaywall,
  compacto = false,
}: {
  level: AccessLevel;
  motivo?: 'contenido' | 'edicion';
  /** Una línea que dice qué trae eso que está cerrado. Opcional. */
  detalle?: string;
  onOpenPaywall: () => void;
  /** Sin botón: para meterlo dentro de una lista o un encabezado. */
  compacto?: boolean;
}) {
  const titulo = textoDeCandado(level, motivo);

  return (
    <div
      style={{
        padding: compacto ? '10px 12px' : 16,
        borderRadius: RADIUS.small,
        background: 'var(--color-accent-100)',
        animation: 'mrlUp .2s ease both',
      }}
    >
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <Lock
          size={compacto ? 15 : 17}
          color="var(--color-accent-700)"
          strokeWidth={2.6}
          style={{ flex: 'none', marginTop: 2 }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: compacto ? 13 : 14,
              fontWeight: 800,
              color: 'var(--color-accent-900)',
              lineHeight: 1.35,
            }}
          >
            {titulo}
          </div>
          {detalle ? (
            <p
              style={{
                margin: '4px 0 0',
                fontSize: compacto ? 12.2 : 12.8,
                lineHeight: 1.5,
                color: 'var(--color-accent-900)',
              }}
            >
              {detalle}
            </p>
          ) : null}
        </div>
      </div>
      {compacto ? null : (
        <div style={{ marginTop: 12 }}>
          <Button onClick={onOpenPaywall}>Ver el pago único</Button>
        </div>
      )}
    </div>
  );
}
