'use client';

import { ArrowLeft } from 'lucide-react';
import type { RealityResult } from '@/domain/reality';
import type { CapacityInput } from '@/domain/reality';
import { H, RADIUS } from '@/components/ui';
import { NumberField } from '../costeador/DishEditor';

/**
 * "Revisión de realidad": los cinco cruces de Números.
 *
 * No mira los números uno por uno, los cruza entre sí. Es donde se ve que la
 * venta que hace falta no cabe en la cocina, o que la renta se come el mes,
 * antes de firmar nada.
 */
export function Realidad({
  result,
  capacity,
  onBack,
  onChangeCapacity,
}: {
  result: RealityResult;
  capacity: CapacityInput;
  onBack: () => void;
  onChangeCapacity: (capacity: CapacityInput) => void;
}) {
  return (
    <div className="mrl-measure" style={{ padding: '18px 20px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 12 }}>
      <button
        type="button"
        onClick={onBack}
        className="mrl-hit"
        style={{
          justifySelf: 'start',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 7,
          padding: '10px 4px',
          border: 'none',
          background: 'none',
          color: 'var(--color-accent-700)',
          fontFamily: 'var(--font-body)',
          fontSize: 14,
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        <ArrowLeft size={15} strokeWidth={3} />
        Números
      </button>

      <div>
        <H size={27}>Revisión de realidad</H>
        <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--color-text-2)' }}>
          Cruzamos tus números entre sí. Aquí es donde se descubren los problemas antes de firmar.
        </p>
      </div>

      <div
        style={{
          padding: 20,
          borderRadius: RADIUS.card,
          color: 'var(--color-bg)',
          background: result.bad === 0 ? 'var(--color-accent-2-600)' : 'var(--color-accent-700)',
        }}
      >
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: 26, lineHeight: 1.1 }}>{result.head}</div>
        <p className="mrl-prose" style={{ margin: '7px 0 0', fontSize: 13, lineHeight: 1.5, opacity: 0.92 }}>
          {result.sub}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {result.rows.map((row) => (
          <div
            key={row.id}
            style={{
              padding: '16px 17px',
              borderRadius: RADIUS.card,
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
              <span
                style={{
                  width: 9,
                  height: 9,
                  flex: 'none',
                  borderRadius: '50%',
                  background: row.ok
                    ? 'var(--color-accent-2-600)'
                    : row.warn
                      ? 'var(--color-neutral-500)'
                      : 'var(--color-accent)',
                }}
              />
              <span style={{ flex: 1, minWidth: 130, fontWeight: 700, fontSize: 14, lineHeight: 1.25 }}>{row.label}</span>
              <span
                style={{
                  display: 'inline-block',
                  padding: '4px 11px',
                  borderRadius: RADIUS.pill,
                  fontSize: 12,
                  fontWeight: 700,
                  background: row.ok
                    ? 'var(--color-accent-2-100)'
                    : row.warn
                      ? 'var(--color-neutral-200)'
                      : 'var(--color-accent-100)',
                  color: row.ok
                    ? 'var(--color-accent-2-800)'
                    : row.warn
                      ? 'var(--color-neutral-700)'
                      : 'var(--color-accent-800)',
                }}
              >
                {row.value}
              </span>
            </div>
            <p
              className="mrl-prose"
              style={{ margin: '9px 0 0', fontSize: 12.8, lineHeight: 1.5, color: 'var(--color-text-2)' }}
            >
              {row.read}
            </p>
            {!row.ok ? (
              <div style={{ marginTop: 10, padding: '12px 14px', borderRadius: RADIUS.block, background: 'var(--color-accent-100)' }}>
                <div style={{ fontSize: 10.5, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--color-accent-700)' }}>
                  Cómo lo arreglas
                </div>
                <p
                  className="mrl-prose"
                  style={{ margin: '4px 0 0', fontSize: 12.6, lineHeight: 1.5, color: 'var(--color-accent-900)' }}
                >
                  {row.fix}
                </p>
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <div
        style={{
          padding: '17px 18px',
          borderRadius: RADIUS.card,
          border: '1px solid var(--color-border)',
          background: 'var(--color-surface)',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr)',
          gap: 10,
        }}
      >
        <div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 17 }}>Los datos de tu capacidad</div>
          <p style={{ margin: '5px 0 0', fontSize: 12.5, lineHeight: 1.45, color: 'var(--color-text-2)' }}>
            Ajústalos con lo que medirás en tu prueba de cocina y en tu acomodo de mesas.
          </p>
        </div>
        <NumberField
          label="Órdenes que tu cocina saca por hora"
          value={capacity.ordersPerHour}
          onChange={(ordersPerHour) => onChangeCapacity({ ...capacity, ordersPerHour: Math.max(1, ordersPerHour) })}
        />
        <NumberField
          label="Horas de venta pico al día"
          value={capacity.peakHours}
          onChange={(peakHours) => onChangeCapacity({ ...capacity, peakHours: Math.min(12, Math.max(1, peakHours)) })}
        />
        <NumberField
          label="Lugares sentados en tu local"
          value={capacity.seats}
          onChange={(seats) => onChangeCapacity({ ...capacity, seats: Math.max(1, seats) })}
        />
      </div>

      <div style={{ padding: '15px 17px', borderRadius: RADIUS.card, background: 'var(--color-accent-2-100)' }}>
        <div style={{ fontSize: 10.5, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--color-accent-2-900)' }}>
          Contra qué te comparamos
        </div>
        <p
          className="mrl-prose"
          style={{ margin: '5px 0 0', fontSize: 12.6, lineHeight: 1.5, color: 'var(--color-accent-2-900)' }}
        >
          {result.benchLine}
        </p>
      </div>
    </div>
  );
}
