'use client';

import { ArrowRight } from 'lucide-react';
import type { Titular } from '@/domain/titular';
import { money } from '@/domain/format';
import { NumeroAnimado } from './NumeroAnimado';
import { RADIUS } from '@/components/ui';

/**
 * «Necesitas 20 clientes al día para no perder dinero», en grande y arriba.
 *
 * Es lo primero que se ve al abrir Inicio, y es a propósito: es lo único que
 * esta app regala sin pedir nada a cambio. Antes vivía en una franja de un
 * renglón al pie de «Tu siguiente paso», debajo de una tarea pendiente, y el
 * orden decía lo contrario de lo que queremos decir: quien acaba de contestar
 * doce preguntas merece ver algo suyo antes de que le pidan más.
 *
 * Mientras no haya gastos fijos capturados no hay cifra que dar. En ese caso
 * dice qué falta y lleva a capturarlo; un cero aquí se leería como «tu negocio
 * no necesita vender nada», que es justo al revés.
 */
export function TitularGrande({ titular, onCapturarFijos }: { titular: Titular; onCapturarFijos: () => void }) {
  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: RADIUS.card,
        background: 'var(--color-accent)',
        color: 'var(--on-accent)',
        minHeight: 186,
      }}
    >
      {/*
        Arnold va a la derecha, mirando hacia el texto. Es el de Números: no
        tenemos una pose señalando como la de la maqueta y no se la inventamos
        —el personaje tiene un estilo y no se reinterpreta—, así que va el que
        ya habla de finanzas.
      */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <picture style={{ display: 'contents' }}>
        <source type="image/avif" srcSet="/img/arnold-numeros-480w.avif 480w, /img/arnold-numeros.avif 800w" sizes="170px" />
        <img
          src="/img/arnold-numeros.webp"
          srcSet="/img/arnold-numeros-480w.webp 480w, /img/arnold-numeros.webp 800w"
          sizes="170px"
          alt=""
          aria-hidden
          width={800}
          height={671}
          decoding="async"
          style={{ position: 'absolute', right: -10, bottom: -4, width: '45%', maxWidth: 178, height: 'auto', pointerEvents: 'none' }}
        />
      </picture>

      {/* 57% de texto contra 45% de Arnold: se traslapan sólo donde él es
          transparente, y el bloque queda tan alto como la ilustración en vez
          de dejarle medio recuadro naranja vacío arriba. */}
      <div style={{ position: 'relative', padding: '20px 18px', maxWidth: '57%' }}>
        {titular.listo ? (
          <>
            <p
              className="mrl-prose"
              style={{
                margin: 0,
                fontFamily: 'var(--font-heading)',
                fontSize: 24,
                lineHeight: 1.14,
                letterSpacing: '-.025em',
              }}
            >
              {titular.antes} <NumeroAnimado id="titular-inicio" valor={titular.numero} /> {titular.unidad}{' '}
              {titular.despues}
            </p>
            <p style={{ margin: '11px 0 0', fontSize: 15, fontWeight: 700, letterSpacing: '-.01em' }}>
              {money(titular.ventaMensual)} de venta al mes
            </p>
          </>
        ) : (
          <>
            <p
              className="mrl-prose"
              style={{
                margin: 0,
                fontFamily: 'var(--font-heading)',
                fontSize: 21,
                lineHeight: 1.2,
                letterSpacing: '-.02em',
              }}
            >
              {titular.mensaje}
            </p>
            <button
              type="button"
              onClick={onCapturarFijos}
              style={{
                marginTop: 14,
                minHeight: 44,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 9,
                paddingInline: 16,
                border: 'none',
                borderRadius: RADIUS.control,
                background: 'var(--color-surface)',
                color: 'var(--color-text)',
                fontFamily: 'var(--font-body)',
                fontSize: 14,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Capturar mis gastos fijos
              <ArrowRight size={16} strokeWidth={2.9} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
