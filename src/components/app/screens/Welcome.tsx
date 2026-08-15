'use client';

import { ChefHat, Check } from 'lucide-react';
import { Button, H, Muted, RADIUS, Row, text } from '@/components/ui';

const BULLETS = [
  'Ruta de apertura paso a paso',
  'Costeo de platillos y precios',
  'Inversión y punto de equilibrio',
];

/** Bienvenida (README § 1.1). */
export function Welcome({ onStart, onSignIn }: { onStart: () => void; onSignIn: () => void }) {
  return (
    <div className="mrl-measure" style={{ padding: '80px 28px 34px' }}>
      <div
        style={{
          width: 96,
          height: 96,
          borderRadius: RADIUS.pill,
          background: 'var(--color-accent)',
          display: 'grid',
          placeItems: 'center',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <ChefHat size={46} color="#fff" strokeWidth={2.6} />
      </div>

      <H size={40} style={{ marginTop: 26 }}>
        Abre tu negocio
        <br />
        de comida
        <br />
        sin adivinar.
      </H>

      <p style={{ fontSize: 16, lineHeight: 1.5, maxWidth: 300, color: text(70), marginTop: 14 }}>
        MiRestauranteListo te dice en qué etapa estás, qué te falta, cuánto invertir, cuánto cobrar y cuánto vender
        para no fracasar.
      </p>

      <div style={{ marginTop: 24, display: 'grid', gap: 12 }}>
        {BULLETS.map((bullet) => (
          <Row key={bullet} gap={12}>
            <span
              style={{
                width: 26,
                height: 26,
                borderRadius: RADIUS.pill,
                background: 'var(--color-accent-2-100)',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
            >
              <Check size={15} color="var(--color-accent-2-600)" strokeWidth={3} />
            </span>
            <span style={{ fontSize: 14.5, fontWeight: 600 }}>{bullet}</span>
          </Row>
        ))}
      </div>

      <div style={{ marginTop: 30, display: 'grid', gap: 10 }}>
        <Button onClick={onStart}>Empezar mi proyecto</Button>
        <Button variant="secondary" height={48} onClick={onSignIn}>
          Ya tengo cuenta
        </Button>
      </div>

      <Muted size={12} style={{ textAlign: 'center', marginTop: 18 }}>
        Pruébala 7 días gratis. Después, un solo pago: sin suscripción mensual.
      </Muted>
    </div>
  );
}
