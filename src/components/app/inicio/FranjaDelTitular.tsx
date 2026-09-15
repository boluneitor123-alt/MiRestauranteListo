'use client';

import { Users } from 'lucide-react';
import type { Titular } from '@/domain/titular';
import { money } from '@/domain/format';
import { NumeroAnimado } from './NumeroAnimado';

/**
 * «Necesitas 20 clientes al día», al pie de Tu siguiente paso.
 *
 * Va pegada al bloque cálido y no en una tarjeta blanca aparte. La versión
 * anterior —Resultados clave, cuatro métricas en su propio recuadro— quedó
 * fría y se comía media pantalla para decir lo que aquí cabe en dos renglones.
 * El resto de las métricas se leen en Números, que es su lugar.
 *
 * Si todavía no hay gastos fijos capturados no hay cifra que dar, y entonces
 * dice qué falta en vez de enseñar un cero: un cero aquí se lee como «tu
 * negocio no necesita vender nada», que es lo contrario de lo que pasa.
 */
export function FranjaDelTitular({ titular }: { titular: Titular }) {
  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '13px 18px',
        borderTop: '1px solid var(--color-accent-200)',
      }}
    >
      <span
        style={{
          display: 'grid',
          placeItems: 'center',
          width: 34,
          height: 34,
          flex: 'none',
          borderRadius: 11,
          background: 'var(--color-accent-200)',
          color: 'var(--color-accent-900)',
        }}
      >
        <Users size={18} strokeWidth={2.5} />
      </span>

      {titular.listo ? (
        <span style={{ minWidth: 0 }}>
          <span style={{ display: 'block', fontSize: 15.5, fontWeight: 800, letterSpacing: '-.01em' }}>
            {titular.antes}{' '}
            <NumeroAnimado id="titular-inicio" valor={titular.numero} />{' '}
            {titular.unidad}
          </span>
          <span style={{ display: 'block', fontSize: 12.5, color: 'var(--color-accent-900)', marginTop: 1 }}>
            {money(titular.ventaMensual)} de venta al mes
          </span>
        </span>
      ) : (
        <span className="mrl-prose" style={{ minWidth: 0, fontSize: 13, lineHeight: 1.45 }}>
          {titular.mensaje}
        </span>
      )}
    </div>
  );
}
