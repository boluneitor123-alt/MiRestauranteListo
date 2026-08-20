'use client';

import { useState } from 'react';
import { Megaphone } from 'lucide-react';
import {
  adsBudgetPlan,
  adsHeadline,
  adsMetrics,
  adsReadings,
  adsVerdict,
  type AdsBand,
  type AdsInput,
  type AdsVerdictKind,
} from '@/domain/ads';
import { money } from '@/domain/format';
import type { AdsCapture } from '@/domain/projectState';
import { Button, Card, Field, H, Muted, RADIUS, ScreenHeader, text } from '@/components/ui';

const soloNumero = (v: string) => v.replace(/[^0-9.]/g, '');
const aNumero = (v: string) => {
  const n = parseFloat(v);
  return Number.isNaN(n) ? 0 : n;
};

const tono = (band: AdsBand) => ({
  background:
    band === 'bien' ? 'var(--color-accent-2-100)' : band === 'medio' ? 'var(--color-neutral-200)' : 'var(--color-accent-100)',
  color: band === 'bien' ? 'var(--color-accent-2-800)' : band === 'medio' ? 'var(--color-neutral-700)' : 'var(--color-accent-800)',
});

const punto = (band: AdsBand) =>
  band === 'bien' ? 'var(--color-accent-2-600)' : band === 'medio' ? 'var(--color-neutral-500)' : 'var(--color-accent)';

/**
 * Analizador de anuncios de Meta (herramienta del pago único).
 *
 * Se capturan los cinco números que se ven en el Administrador de anuncios y
 * el analizador dice, en un minuto, si el anuncio deja dinero y qué cambiar
 * primero.
 */
export function AdDoctor({
  ticket,
  marginPct,
  monthlyFixed,
  saved,
  onBack,
  onSave,
}: {
  ticket: number;
  marginPct: number;
  /** Gastos fijos del mes: de ahí sale el plan de inversión sugerido. */
  monthlyFixed: number;
  /** Los cinco números que capturó la última vez. */
  saved: AdsCapture;
  onBack: () => void;
  onSave: (capture: AdsCapture) => void;
}) {
  const inicial = (n: number) => (n ? String(n) : '');
  const [raw, setRaw] = useState({
    spend: inicial(saved.spend),
    days: inicial(saved.days),
    reach: inicial(saved.reach),
    results: inicial(saved.results),
    visits: inicial(saved.visits),
  });

  const capturar = (key: keyof typeof raw, valor: string) => {
    const limpio = soloNumero(valor);
    const siguiente = { ...raw, [key]: limpio };
    setRaw(siguiente);
    onSave({
      spend: aNumero(siguiente.spend),
      days: aNumero(siguiente.days),
      reach: aNumero(siguiente.reach),
      results: aNumero(siguiente.results),
      visits: aNumero(siguiente.visits),
    });
  };

  const limpiar = () => {
    setRaw({ spend: '', days: '', reach: '', results: '', visits: '' });
    onSave({ spend: 0, days: 0, reach: 0, results: 0, visits: 0 });
  };

  const input: AdsInput = {
    spend: aNumero(raw.spend),
    days: aNumero(raw.days) || 5,
    reach: aNumero(raw.reach),
    results: aNumero(raw.results),
    visits: aNumero(raw.visits),
    ticket,
    marginPct,
  };
  const m = adsMetrics(input);
  const verdict = adsVerdict(input, m);
  const plan = adsBudgetPlan(monthlyFixed);

  // El texto vive en el dominio: el documento imprimible dice lo mismo.
  const COLORES: Record<AdsVerdictKind, { bg: string; fg: string }> = {
    'sin-datos': { bg: 'var(--color-neutral-200)', fg: 'var(--color-text)' },
    'falta-visitas': { bg: 'var(--color-accent-2-500)', fg: 'var(--color-bg)' },
    sirve: { bg: 'var(--color-accent-2-600)', fg: 'var(--color-bg)' },
    'no-sirve': { bg: 'var(--color-accent-600)', fg: 'var(--color-bg)' },
  };
  const cabecera = { ...adsHeadline(input, m, verdict, money), ...COLORES[verdict] };

  const campos: { key: keyof typeof raw; label: string; hint: string }[] = [
    { key: 'spend', label: 'Lo que llevas invertido', hint: 'El total gastado en este anuncio, no el diario.' },
    { key: 'days', label: 'Días que lleva corriendo', hint: 'Si lo dejas en blanco calculamos con 5.' },
    { key: 'reach', label: 'Cuántas personas lo vieron', hint: 'Meta lo llama alcance.' },
    { key: 'results', label: 'Mensajes o clics que trajo', hint: 'La columna de resultados.' },
    { key: 'visits', label: 'De esos, cuántos llegaron', hint: 'Este es el dato que decide. Cuéntalos en tu negocio.' },
  ];

  const filas = adsReadings(input, m, money);

  return (
    <div>
      <ScreenHeader title="Analizador de anuncios" subtitle="Si tu anuncio de Meta deja dinero" onBack={onBack} />
      <div
        className="mrl-measure"
        style={{ padding: '4px 20px 36px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 14 }}
      >
        <div style={{ padding: 20, borderRadius: 28, background: cabecera.bg, color: cabecera.fg, boxShadow: 'var(--shadow-md)' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <span
              style={{
                width: 38,
                height: 38,
                flex: 'none',
                borderRadius: 13,
                display: 'grid',
                placeItems: 'center',
                background: 'color-mix(in srgb, currentColor 16%, transparent)',
              }}
            >
              <Megaphone size={20} strokeWidth={2.6} />
            </span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 22, lineHeight: 1.12 }}>{cabecera.head}</div>
            </div>
          </div>
          <p className="mrl-prose" style={{ margin: '12px 0 0', fontSize: 13, lineHeight: 1.5 }}>
            {cabecera.sub}
          </p>
        </div>

        <Card style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 14 }}>
          <div>
            <H size={17}>Tus números de Meta</H>
            <Muted size={12.5} style={{ marginTop: 3 }}>
              Ábrelos en el Administrador de anuncios y cópialos aquí.
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
          <Button variant="secondary" onClick={limpiar}>
            Empezar de nuevo
          </Button>
        </Card>

        {m.hasData ? (
          <>
            <div className="mrl-duo">
              <div style={{ padding: 14, borderRadius: 20, background: 'var(--color-neutral-200)' }}>
                <Muted size={11.5}>Inversión diaria</Muted>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: 21, marginTop: 3 }}>{money(m.perDay)}</div>
              </div>
              <div style={{ padding: 14, borderRadius: 20, background: 'var(--color-neutral-200)' }}>
                <Muted size={11.5}>Venta por peso invertido</Muted>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: 21, marginTop: 3 }}>
                  {m.roas ? `${m.roas.toFixed(1)}x` : '—'}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 10 }}>
              {filas.map((fila) => (
                <Card key={fila.label} radius={RADIUS.block} style={{ padding: 15 }}>
                  <div className="mrl-amount">
                    <span style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
                      <span style={{ width: 10, height: 10, flex: 'none', borderRadius: '50%', background: punto(fila.band) }} />
                      <span style={{ fontSize: 13.5, fontWeight: 700 }}>{fila.label}</span>
                    </span>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: RADIUS.pill,
                        fontSize: 12,
                        fontWeight: 700,
                        ...tono(fila.band),
                      }}
                    >
                      {fila.value}
                    </span>
                  </div>
                  <p className="mrl-prose" style={{ margin: '8px 0 0', fontSize: 12.8, lineHeight: 1.5, color: text(70) }}>
                    {fila.read}
                  </p>
                  {fila.fix ? (
                    <p
                      className="mrl-prose"
                      style={{
                        margin: '9px 0 0',
                        padding: '10px 12px',
                        borderRadius: RADIUS.small,
                        background: 'var(--color-accent-100)',
                        color: 'var(--color-accent-900)',
                        fontSize: 12.5,
                        lineHeight: 1.5,
                      }}
                    >
                      {fila.fix}
                    </p>
                  ) : null}
                </Card>
              ))}
            </div>

            <Muted size={12}>
              Calculado con tu ticket promedio de {money(ticket)} y tu margen de {Math.round(marginPct)}%. Cámbialos en
              Números.
            </Muted>
          </>
        ) : null}

        <Card>
          <H size={17}>Cuánto invertir el primer mes</H>
          <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 10 }}>
            {[
              { label: 'Semana 1 · prueba con 2 anuncios', value: `${money(plan.base)} al día`, note: 'Mitad y mitad. A los 5 días uno gana claro.' },
              { label: 'Semana 2 · solo el ganador', value: `${money(plan.week2)} al día`, note: 'Apaga el que perdió y pásale su presupuesto.' },
              { label: 'Semanas 3 y 4 · sube 20%', value: `${money(plan.week34)} al día`, note: 'Nunca dupliques de golpe: Meta reinicia su aprendizaje.' },
              { label: 'Total del primer mes', value: money(plan.month), note: 'Con tus gastos fijos, este es un arranque prudente.' },
            ].map((row) => (
              <div key={row.label} style={{ borderTop: '1px dashed var(--color-divider)', paddingTop: 10 }}>
                <div className="mrl-amount">
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{row.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 800 }}>{row.value}</span>
                </div>
                <Muted size={11.8} style={{ marginTop: 3 }}>
                  {row.note}
                </Muted>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
