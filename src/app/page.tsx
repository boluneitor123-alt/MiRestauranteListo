'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import './landing.css';
import {
  BEFORE_AFTER,
  BIG_NUMBERS,
  CALC_DEFAULTS,
  CLOSE_HAND,
  CONFESSION,
  FINEPRINT,
  GUARANTEE_LINE,
  GUARANTEE_SHORT,
  HERO_CHIPS,
  HOW_STEPS,
  INSIDE_CHIPS,
  INSIDE_SUB,
  LANDING_FAQS,
  LANDING_INCLUDES,
  LANDING_TOOLS,
  LAUNCH,
  LEDGER,
  MARQUEE,
  MISTAKE_COSTS,
  PAY_METHODS,
  SHOT_ACTIONS,
  SHOT_INGREDIENTS,
  SHOT_MENU,
  TEMARIO_CHIPS,
  TOTAL_STEPS,
  TYPICAL_INVESTMENT,
} from '@/content/landing';
import { ROUTE_MODULES } from '@/content/route';
import { lessonArt } from '@/content/illustrations';
import { calculate } from '@/domain/landing';
import { money } from '@/domain/format';
import { track, type TrackEvent } from '@/lib/track';
import { getDeviceId } from '@/lib/device';
import { Arrow, Check, Chip, Kick, Phone, ShotCaption } from '@/components/landing/pieces';

/** Solo dígitos: la calculadora acepta lo que el dueño teclee. */
const digits = (value: string) => value.replace(/[^0-9]/g, '');
const num = (value: string) => Number(digits(value)) || 0;
const pad = (n: number) => String(n).padStart(2, '0');

const MARGIN_PCT = 68;

/** La ilustración de la lección que se ve en la tercera maqueta. */
const LESSON_ART = lessonArt('Enseña a tu equipo la frase exacta');

/** Landing de venta. Portada de `LandingMiRestauranteListo.dc.html`. */
export default function LandingPage() {
  const [rent, setRent] = useState(CALC_DEFAULTS.rent);
  const [payroll, setPayroll] = useState(CALC_DEFAULTS.payroll);
  const [other, setOther] = useState(CALC_DEFAULTS.other);
  const [goal, setGoal] = useState(CALC_DEFAULTS.goal);
  const [ticket, setTicket] = useState(CALC_DEFAULTS.ticket);
  const [openModule, setOpenModule] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [now, setNow] = useState<number | null>(null);
  const calculatorUsed = useRef(false);

  // El reloj arranca en el cliente: así el servidor no manda una cuenta vencida.
  useEffect(() => {
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // `Purchase` al volver del checkout.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('pago') === 'ok') {
      track('Purchase', { value: LAUNCH.price, currency: 'MXN' }, true);
    }
  }, []);

  const result = useMemo(
    () =>
      calculate({
        rent: num(rent),
        payroll: num(payroll),
        other: num(other),
        ticket: Math.max(20, num(ticket) || 200),
        goal: num(goal),
        // El diseño calcula siempre con 26 días de venta al mes.
        closedOneDay: true,
      }),
    [rent, payroll, other, ticket, goal],
  );

  const setField = (set: (v: string) => void) => (value: string) => {
    set(digits(value));
    if (!calculatorUsed.current) {
      calculatorUsed.current = true;
      track('CalculadoraUsada');
    }
  };

  const jump = (id: string) => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop - 74, behavior: 'smooth' });
  };

  const checkout = async () => {
    track('InitiateCheckout', { value: LAUNCH.price, currency: 'MXN' });
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId: getDeviceId(), returnPath: '/app?pago=1' }),
      });
      const data = (await response.json()) as { ok: boolean; url?: string };
      // Sin cobro configurado, el camino sigue siendo la prueba de 7 días.
      window.location.href = data.ok && data.url ? data.url : '/app';
    } catch {
      window.location.href = '/app';
    }
  };

  const goApp = (event: TrackEvent) => () => {
    track(event);
    window.location.href = '/app';
  };

  // Cuenta regresiva del precio de lanzamiento.
  const left = now === null ? 0 : Math.max(0, new Date(`${LAUNCH.deadline}T23:59:59`).getTime() - now);
  const onSale = left > 0;
  const countdown = onSale
    ? `${Math.floor(left / 864e5)}d ${pad(Math.floor(left / 36e5) % 24)}:${pad(Math.floor(left / 6e4) % 60)}:${pad(
        Math.floor(left / 1e3) % 60,
      )}`
    : '—';

  const ticketValue = Math.max(20, num(ticket) || 200);
  const profitPerTicket = Math.max(1, ticketValue * (MARGIN_PCT / 100));
  const customersToPayBack = Math.max(1, Math.ceil(LAUNCH.price / profitPerTicket));
  const daysToPayBack = Math.max(1, Math.ceil(LAUNCH.price / (profitPerTicket * result.ticketsPerDay)));
  const pricePctOfSales = ((LAUNCH.price / Math.max(1, result.monthlySales)) * 100).toFixed(1);
  const pricePctOfInvestment = ((LAUNCH.price / TYPICAL_INVESTMENT) * 100).toFixed(1);

  const navLinks = [
    { t: 'Por dentro', id: 'pordentro' },
    { t: 'Temario', id: 'temario' },
    { t: 'Precio', id: 'precio' },
  ];

  const calcFields: Array<[string, string, (v: string) => void]> = [
    ['Renta al mes', rent, setField(setRent)],
    ['Nómina al mes', payroll, setField(setPayroll)],
    ['Otros gastos fijos', other, setField(setOther)],
    ['Tu ticket promedio', ticket, setField(setTicket)],
  ];

  const calcRows: Array<[string, string]> = [
    ['Gastos fijos al mes', money(result.fixedExpenses)],
    ['Venta mensual para no perder', money(result.monthlySales)],
    ['Venta diaria', money(result.dailySales)],
    ['Clientes al día', String(result.ticketsPerDay)],
  ];

  const recapRows: Array<[string, string]> = [
    ['Tus gastos fijos al mes', money(result.fixedExpenses)],
    ['Lo que necesitas vender para no perder', money(result.monthlySales)],
    ['Clientes al día que eso pide', String(result.ticketsPerDay)],
    ['Lo que cuesta esta app, una vez', money(LAUNCH.price)],
  ];

  const dashed = (first: boolean) => (first ? 'none' : '1px dashed rgba(28,22,17,.18)');

  return (
    <div className="lp lp-sheet">
      {/* ═══ AVISO SUPERIOR ═══ */}
      <div style={{ background: 'var(--amber)', borderBottom: '2.5px solid var(--ink)' }}>
        <div
          className="lp-wrap lp-alertbar"
          style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', paddingBlock: 9 }}
        >
          <span className="lp-blink" style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--ink)' }} />
          <Kick style={{ fontSize: 10.5 }}>
            {onSale
              ? `PRECIO DE LANZAMIENTO · QUEDAN ${LAUNCH.spotsLeft} DE ${LAUNCH.spotsTotal} LUGARES`
              : 'PRECIO REGULAR VIGENTE'}
          </Kick>
          <span
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 10.5,
              fontWeight: 700,
              letterSpacing: '.07em',
              background: 'var(--ink)',
              color: 'var(--amber)',
              padding: '4px 9px',
            }}
          >
            {countdown}
          </span>
          <button
            type="button"
            className="lp-cta lp-hidesm"
            style={{ height: 28, paddingInline: 12, fontSize: 11.5, boxShadow: '2px 2px 0 var(--ink)', background: 'var(--paper-2)' }}
            onClick={() => jump('precio')}
          >
            entra hoy →
          </button>
        </div>
      </div>

      {/* ═══ NAV ═══ */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 60,
          background: 'color-mix(in srgb, var(--paper) 94%, transparent)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1.5px solid var(--color-divider)',
        }}
      >
        <div className="lp-wrap lp-navbar" style={{ display: 'flex', alignItems: 'center', gap: 18, height: 60 }}>
          <span
            className="lp-box lp-navbrand"
            style={{
              flex: 'none',
              padding: '6px 12px',
              fontWeight: 900,
              fontSize: 15,
              letterSpacing: '-.02em',
              boxShadow: '2.5px 2.5px 0 var(--ink)',
              whiteSpace: 'nowrap',
            }}
          >
            <span className="lp-brandfull">MiRestauranteListo</span>
            <span className="lp-brandshort">MRL</span>
          </span>
          <div className="lp-hidesm" style={{ display: 'flex', gap: 20, flex: 2 }}>
            {navLinks.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => jump(link.id)}
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  fontFamily: 'var(--sans)',
                  fontWeight: 700,
                  fontSize: 14,
                  color: 'var(--ink-soft)',
                  padding: 0,
                }}
              >
                {link.t}
              </button>
            ))}
          </div>
          <span className="lp-hidesm" style={{ fontFamily: 'var(--mono)', fontSize: 11.5, fontWeight: 700, color: 'var(--ink-soft)' }}>
            Prueba 7 días · sin tarjeta
          </span>
          <button
            type="button"
            className="lp-cta lp-cta-ghost"
            style={{ height: 38, paddingInline: 14, fontSize: 13, boxShadow: '2.5px 2.5px 0 var(--ink)' }}
            onClick={goApp('LeadIntent')}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            className="lp-cta"
            style={{ height: 38, paddingInline: 16, fontSize: 13.5, boxShadow: '3px 3px 0 var(--ink)' }}
            onClick={goApp('Lead')}
          >
            Crear cuenta
          </button>
        </div>
      </div>

      {/* ═══ ENTRADA 01 · LA PRUEBA ═══ */}
      <div className="lp-wrap" style={{ padding: '46px 22px 8px' }}>
        <div className="lp-postit" style={{ top: 120 }}>
          la prueba está aquí mismo →
        </div>

        <Kick style={{ animation: 'lpRise .55s cubic-bezier(.2,.8,.3,1) both' }}>
          Entrada 01, la prueba / calculadora en vivo
        </Kick>

        <h1
          className="lp-disp lp-rise"
          style={{ marginTop: 16, fontSize: 'clamp(38px,6.6vw,72px)', maxWidth: '19ch', animationDelay: '.05s' }}
        >
          Abre tu negocio de comida <span className="lp-it" style={{ fontSize: '1.04em' }}>sin quemar tu dinero.</span>
        </h1>

        <p
          className="lp-rise"
          style={{
            margin: '20px 0 0',
            fontSize: 'clamp(16px,1.9vw,19px)',
            lineHeight: 1.55,
            maxWidth: '58ch',
            color: 'var(--ink-soft)',
            textWrap: 'pretty',
            animationDelay: '.1s',
          }}
        >
          No es un PDF ni un curso en video que ves y olvidas. Es un{' '}
          <b style={{ color: 'var(--ink)' }}>curso interactivo dentro de una app</b>: {TOTAL_STEPS} lecciones donde tú
          capturas tus números reales y la app te dice, al instante, si tu negocio cuadra.
        </p>

        <div className="lp-rise" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 20, animationDelay: '.14s' }}>
          {HERO_CHIPS.map((chip) => (
            <Chip key={chip}>{chip}</Chip>
          ))}
        </div>

        {/* La calculadora en vivo: el recibo */}
        <div
          className="lp-two lp-rise"
          style={{ display: 'grid', gridTemplateColumns: '1.02fr .98fr', gap: 26, marginTop: 34, animationDelay: '.2s' }}
        >
          <div className="lp-box lp-lift" style={{ position: 'relative', padding: 22 }}>
            <span className="lp-tape" />
            <Kick color="var(--color-accent-700)" square="var(--color-accent)">
              Pruébalo antes de creerme
            </Kick>
            <div className="lp-disp" style={{ marginTop: 9, fontSize: 26 }}>
              ¿Cuánto tienes que vender?
            </div>
            <p style={{ margin: '7px 0 16px', fontSize: 13.5, lineHeight: 1.5, color: 'var(--ink-soft)' }}>
              Pon tus números de verdad. Es el mismo cálculo que vas a usar adentro.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 11 }}>
              {calcFields.map(([label, value, set]) => (
                <div key={label}>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: 'var(--mono)',
                      fontSize: 10,
                      letterSpacing: '.09em',
                      textTransform: 'uppercase',
                      fontWeight: 700,
                      color: 'var(--ink-soft)',
                      marginBottom: 5,
                    }}
                  >
                    {label}
                    <input
                      className="lp-inp"
                      inputMode="numeric"
                      value={value}
                      onChange={(e) => set(e.target.value)}
                      style={{ marginTop: 5 }}
                    />
                  </label>
                </div>
              ))}
            </div>

            <div className="lp-rule" style={{ margin: '18px 0 14px' }} />

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {calcRows.map(([k, v], i) => (
                <div
                  key={k}
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '6px 12px',
                    paddingBlock: 9,
                    flexWrap: 'wrap',
                    borderTop: dashed(i === 0),
                  }}
                >
                  <span style={{ flex: 1, minWidth: 0, fontSize: 13.5 }}>{k}</span>
                  <span
                    style={{
                      fontFamily: 'var(--mono)',
                      fontWeight: 700,
                      fontSize: i === 1 ? 19 : 15,
                      color: i === 1 ? 'var(--color-accent-700)' : 'var(--ink)',
                    }}
                  >
                    {v}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 16, padding: '14px 15px', background: 'var(--lime)', border: '2.5px solid var(--ink)' }}>
              <Kick style={{ fontSize: 10 }} color="var(--lime-t)" square="var(--paper-2)">
                Traducido a tu turno
              </Kick>
              <p style={{ margin: '6px 0 0', fontSize: 14, lineHeight: 1.45, fontWeight: 700, color: 'var(--lime-t)' }}>
                Necesitas un cliente cada {result.minutesBetweenCustomers} minutos durante tus 8 horas de venta. Nada
                más. Ese es tu número real.
              </p>
            </div>
          </div>

          <div>
            <div className="lp-box lp-lift" style={{ padding: 22, background: 'var(--ink)', color: 'var(--paper-2)' }}>
              <Kick color="var(--lime)">Para que a ti te queden {money(num(goal))}</Kick>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
                <span className="lp-disp" style={{ fontSize: 'clamp(34px,5vw,52px)', color: 'var(--lime)' }}>
                  {money(result.goalMonthlySales)}
                </span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 12, opacity: 0.65 }}>al mes</span>
              </div>
              <div className="lp-rule" style={{ margin: '16px 0', borderColor: 'rgba(253,250,242,.24)' }} />
              <div style={{ display: 'flex', gap: 18 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '.09em', textTransform: 'uppercase', opacity: 0.6 }}>
                    Clientes al día
                  </div>
                  <div className="lp-disp" style={{ fontSize: 30, marginTop: 3 }}>
                    {result.goalTicketsPerDay}
                  </div>
                </div>
                <div style={{ flex: 1.2, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '.09em', textTransform: 'uppercase', opacity: 0.6 }}>
                    Tickets a la semana
                  </div>
                  <div className="lp-disp" style={{ fontSize: 30, marginTop: 3 }}>
                    {(result.goalTicketsPerDay * 6).toLocaleString('es-MX')}
                  </div>
                </div>
              </div>
              <p style={{ margin: '16px 0 0', fontSize: 12.5, lineHeight: 1.5, opacity: 0.7, textWrap: 'pretty' }}>
                Calculado con margen del {MARGIN_PCT}% y {result.days} días de venta. Adentro, este mismo cálculo usa tu
                menú costeado platillo por platillo, no un margen supuesto.
              </p>
            </div>

            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button type="button" className="lp-cta" style={{ height: 58, fontSize: 17 }} onClick={() => jump('precio')}>
                Entro hoy · {money(LAUNCH.price)} pago único
                <Arrow />
              </button>
              <button
                type="button"
                className="lp-cta lp-cta-ghost"
                style={{ height: 48, fontSize: 14.5, boxShadow: '3px 3px 0 var(--ink)' }}
                onClick={() => jump('temario')}
              >
                Ver el temario completo antes ↓
              </button>
            </div>
            <p className="lp-hand" style={{ margin: '14px 0 0' }}>
              Nadie te pide tarjeta para probarlo.
            </p>
          </div>
        </div>
      </div>

      {/* ═══ MARQUESINA TACHADA ═══ */}
      <div
        style={{
          marginTop: 38,
          background: 'var(--color-accent)',
          borderBlock: '2.5px solid var(--ink)',
          padding: '13px 0',
          overflow: 'hidden',
          transform: 'rotate(-.6deg)',
          width: '104%',
          marginInline: '-2%',
        }}
      >
        <div className="lp-marq">
          {[...MARQUEE, ...MARQUEE].map(([t, strike], i) => (
            <span
              key={`${t}-${i}`}
              style={{
                whiteSpace: 'nowrap',
                paddingInline: 22,
                fontWeight: strike ? 600 : 900,
                fontSize: strike ? 17 : 20,
                letterSpacing: strike ? 0 : '-.02em',
                textDecoration: strike ? 'line-through' : 'none',
                opacity: strike ? 0.78 : 1,
                color: 'var(--on-accent)',
              }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      <p className="lp-hand lp-wrap" style={{ padding: '26px 22px 0' }}>
        Vale, ¿y cómo se usa esto en la práctica? ↓
      </p>

      {/* ═══ ENTRADA 02 · CÓMO FUNCIONA ═══ */}
      <div className="lp-wrap" style={{ padding: '24px 22px 0' }}>
        <div className="lp-box" style={{ padding: '28px 26px' }}>
          <Kick>Entrada 02, cómo funciona</Kick>
          <h2 className="lp-disp" style={{ marginTop: 14, fontSize: 'clamp(28px,4.2vw,44px)', maxWidth: '24ch' }}>
            Del «tengo la idea» al día de la apertura,{' '}
            <span className="lp-it" style={{ fontSize: '1.05em' }}>en 3 movimientos.</span>
          </h2>

          <div className="lp-three" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 20, marginTop: 26 }}>
            {HOW_STEPS.map((step) => (
              <div key={step.n}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      flex: 'none',
                      borderRadius: '50%',
                      background: 'var(--lime)',
                      border: '2px solid var(--ink)',
                      display: 'grid',
                      placeItems: 'center',
                      fontFamily: 'var(--mono)',
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    {step.n}
                  </span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11.5, letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 700 }}>
                    {step.k}
                  </span>
                </div>
                <p style={{ margin: '10px 0 0', fontSize: 14.5, lineHeight: 1.55, color: 'var(--ink-soft)', textWrap: 'pretty' }}>
                  <b style={{ color: 'var(--ink)' }}>{step.lead}</b> {step.d}
                </p>
              </div>
            ))}
          </div>

          <div className="lp-rule" style={{ margin: '24px 0 16px' }} />
          <p className="lp-hand" style={{ margin: 0 }}>
            Todo lo que ves en esta página sale de esas mismas pantallas.
          </p>
        </div>
      </div>

      {/* ═══ ENTRADA 03 · LOS NÚMEROS ═══ */}
      <div style={{ marginTop: 44, background: 'var(--ink)', color: 'var(--paper-2)', borderBlock: '2.5px solid var(--ink)', padding: '56px 0' }}>
        <div className="lp-wrap" style={{ ['--margin-line' as string]: 'rgba(245,185,63,.34)' }}>
          <Kick color="var(--lime)">Entrada 03, los números / modo noche</Kick>
          <h2 className="lp-disp" style={{ marginTop: 14, fontSize: 'clamp(30px,5vw,54px)', maxWidth: '20ch' }}>
            Las cifras que <span className="lp-it" style={{ fontSize: '1.05em' }}>nadie te dice.</span>
          </h2>

          <div className="lp-three" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 30, marginTop: 38 }}>
            {BIG_NUMBERS.map((n) => (
              <div key={n.v + n.u}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, flexWrap: 'wrap' }}>
                  <span className="lp-disp" style={{ fontSize: 'clamp(44px,7vw,68px)', color: 'var(--lime)' }}>
                    {n.v}
                  </span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700, color: 'var(--lime)' }}>{n.u}</span>
                </div>
                <p style={{ margin: '10px 0 0', fontSize: 14.5, lineHeight: 1.55, opacity: 0.78, textWrap: 'pretty' }}>{n.d}</p>
                <p className="lp-hand" style={{ margin: '8px 0 0', color: 'var(--lime)', opacity: 0.9 }}>
                  {n.hand}
                </p>
              </div>
            ))}
          </div>

          <div className="lp-rule" style={{ margin: '34px 0 20px', borderColor: 'rgba(253,250,242,.2)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            {LEDGER.map((row) => (
              <div key={row.k} style={{ display: 'flex', gap: 14, alignItems: 'baseline', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 10.5,
                    letterSpacing: '.1em',
                    textTransform: 'uppercase',
                    opacity: 0.55,
                    width: 120,
                    flex: 'none',
                  }}
                >
                  {row.k}
                </span>
                <span style={{ flex: 1, minWidth: 220, fontSize: 14.5, lineHeight: 1.5 }}>{row.v}</span>
              </div>
            ))}
          </div>
          <p className="lp-hand" style={{ margin: '26px 0 0', color: 'var(--lime)' }}>
            Números así son fáciles de decir. Mejor te enseño lo de dentro y lo juzgas tú ↓
          </p>
        </div>
      </div>

      {/* ═══ ENTRADA 04 · LAS HERRAMIENTAS ═══ */}
      <div className="lp-wrap" style={{ padding: '52px 22px 0' }}>
        <div className="lp-postit" style={{ top: 80 }}>
          esto es lo que usas cada día →
        </div>
        <Kick>Entrada 04, el taller / 4 herramientas</Kick>
        <h2 className="lp-disp" style={{ marginTop: 14, fontSize: 'clamp(28px,4.4vw,46px)', maxWidth: '22ch' }}>
          Cuatro herramientas que <span className="lp-it" style={{ fontSize: '1.05em' }}>hacen las cuentas por ti.</span>
        </h2>

        <div className="lp-two" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16, marginTop: 28 }}>
          {LANDING_TOOLS.map((tool) => (
            <div key={tool.k} className="lp-box lp-lift-sm" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '9px 14px', background: 'var(--ink)', color: 'var(--paper-2)', display: 'flex', alignItems: 'center', gap: 9 }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--lime)' }}>
                  {tool.k}
                </span>
                <span style={{ flex: 1 }} />
                <span className="lp-chip" style={{ background: 'var(--lime)', borderColor: 'var(--lime)', color: 'var(--lime-t)', fontSize: 9.5, padding: '3px 8px' }}>
                  {tool.tag}
                </span>
              </div>
              <div style={{ padding: 20 }}>
                <div className="lp-disp" style={{ fontSize: 23 }}>
                  {tool.t}
                </div>
                <p style={{ margin: '9px 0 14px', fontSize: 14, lineHeight: 1.55, color: 'var(--ink-soft)', textWrap: 'pretty' }}>{tool.d}</p>
                <div style={{ border: '2px solid var(--ink)', background: 'var(--paper)', padding: 14 }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-soft)', marginBottom: 9 }}>
                    {tool.demoK}
                  </div>
                  {tool.demo.map(([k, v], i) => {
                    const last = i === tool.demo.length - 1;
                    return (
                      <div
                        key={k}
                        style={{
                          display: 'flex',
                          gap: 10,
                          paddingBlock: 6,
                          fontSize: 12.8,
                          borderTop: i ? '1px dashed rgba(25,21,16,.16)' : 'none',
                          fontWeight: last ? 800 : 400,
                        }}
                      >
                        <span style={{ flex: 1, minWidth: 0 }}>{k}</span>
                        <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: last ? 'var(--color-accent-700)' : 'var(--ink)' }}>{v}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="lp-hand lp-wrap" style={{ padding: '30px 22px 0' }}>
        ¿Y cómo se ve por dentro? Tal cual, sin maquillar ↓
      </p>

      {/* ═══ ENTRADA 05 · POR DENTRO ═══ */}
      <div id="pordentro" className="lp-wrap" style={{ padding: '22px 22px 0' }}>
        <div className="lp-postit" style={{ top: 78 }}>
          esto es lo que recibes →
        </div>
        <Kick>Entrada 05, por dentro / capturas reales</Kick>
        <h2 className="lp-disp" style={{ marginTop: 14, fontSize: 'clamp(28px,4.4vw,46px)', maxWidth: '24ch' }}>
          Así se ve por dentro, <span className="lp-it" style={{ fontSize: '1.05em' }}>pantalla por pantalla.</span>
        </h2>
        <p style={{ margin: '14px 0 0', fontSize: 16, lineHeight: 1.6, maxWidth: '60ch', color: 'var(--ink-soft)', textWrap: 'pretty' }}>
          {INSIDE_SUB}
        </p>

        <div className="lp-three" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 20, marginTop: 30 }}>
          {/* Pantalla 1 · Costeador */}
          <div>
            <Phone>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 11 }}>
                <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--color-accent-100)', display: 'grid', placeItems: 'center' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-700)" strokeWidth={3} strokeLinecap="round" aria-hidden>
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </span>
                <span style={{ fontWeight: 800, fontSize: 12.5 }}>Taco de pastor</span>
              </div>
              <div style={{ padding: 12, borderRadius: 24, background: 'var(--color-accent-900)', color: 'var(--color-neutral-100)' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase', opacity: 0.72 }}>
                  Food cost
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
                  <span style={{ fontWeight: 900, fontSize: 26, letterSpacing: '-.03em', color: 'var(--lime)' }}>38%</span>
                  <span style={{ fontSize: 8.5, opacity: 0.75 }}>sobre precio sin IVA</span>
                </div>
                <div
                  style={{
                    marginTop: 9,
                    height: 5,
                    borderRadius: 999,
                    background: 'color-mix(in srgb, var(--color-neutral-100) 22%, transparent)',
                    overflow: 'hidden',
                  }}
                >
                  <span style={{ display: 'block', width: '76%', height: '100%', borderRadius: 999, background: 'var(--lime)' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: 7.5, opacity: 0.65, marginTop: 4 }}>
                  <span>28%</span>
                  <span>32%</span>
                  <span>meta</span>
                </div>
              </div>
              <div style={{ marginTop: 9, padding: '10px 11px', borderRadius: 18, background: 'var(--color-accent-100)', borderLeft: '3px solid var(--color-accent)' }}>
                <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--color-accent-800)' }}>Arriba del rango sano</div>
                <div style={{ fontSize: 8.5, lineHeight: 1.4, color: 'var(--color-accent-800)', marginTop: 2 }}>
                  Sube el precio a $32 o baja la carne a 60 g.
                </div>
              </div>
              <div style={{ marginTop: 10 }}>
                {SHOT_INGREDIENTS.map(([k, v], i) => {
                  const last = i === SHOT_INGREDIENTS.length - 1;
                  return (
                    <div
                      key={k}
                      style={{
                        display: 'flex',
                        gap: 8,
                        paddingBlock: last ? '8px 0' : 6,
                        marginTop: last ? 2 : 0,
                        fontSize: last ? 10.5 : 9.5,
                        fontWeight: last ? 800 : 400,
                        borderTop: last ? '1.5px solid var(--ink)' : i ? '1px solid var(--color-divider)' : 'none',
                      }}
                    >
                      <span style={{ flex: 1, minWidth: 0 }}>{k}</span>
                      <span style={{ fontFamily: 'var(--mono)', fontWeight: 700 }}>{v}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: 11, display: 'flex', gap: 6 }}>
                <span
                  style={{
                    flex: 1,
                    height: 27,
                    borderRadius: 999,
                    background: 'var(--color-accent)',
                    color: 'var(--on-accent)',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 9.5,
                    fontWeight: 800,
                  }}
                >
                  Guardar platillo
                </span>
                <span style={{ width: 27, height: 27, borderRadius: 999, border: '1.5px solid var(--color-divider)', display: 'grid', placeItems: 'center' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
                    <path d="M14 2v6h6" />
                  </svg>
                </span>
              </div>
            </Phone>
            <ShotCaption
              n="Pantalla 01"
              title="Costeador de platillos"
              body="Capturas los ingredientes y el semáforo te avisa al instante. Aquí el pastor está en 38%, arriba del rango sano."
            />
          </div>

          {/* Pantalla 2 · Mi Menú */}
          <div>
            <Phone>
              <div style={{ padding: 13, borderRadius: 28, background: 'var(--color-accent-2-600)', color: 'var(--color-neutral-100)' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase', opacity: 0.75 }}>
                  Tu carta hoy deja
                </div>
                <div style={{ fontWeight: 900, fontSize: 24, letterSpacing: '-.03em', marginTop: 1 }}>{money(SHOT_MENU.now)}</div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginTop: 10,
                    paddingTop: 10,
                    borderTop: '1px solid color-mix(in srgb, var(--color-neutral-100) 26%, transparent)',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 7.5, letterSpacing: '.1em', textTransform: 'uppercase', opacity: 0.7 }}>
                      Con los cambios
                    </div>
                    <div style={{ fontWeight: 900, fontSize: 18, color: 'var(--paper-2)' }}>{money(SHOT_MENU.after)}</div>
                  </div>
                  <span style={{ padding: '4px 9px', borderRadius: 999, background: 'var(--lime)', color: 'var(--lime-t)', fontSize: 9, fontWeight: 800 }}>
                    +{money(SHOT_MENU.delta)}
                  </span>
                </div>
              </div>
              <div style={{ fontSize: 10.5, fontWeight: 800, margin: '12px 0 7px' }}>Tu plan de acción</div>
              {SHOT_ACTIONS.map((action) => (
                <div
                  key={action.n}
                  style={{
                    padding: '10px 11px',
                    borderRadius: 26,
                    background: 'var(--color-neutral-100)',
                    boxShadow: '0 1px 3px rgba(28,22,17,.1)',
                    marginBottom: 6,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span
                      style={{
                        width: 15,
                        height: 15,
                        flex: 'none',
                        borderRadius: '50%',
                        background: action.col,
                        color: 'var(--on-accent)',
                        display: 'grid',
                        placeItems: 'center',
                        fontSize: 8,
                        fontWeight: 800,
                      }}
                    >
                      {action.n}
                    </span>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 7.5, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--color-neutral-600)' }}>
                      {action.kind}
                    </span>
                    <span style={{ flex: 1 }} />
                    <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--color-accent-700)' }}>{action.imp}</span>
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, marginTop: 4 }}>{action.title}</div>
                  <div style={{ display: 'flex', gap: 5, marginTop: 8 }}>
                    <span
                      style={{
                        flex: 1,
                        height: 21,
                        borderRadius: 999,
                        background: 'var(--color-accent)',
                        color: 'var(--on-accent)',
                        display: 'grid',
                        placeItems: 'center',
                        fontSize: 8.5,
                        fontWeight: 800,
                      }}
                    >
                      Aplicar
                    </span>
                    <span
                      style={{
                        height: 21,
                        paddingInline: 9,
                        borderRadius: 999,
                        border: '1.2px solid var(--color-divider)',
                        display: 'grid',
                        placeItems: 'center',
                        fontSize: 8.5,
                        fontWeight: 700,
                      }}
                    >
                      No, gracias
                    </span>
                  </div>
                </div>
              ))}
            </Phone>
            <ShotCaption
              n="Pantalla 02"
              title="Mi Menú · plan de acción"
              body="La app ordena los cambios por dinero y cada uno se aplica con un toque. O lo archivas si no te conviene."
            />
          </div>

          {/* Pantalla 3 · Una lección */}
          <div>
            <Phone>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 9 }}>
                <span style={{ padding: '3px 9px', borderRadius: 999, background: 'var(--color-accent-100)', color: 'var(--color-accent-700)', fontSize: 8, fontWeight: 800 }}>
                  Lección 9 de 12
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 8.5, fontWeight: 700, color: 'var(--color-neutral-600)' }}>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" aria-hidden>
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                  </svg>
                  30 min
                </span>
              </div>
              <div style={{ fontWeight: 800, fontSize: 12.5, lineHeight: 1.2 }}>Enseña a tu equipo la frase exacta</div>
              <div
                style={{
                  marginTop: 9,
                  borderRadius: 18,
                  overflow: 'hidden',
                  background: 'var(--color-accent-100)',
                  aspectRatio: '800 / 460',
                  color: 'var(--color-accent)',
                  ['--illo-2' as string]: '#a8442f',
                  ['--illo-2-mid' as string]: '#c05a41',
                  ['--illo-2-soft' as string]: '#e3d9c7',
                  ['--illo-2-wash' as string]: '#f4d3ce',
                }}
                role="img"
                aria-label="Ilustración de la lección: el equipo pide la reseña con la misma frase"
                dangerouslySetInnerHTML={LESSON_ART ? { __html: LESSON_ART } : undefined}
              />
              <div style={{ marginTop: 9, padding: '10px 11px', borderRadius: 18, background: 'var(--color-accent-100)' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 7.5, letterSpacing: '.09em', textTransform: 'uppercase', color: 'var(--color-accent-700)' }}>
                  Cómo hacerlo
                </div>
                <div style={{ display: 'flex', gap: 7, marginTop: 6 }}>
                  <span
                    style={{
                      width: 14,
                      height: 14,
                      flex: 'none',
                      borderRadius: '50%',
                      background: 'var(--color-accent-2-600)',
                      color: 'var(--color-neutral-100)',
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: 8,
                      fontWeight: 800,
                    }}
                  >
                    1
                  </span>
                  <span style={{ fontSize: 9, lineHeight: 1.4 }}>
                    «¿Nos dejarías una reseña? Nos ayudarías muchísimo.» Nada más.
                  </span>
                </div>
              </div>
              <div style={{ marginTop: 7, padding: '10px 11px', borderRadius: 18, background: 'var(--color-neutral-200)' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 7.5, letterSpacing: '.09em', textTransform: 'uppercase', color: 'var(--color-neutral-600)' }}>
                  Ya quedó cuando…
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 5, alignItems: 'flex-start', color: 'var(--color-accent-2-600)' }}>
                  <span style={{ flex: 'none', marginTop: 1 }}>
                    <Check size={11} width={3.4} />
                  </span>
                  <span style={{ fontSize: 9, lineHeight: 1.35, color: 'var(--ink)' }}>Todo tu equipo dice la misma frase</span>
                </div>
              </div>
              <div
                style={{
                  marginTop: 10,
                  height: 27,
                  borderRadius: 999,
                  background: 'var(--color-accent)',
                  color: 'var(--on-accent)',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 9.5,
                  fontWeight: 800,
                }}
              >
                Ya lo hice, marcar completada
              </div>
            </Phone>
            <ShotCaption
              n="Pantalla 03"
              title="Una lección por dentro"
              body="Minutos que toma, los pasos, un ejemplo con números y cómo saber que ya quedó. Todas traen su ilustración."
            />
          </div>
        </div>

        <div className="lp-rule" style={{ margin: '28px 0 18px' }} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
          {INSIDE_CHIPS.map((chip) => (
            <Chip key={chip}>{chip}</Chip>
          ))}
        </div>
      </div>

      <p className="lp-hand lp-wrap" style={{ padding: '30px 22px 0' }}>
        Y esto es lo que cambia cuando corriges la carta ↓
      </p>

      {/* ═══ ENTRADA 06 · ANTES Y DESPUÉS ═══ */}
      <div style={{ marginTop: 22, background: 'var(--ink)', color: 'var(--paper-2)', borderBlock: '2.5px solid var(--ink)', padding: '52px 0' }}>
        <div className="lp-wrap" style={{ ['--margin-line' as string]: 'rgba(245,185,63,.34)' }}>
          <Kick color="var(--lime)" square="var(--lime)">
            Entrada 06, el antes y el después
          </Kick>
          <h2 className="lp-disp" style={{ marginTop: 14, fontSize: 'clamp(28px,4.6vw,50px)', maxWidth: '22ch' }}>
            La misma carta. <span className="lp-it" style={{ fontSize: '1.05em' }}>Los mismos clientes.</span>
          </h2>
          <p style={{ margin: '14px 0 0', fontSize: 16, lineHeight: 1.6, maxWidth: '58ch', opacity: 0.75, textWrap: 'pretty' }}>
            {BEFORE_AFTER.sub}
          </p>

          <div className="lp-two" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 18, marginTop: 30 }}>
            {(
              [
                {
                  tag: 'ANTES',
                  when: 'como estaba la carta',
                  rows: BEFORE_AFTER.before,
                  total: BEFORE_AFTER.beforeTotal,
                  good: false,
                },
                {
                  tag: 'DESPUÉS',
                  when: 'con el plan de acción aplicado',
                  rows: BEFORE_AFTER.after,
                  total: BEFORE_AFTER.afterTotal,
                  good: true,
                },
              ] as const
            ).map((col) => (
              <div
                key={col.tag}
                style={{
                  padding: 22,
                  border: col.good ? '2.5px solid var(--lime)' : '2px solid rgba(253,250,242,.28)',
                  borderRadius: 4,
                  boxShadow: col.good ? '5px 5px 0 rgba(245,185,63,.35)' : undefined,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14, flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontFamily: 'var(--mono)',
                      fontSize: 10.5,
                      fontWeight: 700,
                      letterSpacing: '.1em',
                      padding: '4px 10px',
                      background: col.good ? 'var(--lime)' : undefined,
                      color: col.good ? 'var(--lime-t)' : undefined,
                      border: col.good ? '1.5px solid var(--lime)' : '1.5px solid rgba(253,250,242,.4)',
                    }}
                  >
                    {col.tag}
                  </span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', opacity: 0.7 }}>
                    {col.when}
                  </span>
                </div>
                {col.rows.map(([name, price, fc], i) => (
                  <div
                    key={name}
                    style={{
                      display: 'flex',
                      gap: 8,
                      alignItems: 'baseline',
                      paddingBlock: 8,
                      fontSize: 13,
                      minWidth: 0,
                      borderTop: i ? '1px dashed rgba(253,250,242,.16)' : 'none',
                      opacity: price ? 1 : 0.45,
                    }}
                  >
                    <span style={{ flex: 1, minWidth: 0 }}>{name}</span>
                    <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 13, width: 52, textAlign: 'right' }}>
                      {price ? money(price) : '—'}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--mono)',
                        fontWeight: 700,
                        fontSize: 12.5,
                        width: 46,
                        textAlign: 'right',
                        color: !fc ? 'inherit' : fc <= 32 ? 'var(--lime)' : 'var(--color-accent-300)',
                      }}
                    >
                      {fc ? `${fc}%` : '—'}
                    </span>
                  </div>
                ))}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 12,
                    marginTop: 14,
                    paddingTop: 14,
                    borderTop: col.good ? '2px solid var(--lime)' : '2px solid rgba(253,250,242,.3)',
                    color: col.good ? 'var(--lime)' : undefined,
                    opacity: col.good ? 1 : 0.8,
                    flexWrap: 'wrap',
                  }}
                >
                  <span style={{ flex: 1, minWidth: 0, fontSize: 13 }}>Utilidad al mes con esta carta</span>
                  <span className="lp-disp" style={{ fontSize: 26 }}>
                    {money(col.total)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 20, padding: '20px 22px', background: 'var(--lime)', color: 'var(--lime-t)', border: '2.5px solid var(--lime)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <Kick style={{ fontSize: 10.5 }} color="var(--lime-t)" square="var(--ink)">
                  La diferencia
                </Kick>
                <div className="lp-disp" style={{ fontSize: 'clamp(30px,5vw,46px)', marginTop: 6 }}>
                  +{money(BEFORE_AFTER.delta)} al mes
                </div>
              </div>
              <p style={{ flex: 2, minWidth: 260, margin: 0, fontSize: 14.5, lineHeight: 1.55, fontWeight: 600, textWrap: 'pretty' }}>
                {BEFORE_AFTER.note}
              </p>
            </div>
          </div>
          <p className="lp-hand" style={{ margin: '22px 0 0', color: 'var(--lime)' }}>
            {BEFORE_AFTER.hand}
          </p>
        </div>
      </div>

      <p className="lp-hand lp-wrap" style={{ padding: '30px 22px 0' }}>
        Y antes de que llegues al precio, te debo una confesión ↓
      </p>

      {/* ═══ ENTRADA 07 · LA CONFESIÓN ═══ */}
      <div className="lp-wrap" style={{ padding: '22px 22px 0' }}>
        <div className="lp-box" style={{ padding: '30px 26px', background: 'var(--paper-2)' }}>
          <Kick>Entrada 07, la historia</Kick>
          <h2 className="lp-disp" style={{ marginTop: 14, fontSize: 'clamp(30px,5vw,54px)' }}>
            Te voy a ser <span className="lp-it" style={{ fontSize: '1.06em' }}>sincero.</span>
          </h2>
          <div style={{ marginTop: 20, maxWidth: '64ch', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {CONFESSION.map((paragraph, i) => (
              <p
                key={paragraph.slice(0, 24)}
                style={{
                  margin: 0,
                  fontSize: i === 0 ? 19 : 16,
                  lineHeight: 1.6,
                  fontWeight: i === 0 ? 700 : 400,
                  color: i === 0 ? 'var(--ink)' : 'var(--ink-soft)',
                  textWrap: 'pretty',
                }}
              >
                {paragraph}
              </p>
            ))}
          </div>
          <div style={{ marginTop: 22, padding: '16px 18px', borderLeft: '4px solid var(--color-accent)', background: 'var(--color-accent-100)' }}>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: 'var(--color-accent-900)', textWrap: 'pretty' }}>
              Por eso el temario completo está abajo, con las {TOTAL_STEPS} lecciones a la vista, y por eso hay 7 días
              de prueba sin pedirte tarjeta. Decides viendo, no adivinando.
            </p>
          </div>
        </div>
      </div>

      {/* ═══ ENTRADA 08 · EL TEMARIO ═══ */}
      <div id="temario" className="lp-wrap" style={{ padding: '52px 22px 0' }}>
        <div className="lp-postit" style={{ top: 80 }}>
          míralo antes de pagar →
        </div>
        <Kick>Entrada 08, decide viendo / temario completo</Kick>
        <h2 className="lp-disp" style={{ marginTop: 14, fontSize: 'clamp(28px,4.4vw,46px)', maxWidth: '24ch' }}>
          Sin promesas de cartón: <span className="lp-it" style={{ fontSize: '1.05em' }}>aquí está todo.</span>
        </h2>
        <p style={{ margin: '14px 0 0', fontSize: 16, lineHeight: 1.6, maxWidth: '60ch', color: 'var(--ink-soft)', textWrap: 'pretty' }}>
          No te pedimos fe: aquí está el temario entero, módulo por módulo y lección por lección. Toca cualquiera para
          ver qué trae. Catorce módulos, {TOTAL_STEPS} lecciones, cuatro de ellos son puntos extra para cuando ya estés
          vendiendo.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 26 }}>
          {ROUTE_MODULES.map((module, i) => {
            const open = openModule === i;
            return (
              <button
                key={module.id}
                type="button"
                onClick={() => setOpenModule(open ? null : i)}
                aria-expanded={open}
                style={{
                  width: '100%',
                  padding: '16px 18px',
                  cursor: 'pointer',
                  fontFamily: 'var(--sans)',
                  background: open ? 'var(--paper-2)' : 'transparent',
                  color: 'var(--ink)',
                  border: module.course ? '2.5px solid var(--ink)' : '1.5px solid var(--color-divider)',
                  borderRadius: 4,
                  boxShadow: open ? '4px 4px 0 var(--ink)' : module.course ? '3px 3px 0 var(--lime)' : 'none',
                  transition: 'box-shadow .12s ease, background .12s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                  <span
                    style={{
                      width: 38,
                      height: 38,
                      flex: 'none',
                      display: 'grid',
                      placeItems: 'center',
                      fontFamily: 'var(--mono)',
                      fontSize: 13,
                      fontWeight: 700,
                      borderRadius: 3,
                      border: '2px solid var(--ink)',
                      background: module.course ? 'var(--lime)' : 'var(--paper-2)',
                      color: 'var(--ink)',
                    }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-.01em' }}>{module.name}</span>
                      {module.course ? (
                        <span className="lp-chip" style={{ background: 'var(--lime)', fontSize: 9.5, padding: '3px 9px' }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                            <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.8L5.8 21l1.6-7L2 9.2l7.1-.6Z" />
                          </svg>
                          Punto extra
                        </span>
                      ) : null}
                    </div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.06em', color: 'var(--ink-soft)', marginTop: 3 }}>
                      {module.tasks.length} lecciones{module.course ? ' · vuelves cada semana' : ''}
                    </div>
                  </div>
                  <span
                    style={{
                      width: 30,
                      height: 30,
                      flex: 'none',
                      borderRadius: '50%',
                      border: '2px solid var(--ink)',
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: 17,
                      fontWeight: 700,
                      lineHeight: 1,
                      background: open ? 'var(--lime)' : 'transparent',
                    }}
                  >
                    {open ? '×' : '+'}
                  </span>
                </div>
                {open ? (
                  <div className="lp-rise" style={{ padding: '15px 0 3px', marginLeft: 51 }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                      {module.tasks.map((task) => (
                        <span
                          key={task.title}
                          style={{
                            padding: '6px 12px',
                            border: '1.5px solid var(--color-divider)',
                            borderRadius: 3,
                            background: 'var(--paper)',
                            fontSize: 12.5,
                            fontWeight: 600,
                            textAlign: 'left',
                          }}
                        >
                          {task.title}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', gap: 9 }}>
          {TEMARIO_CHIPS.map((chip) => (
            <Chip key={chip}>{chip}</Chip>
          ))}
        </div>
      </div>

      <p className="lp-hand lp-wrap" style={{ padding: '30px 22px 0' }}>
        La siguiente pregunta siempre es la misma: ¿esto cuánto cuesta de verdad? ↓
      </p>

      {/* ═══ ENTRADA 09 · LA CUENTA ═══ */}
      <div className="lp-wrap" style={{ padding: '22px 22px 0' }}>
        <Kick>Entrada 09, la cuenta clara</Kick>
        <h2 className="lp-disp" style={{ marginTop: 14, fontSize: 'clamp(28px,4.4vw,46px)', maxWidth: '22ch' }}>
          Lo que cuesta <span className="lp-it" style={{ fontSize: '1.05em' }}>equivocarse una vez.</span>
        </h2>

        <div className="lp-box lp-lift" style={{ marginTop: 24, overflow: 'hidden' }}>
          {MISTAKE_COSTS.map(([k, v, good], i) => (
            <div
              key={k}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px 16px',
                padding: '16px 18px',
                flexWrap: 'wrap',
                background: good ? 'var(--lime)' : 'transparent',
                borderTop: i ? '1.5px solid var(--ink)' : 'none',
              }}
            >
              <span style={{ flex: 1, minWidth: 0, fontSize: 15, fontWeight: 600, textWrap: 'pretty' }}>{k}</span>
              <span
                style={{
                  fontFamily: 'var(--mono)',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  fontSize: good ? 22 : 16,
                  color: good ? 'var(--lime-t)' : 'var(--ink-soft)',
                }}
              >
                {v}
              </span>
            </div>
          ))}
        </div>
        <p style={{ margin: '16px 0 0', fontSize: 14.5, lineHeight: 1.6, maxWidth: '62ch', color: 'var(--ink-soft)', textWrap: 'pretty' }}>
          La inversión típica de un negocio de comida en México ronda {money(TYPICAL_INVESTMENT)}. Lo que cuesta esto
          es el {pricePctOfInvestment} de esa cifra, y es lo único que compras antes de gastar el resto. Cualquiera de
          los cuatro errores de arriba cuesta más que la app entera.
        </p>
      </div>

      {/* ═══ ENTRADA 10 · EL PRECIO ═══ */}
      <div id="precio" className="lp-wrap" style={{ padding: '52px 22px 0' }}>
        <div className="lp-postit" style={{ top: 110 }}>
          el pago único lo tiene TODO ←
        </div>
        <Kick>Entrada 10, la hoja de pedido</Kick>
        <h2 className="lp-disp" style={{ marginTop: 14, fontSize: 'clamp(30px,5vw,54px)' }}>
          Se paga una vez. <span className="lp-it" style={{ fontSize: '1.06em' }}>Se queda para siempre.</span>
        </h2>

        {onSale ? (
          <>
            <div
              style={{
                marginTop: 18,
                display: 'inline-flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 12,
                padding: '11px 15px',
                background: 'var(--amber)',
                border: '2.5px solid var(--ink)',
              }}
            >
              <Kick style={{ fontSize: 10.5 }}>PRECIO DE LANZAMIENTO · SE CIERRA EL 15 DE SEPTIEMBRE</Kick>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700, background: 'var(--ink)', color: 'var(--amber)', padding: '4px 10px' }}>
                {countdown}
              </span>
            </div>
            <p style={{ margin: '12px 0 0', fontSize: 14, lineHeight: 1.6, maxWidth: '60ch', color: 'var(--ink-soft)', textWrap: 'pretty' }}>
              Existe porque estamos abriendo con cupo: los primeros {LAUNCH.spotsTotal} entran a este precio y conservan
              las actualizaciones gratis de por vida. Cuando se cierra la ventana, el precio sube a{' '}
              {money(LAUNCH.listPrice)}.
            </p>
          </>
        ) : null}

        {/* La calculadora vuelve, ya con sus cifras */}
        <div className="lp-box lp-lift" style={{ position: 'relative', marginTop: 26, padding: '22px 24px', background: 'var(--paper-2)' }}>
          <span className="lp-tape" style={{ left: 'auto', right: 26 }} />
          <Kick color="var(--color-accent-700)">Tu cuenta, la que capturaste arriba</Kick>
          <div style={{ marginTop: 12 }}>
            {recapRows.map(([k, v], i) => (
              <div
                key={k}
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '8px 12px',
                  paddingBlock: 9,
                  fontSize: 14,
                  flexWrap: 'wrap',
                  borderTop: i ? '1px dashed rgba(28,22,17,.16)' : 'none',
                  fontWeight: i === 3 ? 800 : 400,
                }}
              >
                <span style={{ flex: 1, minWidth: 0, textWrap: 'pretty' }}>{k}</span>
                <span
                  style={{
                    fontFamily: 'var(--mono)',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    fontSize: i === 3 ? 18 : 15,
                    color: i === 3 ? 'var(--color-accent-700)' : 'var(--ink)',
                  }}
                >
                  {v}
                </span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, padding: '14px 16px', background: 'var(--lime)', border: '2.5px solid var(--ink)' }}>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, fontWeight: 700, color: 'var(--lime-t)', textWrap: 'pretty' }}>
              Con tus propios números: esta app cuesta el {pricePctOfSales}% de UN mes de la venta que necesitas. La
              recuperas con {customersToPayBack} clientes.
            </p>
          </div>
          <p className="lp-hand" style={{ margin: '12px 0 0' }}>
            Menos de {daysToPayBack} día de venta. Y son 7 días gratis antes de pagar nada.
          </p>
        </div>

        <div className="lp-two" style={{ display: 'grid', gridTemplateColumns: '1.1fr .9fr', gap: 20, marginTop: 20, alignItems: 'start' }}>
          <div className="lp-box lp-lift" style={{ padding: 0, overflow: 'hidden', background: 'var(--ink)', color: 'var(--paper-2)' }}>
            <div
              style={{
                padding: '8px 16px',
                background: 'var(--lime)',
                color: 'var(--lime-t)',
                fontFamily: 'var(--mono)',
                fontSize: 10.5,
                letterSpacing: '.1em',
                textTransform: 'uppercase',
                fontWeight: 700,
              }}
            >
              Acceso completo · siempre al día
            </div>
            <div style={{ padding: 26 }}>
              <div className="lp-disp" style={{ fontSize: 30 }}>
                MiRestauranteListo
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px 12px', marginTop: 14, flexWrap: 'wrap' }}>
                <span className="lp-disp" style={{ fontSize: 'clamp(48px,8vw,76px)', color: 'var(--lime)' }}>
                  {money(LAUNCH.price)}
                </span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 700, color: 'var(--lime)' }}>MXN</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 15, opacity: 0.5, textDecoration: 'line-through' }}>
                  {money(LAUNCH.listPrice)}
                </span>
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11.5, letterSpacing: '.07em', textTransform: 'uppercase', opacity: 0.65, marginTop: 8 }}>
                pago único · de por vida · {LAUNCH.installments} pagos de {money(LAUNCH.installmentAmount)}
              </div>
              <p className="lp-hand" style={{ margin: '12px 0 0', color: 'var(--lime)' }}>
                el {pricePctOfInvestment} de tu inversión ✓
              </p>

              <div className="lp-rule" style={{ margin: '20px 0', borderColor: 'rgba(253,250,242,.22)' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                {LANDING_INCLUDES.map(([on, t]) => (
                  <div key={t} style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
                    <span
                      style={{
                        width: 20,
                        height: 20,
                        flex: 'none',
                        marginTop: 2,
                        display: 'grid',
                        placeItems: 'center',
                        border: `2px solid ${on ? 'var(--lime)' : 'rgba(253,250,242,.35)'}`,
                        background: on ? 'var(--lime)' : 'transparent',
                        color: 'var(--lime-t)',
                      }}
                    >
                      {on ? <Check size={11} width={4} /> : null}
                    </span>
                    <span style={{ fontSize: 14.2, lineHeight: 1.5, opacity: on ? 0.95 : 0.5, textWrap: 'pretty' }}>{t}</span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="lp-cta"
                style={{ width: '100%', height: 60, marginTop: 24, fontSize: 17.5, boxShadow: '5px 5px 0 var(--lime-d)' }}
                onClick={checkout}
              >
                Lo quiero, {money(LAUNCH.price)} MXN
                <Arrow size={18} />
              </button>
              <div style={{ marginTop: 12, textAlign: 'center', fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '.08em', textTransform: 'uppercase', opacity: 0.6 }}>
                {GUARANTEE_SHORT}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="lp-box" style={{ padding: 20 }}>
              <Kick color="var(--color-accent-700)" square="var(--color-accent)">
                Sin letra pequeña
              </Kick>
              <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 13 }}>
                {FINEPRINT.map((row) => (
                  <div key={row.k}>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-soft)' }}>
                      {row.k}
                    </div>
                    <p style={{ margin: '4px 0 0', fontSize: 13.8, lineHeight: 1.5, textWrap: 'pretty' }}>{row.v}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lp-box" style={{ padding: 20, background: 'var(--color-accent-2-100)' }}>
              <Kick color="var(--color-accent-2-800)" square="var(--color-accent-2-500)">
                La garantía
              </Kick>
              <p style={{ margin: '11px 0 0', fontSize: 14, lineHeight: 1.6, color: 'var(--color-accent-2-900)', textWrap: 'pretty' }}>
                {GUARANTEE_LINE}
              </p>
            </div>

            <div className="lp-box" style={{ padding: '18px 20px' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-soft)' }}>
                Pago seguro
              </div>
              <div style={{ marginTop: 9, display: 'flex', flexWrap: 'wrap', gap: 9 }}>
                {PAY_METHODS.map((method) => (
                  <span key={method} style={{ fontFamily: 'var(--mono)', fontSize: 11.5, fontWeight: 700, letterSpacing: '.03em' }}>
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ ENTRADA 11 · PREGUNTAS ═══ */}
      <div className="lp-wrap" style={{ padding: '52px 22px 0' }}>
        <div className="lp-postit" style={{ top: 80 }}>
          ¿dudas? aquí →
        </div>
        <Kick>Entrada 11, preguntas frecuentes</Kick>
        <h2 className="lp-disp" style={{ marginTop: 14, fontSize: 'clamp(30px,5vw,52px)', maxWidth: '20ch' }}>
          Lo que todo el mundo pregunta <span className="lp-it" style={{ fontSize: '1.05em' }}>antes de entrar.</span>
        </h2>

        <div style={{ marginTop: 26, borderTop: '2px solid var(--ink)' }}>
          {LANDING_FAQS.map((faq, i) => {
            const open = openFaq === i;
            return (
              <button
                key={faq.q}
                type="button"
                onClick={() => setOpenFaq(open ? null : i)}
                aria-expanded={open}
                style={{
                  width: '100%',
                  padding: '20px 4px',
                  cursor: 'pointer',
                  fontFamily: 'var(--sans)',
                  background: 'transparent',
                  color: 'var(--ink)',
                  border: 'none',
                  borderBottom: '1.5px solid var(--color-divider)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span style={{ flex: 1, minWidth: 0, textAlign: 'left', fontWeight: 800, fontSize: 17, letterSpacing: '-.01em', lineHeight: 1.3 }}>
                    {faq.q}
                  </span>
                  <span
                    style={{
                      width: 32,
                      height: 32,
                      flex: 'none',
                      borderRadius: '50%',
                      border: '2px solid var(--ink)',
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: 18,
                      fontWeight: 700,
                      lineHeight: 1,
                      background: open ? 'var(--lime)' : 'transparent',
                    }}
                  >
                    {open ? '×' : '+'}
                  </span>
                </div>
                {open ? (
                  <p
                    className="lp-rise"
                    style={{
                      margin: '12px 0 0',
                      fontSize: 14.8,
                      lineHeight: 1.65,
                      color: 'var(--ink-soft)',
                      textAlign: 'left',
                      maxWidth: '70ch',
                      textWrap: 'pretty',
                    }}
                  >
                    {faq.a}
                  </p>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══ ENTRADA 12 · EL CIERRE ═══ */}
      <div className="lp-wrap" style={{ padding: '56px 22px 20px' }}>
        <div style={{ textAlign: 'center', maxWidth: 660, margin: '0 auto' }}>
          <Kick style={{ justifyContent: 'center' }}>Entrada 12, el cierre</Kick>
          <h2 className="lp-disp" style={{ marginTop: 16, fontSize: 'clamp(32px,5.4vw,58px)' }}>
            El método está entero ahí arriba. <span className="lp-it" style={{ fontSize: '1.05em' }}>Ya lo viste todo.</span>
          </h2>
          <p style={{ margin: '20px 0 0', fontSize: 17, lineHeight: 1.6, color: 'var(--ink-soft)', textWrap: 'pretty' }}>
            El temario con las {TOTAL_STEPS} lecciones, las cuatro herramientas por dentro, la cuenta clara y el precio.
            Ya viste todo. Lo único que esta página no puede hacer por ti es capturar tu primer platillo — ese lo haces
            tú, esta misma tarde.
          </p>
          <p className="lp-hand" style={{ margin: '20px 0 0', fontSize: 24 }}>
            {CLOSE_HAND}
          </p>
          <button type="button" className="lp-cta" style={{ height: 62, paddingInline: 34, marginTop: 24, fontSize: 18 }} onClick={goApp('InicioPrueba')}>
            Empezar mis 7 días gratis
            <Arrow size={18} />
          </button>
          <div style={{ marginTop: 14, fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--ink-soft)' }}>
            {GUARANTEE_SHORT}
          </div>
        </div>
      </div>

      {/* ═══ PIE ═══ */}
      <div style={{ marginTop: 44, borderTop: '2.5px solid var(--ink)', background: 'var(--paper-2)' }}>
        <div className="lp-wrap" style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center', paddingBlock: 26 }}>
          <span style={{ flex: 1, minWidth: 0, fontFamily: 'var(--mono)', fontSize: 11.5, letterSpacing: '.05em', color: 'var(--ink-soft)' }}>
            MiRestauranteListo · hecho en México para negocios de comida
          </span>
          {navLinks.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => jump(link.id)}
              style={{
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--mono)',
                fontSize: 11.5,
                fontWeight: 700,
                letterSpacing: '.05em',
                color: 'var(--ink)',
                padding: 0,
                minHeight: 44,
              }}
            >
              {link.t}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ BARRA FIJA ═══ */}
      <div
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 70,
          background: 'var(--ink)',
          borderTop: '2.5px solid var(--ink)',
          padding: '10px 0 calc(10px + env(safe-area-inset-bottom))',
        }}
      >
        <div className="lp-wrap lp-stickybar" style={{ display: 'flex', alignItems: 'center', gap: 14, ['--margin-line' as string]: 'transparent' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="lp-stickyfull" style={{ fontWeight: 800, fontSize: 14.5, color: 'var(--paper-2)' }}>
              Acceso completo · {money(LAUNCH.price)} MXN
            </div>
            <div className="lp-stickyshort" style={{ fontWeight: 800, fontSize: 13, color: 'var(--paper-2)' }}>
              {money(LAUNCH.price)} · pago único
            </div>
            <div
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 10.5,
                letterSpacing: '.06em',
                color: 'rgba(253,250,242,.62)',
                marginTop: 2,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              pago único · nunca una mensualidad más
            </div>
          </div>
          <button type="button" className="lp-cta" style={{ flex: 1, height: 48, fontSize: 15.5, boxShadow: '4px 4px 0 var(--lime-d)' }} onClick={checkout}>
            Entro hoy, pago único
            <Arrow size={16} />
          </button>
        </div>
      </div>
      <div style={{ height: 78 }} />
    </div>
  );
}
