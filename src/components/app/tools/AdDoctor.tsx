'use client';

import { useState } from 'react';
import { Megaphone } from 'lucide-react';
import { adsBands, adsBudgetPlan, adsMetrics, adsVerdict, type AdsBand, type AdsInput } from '@/domain/ads';
import { money } from '@/domain/format';
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
  onBack,
}: {
  ticket: number;
  marginPct: number;
  /** Gastos fijos del mes: de ahí sale el plan de inversión sugerido. */
  monthlyFixed: number;
  onBack: () => void;
}) {
  const [raw, setRaw] = useState({ spend: '', days: '', reach: '', results: '', visits: '' });

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
  const bands = adsBands(m);
  const verdict = adsVerdict(input, m);
  const plan = adsBudgetPlan(monthlyFixed);

  const cabecera = {
    'sin-datos': {
      head: 'Captura tus números',
      sub: 'Con lo que ves en el Administrador de anuncios de Meta te digo en un minuto si tu anuncio sirve.',
      bg: 'var(--color-neutral-200)',
      fg: 'var(--color-text)',
    },
    'falta-visitas': {
      head: 'Falta el dato que decide',
      sub: 'Ya tengo tu costo por mensaje. Captura cuántos llegaron al negocio y te digo si el anuncio deja dinero.',
      bg: 'var(--color-accent-2-500)',
      fg: 'var(--color-bg)',
    },
    sirve: {
      head: 'Este anuncio sirve',
      sub: `Invertiste ${money(input.spend)} y trajiste ${input.visits} clientes que dejan ${money(m.income * (marginPct / 100))} de utilidad. Ganas ${money(m.profit)}. Súbele presupuesto 20% y déjalo correr 3 días más.`,
      bg: 'var(--color-accent-2-600)',
      fg: 'var(--color-bg)',
    },
    'no-sirve': {
      head: 'Este anuncio todavía no sirve',
      sub: `Invertiste ${money(input.spend)} y la utilidad de los ${input.visits} clientes que llegaron suma ${money(m.income * (marginPct / 100))}. Te falta ${money(-m.profit)}. Abajo está qué cambiar, en orden.`,
      bg: 'var(--color-accent-600)',
      fg: 'var(--color-bg)',
    },
  }[verdict];

  const campos: { key: keyof typeof raw; label: string; hint: string }[] = [
    { key: 'spend', label: 'Lo que llevas invertido', hint: 'El total gastado en este anuncio, no el diario.' },
    { key: 'days', label: 'Días que lleva corriendo', hint: 'Si lo dejas en blanco calculamos con 5.' },
    { key: 'reach', label: 'Cuántas personas lo vieron', hint: 'Meta lo llama alcance.' },
    { key: 'results', label: 'Mensajes o clics que trajo', hint: 'La columna de resultados.' },
    { key: 'visits', label: 'De esos, cuántos llegaron', hint: 'Este es el dato que decide. Cuéntalos en tu negocio.' },
  ];

  const filas = m.hasData
    ? [
        {
          label: 'Costo por mensaje o clic',
          value: money(m.costPerResult),
          band: bands.costPerResult,
          read:
            bands.costPerResult === 'bien'
              ? 'Está en el rango sano de comida local ($8 a $25). Tu foto y tu texto están haciendo su trabajo.'
              : bands.costPerResult === 'medio'
                ? 'Un poco arriba del rango sano. Suele arreglarse cambiando la foto antes que subiendo presupuesto.'
                : 'Arriba de $40 por mensaje. En comida local eso indica que la foto no detiene o que el radio está muy abierto.',
          fix:
            bands.costPerResult === 'bien'
              ? ''
              : 'Cambia la foto por una con manos, vapor o movimiento. Si sigue igual, cierra el radio a 3 km.',
        },
        {
          label: 'De los que lo vieron, cuántos respondieron',
          value: `${m.showRate.toFixed(1)}%`,
          band: bands.showRate,
          read:
            bands.showRate === 'bien'
              ? `Buena respuesta: de cada 100 que lo ven, ${m.showRate.toFixed(1)} te escriben.`
              : bands.showRate === 'medio'
                ? 'Respuesta tibia. El anuncio se ve, pero no convence de dar el paso.'
                : 'Casi nadie responde. El anuncio llega a la gente pero no le está diciendo por qué venir hoy.',
          fix:
            bands.showRate === 'bien'
              ? ''
              : 'Revisa la línea 2 de tu texto: necesita una razón con fecha (promoción, día especial, algo que solo tú tienes).',
        },
        {
          label: 'De los que escribieron, cuántos llegaron',
          value: `${Math.round(m.closeRate)}%`,
          band: bands.closeRate,
          read:
            bands.closeRate === 'bien'
              ? 'Estás cerrando bien: contestas rápido y das la información que hace falta.'
              : bands.closeRate === 'medio'
                ? 'Se te va gente entre el mensaje y la visita. Casi siempre es tiempo de respuesta.'
                : 'La mayoría escribe y no llega. El problema ya no es el anuncio, es la conversación.',
          fix:
            bands.closeRate === 'bien'
              ? ''
              : 'Contesta en menos de 10 minutos en horas de venta y deja listas tus 3 respuestas rápidas: menú con precios, ubicación con liga y horario.',
        },
        {
          label: 'Costo real por cliente que llegó',
          value: input.visits ? money(m.costPerVisit) : 'Sin datos',
          band: bands.costPerVisit,
          read: !input.visits
            ? 'Captura cuántos de los que escribieron llegaron al negocio y aquí verás el número que de verdad importa.'
            : bands.costPerVisit === 'bien'
              ? `Te cuesta ${money(m.costPerVisit)} traer a alguien que te deja ${money(m.profitPerCustomer)} de utilidad. Este anuncio se paga solo.`
              : bands.costPerVisit === 'medio'
                ? `Te cuesta ${money(m.costPerVisit)} y cada cliente deja ${money(m.profitPerCustomer)}. Todavía ganas, pero el margen es corto.`
                : `Te cuesta ${money(m.costPerVisit)} traer a alguien que deja ${money(m.profitPerCustomer)}. Con estos números el anuncio te cuesta dinero.`,
          fix:
            bands.costPerVisit === 'mal' && input.visits
              ? `Tu tope para seguir ganando es ${money(m.maxCostPerVisit)} por cliente. Sube el ticket promedio o baja el costo por mensaje antes de subir presupuesto.`
              : '',
        },
      ]
    : [];

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
                onChange={(v) => setRaw((prev) => ({ ...prev, [campo.key]: soloNumero(v) }))}
                inputMode="decimal"
              />
              <Muted size={11.8} style={{ marginTop: 4 }}>
                {campo.hint}
              </Muted>
            </div>
          ))}
          <Button variant="secondary" onClick={() => setRaw({ spend: '', days: '', reach: '', results: '', visits: '' })}>
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
