'use client';

import { ArrowRight, ShieldCheck } from 'lucide-react';
import { avisoDePrueba, type AccessLevel } from '@/domain/access';
import { money } from '@/domain/format';
import { RADIUS } from '@/components/ui';

/**
 * La prueba y el precio, al pie de Inicio.
 *
 * Hasta ahora el precio sólo aparecía al chocar con un candado: la persona
 * pasaba días sin saber cuánto cuesta y se enteraba en el peor momento, justo
 * cuando la app le acababa de cerrar una puerta. Aquí se lee desde el primer
 * día, al lado de cuántos le quedan, sin que nadie tope con nada.
 *
 * El precio viene del `entitlement`, que lo saca de los ajustes del panel —el
 * mismo número con el que Stripe arma el cobro—. Nunca de una constante de
 * pantalla: si el dueño cambia el precio, esto cambia con él.
 *
 * Quién ve esto lo decide `avisoDePrueba`, por nivel y no por fecha. Con
 * licencia devuelve `null` y la tarjeta no existe: a quien pagó no se le
 * vuelve a ofrecer el pago.
 */
export function TarjetaDePrueba({
  level,
  trial,
  precio,
  onOpenPaywall,
}: {
  level: AccessLevel;
  trial: { daysLeft: number; expired: boolean } | null;
  /** Pesos, del panel de admin vía el entitlement. `null` mientras no llega. */
  precio: number | null;
  onOpenPaywall: () => void;
}) {
  const aviso = avisoDePrueba(level, trial);
  if (!aviso) return null;

  return (
    <div
      style={{
        padding: '16px 17px',
        borderRadius: RADIUS.card,
        background: 'var(--color-accent-2-100)',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr)',
        gap: 12,
      }}
    >
      <div>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 10.5,
            letterSpacing: '.09em',
            textTransform: 'uppercase',
            fontWeight: 800,
            color: 'var(--color-accent-2-800)',
          }}
        >
          <ShieldCheck size={13} strokeWidth={2.6} />
          {aviso.titulo}
        </span>

        {precio === null ? null : (
          <div style={{ marginTop: 9 }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: 27, lineHeight: 1.05, letterSpacing: '-.02em' }}>
              {money(precio)} MXN
            </span>
            <span style={{ fontSize: 13.5, fontWeight: 700, marginLeft: 8 }}>pago único</span>
            <div style={{ fontSize: 12.5, color: 'var(--color-accent-2-900)', marginTop: 3 }}>Sin mensualidades</div>
          </div>
        )}

        <p
          className="mrl-prose"
          style={{ margin: '9px 0 0', fontSize: 12.5, lineHeight: 1.5, color: 'var(--color-accent-2-900)' }}
        >
          {aviso.detalle}
        </p>
      </div>

      <button
        type="button"
        onClick={onOpenPaywall}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 9,
          width: '100%',
          minHeight: 48,
          padding: '0 18px',
          border: '1px solid var(--color-accent-2-600)',
          borderRadius: RADIUS.control,
          background: 'var(--color-surface)',
          color: 'var(--color-accent-2-800)',
          fontFamily: 'var(--font-body)',
          fontSize: 14.5,
          fontWeight: 800,
          cursor: 'pointer',
        }}
      >
        Ver qué incluye
        <ArrowRight size={17} strokeWidth={2.8} />
      </button>
    </div>
  );
}
