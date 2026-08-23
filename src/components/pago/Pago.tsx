'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { GUARANTEE_LINE, GUARANTEE_SHORT, LAUNCH } from '@/content/landing';
import { AVISO_DE_ESTADO, estadoDeCobro, FUENTE_ELEMENTS, TEMA_ELEMENTS, type EstadoDeCobro } from '@/domain/pago';
import { money } from '@/domain/format';
import { getDeviceId } from '@/lib/device';
import { track } from '@/lib/track';
import { Arrow, Check, Ico } from '@/components/landing/pieces';
import { FormaDePago } from './FormaDePago';

/**
 * Pantalla de pago (`PagoMRL.dc.html` de la entrega v2).
 *
 * El cobro sucede aquí, sin mandar a nadie a otra página: los campos de tarjeta
 * son el Payment Element de Stripe, montado dentro de esta tarjeta con el tema
 * de la marca. El número de tarjeta vive en el iframe de Stripe y no pasa por
 * nuestro servidor; lo único que guardamos es el correo, que es a donde va la
 * licencia. El precio lo fija el servidor con los ajustes del panel.
 */

const INCLUYE: ReadonlyArray<[string, string, string, string]> = [
  ['Las 90 lecciones interactivas', 'Paso a paso, desde la idea hasta la apertura.', 'route', 'sage'],
  ['Calculadoras y herramientas', 'Números reales para tomar decisiones reales.', 'calc', 'amber'],
  ['Plantillas y checklists', 'Listas para usar en tu restaurante.', 'permit', 'rose'],
  ['Actualizaciones de por vida', 'Nuevos contenidos sin costo adicional.', 'cloud', 'sky'],
  ['Soporte por correo', 'Te ayudamos cuando lo necesites.', 'head', 'lila'],
];

const SELLOS: ReadonlyArray<[string, string]> = [
  ['Pago seguro y encriptado', 'shield'],
  ['Acceso para siempre', 'infin'],
  ['Sin cargos recurrentes', 'card'],
];

const PIE: ReadonlyArray<[string, string, string]> = [
  ['Acceso inmediato', 'Empieza ahora mismo.', 'cal'],
  ['Sin tarjeta para probar', `Prueba ${LAUNCH.trialDays} días sin riesgo.`, 'clock'],
  ['Actualizaciones incluidas', 'Nuevos contenidos siempre.', 'cloud'],
  ['Soporte humano', 'Te respondemos por correo.', 'head'],
];

/** Lo que puede estar pasando en la tarjeta de la derecha. */
type Fase = 'abriendo' | 'cobrando' | 'sin-cobro' | 'listo';

interface Cobro {
  clientSecret: string;
  intentId: string;
  publishableKey: string;
  price: number;
  email: string;
}

export function Pago() {
  const [fase, setFase] = useState<Fase>('abriendo');
  const [cobro, setCobro] = useState<Cobro | null>(null);
  const [precio, setPrecio] = useState(LAUNCH.price);
  const [aviso, setAviso] = useState('');
  const [estadoFinal, setEstadoFinal] = useState<EstadoDeCobro>('listo');
  const abierto = useRef(false);

  /* Abrir el cobro, o retomar el que volvió del banco. */
  useEffect(() => {
    if (abierto.current) return;
    abierto.current = true;

    const params = new URLSearchParams(window.location.search);
    const secretoDeVuelta = params.get('payment_intent_client_secret');

    const abrir = async () => {
      try {
        if (secretoDeVuelta) {
          // Volvimos de la autenticación del banco: el cobro ya existe y lo
          // único que falta es preguntarle a Stripe cómo terminó.
          const clave = await fetch('/api/pago/intent').then((r) => r.json());
          if (!clave.ok) {
            setFase('sin-cobro');
            setAviso('El cobro todavía no está disponible. Escríbenos y lo resolvemos.');
            return;
          }
          setPrecio(clave.price);
          const stripe = await loadStripe(clave.publishableKey);
          const resultado = await stripe?.retrievePaymentIntent(secretoDeVuelta);
          const estado = estadoDeCobro(resultado?.paymentIntent?.status);
          if (estado === 'listo' || estado === 'confirmando') {
            setEstadoFinal(estado);
            setFase('listo');
            return;
          }
          // Quedó a medias: se vuelve a abrir el cobro para reintentar.
          setAviso(AVISO_DE_ESTADO[estado]);
        }

        const respuesta = await fetch('/api/pago/intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deviceId: getDeviceId() }),
        });
        const datos = await respuesta.json();

        if (!datos.ok) {
          setFase('sin-cobro');
          setAviso(datos.message ?? 'El cobro todavía no está disponible. Escríbenos y lo resolvemos.');
          return;
        }

        setPrecio(datos.price);
        setCobro({
          clientSecret: datos.clientSecret,
          intentId: datos.intentId,
          publishableKey: datos.publishableKey,
          price: datos.price,
          email: datos.email ?? '',
        });
        setFase('cobrando');
      } catch {
        setFase('sin-cobro');
        setAviso('Necesitas conexión para pagar. Revisa tu internet y recarga la página.');
      }
    };

    void abrir();
  }, []);

  const stripePromise = useMemo<Promise<Stripe | null> | null>(
    () => (cobro ? loadStripe(cobro.publishableKey) : null),
    [cobro],
  );

  const listo = useCallback(() => {
    setEstadoFinal('listo');
    setFase('listo');
  }, []);

  /* Al terminar bien, la medición y nada más: la licencia la emite el webhook. */
  useEffect(() => {
    if (fase === 'listo' && estadoFinal === 'listo') {
      track('Purchase', { value: precio, currency: 'MXN' }, true);
    }
  }, [fase, estadoFinal, precio]);

  const opciones = cobro
    ? {
        clientSecret: cobro.clientSecret,
        appearance: TEMA_ELEMENTS,
        fonts: FUENTE_ELEMENTS,
        locale: 'es' as const,
      }
    : undefined;

  return (
    <div className="lp">
      <div className="lp-bar">
        <div>{GUARANTEE_SHORT}</div>
      </div>

      <header className="lp-head">
        <div>
          <a href="/" className="lp-marca">
            <span>MRL</span>
            <span>
              Mi<span style={{ color: 'var(--orange)' }}>Restaurante</span>Listo
            </span>
          </a>
          <div style={{ flex: 1 }} />
          <a href="/" className="lp-btn">
            Volver
          </a>
        </div>
      </header>

      <section className="lp-sec">
        <div className="lp-split" style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(0,540px)', alignItems: 'start' }}>
          {/* ── Lo que compras ── */}
          <div>
            <div className="lp-hand" style={{ fontSize: 25, lineHeight: 1.2, color: 'var(--ink-2)' }}>
              Estás a un paso
              <br />
              de hacerlo realidad.
            </div>

            <h1 style={{ marginTop: 20, fontSize: 'clamp(32px,4.4vw,50px)' }}>
              Acceso inmediato
              <br />
              de por vida.
            </h1>

            <p style={{ marginTop: 20, fontSize: 17, lineHeight: 1.6, color: 'var(--ink-2)', maxWidth: 420 }}>
              Sin suscripciones, sin mensualidades.
              <br />
              Un solo pago y es tuyo para siempre.
            </p>

            <div style={{ marginTop: 26, padding: 24, borderRadius: 20, background: 'var(--paper)' }}>
              <div style={{ fontFamily: 'var(--disp)', fontWeight: 800, fontSize: 17, letterSpacing: '-.01em' }}>
                Con tu acceso obtienes:
              </div>
              <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 17 }}>
                {INCLUYE.map(([t, d, icono, tono]) => (
                  <div key={t} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <span className={`lp-circ lp-t-${tono}`} style={{ width: 46, height: 46, border: 'none' }}>
                      <Ico name={icono} size={22} width={2.1} />
                    </span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', fontSize: 15.5, fontWeight: 800 }}>{t}</span>
                      <span style={{ display: 'block', fontSize: 13.5, lineHeight: 1.45, color: 'var(--ink-3)', marginTop: 3 }}>
                        {d}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 22, display: 'flex', alignItems: 'flex-end', gap: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/img/arnold-cierre.webp"
                alt="Arnold celebrando"
                loading="lazy"
                style={{ display: 'block', width: '56%', maxWidth: 250, height: 'auto' }}
              />
              <div style={{ flex: 1, minWidth: 0, marginBottom: 34 }}>
                <div style={{ padding: '22px 24px', border: '2.5px solid var(--ink)', borderRadius: 38, background: 'var(--paper)' }}>
                  <span className="lp-hand" style={{ fontSize: 27, lineHeight: 1.2 }}>
                    ¡Nos vemos
                    <br />
                    dentro! <span style={{ color: 'var(--orange)' }}>♥</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── El pedido y el cobro ── */}
          <div
            className="pg-card"
            style={{
              position: 'sticky',
              top: 18,
              padding: 26,
              borderRadius: 22,
              background: '#fff',
              boxShadow: '0 10px 40px rgb(28 26 23 / 0.07)',
            }}
          >
            {fase === 'listo' ? (
              <Exito estado={estadoFinal} precio={precio} />
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 11, flexWrap: 'wrap' }}>
                  <span style={{ color: 'var(--ink-2)', display: 'grid' }}>
                    <Ico name="lock" size={17} width={2.4} />
                  </span>
                  <span style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--ink-2)' }}>Pago 100% seguro con</span>
                  <span style={{ fontFamily: 'var(--disp)', fontWeight: 900, fontSize: 19, letterSpacing: '-.03em', color: '#635BFF' }}>
                    stripe
                  </span>
                  <span className="pg-pci">PCI DSS</span>
                </div>

                <Pedido precio={precio} />

                <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }} className="pg-sellos">
                  {SELLOS.map(([t, icono]) => (
                    <div
                      key={t}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '13px 12px',
                        border: '1.5px solid var(--line-2)',
                        borderRadius: 14,
                      }}
                    >
                      <span className="lp-tile lp-t-ink" style={{ width: 32, height: 32, borderRadius: '50%', border: 'none' }}>
                        <Ico name={icono} size={17} width={2.2} />
                      </span>
                      <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, lineHeight: 1.32, fontWeight: 600, color: 'var(--ink-2)' }}>
                        {t}
                      </span>
                    </div>
                  ))}
                </div>

                {aviso ? (
                  <div
                    role="alert"
                    style={{
                      marginTop: 14,
                      padding: '13px 15px',
                      borderRadius: 13,
                      background: '#FBE9E6',
                      color: '#8C2A1F',
                      fontSize: 14,
                      lineHeight: 1.45,
                      fontWeight: 600,
                    }}
                  >
                    {aviso}
                  </div>
                ) : null}

                {fase === 'cobrando' && cobro && stripePromise && opciones ? (
                  <Elements stripe={stripePromise} options={opciones}>
                    <FormaDePago
                      intentId={cobro.intentId}
                      precio={cobro.price}
                      correoInicial={cobro.email}
                      onListo={listo}
                    />
                  </Elements>
                ) : null}

                {fase === 'abriendo' ? <Abriendo /> : null}

                {fase === 'sin-cobro' ? (
                  <a
                    href="mailto:hola@mirestaurantelisto.mx"
                    className="pg-pay"
                    style={{ marginTop: 18, textDecoration: 'none' }}
                  >
                    Escríbenos
                    <Arrow />
                  </a>
                ) : null}
              </>
            )}

            <div style={{ marginTop: 20, padding: '20px 22px', borderRadius: 17, background: 'var(--sage-xl)', display: 'flex', alignItems: 'center', gap: 16 }}>
              <span
                style={{
                  display: 'grid',
                  placeItems: 'center',
                  width: 56,
                  height: 56,
                  flex: 'none',
                  borderRadius: '50%',
                  background: 'var(--sage-d)',
                  color: '#fff',
                }}
              >
                <Ico name="shield" size={30} width={2.1} />
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontFamily: 'var(--disp)', fontSize: 18, fontWeight: 800, letterSpacing: '-.01em' }}>
                  Garantía {LAUNCH.warrantyDays} días sin riesgo
                </span>
                <span style={{ display: 'block', fontSize: 14.5, lineHeight: 1.5, color: 'var(--ink-2)', marginTop: 4 }}>
                  {GUARANTEE_LINE}
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className="lp-trust" style={{ marginTop: 22, borderRadius: 20 }}>
          {PIE.map(([t, d, icono]) => (
            <div key={t}>
              <span className="lp-tile lp-t-ink" style={{ width: 40, height: 40, borderRadius: 11 }}>
                <Ico name={icono} size={20} width={2.2} />
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 13.5, fontWeight: 800 }}>{t}</span>
                <span style={{ display: 'block', fontSize: 12.5, lineHeight: 1.4, color: 'var(--ink-3)', marginTop: 2 }}>{d}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      <div style={{ background: 'var(--ink)', color: '#fff' }}>
        <div
          className="pg-negra"
          style={{
            maxWidth: 1120,
            margin: '0 auto',
            padding: '22px 22px calc(22px + env(safe-area-inset-bottom, 0px))',
            display: 'flex',
            alignItems: 'center',
            gap: 28,
          }}
        >
          <div>
            <div style={{ fontFamily: 'var(--disp)', fontSize: 18, fontWeight: 800, letterSpacing: '-.01em' }}>
              ¿Dudas? Escríbenos
            </div>
            <a
              href="mailto:hola@mirestaurantelisto.mx"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 9,
                minHeight: 44,
                fontSize: 14.5,
                color: 'rgb(255 255 255 / 0.82)',
              }}
            >
              <Ico name="mail" size={17} width={2.2} />
              hola@mirestaurantelisto.mx
            </a>
          </div>
          <div style={{ flex: 1 }} />
          <div
            className="pg-negra-der"
            style={{
              borderLeft: '1.5px solid rgb(255 255 255 / 0.18)',
              paddingLeft: 28,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <span style={{ fontSize: 14.5, lineHeight: 1.45, color: 'rgb(255 255 255 / 0.82)' }}>
              Pago procesado de forma segura por
            </span>
            <span style={{ fontFamily: 'var(--disp)', fontWeight: 900, fontSize: 21, letterSpacing: '-.03em', color: '#A9A2FF' }}>
              stripe
            </span>
            <span className="pg-pci pg-pci-oscuro">PCI DSS</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** El resumen del pedido: qué se lleva y cuánto es. */
function Pedido({ precio }: { precio: number }) {
  return (
    <div style={{ marginTop: 20, padding: 22, borderRadius: 17, background: 'var(--amber-xl)' }} className="pg-sum">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span
          style={{
            display: 'grid',
            placeItems: 'center',
            width: 52,
            height: 52,
            flex: 'none',
            borderRadius: 12,
            background: 'var(--ink)',
            color: '#fff',
            fontFamily: 'var(--disp)',
            fontWeight: 900,
            fontSize: 15,
          }}
        >
          MRL
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', fontFamily: 'var(--disp)', fontSize: 18, fontWeight: 800, letterSpacing: '-.02em' }}>
            MiRestauranteListo
          </span>
          <span style={{ display: 'block', fontSize: 14, color: 'var(--ink-2)', marginTop: 2 }}>Acceso de por vida</span>
        </span>
        <span style={{ textAlign: 'right', flex: 'none' }}>
          <span className="pg-precio" style={{ display: 'block', fontFamily: 'var(--disp)', fontSize: 29, fontWeight: 900, letterSpacing: '-.03em' }}>
            {money(precio)}
          </span>
          <span style={{ display: 'block', fontSize: 13, color: 'var(--ink-2)', marginTop: 1 }}>Pago único</span>
        </span>
      </div>

      <div
        style={{
          marginTop: 18,
          paddingTop: 16,
          borderTop: '1.5px solid rgb(28 26 23 / 0.12)',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <span style={{ fontFamily: 'var(--disp)', fontSize: 17, fontWeight: 800, letterSpacing: '-.01em' }}>Total a pagar</span>
        <span style={{ textAlign: 'right' }}>
          <span style={{ display: 'flex', alignItems: 'baseline', gap: 7, justifyContent: 'flex-end' }}>
            <span className="pg-precio" style={{ fontFamily: 'var(--disp)', fontSize: 31, fontWeight: 900, letterSpacing: '-.03em' }}>
              {money(precio)}
            </span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 700, color: 'var(--ink-2)' }}>MXN</span>
          </span>
          <span style={{ display: 'block', fontSize: 13, color: 'var(--ink-2)', marginTop: 2 }}>Sin impuestos adicionales</span>
        </span>
      </div>
    </div>
  );
}

/** Mientras se abre el cobro: el mismo hueco que usan los campos de Stripe. */
function Abriendo() {
  return (
    <div style={{ marginTop: 22 }} aria-live="polite">
      <span style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--ink-2)' }}>
        Preparando tu pago seguro…
      </span>
      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 14 }} aria-hidden>
        <span className="pg-hueco" style={{ height: 58 }} />
        <span className="pg-hueco" style={{ height: 52 }} />
        <span className="pg-hueco" style={{ height: 52 }} />
        <span className="pg-hueco" style={{ height: 66 }} />
      </div>
    </div>
  );
}

/**
 * El final feliz.
 *
 * La licencia la emite el webhook al confirmar Stripe el cobro, así que aquí no
 * se promete nada que dependa del navegador: se dice qué pasó y a dónde entrar.
 */
function Exito({ estado, precio }: { estado: EstadoDeCobro; precio: number }) {
  const confirmando = estado === 'confirmando';
  return (
    <div style={{ textAlign: 'center', padding: '10px 0 4px' }} aria-live="polite">
      <span
        style={{
          display: 'grid',
          placeItems: 'center',
          width: 74,
          height: 74,
          margin: '0 auto',
          borderRadius: '50%',
          background: 'var(--sage-d)',
          color: '#fff',
        }}
      >
        {confirmando ? <span className="pg-giro" style={{ borderColor: 'rgb(255 255 255 / 0.35)', borderTopColor: '#fff' }} /> : <Check size={40} color="#fff" />}
      </span>

      <h2 style={{ marginTop: 18, fontFamily: 'var(--disp)', fontSize: 27, fontWeight: 900, letterSpacing: '-.02em' }}>
        {confirmando ? 'Tu pago se está confirmando' : '¡Listo! Ya es tuyo.'}
      </h2>

      <p style={{ marginTop: 10, fontSize: 15, lineHeight: 1.6, color: 'var(--ink-2)' }}>
        {confirmando
          ? AVISO_DE_ESTADO.confirmando
          : `Pagaste ${money(precio)} MXN una sola vez. Tu acceso ya quedó abierto en este equipo y te mandamos el comprobante por correo.`}
      </p>

      <a href="/app?pago=1" className="pg-pay" style={{ marginTop: 20, textDecoration: 'none' }}>
        Entrar a la app
        <Arrow />
      </a>

      <p style={{ marginTop: 12, fontSize: 13, lineHeight: 1.55, color: 'var(--ink-3)' }}>
        Si algo no se abre, escríbenos a hola@mirestaurantelisto.mx y lo resolvemos.
      </p>
    </div>
  );
}
