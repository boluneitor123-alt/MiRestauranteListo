'use client';

import { useState } from 'react';
import { Bike } from 'lucide-react';
import {
  calculateDelivery,
  deliveryActions,
  DELIVERY_VERDICTS,
  MAX_COMMISSION_PCT,
  type DeliveryInput,
} from '@/domain/delivery';
import { money, money2 } from '@/domain/format';
import { Card, Field, H, Muted, RADIUS, ScreenHeader, text } from '@/components/ui';

/** Los cuatro tramos del veredicto y el color con el que se pintan. */
const VERDICT_COLOR = {
  perdida: 'var(--color-accent-2-800)',
  flaco: 'var(--color-accent-700)',
  justo: 'var(--color-accent-600)',
  sano: 'var(--color-accent-2-600)',
} as const;

/** Sólo dígitos y punto: el campo nunca se reformatea mientras se escribe. */
const soloNumero = (v: string) => v.replace(/[^0-9.]/g, '');
const aNumero = (v: string) => {
  const n = parseFloat(v);
  return Number.isNaN(n) ? 0 : n;
};

/**
 * Calculadora de delivery (herramienta del pago único).
 *
 * Contesta la pregunta con la que más gente pierde dinero sin darse cuenta:
 * de lo que paga el cliente en Rappi o UberEats, cuánto te queda a ti.
 */
export function DeliveryCalculator({
  saved,
  onBack,
  onSave,
}: {
  /** Lo último que capturó el usuario. Se guarda con su proyecto. */
  saved: DeliveryInput;
  onBack: () => void;
  onSave: (input: DeliveryInput) => void;
}) {
  // Mientras escribe manda el texto crudo, para no reformatear el campo bajo
  // los dedos; al salir del campo se guarda el número.
  const [raw, setRaw] = useState<Record<keyof DeliveryInput, string>>({
    appPrice: String(saved.appPrice),
    counterPrice: String(saved.counterPrice),
    cost: String(saved.cost),
    packaging: String(saved.packaging),
    commissionPct: String(saved.commissionPct),
    ordersPerDay: String(saved.ordersPerDay),
  });

  const input: DeliveryInput = {
    appPrice: aNumero(raw.appPrice),
    counterPrice: aNumero(raw.counterPrice),
    cost: aNumero(raw.cost),
    packaging: aNumero(raw.packaging),
    commissionPct: aNumero(raw.commissionPct),
    ordersPerDay: aNumero(raw.ordersPerDay),
  };
  const r = calculateDelivery(input);

  const capturar = (key: keyof DeliveryInput, valor: string) => {
    const limpio = soloNumero(valor);
    const siguiente = { ...raw, [key]: limpio };
    setRaw(siguiente);
    onSave({ ...input, [key]: aNumero(limpio) });
  };
  const verdict = DELIVERY_VERDICTS[r.level];
  const commission = Math.min(MAX_COMMISSION_PCT, input.commissionPct);
  const actions = deliveryActions(input, r, money, money2);

  const campos: { key: keyof DeliveryInput; label: string; hint: string }[] = [
    { key: 'appPrice', label: 'Precio en la app', hint: 'Lo que paga el cliente dentro de Rappi o UberEats.' },
    { key: 'counterPrice', label: 'Precio en tu mostrador', hint: 'El precio del mismo platillo en tu local.' },
    { key: 'cost', label: 'Costo del platillo', hint: 'El que te da el Costeador, sin empaque.' },
    { key: 'packaging', label: 'Empaque por pedido', hint: 'Envase, tapa, bolsa, servilletas, cubiertos y salsas.' },
    { key: 'commissionPct', label: 'Comisión de la app (%)', hint: 'La de tu contrato. En México suele ir de 20% a 30%.' },
    { key: 'ordersPerDay', label: 'Pedidos de app al día', hint: 'Para calcular el impacto al mes.' },
  ];

  /** El desglose: precio, menos comisión, menos costo, menos empaque, te queda. */
  const desglose: { k: string; v: string; kind: 'first' | 'neg' | 'total' }[] = [
    { k: 'Precio que paga el cliente', v: money2(input.appPrice), kind: 'first' },
    { k: `Comisión de la app (${Math.round(commission)}%)`, v: `-${money2(r.commissionAmount)}`, kind: 'neg' },
    { k: 'Costo del platillo', v: `-${money2(input.cost)}`, kind: 'neg' },
    { k: 'Empaque', v: `-${money2(input.packaging)}`, kind: 'neg' },
    { k: 'Te queda', v: money2(r.keptOnApp), kind: 'total' },
  ];

  /** La barra apilada: a dónde se va cada peso del precio de app. */
  const partes: [string, number, string][] = [
    ['Comisión de la app', r.commissionAmount, 'accent-2-700'],
    ['Costo del platillo', input.cost, 'accent-600'],
    ['Empaque', input.packaging, 'accent-400'],
    ['Te queda', Math.max(0, r.keptOnApp), 'accent-2-500'],
  ];
  const total = partes.reduce((a, p) => a + p[1], 0) || 1;

  return (
    <div>
      <ScreenHeader title="Calculadora de delivery" subtitle="Cuánto te queda después de la comisión" onBack={onBack} />
      <div
        className="mrl-measure"
        style={{ padding: '4px 20px 36px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 14 }}
      >
        <div
          style={{
            padding: 18,
            borderRadius: 26,
            boxShadow: 'var(--shadow-md)',
            background: VERDICT_COLOR[r.level],
            color: 'var(--color-bg)',
          }}
        >
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <span
              style={{
                width: 38,
                height: 38,
                flex: 'none',
                borderRadius: 13,
                display: 'grid',
                placeItems: 'center',
                background: 'color-mix(in srgb, var(--color-bg) 20%, transparent)',
              }}
            >
              <Bike size={20} strokeWidth={2.6} />
            </span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 800, opacity: 0.85 }}>
                {verdict.kicker}
              </div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 21, lineHeight: 1.12, marginTop: 2 }}>
                {verdict.title}
              </div>
            </div>
          </div>
          <p className="mrl-prose" style={{ margin: '12px 0 0', fontSize: 13, lineHeight: 1.5 }}>
            {r.keptOnApp <= 0
              ? `A ${money(input.appPrice)} en la app, cada pedido te cuesta ${money2(Math.abs(r.keptOnApp))} de tu bolsa. Sube el precio de app o saca este platillo de la plataforma.`
              : `De ${money(input.appPrice)} que paga el cliente, te quedan ${money2(r.keptOnApp)} — el ${Math.round(r.appMarginPct)}%. En tu mostrador el mismo platillo te deja ${money2(r.keptOnCounter)}.`}
          </p>
        </div>

        <Card style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 14 }}>
          <div>
            <H size={17}>Tus números</H>
            <Muted size={12.5} style={{ marginTop: 3 }}>
              Toma tu platillo más vendido. Si no sabes tu comisión exacta, deja 27%.
            </Muted>
          </div>
          {campos.map((campo) => (
            <div key={campo.key}>
              <Field
                label={campo.label}
                value={raw[campo.key]}
                onChange={(v) => capturar(campo.key, v)}
                inputMode="decimal"
              />
              <Muted size={11.8} style={{ marginTop: 4 }}>
                {campo.hint}
              </Muted>
            </div>
          ))}
        </Card>

        <Card>
          <H size={17}>Qué te queda en la app</H>
          <div style={{ marginTop: 8 }}>
            {desglose.map((row, i) => (
              <div
                key={row.k}
                className="mrl-amount"
                style={{
                  paddingBlock: 9,
                  fontSize: 13.5,
                  fontWeight: row.kind === 'total' ? 800 : 400,
                  borderTop:
                    i === 0
                      ? 'none'
                      : row.kind === 'total'
                        ? '1.5px solid var(--color-text)'
                        : '1px dashed var(--color-divider)',
                  marginTop: row.kind === 'total' ? 3 : 0,
                }}
              >
                <span>{row.k}</span>
                <span
                  style={{
                    fontWeight: row.kind === 'total' ? 800 : 700,
                    fontSize: row.kind === 'total' ? 17 : 13.5,
                    color:
                      row.kind === 'total'
                        ? VERDICT_COLOR[r.level]
                        : row.kind === 'neg'
                          ? 'var(--color-neutral-600)'
                          : 'var(--color-text)',
                  }}
                >
                  {row.v}
                </span>
              </div>
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              height: 12,
              borderRadius: 999,
              overflow: 'hidden',
              marginTop: 14,
              background: 'var(--color-neutral-200)',
            }}
            aria-hidden
          >
            {partes.map(([label, value, col]) => (
              <span key={label} style={{ display: 'block', width: `${(value / total) * 100}%`, background: `var(--color-${col})` }} />
            ))}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', marginTop: 10 }}>
            {partes.map(([label, , col]) => (
              <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: text(65) }}>
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: `var(--color-${col})`, flex: 'none' }} />
                {label}
              </span>
            ))}
          </div>
        </Card>

        <Card style={{ background: 'var(--color-accent-100)' }}>
          <div style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 800, color: 'var(--color-accent-800)' }}>
            El precio que deberías poner en la app
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 34, lineHeight: 1.05, marginTop: 4, color: 'var(--color-accent-900)' }}>
            {money(r.suggestedRounded)}
          </div>
          <Muted size={12.5} style={{ marginTop: 2, color: 'var(--color-accent-900)' }}>
            para ganar lo mismo que en tu mostrador
          </Muted>
          <p className="mrl-prose" style={{ margin: '10px 0 0', fontSize: 12.5, lineHeight: 1.5, color: 'var(--color-accent-900)' }}>
            Sale de la fórmula (costo + empaque + tu utilidad de mostrador) ÷ (1 − comisión) = {money2(r.suggestedPrice)},
            redondeado hacia arriba. A este precio el delivery te deja lo mismo que atender en tu local, y estás cobrando
            el servicio de llevarlo.
          </p>
        </Card>

        <div className="mrl-duo">
          <div style={{ padding: 14, borderRadius: 20, background: 'var(--color-neutral-200)' }}>
            <div style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 800, color: text(60) }}>
              Por la app
            </div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 22, marginTop: 3 }}>{money2(r.keptOnApp)}</div>
            <Muted size={12}>{Math.round(r.appMarginPct)}% del precio</Muted>
          </div>
          <div
            style={{
              padding: 14,
              borderRadius: 20,
              background: 'var(--color-accent-2-100)',
              color: 'var(--color-accent-2-900)',
            }}
          >
            <div style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 800, opacity: 0.8 }}>
              En tu mostrador
            </div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 22, marginTop: 3 }}>{money2(r.keptOnCounter)}</div>
            <div style={{ fontSize: 12, opacity: 0.85 }}>
              {input.counterPrice ? `${Math.round((r.keptOnCounter / input.counterPrice) * 100)}% del precio` : '—'}
            </div>
          </div>
        </div>

        <p className="mrl-prose" style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: text(70) }}>
          {r.perOrderGap < 0
            ? `Con ${input.ordersPerDay} pedidos de app al día, el delivery te está costando ${money(Math.abs(r.monthlyGap))} al mes contra vender lo mismo en mostrador. No significa cerrarlo: significa subir el precio de app.`
            : `Con ${input.ordersPerDay} pedidos de app al día, el delivery te suma ${money(r.monthlyGap)} al mes por encima de tu mostrador. Ese es el negocio que buscas.`}
        </p>

        {actions.length ? (
          <div>
            <div style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 800, color: text(55) }}>
              Qué hacer con esto
            </div>
            <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 8 }}>
              {actions.map((action) => (
                <div
                  key={action}
                  className="mrl-prose"
                  style={{
                    padding: '12px 14px',
                    borderRadius: RADIUS.small,
                    background: 'var(--color-neutral-100)',
                    boxShadow: 'var(--shadow-sm)',
                    fontSize: 13,
                    lineHeight: 1.5,
                  }}
                >
                  {action}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
