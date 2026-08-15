'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import './landing.css';
import {
  COST_COMPARISON,
  DEFAULT_TICKET,
  GIROS_LANDING,
  INCLUDED,
  LAUNCH,
  OBJECTIONS,
  TOOLS,
  TOTAL_STEPS,
  TYPICAL_INVESTMENT,
  STARTING_POINTS,
} from '@/content/landing';
import { calculate, routePanel, urgency } from '@/domain/landing';
import { money } from '@/domain/format';
import { track } from '@/lib/track';

/** Landing de venta (README § 12). */
export default function LandingPage() {
  const [giro, setGiro] = useState<string | null>(null);
  const [start, setStart] = useState<string | null>(null);
  const [rent, setRent] = useState('');
  const [payroll, setPayroll] = useState('');
  const [other, setOther] = useState('');
  const [ticket, setTicket] = useState(String(DEFAULT_TICKET));
  const [goal, setGoal] = useState('25000');
  const [closedOneDay, setClosedOneDay] = useState(false);
  const [leadOpen, setLeadOpen] = useState(false);
  const [leadDone, setLeadDone] = useState(false);
  const [email, setEmail] = useState('');
  const [openObjection, setOpenObjection] = useState<string | null>(null);
  const [sticky, setSticky] = useState(false);
  const [now, setNow] = useState<number | null>(null);
  const calculatorUsed = useRef(false);

  // La urgencia se evalúa en el cliente para no servir HTML con una fecha vencida.
  useEffect(() => setNow(Date.now()), []);

  useEffect(() => {
    const onScroll = () => setSticky(window.scrollY > 420);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // `Purchase` al volver del checkout.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('pago') === 'ok') {
      track('Purchase', { value: LAUNCH.price, currency: 'MXN' }, true);
    }
  }, []);

  const num = (value: string) => Number(value.replace(/[^0-9.]/g, '')) || 0;

  const result = useMemo(
    () =>
      calculate({
        rent: num(rent),
        payroll: num(payroll),
        other: num(other),
        ticket: num(ticket) || DEFAULT_TICKET,
        goal: num(goal),
        closedOneDay,
      }),
    [rent, payroll, other, ticket, goal, closedOneDay],
  );

  const panel = giro && start ? routePanel(giro, start) : null;
  const promo = now === null ? null : urgency(now);
  const showUrgency = !!promo?.visible;

  useEffect(() => {
    if (panel) track('DiagnosticoCompletado', { giro, start }, true);
  }, [panel, giro, start]);

  useEffect(() => {
    if (result.fixedExpenses > 0 && !calculatorUsed.current) {
      calculatorUsed.current = true;
      track('CalculadoraUsada', { gastosFijos: result.fixedExpenses });
    }
  }, [result.fixedExpenses]);

  const startTrial = () => {
    track('InicioPrueba');
    window.location.href = '/app';
  };

  const checkout = () => {
    track('InitiateCheckout', { value: LAUNCH.price, currency: 'MXN' });
    window.location.href = `/checkout?volver=${encodeURIComponent('/?pago=ok')}`;
  };

  return (
    <div className="lp">
      {showUrgency && promo ? (
        <div style={{ background: 'var(--ink)', color: '#fff', padding: '10px 16px' }}>
          <div className="lp-wrap" style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13.5, fontWeight: 600 }}>
              Precio de lanzamiento · {promo.label} · quedan {promo.spotsLabel}
            </span>
            <span style={{ flex: 1, minWidth: 80, height: 6, borderRadius: 999, background: 'rgb(255 255 255 / .18)' }}>
              <span
                style={{
                  display: 'block',
                  width: `${promo.spotsTakenPct}%`,
                  height: '100%',
                  borderRadius: 999,
                  background: 'var(--red)',
                }}
              />
            </span>
          </div>
        </div>
      ) : null}

      <main className="lp-wrap" style={{ paddingBottom: 120 }}>
        {/* 2 · Hero de diagnóstico */}
        <section className="lp-hero">
          <div>
            <div className="lp-eyebrow">Diagnóstico gratuito · sin registro</div>
            <h1 className="lp-display" style={{ fontSize: 'clamp(32px, 6.4vw, 58px)', margin: '12px 0 0' }}>
              ¿Quieres abrir tu negocio de comida y no sabes ni por dónde empezar?
            </h1>
            <p style={{ fontSize: 16.5, lineHeight: 1.5, color: 'var(--pencil)', maxWidth: '46ch' }}>
              Dos preguntas y te decimos en qué paso vas de los {TOTAL_STEPS} que lleva abrir, cuál sigue y por qué
              importa.
            </p>

            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>¿Qué quieres abrir?</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                {GIROS_LANDING.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className="lp-chip"
                    aria-pressed={giro === option}
                    onClick={() => setGiro(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {giro ? (
              <div style={{ marginTop: 20, animation: 'lpPrint .35s ease both' }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>¿En dónde estás hoy?</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                  {STARTING_POINTS.map((option) => (
                    <button
                      key={option.label}
                      type="button"
                      className="lp-chip"
                      aria-pressed={start === option.label}
                      onClick={() => setStart(option.label)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {/* 3 · Panel de ruta, en tinta */}
          <div>
            {panel ? (
              <div className="lp-ticket">
                <div style={{ fontSize: 12.5, opacity: 0.75, marginTop: 6 }}>{panel.title}</div>
                <div className="lp-num" style={{ fontSize: 15, marginTop: 8 }}>
                  {TOTAL_STEPS} pasos, 10 etapas. Estás en el paso {panel.step}.
                </div>
                <div style={{ height: 7, borderRadius: 999, background: 'rgb(255 255 255 / .18)', marginTop: 10 }}>
                  <div
                    style={{
                      width: `${panel.progressPct}%`,
                      height: '100%',
                      borderRadius: 999,
                      background: 'var(--red)',
                      transition: 'width .5s ease',
                    }}
                  />
                </div>

                {panel.covered.length ? (
                  <>
                    <hr />
                    {panel.covered.map((step) => (
                      <div key={step.title} style={{ fontSize: 13.5, opacity: 0.6, textDecoration: 'line-through' }}>
                        ✓ {step.title}
                      </div>
                    ))}
                  </>
                ) : null}

                {panel.skippedNote ? (
                  <>
                    <hr />
                    <div style={{ fontSize: 13, color: '#ffb3a3' }}>{panel.skippedNote}</div>
                  </>
                ) : null}

                <hr />
                <div style={{ fontSize: 11.5, letterSpacing: '.08em', textTransform: 'uppercase', opacity: 0.6 }}>
                  Tu siguiente paso
                </div>
                <div className="lp-display" style={{ fontSize: 22, marginTop: 4 }}>
                  {panel.next.title}
                </div>
                <div style={{ fontSize: 14, marginTop: 6, lineHeight: 1.45 }}>{panel.next.instruction}</div>
                <div style={{ fontSize: 13, marginTop: 6, opacity: 0.75 }}>{panel.next.why}</div>

                <hr />
                {panel.following.map((step) => (
                  <div key={step.title} style={{ fontSize: 13.5, opacity: 0.8 }}>
                    · {step.title}
                  </div>
                ))}
                <div className="lp-num" style={{ fontSize: 12.5, marginTop: 8, opacity: 0.65 }}>
                  {panel.restLine}
                </div>

                <hr />
                {leadDone ? (
                  <div style={{ fontSize: 13.5, color: '#9fe3c0' }}>
                    Listo: te mandamos tu ruta completa a {email}.
                  </div>
                ) : leadOpen ? (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@correo.com"
                      style={{
                        flex: 1,
                        minWidth: 180,
                        height: 50,
                        padding: '0 14px',
                        borderRadius: 14,
                        border: 'none',
                        fontSize: 16,
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!email.includes('@')) return;
                        track('Lead', { origen: 'ruta' });
                        setLeadDone(true);
                      }}
                      style={{
                        height: 50,
                        padding: '0 20px',
                        border: 'none',
                        borderRadius: 14,
                        background: 'var(--red)',
                        color: '#fff',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Mándame mi ruta
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="lp-link-cta"
                    style={{ color: '#ffb3a3' }}
                    onClick={() => {
                      track('LeadIntent', { origen: 'ruta' });
                      setLeadOpen(true);
                    }}
                  >
                    Mándame mi ruta completa
                  </button>
                )}
              </div>
            ) : (
              <div className="lp-bone" style={{ minHeight: 220, display: 'grid', placeItems: 'center' }}>
                <p style={{ fontSize: 15, color: 'var(--pencil)', textAlign: 'center', margin: 0 }}>
                  Contesta las dos preguntas y aquí aparece tu ruta, con el paso en el que vas.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* 4 · Franja de CTA que lee del diagnóstico */}
        {panel ? (
          <section className="lp-section lp-bone" style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <p className="lp-display" style={{ fontSize: 'clamp(19px, 3vw, 26px)', margin: 0, flex: '1 1 320px' }}>
              {panel.ctaLine}
            </p>
            <button type="button" className="lp-cta" onClick={startTrial}>
              Empezar mi prueba de {LAUNCH.trialDays} días
            </button>
          </section>
        ) : null}

        {/* 5 · El puente al producto */}
        <section className="lp-section">
          <h2 className="lp-display" style={{ fontSize: 'clamp(24px, 4vw, 34px)' }}>
            Eso es MiRestauranteListo
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginTop: 16 }}>
            {[
              ['43 tareas', 'Tu ruta completa, en orden, con el porqué de cada paso.'],
              ['Costo real', 'Lo que cuesta cada platillo con merma, empaque y mano de obra.'],
              ['3 equipos', 'Un solo pago, tu licencia en hasta 3 equipos.'],
            ].map(([title, body]) => (
              <div key={title} className="lp-card">
                <div className="lp-display" style={{ fontSize: 22 }}>
                  {title}
                </div>
                <p style={{ fontSize: 14.5, color: 'var(--pencil)', margin: '6px 0 0' }}>{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Video demo */}
        <section className="lp-section">
          <div className="lp-slot" style={{ aspectRatio: '16 / 10', minHeight: 0 }}>
            [EDITAR] Video demo 16:10, MP4 self-hosted con subtítulos quemados. Autoplay silenciado; eventos de progreso
            25 / 50 / 75%.
          </div>
        </section>

        {/* Las tres herramientas */}
        <section className="lp-section">
          <h2 className="lp-display" style={{ fontSize: 'clamp(24px, 4vw, 34px)' }}>
            Las tres herramientas
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginTop: 16 }}>
            {TOOLS.map((tool) => (
              <div key={tool.slot}>
                <div className="lp-slot" style={{ aspectRatio: '9 / 17' }}>
                  [EDITAR] Captura real · {tool.slot}
                </div>
                <div className="lp-display" style={{ fontSize: 20, marginTop: 10 }}>
                  {tool.title}
                </div>
                <p style={{ fontSize: 14.5, color: 'var(--pencil)', margin: '4px 0 0' }}>{tool.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 6 · La calculadora completa */}
        <section className="lp-section">
          <h2 className="lp-display" style={{ fontSize: 'clamp(24px, 4vw, 34px)' }}>
            Y cuando llegues a los números, ya están resueltos
          </h2>
          <p style={{ fontSize: 16, color: 'var(--pencil)', maxWidth: '52ch' }}>
            Sin botón de calcular y sin pedirte el correo: escribe tus gastos y el resultado se mueve solo.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginTop: 18 }}>
            <div style={{ display: 'grid', gap: 12 }}>
              {(
                [
                  ['Renta mensual del local', rent, setRent],
                  ['Nómina mensual estimada', payroll, setPayroll],
                  ['Otros gastos fijos al mes', other, setOther],
                  ['Ticket promedio', ticket, setTicket],
                  ['¿Cuánto quieres ganar tú al mes?', goal, setGoal],
                ] as Array<[string, string, (v: string) => void]>
              ).map(([label, value, setter]) => (
                <label key={label} className="lp-field">
                  {label}
                  <input inputMode="numeric" value={value} onChange={(e) => setter(e.target.value)} placeholder="0" />
                </label>
              ))}

              <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14.5, fontWeight: 600 }}>
                <input type="checkbox" checked={closedOneDay} onChange={(e) => setClosedOneDay(e.target.checked)} />
                Cierro un día a la semana
              </label>
            </div>

            <div className="lp-ticket">
              <div style={{ fontSize: 12.5, opacity: 0.75, marginTop: 6 }}>
                Gastos fijos: {money(result.fixedExpenses)} al mes. Se pagan abras o no, vendas o no.
              </div>
              <hr />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 11.5, opacity: 0.7, fontWeight: 700 }}>Para no perder</div>
                  <div className="lp-num" style={{ fontSize: 26, marginTop: 2 }}>
                    {money(result.dailySales)}
                  </div>
                  <div style={{ fontSize: 12.5, opacity: 0.8 }}>al día · {result.ticketsPerDay} tickets</div>
                </div>
                <div>
                  <div style={{ fontSize: 11.5, opacity: 0.7, fontWeight: 700 }}>Para ganar {money(num(goal))}</div>
                  <div className="lp-num" style={{ fontSize: 26, marginTop: 2 }}>
                    {money(result.goalDailySales)}
                  </div>
                  <div style={{ fontSize: 12.5, opacity: 0.8 }}>al día · {result.goalTicketsPerDay} tickets</div>
                </div>
              </div>
              <hr />
              <div style={{ fontSize: 13 }}>
                {result.goalTicketsPerDay} tickets al día ≈ un cliente cada {result.minutesBetweenCustomers} minutos, en
                un turno de 8 horas.
              </div>
              <div style={{ fontSize: 12.5, opacity: 0.75, marginTop: 6 }}>
                Al mes: {money(result.monthlySales)} para no perder · {money(result.goalMonthlySales)} para tu meta ·{' '}
                {result.days} días de venta.
              </div>
              {result.note ? (
                <div style={{ fontSize: 12.5, marginTop: 10, color: '#ffb3a3' }}>{result.note}</div>
              ) : null}
              <hr />
              <button
                type="button"
                className="lp-link-cta"
                style={{ color: '#ffb3a3' }}
                onClick={() => {
                  track('LeadIntent', { origen: 'calculadora' });
                  setLeadOpen(true);
                }}
              >
                Guardar mi cálculo y ver qué más me falta
              </button>
            </div>
          </div>

          {num(rent) > 0 ? (
            <p className="lp-display" style={{ fontSize: 'clamp(18px, 3.4vw, 26px)', marginTop: 24 }}>
              Un mes de renta mal elegida te cuesta {money(result.rentCost)} de venta.
            </p>
          ) : null}
        </section>

        {/* 7 · Comparativa */}
        <section className="lp-section lp-ticket" style={{ animation: 'none' }}>
          <h2 className="lp-display" style={{ fontSize: 'clamp(22px, 4vw, 30px)', marginTop: 8 }}>
            Lo que cuesta resolver esto de otras formas
          </h2>
          <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
            {COST_COMPARISON.map((row) => (
              <div
                key={row.label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 12,
                  flexWrap: 'wrap',
                  padding: '12px 14px',
                  borderRadius: 12,
                  background: row.highlight ? 'var(--red)' : 'rgb(255 255 255 / .06)',
                }}
              >
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{row.label}</div>
                  <div style={{ fontSize: 12.5, opacity: 0.8 }}>{row.note}</div>
                </div>
                <div className="lp-num" style={{ fontSize: 17 }}>
                  {row.cost}
                </div>
              </div>
            ))}
          </div>
          <p className="lp-num" style={{ fontSize: 'clamp(18px, 4.6vw, 26px)', lineHeight: 1.25, marginTop: 24, maxWidth: '34ch' }}>
            Vas a invertir alrededor de <span style={{ color: '#ffb3a3' }}>{money(TYPICAL_INVESTMENT)}</span> en abrir.
            Esto es el <span style={{ color: '#ffb3a3' }}>{result.pricePctOfInvestment}</span> de eso.
          </p>
        </section>

        {/* 8 · Videos de objeción */}
        <section className="lp-section">
          <h2 className="lp-display" style={{ fontSize: 'clamp(24px, 4vw, 34px)' }}>
            Lo que todos preguntan
          </h2>
          <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
            {OBJECTIONS.map((objection) => (
              <div key={objection.id} className="lp-card" style={{ padding: 0, overflow: 'hidden' }}>
                <button
                  type="button"
                  onClick={() => {
                    setOpenObjection(openObjection === objection.id ? null : objection.id);
                    if (openObjection !== objection.id) track('VideoObjecion', { id: objection.id });
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '14px 16px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'inherit',
                  }}
                >
                  <span className="lp-slot" style={{ width: 56, height: 56, minHeight: 0, borderRadius: 999, fontSize: 10 }}>
                    {objection.id}
                  </span>
                  <span style={{ flex: 1, fontSize: 15.5, fontWeight: 700 }}>{objection.title}</span>
                  <span style={{ color: 'var(--pencil)' }}>{openObjection === objection.id ? '−' : '+'}</span>
                </button>
                {openObjection === objection.id ? (
                  <div style={{ padding: '0 16px 16px', animation: 'lpPrint .25s ease both' }}>
                    <div className="lp-slot" style={{ aspectRatio: '16 / 10' }}>
                      [EDITAR] Clip de objeción con carátula de cara · {objection.id}
                    </div>
                    <p style={{ fontSize: 14.5, lineHeight: 1.5, color: 'var(--pencil)', marginBottom: 0 }}>
                      {objection.summary}
                    </p>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </section>

        {/* 9 · Precio y cierre */}
        <section className="lp-section" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          <div className="lp-bone">
            {showUrgency ? (
              <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--red-deep)' }}>
                Precio de lanzamiento · {promo?.label} · quedan {promo?.spotsLabel}
              </div>
            ) : null}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 8 }}>
              {showUrgency ? (
                <span className="lp-num" style={{ fontSize: 20, color: 'var(--pencil)', textDecoration: 'line-through' }}>
                  {money(LAUNCH.listPrice)}
                </span>
              ) : null}
              <span className="lp-display" style={{ fontSize: 'clamp(34px, 7vw, 52px)' }}>
                {money(LAUNCH.price)}
              </span>
            </div>
            <div style={{ fontSize: 14.5, color: 'var(--pencil)' }}>
              pago único · o {LAUNCH.installments} pagos de {money(LAUNCH.installmentAmount)} sin intereses
            </div>

            <div style={{ marginTop: 18, display: 'grid', gap: 10 }}>
              <button type="button" className="lp-cta" onClick={startTrial}>
                Empezar mi prueba de {LAUNCH.trialDays} días
              </button>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <button type="button" className="lp-link-cta" onClick={checkout}>
                  Pagar ahora y desbloquear todo
                </button>
                <span style={{ fontSize: 13, color: 'var(--pencil)' }}>Ya lo tengo claro, sáltate la prueba</span>
              </div>
            </div>

            {showUrgency ? (
              <details style={{ marginTop: 16, fontSize: 14 }}>
                <summary style={{ cursor: 'pointer', fontWeight: 700 }}>Por qué sube el precio</summary>
                <p style={{ color: 'var(--red-deep)', lineHeight: 1.5 }}>
                  Los primeros {promo?.spotsLabel} entran a {money(LAUNCH.price)} porque su uso nos dice qué mejorar. Al
                  cerrar el cupo, el precio queda en {money(LAUNCH.listPrice)} y quien ya entró conserva su acceso sin
                  pagar la diferencia.
                </p>
              </details>
            ) : null}
          </div>

          <div className="lp-card">
            <div className="lp-display" style={{ fontSize: 20 }}>
              Qué incluye
            </div>
            <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
              {INCLUDED.map((item) => (
                <div key={item} style={{ display: 'flex', gap: 10, fontSize: 14.5 }}>
                  <span style={{ color: 'var(--green)', fontWeight: 800 }}>✓</span>
                  {item}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, padding: 14, borderRadius: 12, background: 'var(--green-soft)', fontSize: 13.5 }}>
              Garantía de {LAUNCH.warrantyDays} días · prueba de {LAUNCH.trialDays} días · sin mensualidades
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section className="lp-section" style={{ background: 'var(--red-soft)', borderRadius: 20, padding: 'clamp(22px, 5vw, 38px)', textAlign: 'center' }}>
          <p className="lp-display" style={{ fontSize: 'clamp(22px, 4.4vw, 34px)', margin: 0 }}>
            Puedes calcular todo esto después de firmar el local. Sale mucho más caro.
          </p>
          <div style={{ marginTop: 18 }}>
            <button type="button" className="lp-cta" onClick={startTrial}>
              Empezar mi prueba de {LAUNCH.trialDays} días
            </button>
          </div>
          <p style={{ fontSize: 13, color: 'var(--pencil)', marginTop: 12 }}>
            Sin tarjeta para la prueba · pago único de {money(LAUNCH.price)} · garantía de {LAUNCH.warrantyDays} días
          </p>
        </section>

        <footer style={{ marginTop: 40, fontSize: 13, color: 'var(--pencil)', textAlign: 'center' }}>
          MiRestauranteListo · hecho en México · Aviso de privacidad · Términos
        </footer>
      </main>

      {sticky ? (
        <div className="lp-sticky">
          <div style={{ fontSize: 13 }}>
            <strong>{money(LAUNCH.price)}</strong> pago único
            {showUrgency ? <span style={{ display: 'block', opacity: 0.75 }}>quedan {promo?.spotsLabel}</span> : null}
          </div>
          <button type="button" className="lp-cta" style={{ height: 46 }} onClick={startTrial}>
            Probar {LAUNCH.trialDays} días
          </button>
        </div>
      ) : null}

      <button
        type="button"
        className="lp-whatsapp"
        aria-label="Escríbenos por WhatsApp"
        onClick={() => {
          track('ContactoWhatsApp');
          window.open('https://wa.me/5215500000000', '_blank', 'noopener');
        }}
      >
        WA
      </button>
    </div>
  );
}
