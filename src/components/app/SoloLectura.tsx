'use client';

import type { ReactNode } from 'react';
import type { AccessLevel } from '@/domain/access';
import { Candado } from './Candado';

/**
 * Un bloque que se ve completo y no se puede tocar.
 *
 * Se usa donde el contrato pide «vista general permitida, edición bloqueada»:
 * la estructura, los conceptos y la interfaz siguen ahí, y lo que se apaga es
 * la captura. Encima va el letrero, siempre el mismo.
 *
 * `inert` es lo que de verdad desactiva el subárbol: quita el foco del teclado
 * y los clics, no sólo el cursor. Un `pointer-events: none` se salta con Tab, y
 * alguien navegando con teclado habría podido escribir en campos que la
 * pantalla presenta como bloqueados.
 *
 * Esto es la capa de pantalla. Quien llame a la API a mano se topa igual con
 * `aplicarAlcance` en `PUT /api/project`, que es donde de verdad se decide.
 */
export function SoloLectura({
  activo,
  level,
  onOpenPaywall,
  children,
}: {
  /** `false` deja pasar todo sin envolver nada. */
  activo: boolean;
  level: AccessLevel;
  onOpenPaywall: () => void;
  children: ReactNode;
}) {
  if (!activo) return <>{children}</>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 12 }}>
      <Candado level={level} motivo="edicion" onOpenPaywall={onOpenPaywall} compacto />
      <div inert style={{ opacity: 0.72 }}>
        {children}
      </div>
    </div>
  );
}
