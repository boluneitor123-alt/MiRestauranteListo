'use client';

import { Users } from 'lucide-react';
import type { Titular } from '@/domain/titular';
import { money } from '@/domain/format';
import { NumeroAnimado } from '@/components/app/inicio/NumeroAnimado';
import { RADIUS } from '@/components/ui';

/**
 * La frase, en grande y arriba de todo: la pieza central de Números.
 *
 * Antes la pantalla abría con la revisión de realidad y había que bajar para
 * encontrar la única cifra que contesta «¿esto me va a dar de comer?». Ahora
 * es lo primero, antes incluso de las pestañas.
 *
 * Mientras no haya gastos fijos capturados no hay cifra que dar, y entonces
 * dice qué falta: un cero aquí se leería como «tu negocio no necesita vender
 * nada», que es lo contrario de lo que pasa.
 */
export function FraseDeNumeros({ titular }: { titular: Titular }) {
  return (
    <div
      style={{
        padding: '18px 18px 17px',
        borderRadius: RADIUS.card,
        background: 'var(--color-accent-100)',
        border: '1px solid var(--color-accent-200)',
      }}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 7,
          fontSize: 10.5,
          letterSpacing: '.09em',
          textTransform: 'uppercase',
          fontWeight: 800,
          color: 'var(--color-accent-800)',
        }}
      >
        <Users size={13} strokeWidth={2.7} />
        Tus números
      </span>

      {titular.listo ? (
        <>
          <div
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 25,
              lineHeight: 1.14,
              letterSpacing: '-.02em',
              marginTop: 9,
            }}
          >
            {titular.antes} <NumeroAnimado id="titular-numeros" valor={titular.numero} /> {titular.unidad}{' '}
            {titular.despues}
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-accent-900)', marginTop: 8 }}>
            {money(titular.ventaMensual)} de venta al mes
          </div>
        </>
      ) : (
        <p className="mrl-prose" style={{ margin: '9px 0 0', fontSize: 14.5, lineHeight: 1.45 }}>
          {titular.mensaje}
        </p>
      )}
    </div>
  );
}
