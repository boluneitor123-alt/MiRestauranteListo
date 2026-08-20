'use client';

import { useEffect, useState } from 'react';
import { Check, Clock, WifiOff } from 'lucide-react';
import { money } from '@/domain/format';
import { LICENSE_DEFAULTS } from '@/domain/license';
import type { Entitlement } from '@/state/store';
import { Button, Card, H, Muted, RADIUS, Row, text } from '@/components/ui';

const BENEFITS = [
  'Tu ruta completa: 14 módulos y 90 tareas en orden',
  'Costeador ilimitado con sub-recetas y merma',
  'Mi Menú con food cost ponderado y clasificación',
  'Presupuesto de apertura con subconceptos',
  'Punto de equilibrio con tu meta de ganancia',
  'Recursos descargables y documentos imprimibles',
  'Actualizaciones de las herramientas de apertura incluidas',
];

/** Paywall (README § 1.12). El campo de código NO va aquí: vive en Más › Recuperar acceso. */
export function Paywall({
  entitlement,
  onClose,
  onClaim,
  onCheckout,
}: {
  entitlement: Entitlement | null;
  onClose: () => void;
  onClaim: () => Promise<boolean>;
  onCheckout: () => void;
}) {
  const [claiming, setClaiming] = useState(false);
  const price = entitlement?.price ?? LICENSE_DEFAULTS.price;
  const installment = Math.round(price / LICENSE_DEFAULTS.installmentCount);

  const claim = async () => {
    setClaiming(true);
    await onClaim();
    setClaiming(false);
  };

  return (
    <div className="mrl-measure" style={{ padding: '24px 22px 40px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 16 }}>
      <Row style={{ justifyContent: 'space-between' }}>
        <span
          style={{
            padding: '6px 12px',
            borderRadius: RADIUS.pill,
            background: 'var(--color-accent-100)',
            color: 'var(--color-accent-800)',
            fontSize: 11.5,
            fontWeight: 800,
          }}
        >
          {entitlement?.trial.label ?? 'Prueba en curso'}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          style={{
            width: 44,
            height: 44,
            borderRadius: RADIUS.pill,
            border: 'none',
            background: 'var(--color-neutral-200)',
            cursor: 'pointer',
            fontSize: 17,
            color: 'var(--color-text)',
          }}
        >
          ×
        </button>
      </Row>

      <H size={30}>Desbloquea MiRestauranteListo con un solo pago.</H>

      <div>
        <H size={40}>{money(price)} MXN</H>
        <Muted size={13}>
          o {LICENSE_DEFAULTS.installmentCount} pagos de {money(installment)} sin intereses
        </Muted>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 10 }}>
        {BENEFITS.map((benefit) => (
          <Row key={benefit} gap={10} align="flex-start">
            <span
              style={{
                width: 22,
                height: 22,
                borderRadius: RADIUS.pill,
                background: 'var(--color-accent-2-100)',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
            >
              <Check size={13} strokeWidth={3} color="var(--color-accent-2-600)" />
            </span>
            <span style={{ fontSize: 14, lineHeight: 1.4 }}>{benefit}</span>
          </Row>
        ))}
      </div>

      <Button onClick={onCheckout}>Pagar una sola vez</Button>

      <Muted size={12.5} style={{ textAlign: 'center' }}>
        Garantía de {entitlement?.warrantyDays ?? LICENSE_DEFAULTS.warrantyDays} días: si no te sirve, te devolvemos
        todo.
      </Muted>

      <Card style={{ background: 'var(--color-neutral-200)' }}>
        <H size={16}>Se desbloquea al confirmarse el pago</H>
        <Muted size={12.5} style={{ marginTop: 4 }}>
          No tienes que escribir ningún código: en cuanto el pago se confirma, la app se desbloquea sola en este equipo.
        </Muted>
        <div style={{ marginTop: 12 }}>
          <Button variant="secondary" height={46} disabled={claiming} onClick={claim}>
            {claiming ? 'Buscando tu pago…' : 'Ya pagué, desbloquear ahora'}
          </Button>
        </div>
      </Card>

      <Muted size={12} style={{ textAlign: 'center' }}>
        Estado: {entitlement?.licensed ? 'acceso activado' : (entitlement?.trial.label ?? 'prueba')}
      </Muted>

      <button
        type="button"
        onClick={onClose}
        style={{
          border: 'none',
          background: 'transparent',
          color: text(50),
          fontSize: 13,
          fontWeight: 700,
          cursor: 'pointer',
          fontFamily: 'var(--font-body)',
        }}
      >
        Seguir en versión de prueba
      </button>
    </div>
  );
}

/** Bloqueo al expirar la prueba: sólo queda "Más" (README § 1.12). */
export function Blocked({
  onOpenPaywall,
  onGoMore,
  onBackup,
}: {
  onOpenPaywall: () => void;
  onGoMore: () => void;
  onBackup: () => void;
}) {
  return (
    <div className="mrl-measure" style={{ padding: '60px 24px 40px', textAlign: 'center' }}>
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: RADIUS.pill,
          background: 'var(--color-accent-100)',
          display: 'grid',
          placeItems: 'center',
          margin: '0 auto',
        }}
      >
        <Clock size={34} color="var(--color-accent)" strokeWidth={2.6} />
      </div>
      <H size={26} style={{ marginTop: 20 }}>
        Desbloquea con un solo pago
      </H>
      <Muted size={14} style={{ marginTop: 10 }}>
        Recuperas Inicio, Mi Ruta, el Costeador de Platillos y Números tal como los dejaste: nada se borró.
      </Muted>
      <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 10 }}>
        <Button onClick={onOpenPaywall}>Ver el pago único</Button>
        <Button variant="secondary" height={48} onClick={onGoMore}>
          Ir a Más
        </Button>
        <Button variant="ghost" height={48} onClick={onBackup}>
          Descargar respaldo
        </Button>
      </div>
    </div>
  );
}

/**
 * Bloqueo sin conexión (z-80). El producto exige internet para validar el pago:
 * no hay modo offline ni service worker.
 */
export function OfflineGate({ onRetry }: { onRetry: () => Promise<unknown> }) {
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    const id = setInterval(() => void onRetry(), 8000);
    return () => clearInterval(id);
  }, [onRetry]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 80,
        background: 'var(--color-bg)',
        display: 'grid',
        placeItems: 'center',
        padding: 28,
        textAlign: 'center',
      }}
    >
      <div>
        <WifiOff size={40} color="var(--color-accent)" strokeWidth={2.6} />
        <H size={25} style={{ marginTop: 16 }}>
          Necesitas conexión para usar la app
        </H>
        <Muted size={14} style={{ marginTop: 10, maxWidth: 300 }}>
          Validamos tu acceso en línea cada vez que abres. En cuanto vuelva tu conexión, sigues donde te quedaste.
        </Muted>
        <div style={{ marginTop: 22 }}>
          <Button
            disabled={retrying}
            onClick={async () => {
              setRetrying(true);
              await onRetry();
              setRetrying(false);
            }}
          >
            {retrying ? 'Reintentando…' : 'Volver a intentar'}
          </Button>
        </div>
      </div>
    </div>
  );
}
