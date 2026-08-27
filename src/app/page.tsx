'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import './landing.css';
import {
  BENEFITS,
  CALC_DEFAULTS,
  DEMO_LIST,
  FAQ,
  FOOT_TRUST,
  GUARANTEE_ITEMS,
  GUARANTEE_LINE,
  GUARANTEE_SHORT,
  HERO_MICRO,
  HOW_STEPS,
  INCLUDED,
  LANDING_MARGIN_PCT,
  LAUNCH,
  MOCK_DISH,
  MOCK_MKT,
  MOCK_NAV,
  MOCK_ROUTE,
  MOCK_STAGES,
  NO_PROMISES,
  TOOL_LIST,
  TRUST,
} from '@/content/landing';
import { CORREO as CORREO_CONTACTO, TITULAR as TITULAR_LEGAL } from '@/content/legal';
import { calculate } from '@/domain/landing';
import { money } from '@/domain/format';
import { track } from '@/lib/track';
import { Arrow, Check, Ico, Ilustracion, Kick, Rayita, Uline } from '@/components/landing/pieces';

const digits = (value: string) => value.replace(/[^0-9]/g, '');
const num = (value: string) => parseInt(digits(value) || '0', 10) || 0;
const miles = (n: number) => Math.round(n).toLocaleString('es-MX');

/** Landing de venta (README § 12, entrega-v2 § 4). */
export default function LandingPage() {
  const [rent, setRent] = useState(CALC_DEFAULTS.rent);
  const [payroll, setPayroll] = useState(CALC_DEFAULTS.payroll);
  const [other, setOther] = useState(CALC_DEFAULTS.other);
  const [goal] = useState(CALC_DEFAULTS.goal);
  const [ticket, setTicket] = useState(CALC_DEFAULTS.ticket);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  /*
    La barra fija de compra sólo aparece cuando el botón del héroe ya se fue
    de la pantalla. Con los dos visibles había dos llamados casi iguales
    compitiendo en la primera pantalla, y la barra tapaba contenido sin dar
    nada nuevo.
  */
  const ctaHeroe = useRef<HTMLButtonElement>(null);
  const [barraFija, setBarraFija] = useState(false);
  const [demoOn, setDemoOn] = useState(false);
  const calculatorUsed = useRef(false);
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const boton = ctaHeroe.current;
    if (!boton) return;
    const ojo = new IntersectionObserver(([e]) => setBarraFija(!e.isIntersecting), { threshold: 0 });
    ojo.observe(boton);
    return () => ojo.disconnect();
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

  /** Las dos entradas al producto: van a la página de acceso, no a la app. */
  const ir = (evento: 'Lead' | 'LeadIntent' | 'InicioPrueba', vista: 'signup' | 'login') => () => {
    track(evento);
    window.location.href = `/cuenta#${vista}`;
  };

  /** El pago pasa por la pantalla previa, que resume el pedido. */
  const comprar = () => {
    track('InitiateCheckout', { value: LAUNCH.price, currency: 'MXN' });
    window.location.href = '/pago';
  };

  const jump = (id: string) => () => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop - 74, behavior: 'smooth' });
  };

  const precio = money(LAUNCH.price);

  const campos: Array<[string, string, string, string, string, (v: string) => void]> = [
    ['f-renta', 'Renta al mes', 'Ej. 18000', 'store', rent, setField(setRent)],
    ['f-nomina', 'Nómina al mes', 'Ej. 32000', 'people', payroll, setField(setPayroll)],
    ['f-otros', 'Otros gastos fijos', 'Ej. 9000', 'receipt', other, setField(setOther)],
    ['f-ticket', 'Tu ticket promedio', 'Ej. 200', 'ticket', ticket, setField(setTicket)],
  ];

  const filas: Array<[string, string, string, string, boolean]> = [
    ['Gastos fijos al mes', money(result.fixedExpenses), 'calc', 'sage', false],
    ['Venta mensual para no perder', money(result.monthlySales), 'star', 'amber', true],
    ['Venta diaria', money(result.dailySales), 'cal', 'sky', false],
    ['Clientes al día', `${result.ticketsPerDay}`, 'people', 'rose', false],
  ];

  return (
    <div className="lp lp-conbarra">
      {/*
        ═══ AVISO SUPERIOR ═══
        Sin contador de lugares ni cuenta regresiva: ninguno de los dos salía
        de licencias vendidas de verdad.
      */}
      <div className="lp-bar">
        <div>{GUARANTEE_SHORT}</div>
      </div>

      {/* ═══ ENCABEZADO ═══ */}
      <header className="lp-head">
        <div>
          <a href="#top" className="lp-marca">
            <span>MRL</span>
            <span>
              Mi<span style={{ color: 'var(--orange-texto)' }}>Restaurante</span>Listo
            </span>
          </a>
          <nav className="lp-nav">
            <a href="#como">¿Cómo funciona?</a>
            <a href="#temario">Temario</a>
            <a href="#precio">Precios</a>
            <a href="#faq">Preguntas</a>
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button type="button" className="lp-btn lp-login" onClick={ir('LeadIntent', 'login')}>
              Iniciar sesión
            </button>
            <button type="button" className="lp-btn lp-btn-amber" onClick={ir('Lead', 'signup')}>
              Crear cuenta
            </button>
          </div>
        </div>
      </header>

      {/* ═══ 1 · ARNOLD Y LA PROMESA ═══ */}
      <section id="top" className="lp-sec" style={{ paddingTop: 'var(--sp-5)' }}>
        <div className="lp-hero">
          <div className="lp-hero-col">
            <div className="lp-hand" style={{ fontSize: 'var(--t-entrada)', lineHeight: 1.18, color: 'var(--ink-2)' }}>
              Él es Arnold.
              <br />
              También quiere abrir su restaurante.
            </div>
            <Rayita />

            <h1 className="lp-hero-h1" style={{ fontSize: 'clamp(var(--min-hero),5.4vw,66px)' }}>
              Abre tu negocio
              <br />
              de comida
              <br />
              <span className="lp-uwrap" style={{ color: 'var(--orange-display)' }}>
                sin quemar
                <br />
                tu dinero.
                <Uline color="#1C1A17" />
              </span>
            </h1>

            <p style={{ marginTop: 'var(--sp-heroe)', fontSize: 17, lineHeight: 1.55, color: 'var(--ink-2)', maxWidth: 430 }}>
              La app que te guía paso a paso con tus números reales para que tomes decisiones claras y abras con
              confianza.
            </p>

            <div className="lp-micro" style={{ marginTop: 'var(--sp-heroe)' }}>
              {HERO_MICRO.map(([titulo, texto, tono], i) => (
                <div key={titulo} style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
                  <span className={`lp-tile lp-t-${tono}`}>
                    <Ico name={i === 0 ? 'calc' : 'route'} width={2.4} />
                  </span>
                  <span>
                    <span style={{ display: 'block', fontSize: 14.5, fontWeight: 800 }}>{titulo}</span>
                    <span style={{ display: 'block', fontSize: 13, lineHeight: 1.4, color: 'var(--ink-3)', marginTop: 2 }}>
                      {texto}
                    </span>
                  </span>
                </div>
              ))}
            </div>

            <button
              ref={ctaHeroe}
              type="button"
              className="lp-cta"
              style={{ marginTop: 'var(--sp-heroe)', maxWidth: 400 }}
              onClick={ir('InicioPrueba', 'signup')}
            >
              Empieza gratis {LAUNCH.trialDays} días
              <Arrow />
            </button>
            <p style={{ marginTop: 12, fontSize: 13, color: 'var(--ink-3)' }}>
              Sin tarjeta de crédito · Cancela cuando quieras
            </p>
          </div>

          <div className="lp-arnold">
            <Ilustracion
              nombre="arnold-hero"
              alt="Arnold, con su libreta y los post-its de las preguntas que se hace antes de abrir su restaurante"
              ancho={1000}
              alto={833}
              sizes="(max-width: 560px) 65vw, (max-width: 900px) 92vw, 460px"
              prioridad
            />
          </div>
        </div>
      </section>

      {/* ═══ 2 · LAS SEIS HERRAMIENTAS ═══ */}
      <section className="lp-sec">
        <h2 style={{ fontSize: 'clamp(var(--min-h2-sm),3.4vw,40px)', textAlign: 'center' }}>
          Todo lo que necesitas antes de abrir,
          <br />
          <span className="lp-uwrap">
            en una <span style={{ color: 'var(--orange-display)' }}>sola app.</span>
            <Uline />
          </span>
        </h2>

        <div className="lp-prod" style={{ marginTop: 'var(--sp-5)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lista)' }}>
            {TOOL_LIST.map((t, i) => (
              <div key={t.name} style={{ display: 'flex', gap: 13, alignItems: 'flex-start' }}>
                <span className={`lp-tile lp-t-${t.tone}`}>
                  <Ico name={['calc', 'menu', 'permit', 'mkt', 'team', 'tmpl'][i]} />
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 15, fontWeight: 800 }}>{t.name}</span>
                  <span style={{ display: 'block', fontSize: 13.2, lineHeight: 1.45, color: 'var(--ink-3)', marginTop: 3 }}>
                    {t.desc}
                  </span>
                </span>
              </div>
            ))}
          </div>

          {/*
            La misma foto del producto en dos marcos: laptop en escritorio,
            teléfono en teléfono. La hoja enseña uno y esconde el otro — no es
            un árbol distinto, es el mismo dato en el marco que corresponde.
          */}
          <Laptop
            day={money(result.dailySales)}
            tickets={`${result.ticketsPerDay}`}
            month={money(result.monthlySales)}
            every={`1 cliente cada ${result.minutesBetweenCustomersAtBreakeven} min`}
          />
          <TelefonoRuta />
        </div>
      </section>

      {/* ═══ 3 · CONFIANZA ═══ */}
      <section className="lp-sec" style={{ paddingBlock: 12 }}>
        <div className="lp-trust">
          {TRUST.map(([t, d], i) => (
            <div key={t}>
              <span className="lp-tile lp-t-ink">
                <Ico name={['people', 'shield', 'infin', 'head'][i]} size={19} width={2.4} />
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 13.5, fontWeight: 800 }}>{t}</span>
                <span style={{ display: 'block', fontSize: 12.2, lineHeight: 1.4, color: 'var(--ink-3)', marginTop: 2 }}>
                  {d}
                </span>
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ 4 · EL DEMO ═══ */}
      <section id="demo" className="lp-sec">
        <div className="lp-card">
          <div className="lp-demo">
            <div>
              <Kick>Mira cómo funciona</Kick>
              <h2 style={{ fontSize: 'clamp(var(--min-h2),3.6vw,42px)', marginTop: 14 }}>
                De la idea
                <br />
                a tu restaurante,
                <br />
                <span className="lp-hand" style={{ color: 'var(--orange-display)', fontSize: '1.12em' }}>
                  en un minuto.
                </span>
              </h2>
              <p style={{ marginTop: 'var(--sp-3)', fontSize: 15.5, lineHeight: 1.55, color: 'var(--ink-2)' }}>
                Un recorrido rápido por la app para que veas exactamente cómo MiRestauranteListo te ayuda a pasar de la
                idea a la apertura.
              </p>
              <div style={{ marginTop: 'var(--sp-3)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  ['shield', 'Sin registro'],
                  ['clock', 'Dura solo 1 minuto'],
                ].map(([icono, texto]) => (
                  <div
                    key={texto}
                    style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 14, fontWeight: 600, color: 'var(--ink-2)' }}
                  >
                    <span style={{ color: 'var(--amber-d)', display: 'grid' }}>
                      <Ico name={icono} size={17} width={2.5} />
                    </span>
                    {texto}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ position: 'relative' }}>
              <div
                className="lp-demo-marco"
                style={{
                  position: 'relative',
                  border: '8px solid var(--ink)',
                  borderRadius: 34,
                  overflow: 'hidden',
                  aspectRatio: '9/16',
                  background: 'var(--ink)',
                  boxShadow: '0 20px 44px rgb(28 26 23 / 0.26)',
                }}
              >
                {/*
                  `preload="none"` y carátula propia: así la página no baja ni
                  un byte del video hasta que le dan play. La carátula es el
                  primer cuadro, para que no salte al arrancar.
                */}
                <video
                  ref={video}
                  src="/video/demo-mrl.mp4"
                  poster="/video/demo-mrl-poster.webp"
                  playsInline
                  preload="none"
                  onEnded={() => setDemoOn(false)}
                  style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover', background: 'var(--ink)' }}
                />
                {!demoOn ? (
                  <button
                    type="button"
                    aria-label="Reproducir el demo"
                    onClick={() => {
                      const v = video.current;
                      if (!v) return;
                      v.controls = true;
                      // En iOS un play() bloqueado rechaza: el botón no se esconde.
                      const p = v.play();
                      if (p) p.then(() => setDemoOn(true)).catch(() => {});
                      else setDemoOn(true);
                    }}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'grid',
                      placeItems: 'center',
                      border: 'none',
                      background: 'linear-gradient(180deg, rgb(28 26 23 / 0.05), rgb(28 26 23 / 0.42))',
                      cursor: 'pointer',
                    }}
                  >
                    <span
                      style={{
                        display: 'grid',
                        placeItems: 'center',
                        width: 78,
                        height: 78,
                        borderRadius: '50%',
                        background: 'var(--paper)',
                        boxShadow: '0 8px 24px rgb(0 0 0 / 0.34)',
                      }}
                    >
                      <svg width={30} height={30} viewBox="0 0 24 24" fill="var(--ink)" style={{ marginLeft: 5 }} aria-hidden>
                        <path d="M7 4.5v15l13-7.5z" />
                      </svg>
                    </span>
                  </button>
                ) : null}
              </div>
            </div>

            <div>
              <div className="lp-hand" style={{ fontSize: 31, lineHeight: 1.1 }}>
                En este demo verás:
              </div>
              <div style={{ marginTop: 'var(--sp-3)', display: 'flex', flexDirection: 'column', gap: 'var(--gap-lista)' }}>
                {DEMO_LIST.map(([t, d, tono], i) => (
                  <div key={t} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span className={`lp-tile lp-t-${tono}`}>
                      <Ico name={['spark', 'map', 'calc', 'tmpl', 'chart'][i]} size={19} width={2.4} />
                    </span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', fontSize: 14.5, fontWeight: 800 }}>{t}</span>
                      <span style={{ display: 'block', fontSize: 13, lineHeight: 1.42, color: 'var(--ink-3)', marginTop: 2 }}>
                        {d}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 5 · LA CALCULADORA ═══ */}
      <section id="calc" className="lp-sec" style={{ paddingBlock: 20 }}>
        <div className="lp-calc">
          <div className="lp-calchead">
            <div>
              <Kick>Pruébalo antes de creerme</Kick>
              <h2 style={{ fontSize: 'clamp(var(--min-h2),4vw,46px)', marginTop: 14 }}>
                ¿Cuánto tienes que{' '}
                <span className="lp-uwrap">
                  vender?
                  <Uline />
                </span>
              </h2>
              <p style={{ marginTop: 16, fontSize: 16, lineHeight: 1.55, color: 'var(--ink-2)' }}>
                Pon tus números de verdad.
                <br />
                Es el mismo cálculo que vas a usar adentro.
              </p>
            </div>
            <div className="lp-hidesm">
              <Ilustracion
                nombre="arnold-calc"
                alt="Arnold señalando su libreta de cuentas: tus números no mienten"
                ancho={800}
                alto={533}
                sizes="(max-width: 900px) 320px, 300px"
                style={{ display: 'block', width: '100%', height: 'auto' }}
              />
            </div>
          </div>

          <div className="lp-fields" style={{ marginTop: 'var(--sp-4)' }}>
            {campos.map(([id, label, hint, icono, value, set]) => (
              <div key={id}>
                <div className="lp-circ" style={{ margin: '0 auto', background: 'var(--paper)', color: 'var(--ink)' }}>
                  <Ico name={icono} size={28} width={2} />
                </div>
                <label htmlFor={id}>{label}</label>
                <div className="lp-input">
                  <span>$</span>
                  <input id={id} type="text" inputMode="numeric" value={value} onChange={(e) => set(e.target.value)} />
                </div>
                <div
                  style={{
                    marginTop: 6,
                    textAlign: 'center',
                    fontFamily: 'var(--mono)',
                    fontSize: 11.5,
                    color: 'var(--ink-3)',
                  }}
                >
                  {hint}
                </div>
              </div>
            ))}
          </div>

          <div
            className="lp-results"
            style={{ marginTop: 'var(--sp-4)', paddingTop: 'var(--sp-4)', borderTop: '1.5px dashed var(--line)' }}
          >
            <div className="lp-reslist" style={{ display: 'flex', flexDirection: 'column' }}>
              {filas.map(([k, v, icono, tono, grande], i) => (
                <div
                  key={k}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '15px 2px',
                    borderBottom: i < filas.length - 1 ? '1.5px dashed var(--line)' : 'none',
                  }}
                >
                  <span
                    className={`lp-tile lp-t-${tono}`}
                    style={{ borderRadius: '50%', width: 40, height: 40, border: 'none' }}
                  >
                    <Ico name={icono} size={19} width={2.4} />
                  </span>
                  <span style={{ flex: 1, minWidth: 0, fontSize: 15.5, fontWeight: 600 }}>{k}</span>
                  <span
                    style={{
                      fontFamily: 'var(--disp)',
                      fontWeight: 900,
                      letterSpacing: '-.02em',
                      fontSize: grande ? 27 : 22,
                      color: grande ? 'var(--orange-texto)' : 'var(--ink)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {v}
                  </span>
                </div>
              ))}
            </div>

            <div className="lp-postit">
              <div
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '.08em',
                  textTransform: 'uppercase',
                }}
              >
                Traducido a tu turno
              </div>
              <p className="lp-hand" style={{ marginTop: 14, fontSize: 23, lineHeight: 1.32 }}>
                Necesitas un cliente cada {result.minutesBetweenCustomersAtBreakeven} minutos durante tus 8 horas de
                venta.
              </p>
              <p className="lp-hand" style={{ marginTop: 12, fontSize: 25, lineHeight: 1.25, color: 'var(--orange-display)' }}>
                Nada más. Ese es tu número real.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 6 · LA META, EN CARBÓN ═══ */}
      <section className="lp-sec" style={{ paddingBlock: 16 }}>
        <div className="lp-goal">
          <div className="lp-goal-grid">
            <div>
              <span className="lp-kick" style={{ color: 'var(--amber-l)', letterSpacing: '.1em' }}>
                <i style={{ background: 'var(--orange)' }} />
                Para que a ti te queden {money(num(goal))}
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap', marginTop: 12 }}>
                <span
                  style={{
                    fontFamily: 'var(--disp)',
                    fontWeight: 900,
                    fontSize: 'clamp(var(--min-cifra),6vw,62px)',
                    letterSpacing: '-.035em',
                    color: 'var(--amber)',
                  }}
                >
                  {money(result.goalMonthlySales)}
                </span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 15, fontWeight: 700, color: 'var(--amber-l)' }}>
                  al mes
                </span>
              </div>
            </div>
            <Celda label="Clientes al día" valor={`${result.goalTicketsPerDay}`} />
            <Celda label="Tickets a la semana" valor={miles(result.goalTicketsPerDay * 6)} />
          </div>

          <div className="lp-goalnote">
            <p style={{ fontSize: 14, lineHeight: 1.55, opacity: 0.82 }}>
              Calculado con margen del {LANDING_MARGIN_PCT}% y {result.days} días de venta. Adentro, este mismo cálculo
              usa tu menú costeado platillo por platillo, no un margen supuesto.
            </p>
            <div
              style={{
                border: '1.5px solid rgb(255 253 248 / 0.3)',
                borderRadius: 14,
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: 11,
              }}
            >
              <span style={{ color: 'var(--amber-l)', display: 'grid' }}>
                <Ico name="spark" size={20} width={2.3} />
              </span>
              <span className="lp-hand" style={{ fontSize: 20, lineHeight: 1.25 }}>
                Números reales para decisiones reales.
              </span>
            </div>
          </div>
        </div>

        <div className="lp-duo" style={{ marginTop: 16 }}>
          <button type="button" className="lp-cta" style={{ height: 60, fontSize: 15.5 }} onClick={comprar}>
            Entro hoy · {precio} pago único
            <Arrow size={17} />
          </button>
          <button
            type="button"
            className="lp-cta lp-cta-paper"
            style={{ height: 60, fontSize: 15.5 }}
            onClick={jump('temario')}
          >
            Ver el temario completo
          </button>
        </div>
        <p className="lp-hand" style={{ marginTop: 13, textAlign: 'center', fontSize: 21, color: 'var(--ink-3)' }}>
          Nadie te pide tarjeta para probarlo.
        </p>
      </section>

      {/* ═══ 7 · CÓMO FUNCIONA ═══ */}
      <section id="como" className="lp-sec" style={{ paddingTop: 'var(--sp-6)' }}>
        <div className="lp-split">
          <div>
            <Kick>Cómo funciona</Kick>
            <h2 style={{ fontSize: 'clamp(var(--min-h2),4vw,46px)', marginTop: 14 }}>
              Del «tengo la idea»
              <br />
              al día de la apertura,
              <br />
              <span className="lp-hand" style={{ color: 'var(--orange-display)', fontSize: '1.12em' }}>
                en 3 movimientos.
              </span>
            </h2>
            <p style={{ marginTop: 'var(--sp-3)', fontSize: 16, lineHeight: 1.55, color: 'var(--ink-2)', maxWidth: 440 }}>
              Un sistema paso a paso que te guía, te da las herramientas y te dice exactamente qué hacer en cada etapa.
            </p>
          </div>
          <div>
            <Ilustracion
              nombre="arnold-tres"
              alt="Arnold levantando tres dedos, uno por cada movimiento de la ruta"
              ancho={800}
              alto={847}
              sizes="340px"
              style={{ display: 'block', width: '100%', maxWidth: 340, height: 'auto', margin: '0 auto' }}
            />
          </div>
        </div>

        <div className="lp-soft" style={{ marginTop: 'var(--sp-4)' }}>
          <div className="lp-steps">
            {HOW_STEPS.map((paso, i) => (
              <div key={paso.n} className="lp-paso">
                <div className="lp-paso-cab" style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                  <span
                    style={{
                      display: 'grid',
                      placeItems: 'center',
                      width: 38,
                      height: 38,
                      flex: 'none',
                      borderRadius: '50%',
                      background: ['var(--amber)', 'var(--orange)', 'var(--sage-d)'][i],
                      color: i === 2 ? 'var(--paper)' : 'var(--ink)',
                      fontFamily: 'var(--disp)',
                      fontWeight: 900,
                      fontSize: 17,
                    }}
                  >
                    {paso.n}
                  </span>
                  <span className={`lp-circ lp-t-${paso.tone}`}>
                    <Ico name={['bulb', 'chef', 'store'][i]} size={26} width={1.9} />
                  </span>
                </div>
                <div className="lp-paso-nom">{paso.name}</div>
                <div
                  className="lp-paso-raya"
                  style={{ background: ['var(--amber)', 'var(--orange)', 'var(--sage-d)'][i] }}
                />
                <p style={{ marginTop: 12, fontSize: 14.5, lineHeight: 1.5, color: 'var(--ink-2)' }}>{paso.desc}</p>
                <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 9 }}>
                  {paso.items.map((item) => (
                    <div
                      key={item}
                      style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 14, color: 'var(--ink-2)' }}
                    >
                      <Check size={17} />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 8 · TEMARIO ═══ */}
      <section id="temario" className="lp-sec">
        <div className="lp-prod">
          <div>
            <h2 style={{ fontSize: 'clamp(var(--min-h2-sm),3.4vw,38px)' }}>
              Todo lo que necesitas,
              <br />
              <span className="lp-uwrap">
                en una <span style={{ color: 'var(--orange-display)' }}>sola app.</span>
                <Uline />
              </span>
            </h2>
            <div style={{ marginTop: 'var(--sp-4)', display: 'flex', flexDirection: 'column', gap: 11 }}>
              {TOOL_LIST.map((t, i) => (
                <div
                  key={t.name}
                  style={{
                    display: 'flex',
                    gap: 12,
                    alignItems: 'flex-start',
                    padding: '14px 15px',
                    border: '1.5px solid var(--line)',
                    borderRadius: 16,
                    background: 'var(--paper)',
                  }}
                >
                  <span className={`lp-tile lp-t-${t.tone}`}>
                    <Ico name={['calc', 'menu', 'permit', 'mkt', 'team', 'tmpl'][i]} size={20} />
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: 14.5, fontWeight: 800 }}>{t.name}</span>
                    <span style={{ display: 'block', fontSize: 12.8, lineHeight: 1.42, color: 'var(--ink-3)', marginTop: 2 }}>
                      {t.desc}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <TresTelefonos onOpen={ir('InicioPrueba', 'signup')} />
        </div>
      </section>

      {/* ═══ 9 · CIERRE Y BENEFICIOS ═══ */}
      <section className="lp-sec">
        <div className="lp-split">
          <div>
            <Kick>Todo listo para abrir tu restaurante</Kick>
            <h2 style={{ fontSize: 'clamp(var(--min-h2-lg),4.4vw,50px)', marginTop: 14 }}>
              Deja de adivinar.
              <br />
              <span className="lp-uwrap">
                Empieza a construir.
                <Uline />
              </span>
            </h2>
            <p style={{ marginTop: 'var(--sp-4)', fontSize: 16.5, lineHeight: 1.55, color: 'var(--ink-2)', maxWidth: 450 }}>
              MiRestauranteListo reúne en un solo lugar las herramientas y pasos que necesitas para tomar mejores
              decisiones antes de abrir.
            </p>
          </div>
          <div>
            <Ilustracion
              nombre="arnold-cierre"
              alt="Arnold celebrando con los brazos en alto el día que abre su restaurante"
              ancho={800}
              alto={840}
              sizes="320px"
              style={{ display: 'block', width: '100%', maxWidth: 320, height: 'auto', margin: '0 auto' }}
            />
            <div className="lp-postit" style={{ maxWidth: 300, margin: '14px auto 0' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                {NO_PROMISES.map((linea) => (
                  <div key={linea} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <svg
                      width={17}
                      height={17}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#1C1A17"
                      strokeWidth={2.8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ flex: 'none' }}
                      aria-hidden
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 12.5, fontWeight: 700, letterSpacing: '.04em' }}>
                      {linea}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="lp-soft" style={{ marginTop: 28, padding: '30px 24px' }}>
          <div className="lp-benef">
            {BENEFITS.map(([t, d, tono], i) => (
              <div key={t}>
                <span className={`lp-circ lp-t-${tono}`}>
                  <Ico name={['clock', 'bag', 'check', 'chart', 'hands'][i]} size={26} width={2.1} />
                </span>
                {/* En teléfono este bloque se va al lado del disco, no debajo. */}
                <div className="lp-benef-txt">
                  <div className="lp-benef-k">{t}</div>
                  <p style={{ marginTop: 9, fontSize: 13.5, lineHeight: 1.5, color: 'var(--ink-2)' }}>{d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 10 · GARANTÍA ═══ */}
      <section className="lp-sec" style={{ paddingBlock: 14 }}>
        <div className="lp-guar">
          <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
            <span
              style={{
                display: 'grid',
                placeItems: 'center',
                width: 64,
                height: 64,
                flex: 'none',
                borderRadius: '50%',
                background: 'var(--paper)',
                color: 'var(--sage-d)',
              }}
            >
              <Ico name="shield" size={32} width={2.1} />
            </span>
            <div>
              <h3 style={{ fontSize: 'clamp(var(--min-sub),2.6vw,27px)', letterSpacing: '-.02em' }}>
                Pruébalo {LAUNCH.trialDays} días sin riesgo
              </h3>
              <p style={{ marginTop: 8, fontSize: 14.5, lineHeight: 1.5, color: 'var(--ink-2)' }}>{GUARANTEE_LINE}</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {GUARANTEE_ITEMS.map((t, i) => (
              <div
                key={t}
                style={{ display: 'flex', alignItems: 'center', gap: 11, fontSize: 14, fontWeight: 600, color: 'var(--ink-2)' }}
              >
                <span style={{ color: 'var(--sage-d)', display: 'grid' }}>
                  <Ico name={['cal', 'card', 'back'][i]} size={19} width={2.4} />
                </span>
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 11 · EL PRECIO ═══ */}
      <section id="precio" className="lp-sec" style={{ paddingBottom: 30 }}>
        <div className="lp-card" style={{ boxShadow: '7px 8px 0 var(--amber)' }}>
          <div className="lp-offer">
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '7px 14px',
                  borderRadius: 999,
                  background: 'var(--amber-xl)',
                  fontFamily: 'var(--mono)',
                  fontSize: 11.5,
                  fontWeight: 700,
                  letterSpacing: '.08em',
                  textTransform: 'uppercase',
                }}
              >
                <svg width={13} height={13} viewBox="0 0 24 24" fill="var(--amber-d)" aria-hidden>
                  <path d="m12 2 2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.8L5.8 21l1.6-7L2 9.2l7.1-.6Z" />
                </svg>
                Pago único
              </div>
              <div
                style={{
                  fontFamily: 'var(--disp)',
                  fontWeight: 900,
                  fontSize: 'clamp(var(--min-cifra-xl),8vw,82px)',
                  letterSpacing: '-.04em',
                  lineHeight: 1,
                  marginTop: 16,
                }}
              >
                {precio}
              </div>
              <div
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 12.5,
                  fontWeight: 700,
                  letterSpacing: '.07em',
                  textTransform: 'uppercase',
                  color: 'var(--ink-2)',
                  marginTop: 9,
                }}
              >
                Pago único · acceso de por vida
              </div>
              <p className="lp-hand" style={{ marginTop: 16, fontSize: 21, lineHeight: 1.2, color: 'var(--ink-3)' }}>
                Un solo pago y es tuyo para siempre.
              </p>
            </div>

            <div className="lp-offerlist">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lista)' }}>
                {INCLUDED.map((linea) => (
                  <div key={linea} style={{ display: 'flex', alignItems: 'flex-start', gap: 11 }}>
                    <Check />
                    <span
                      style={{ flex: 1, minWidth: 0, fontSize: 15, lineHeight: 1.45, fontWeight: 600, color: 'var(--ink-2)' }}
                    >
                      {linea}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', placeItems: 'center' }}>
              <div
                className="lp-hidesm"
                style={{
                  width: 138,
                  height: 138,
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: '50%',
                  background: 'var(--amber-xl)',
                  border: '2.5px dashed var(--amber-d)',
                  textAlign: 'center',
                  transform: 'rotate(-6deg)',
                }}
              >
                <div className="lp-hand" style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.15 }}>
                  Pago único
                  <br />
                  para siempre
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="lp-cta"
            style={{ marginTop: 'var(--sp-4)', height: 72, fontSize: 'clamp(var(--min-guia),2.4vw,19px)' }}
            onClick={comprar}
          >
            Entrar hoy · pago único · acceso de por vida
            <Arrow size={22} />
          </button>
          <p style={{ marginTop: 13, textAlign: 'center', fontSize: 14, color: 'var(--ink-3)' }}>
            Un solo pago. Sin mensualidades.
          </p>
        </div>

        <div className="lp-trust" style={{ marginTop: 'var(--sp-3)', borderRadius: 20 }}>
          {FOOT_TRUST.map(([t, d], i) => (
            <div key={t}>
              <span className="lp-tile lp-t-ink" style={{ width: 36, height: 36, borderRadius: 10 }}>
                <Ico name={['lock', 'phone', 'cloud', 'badge'][i]} size={18} width={2.4} />
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 13, fontWeight: 800 }}>{t}</span>
                <span style={{ display: 'block', fontSize: 12, lineHeight: 1.4, color: 'var(--ink-3)', marginTop: 2 }}>{d}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ 12 · PREGUNTAS ═══ */}
      <section id="faq" className="lp-sec" style={{ maxWidth: 840, paddingBottom: 50 }}>
        <h2 style={{ fontSize: 'clamp(var(--min-h3),3.2vw,36px)', textAlign: 'center' }}>Preguntas</h2>
        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 11 }}>
          {FAQ.map((item, i) => {
            const abierta = openFaq === i;
            return (
              <div key={item.q} className={`lp-faq${abierta ? ' on' : ''}`}>
                <button type="button" aria-expanded={abierta} onClick={() => setOpenFaq(abierta ? null : i)}>
                  <span style={{ flex: 1, minWidth: 0, fontSize: 16, fontWeight: 800 }}>{item.q}</span>
                  <span
                    className="lp-tile lp-t-ink"
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      border: 'none',
                      transform: abierta ? 'rotate(180deg)' : 'none',
                      transition: 'transform .2s',
                    }}
                  >
                    <svg
                      width={15}
                      height={15}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={3.2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </span>
                </button>
                {abierta ? <p>{item.a}</p> : null}
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══ PIE ═══ */}
      <footer className="lp-pie">
        <div>
          <div className="lp-pie-marca">
            <span className="lp-pie-logo">MRL</span>
            <span>
              Mi<span style={{ color: 'var(--amber-l)' }}>Restaurante</span>Listo
            </span>
          </div>

          <nav className="lp-pie-enlaces" aria-label="Enlaces legales y de contacto">
            <a href="/terminos">Términos de uso</a>
            <a href="/privacidad">Aviso de privacidad</a>
            <a href={`mailto:${CORREO_CONTACTO}`}>{CORREO_CONTACTO}</a>
          </nav>

          <p className="lp-pie-razon">{TITULAR_LEGAL} · Querétaro, México</p>
        </div>
      </footer>

      {/* ═══ BARRA FIJA ═══ */}
      <div className={barraFija ? 'lp-sticky lp-sticky-on' : 'lp-sticky'} aria-hidden={!barraFija}>
        <div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, flexWrap: 'wrap' }}>
              <span
                className="lp-precio"
                style={{ fontFamily: 'var(--disp)', fontWeight: 900, fontSize: 21, color: 'var(--paper)', letterSpacing: '-.02em' }}
              >
                {precio}
              </span>
              <span style={{ fontSize: 13, color: 'rgb(255 253 248 / 0.66)' }}>· pago único</span>
            </div>
            <div className="lp-hidesm" style={{ fontSize: 11.5, color: 'rgb(255 253 248 / 0.5)', marginTop: 2 }}>
              Acceso de por vida · Sin tarjeta para probar
            </div>
          </div>
          <button
            type="button"
            className="lp-cta"
            style={{ flex: 'none', width: 'auto', height: 52, paddingInline: 26, fontSize: 15, boxShadow: 'none' }}
            onClick={ir('InicioPrueba', 'signup')}
          >
            Empezar gratis
            <Arrow size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}

/** Una celda del bloque de la meta. */
function Celda({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="lp-goal-cell">
      <div
        style={{
          fontFamily: 'var(--mono)',
          fontSize: 11.5,
          fontWeight: 700,
          letterSpacing: '.09em',
          textTransform: 'uppercase',
          opacity: 0.62,
        }}
      >
        {label}
      </div>
      <div style={{ fontFamily: 'var(--disp)', fontWeight: 900, fontSize: 44, marginTop: 4 }}>{valor}</div>
    </div>
  );
}

function Barra({ pct, color, alto }: { pct: number; color: string; alto: number }) {
  return (
    <div style={{ marginTop: 7, height: alto, borderRadius: 999, background: 'var(--cream-2)', overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', borderRadius: 999, background: color }} />
    </div>
  );
}

/**
 * El avance de una lista de pasos, contando los que están palomeados.
 *
 * Las maquetas dibujan la lista y el porcentaje juntos, así que el porcentaje
 * tiene que salir de la lista: escrito a mano se desfasa en cuanto alguien
 * toca el contenido, y queda un número que la misma pantalla desmiente.
 */
function avanceDeLaLista(pasos: ReadonlyArray<readonly [string, 0 | 1 | 2, ...unknown[]]>): {
  hechos: number;
  total: number;
  pct: number;
} {
  const hechos = pasos.filter(([, estado]) => estado === 1).length;
  const total = pasos.length;
  return { hechos, total, pct: total ? Math.round((hechos / total) * 100) : 0 };
}

/** La maqueta de la app dentro de una laptop, con las cifras de la calculadora. */
function Laptop({ day, tickets, month, every }: { day: string; tickets: string; month: string; every: string }) {
  return (
    // `lp-laptop-marco` es el asa que usa la hoja para esconderla en teléfono:
    // como ilustración de apoyo medía más de una pantalla de alto.
    <div className="lp-laptop-marco" style={{ position: 'relative', paddingBottom: 'var(--sp-4)' }}>
      <div
        style={{
          background: 'var(--ink)',
          borderRadius: '18px 18px 6px 6px',
          padding: '10px 10px 0',
          boxShadow: '0 22px 50px rgb(28 26 23 / 0.22)',
        }}
      >
        <div
          className="lp-laptop"
          style={{
            background: 'var(--paper)',
            borderRadius: '11px 11px 0 0',
            overflow: 'hidden',
            minHeight: 340,
          }}
        >
          <div style={{ background: 'var(--cream-2)', padding: '14px 10px', borderRight: '1px solid var(--line)' }}>
            <div
              style={{
                display: 'grid',
                placeItems: 'center',
                width: 30,
                height: 30,
                borderRadius: 8,
                background: 'var(--ink)',
                color: 'var(--paper)',
                fontFamily: 'var(--disp)',
                fontWeight: 900,
                fontSize: 10,
              }}
            >
              MRL
            </div>
            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 3 }}>
              {MOCK_NAV.map((label, i) => (
                <div
                  key={label}
                  style={{
                    fontSize: 9.5,
                    fontWeight: i === 0 ? 800 : 600,
                    padding: '5px 7px',
                    borderRadius: 6,
                    background: i === 0 ? 'var(--paper)' : 'transparent',
                    color: i === 0 ? 'var(--orange-texto)' : 'var(--ink-3)',
                  }}
                >
                  {label}
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
              <div style={{ fontFamily: 'var(--disp)', fontWeight: 800, fontSize: 19, letterSpacing: '-.02em' }}>
                Tu ruta de apertura
              </div>
              <div style={{ fontFamily: 'var(--disp)', fontWeight: 800, fontSize: 16, color: 'var(--sage-d)' }}>
                {avanceDeLaLista(MOCK_ROUTE).pct}%
              </div>
            </div>
            <Barra pct={avanceDeLaLista(MOCK_ROUTE).pct} color="var(--sage-d)" alto={9} />

            <div className="lp-laptop-tres lp-laptop-etapas" style={{ marginTop: 16 }}>
              {MOCK_STAGES.map(([name, frac, pct, tono]) => {
                const col = tono === 'sage' ? 'var(--sage-d)' : tono === 'amber' ? 'var(--amber-d)' : 'var(--ink-3)';
                return (
                  <div
                    key={name}
                    style={{ padding: '11px 12px', borderRadius: 11, border: '1px solid var(--line)', background: 'var(--cream)' }}
                  >
                    <span style={{ display: 'block', width: 20, height: 20, borderRadius: 7, background: col }} />
                    <div className="lp-etapa-nom">{name}</div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>{frac}</div>
                    <Barra pct={pct} color={col} alto={4} />
                  </div>
                );
              })}
            </div>

            <div className="lp-laptop-tres" style={{ marginTop: 11 }}>
              {[
                ['Necesitas vender', day, 'al día'],
                ['Clientes al día', tickets, 'aprox.'],
                ['Ventas del mes', month, 'meta para no perder'],
              ].map(([k, v, pie]) => (
                <div
                  key={k}
                  style={{ padding: '11px 12px', borderRadius: 11, border: '1px solid var(--line)', background: 'var(--cream)' }}
                >
                  <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{k}</div>
                  <div style={{ fontFamily: 'var(--disp)', fontWeight: 900, fontSize: 19, marginTop: 3 }}>{v}</div>
                  <div style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>{pie}</div>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: 11,
                padding: '10px 12px',
                borderRadius: 11,
                background: 'var(--amber-xl)',
                fontSize: 12.5,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span style={{ color: 'var(--amber-d)', display: 'grid' }}>
                <Ico name="clock" size={14} width={2.75} />
              </span>
              {every}
            </div>
          </div>
        </div>
      </div>
      <div
        style={{
          height: 13,
          background: 'var(--ink)',
          borderRadius: '0 0 12px 12px',
          margin: '0 -14px',
          boxShadow: '0 12px 22px rgb(28 26 23 / 0.16)',
        }}
      />
    </div>
  );
}

/**
 * La misma maqueta, en teléfono: la pantalla de Mi Ruta.
 *
 * En un teléfono la laptop medía 846px de alto y por eso se escondía, pero
 * esconderla era peor: es la única foto del producto y el teléfono es donde
 * llega la mayoría de la gente. Aquí va lo que de verdad importa de esa
 * pantalla —la barra de avance, las tres etapas y la siguiente acción— en el
 * marco en el que la van a ver.
 *
 * Los datos salen de `MOCK_STAGES` y `MOCK_ROUTE`, los mismos que usa la
 * laptop: la siguiente acción es el paso marcado como en curso, no un texto
 * escrito a mano que se desfase.
 */
function TelefonoRuta() {
  const avance = avanceDeLaLista(MOCK_ROUTE).pct;
  const siguiente = MOCK_ROUTE.find(([, estado]) => estado === 2)?.[0] ?? MOCK_ROUTE[0][0];

  return (
    <div className="lp-telruta" aria-hidden>
      <div className="lp-telruta-marco">
        <div style={{ padding: '13px 13px 15px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
            <span style={{ fontFamily: 'var(--disp)', fontWeight: 800, fontSize: 15, letterSpacing: '-.02em' }}>
              Tu ruta de apertura
            </span>
            <span style={{ fontFamily: 'var(--disp)', fontWeight: 800, fontSize: 14, color: 'var(--sage-d)' }}>
              {avance}%
            </span>
          </div>
          <Barra pct={avance} color="var(--sage-d)" alto={8} />

          <div style={{ marginTop: 13, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {MOCK_STAGES.map(([nombre, frac, pct, tono]) => {
              const col = tono === 'sage' ? 'var(--sage-d)' : tono === 'amber' ? 'var(--amber-d)' : 'var(--ink-3)';
              return (
                <div
                  key={nombre}
                  style={{
                    padding: '9px 10px',
                    borderRadius: 10,
                    border: '1px solid var(--line)',
                    background: 'var(--cream)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ display: 'block', width: 15, height: 15, borderRadius: 5, background: col, flex: 'none' }} />
                    <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, fontWeight: 800 }}>{nombre}</span>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--ink-3)' }}>{frac}</span>
                  </div>
                  <Barra pct={pct} color={col} alto={4} />
                </div>
              );
            })}
          </div>

          <div
            style={{
              marginTop: 11,
              padding: '10px 11px',
              borderRadius: 10,
              background: 'var(--amber-xl)',
              border: '1px solid var(--amber)',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 9.5,
                fontWeight: 700,
                letterSpacing: '.09em',
                textTransform: 'uppercase',
                /* `--amber-d` sobre `--amber-xl` da 2.64:1 y esto es texto de
                   9.5px: le toca el naranja de texto, no el de relleno. */
                color: 'var(--orange-texto)',
              }}
            >
              Tu siguiente paso
            </div>
            <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12.5, fontWeight: 800, flex: 1, minWidth: 0 }}>{siguiente}</span>
              <span style={{ color: 'var(--ink)', display: 'grid', flex: 'none' }}>
                <Arrow size={15} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Los tres teléfonos del temario: costeo, ruta y plan de marketing. */
function TresTelefonos({ onOpen }: { onOpen: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingTop: 34 }}>
      <div
        className="lp-hidesm"
        style={{
          width: '31%',
          border: '6px solid var(--ink)',
          borderRadius: 24,
          background: 'var(--paper)',
          overflow: 'hidden',
          boxShadow: '0 14px 32px rgb(28 26 23 / 0.2)',
          transform: 'translateX(14px) rotate(-1.5deg)',
        }}
      >
        <div style={{ padding: '12px 11px 14px' }}>
          <div style={{ fontFamily: 'var(--disp)', fontWeight: 800, fontSize: 13, letterSpacing: '-.02em' }}>
            Menú rentable
          </div>
          <div style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 1 }}>Costeador de platillos</div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/img/ramen-tori-tonkotsu.webp"
            alt=""
            loading="lazy"
            style={{ display: 'block', width: '100%', aspectRatio: '1/.78', objectFit: 'cover', borderRadius: 9, marginTop: 9 }}
          />
          <div style={{ fontSize: 11.5, fontWeight: 800, marginTop: 9 }}>{MOCK_DISH.name}</div>
          <div style={{ marginTop: 7, display: 'flex', flexDirection: 'column', gap: 4, fontSize: 9.5 }}>
            {MOCK_DISH.rows.map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}>
                <span style={{ color: 'var(--ink-3)' }}>{k}</span>
                <span style={{ fontWeight: 700 }}>{v}</span>
              </div>
            ))}
            <div
              style={{ display: 'flex', justifyContent: 'space-between', gap: 6, paddingTop: 5, borderTop: '1px solid var(--line)' }}
            >
              <span
                style={{ fontFamily: 'var(--mono)', fontSize: 8.5, letterSpacing: '.05em', textTransform: 'uppercase', fontWeight: 700 }}
              >
                Costo total
              </span>
              <span style={{ fontWeight: 800 }}>{MOCK_DISH.total}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}>
              <span style={{ color: 'var(--ink-3)' }}>Precio sugerido</span>
              <span style={{ fontWeight: 800 }}>{MOCK_DISH.price}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}>
              <span style={{ color: 'var(--ink-3)' }}>Margen</span>
              <span style={{ fontWeight: 800, color: 'var(--sage-d)' }}>{MOCK_DISH.margin}%</span>
            </div>
          </div>
          <Barra pct={MOCK_DISH.margin} color="var(--sage-d)" alto={5} />
        </div>
      </div>

      <div
        style={{
          width: '36%',
          minWidth: 220,
          border: '7px solid var(--ink)',
          borderRadius: 28,
          background: 'var(--paper)',
          overflow: 'hidden',
          boxShadow: '0 22px 46px rgb(28 26 23 / 0.26)',
          zIndex: 2,
        }}
      >
        <div style={{ padding: '13px 12px 0' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
            <span style={{ fontFamily: 'var(--disp)', fontWeight: 800, fontSize: 14, letterSpacing: '-.02em' }}>
              Tu ruta de apertura
            </span>
            <span style={{ fontFamily: 'var(--disp)', fontWeight: 800, fontSize: 12.5, color: 'var(--sage-d)' }}>
              {avanceDeLaLista(MOCK_ROUTE).pct}%
            </span>
          </div>
          <Barra pct={avanceDeLaLista(MOCK_ROUTE).pct} color="var(--sage-d)" alto={7} />
          <div style={{ marginTop: 11, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {MOCK_ROUTE.map(([name, estado]) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 2px' }}>
                <span
                  style={{
                    display: 'grid',
                    placeItems: 'center',
                    width: 17,
                    height: 17,
                    flex: 'none',
                    borderRadius: '50%',
                    background: estado === 1 ? 'var(--sage-d)' : 'transparent',
                    border: estado === 1 ? 'none' : `2px solid ${estado === 2 ? 'var(--amber)' : 'var(--line)'}`,
                    color: 'var(--paper)',
                  }}
                >
                  {estado === 1 ? (
                    <svg
                      width={10}
                      height={10}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={3.6}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  ) : null}
                </span>
                <span
                  style={{
                    flex: 1,
                    minWidth: 0,
                    fontSize: 10,
                    fontWeight: estado ? 700 : 600,
                    color: estado ? 'var(--ink)' : 'var(--ink-3)',
                  }}
                >
                  {name}
                </span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 10, marginBottom: 12, padding: '10px 11px', borderRadius: 12, background: 'var(--cream-2)' }}>
            <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--ink-3)' }}>Próxima acción</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 6 }}>
              <span className="lp-tile lp-t-amber" style={{ width: 26, height: 26, borderRadius: 8, border: 'none' }}>
                <Ico name="doc" size={14} width={2.5} />
              </span>
              <span style={{ fontSize: 10.5, lineHeight: 1.32, fontWeight: 600 }}>
                Elige el tipo de licencia para tu restaurante
              </span>
            </div>
            <button
              type="button"
              onClick={onOpen}
              style={{
                width: '100%',
                marginTop: 9,
                minHeight: 44,
                borderRadius: 9,
                border: 'none',
                background: 'var(--ink)',
                color: 'var(--paper)',
                fontFamily: 'var(--body)',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Continuar
            </button>
          </div>
        </div>
      </div>

      <div
        className="lp-hidesm"
        style={{
          width: '31%',
          border: '6px solid var(--ink)',
          borderRadius: 24,
          background: 'var(--paper)',
          overflow: 'hidden',
          boxShadow: '0 14px 32px rgb(28 26 23 / 0.2)',
          transform: 'translateX(-14px) rotate(1.5deg)',
        }}
      >
        <div style={{ padding: '12px 11px 14px' }}>
          <div style={{ fontFamily: 'var(--disp)', fontWeight: 800, fontSize: 13, letterSpacing: '-.02em' }}>
            Plan de marketing
          </div>
          <div style={{ marginTop: 10, padding: '9px 10px', borderRadius: 10, background: 'var(--cream-2)' }}>
            <div style={{ fontSize: 9.5, color: 'var(--ink-3)' }}>Tu próximo plan</div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 6, marginTop: 2 }}>
              <span style={{ fontSize: 11.5, fontWeight: 800 }}>Mes 1 – Apertura</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--ink-3)' }}>
                {avanceDeLaLista(MOCK_MKT).hechos}/{avanceDeLaLista(MOCK_MKT).total}
              </span>
            </div>
            <Barra pct={avanceDeLaLista(MOCK_MKT).pct} color="var(--sage-d)" alto={5} />
          </div>
          <div style={{ marginTop: 9, display: 'flex', flexDirection: 'column', gap: 5 }}>
            {MOCK_MKT.map(([name, estado]) => (
              <div
                key={name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '5px 7px',
                  borderRadius: 7,
                  background: estado === 2 ? 'var(--amber-xl)' : 'transparent',
                }}
              >
                <span
                  style={{
                    display: 'block',
                    width: 11,
                    height: 11,
                    flex: 'none',
                    borderRadius: '50%',
                    background: estado === 1 ? 'var(--sage-d)' : 'transparent',
                    border: estado === 1 ? 'none' : `2px solid ${estado === 2 ? 'var(--amber-d)' : 'var(--line)'}`,
                  }}
                />
                <span style={{ flex: 1, minWidth: 0, fontSize: 9.5, fontWeight: 600 }}>{name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
