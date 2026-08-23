'use client';

import { useState } from 'react';
import { GUARANTEE_LINE, GUARANTEE_SHORT, LAUNCH } from '@/content/landing';
import { money } from '@/domain/format';
import { getDeviceId } from '@/lib/device';
import { track } from '@/lib/track';
import { Arrow, Ico } from '@/components/landing/pieces';

/**
 * Pantalla previa al pago (`PagoMRL.dc.html` de la entrega v2).
 *
 * Resume el pedido, la garantía y qué se lleva; el cobro lo hace Stripe en su
 * propia página. Los campos de tarjeta del prototipo **no** se portaron a
 * propósito: quedarnos en Checkout hospedado mantiene el cumplimiento en SAQ A,
 * y un formulario de tarjeta que no cobra haría creer que aquí se paga.
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

export function Pago() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const precio = money(LAUNCH.price);

  const pagar = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    track('InitiateCheckout', { value: LAUNCH.price, currency: 'MXN' });
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId: getDeviceId(), returnPath: '/app?pago=1' }),
      });
      const data = (await response.json()) as { ok: boolean; url?: string; message?: string };
      if (data.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      setBusy(false);
      setError(data.message ?? 'No pudimos abrir el pago. Inténtalo otra vez en un momento.');
    } catch {
      setBusy(false);
      setError('Necesitas conexión para pagar. Revisa tu internet e inténtalo otra vez.');
    }
  };

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
        <div className="lp-split" style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(0,480px)', alignItems: 'start' }}>
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

          {/* ── El pedido ── */}
          <div
            style={{
              position: 'sticky',
              top: 18,
              padding: 26,
              borderRadius: 22,
              background: '#fff',
              boxShadow: '0 10px 40px rgb(28 26 23 / 0.07)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 11, flexWrap: 'wrap' }}>
              <span style={{ color: 'var(--ink-2)', display: 'grid' }}>
                <Ico name="lock" size={17} width={2.4} />
              </span>
              <span style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--ink-2)' }}>Pago 100% seguro con</span>
              <span style={{ fontFamily: 'var(--disp)', fontWeight: 900, fontSize: 19, letterSpacing: '-.03em', color: '#635BFF' }}>
                stripe
              </span>
            </div>

            <div style={{ marginTop: 20, padding: 22, borderRadius: 17, background: 'var(--amber-xl)' }}>
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
                <span style={{ fontFamily: 'var(--disp)', fontSize: 17, fontWeight: 800, letterSpacing: '-.01em' }}>
                  Total a pagar
                </span>
                <span style={{ textAlign: 'right' }}>
                  <span style={{ display: 'flex', alignItems: 'baseline', gap: 7, justifyContent: 'flex-end' }}>
                    <span style={{ fontFamily: 'var(--disp)', fontSize: 31, fontWeight: 900, letterSpacing: '-.03em' }}>
                      {precio}
                    </span>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 700, color: 'var(--ink-2)' }}>MXN</span>
                  </span>
                  <span style={{ display: 'block', fontSize: 13, color: 'var(--ink-2)', marginTop: 2 }}>
                    Sin impuestos adicionales
                  </span>
                </span>
              </div>
            </div>

            <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
              {SELLOS.map(([t, icono]) => (
                <div
                  key={t}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '13px 12px',
                    border: '1.5px solid var(--line)',
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

            <p style={{ marginTop: 20, fontSize: 14, lineHeight: 1.55, color: 'var(--ink-2)' }}>
              Al continuar te llevamos a la página de pago de Stripe. Tus datos de tarjeta se capturan ahí y nunca pasan
              por nuestro servidor.
            </p>

            {error ? (
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
                }}
              >
                {error}
              </div>
            ) : null}

            <button type="button" className="lp-cta" style={{ marginTop: 18, height: 64 }} onClick={pagar} disabled={busy}>
              {busy ? 'Abriendo el pago…' : `Pagar ${precio} MXN`}
              {busy ? null : <Arrow />}
            </button>

            <p style={{ marginTop: 13, textAlign: 'center', fontSize: 13, lineHeight: 1.55, color: 'var(--ink-3)' }}>
              Al completar tu compra aceptas nuestros <a href="/#faq">Términos de uso</a> y la{' '}
              <a href="/#faq">Política de privacidad</a>.
            </p>

            <div style={{ marginTop: 18, padding: '16px 18px', borderRadius: 16, background: 'var(--sage)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: 'var(--sage-d)', display: 'grid' }}>
                  <Ico name="shield" size={20} width={2.2} />
                </span>
                <span style={{ fontFamily: 'var(--disp)', fontSize: 16, fontWeight: 800, letterSpacing: '-.01em' }}>
                  Garantía de {LAUNCH.warrantyDays} días
                </span>
              </div>
              <p style={{ marginTop: 8, fontSize: 13.5, lineHeight: 1.5, color: 'var(--ink-2)' }}>{GUARANTEE_LINE}</p>
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
          style={{
            maxWidth: 1120,
            margin: '0 auto',
            padding: '22px 22px calc(22px + env(safe-area-inset-bottom, 0px))',
            display: 'flex',
            alignItems: 'center',
            gap: 28,
            flexWrap: 'wrap',
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
              hola@mirestaurantelisto.mx
            </a>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 14.5, lineHeight: 1.45, color: 'rgb(255 255 255 / 0.82)' }}>
              Pago procesado de forma segura por
            </span>
            <span style={{ fontFamily: 'var(--disp)', fontWeight: 900, fontSize: 21, letterSpacing: '-.03em', color: '#A9A2FF' }}>
              stripe
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
