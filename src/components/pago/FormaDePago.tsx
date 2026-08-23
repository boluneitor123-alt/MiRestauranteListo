'use client';

import { useState, type FormEvent } from 'react';
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { correoValido, errorDeCorreo, mensajeDeError } from '@/domain/pago';
import { money } from '@/domain/format';
import { getDeviceId } from '@/lib/device';
import { track } from '@/lib/track';
import { Arrow, Ico } from '@/components/landing/pieces';

/**
 * El formulario que cobra (`PagoMRL.dc.html`, bloque "Método de pago").
 *
 * Los campos de tarjeta son el Payment Element de Stripe: viven en un iframe
 * suyo y el número nunca pasa por nuestro servidor ni por este código. Lo único
 * nuestro es el correo, que es lo que necesitamos para emitir la licencia.
 */
export function FormaDePago({
  intentId,
  precio,
  correoInicial,
  onListo,
}: {
  intentId: string;
  precio: number;
  correoInicial: string;
  onListo: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();

  const [email, setEmail] = useState(correoInicial);
  const [tocado, setTocado] = useState(false);
  const [listoElemento, setListoElemento] = useState(false);
  const [cobrando, setCobrando] = useState(false);
  const [error, setError] = useState('');

  const errMail = errorDeCorreo(email, tocado);

  const pagar = async (evento: FormEvent) => {
    evento.preventDefault();
    if (cobrando || !stripe || !elements) return;

    setTocado(true);
    if (!correoValido(email)) return;

    setCobrando(true);
    setError('');
    track('InitiateCheckout', { value: precio, currency: 'MXN' });

    // El correo se guarda en el servidor antes de cobrar: la licencia se emite
    // al correo que trae el cobro, no al que diga el navegador después.
    try {
      await fetch('/api/pago/intent', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intentId, email, deviceId: getDeviceId() }),
      });
    } catch {
      setCobrando(false);
      setError('Necesitas conexión para pagar. Revisa tu internet e inténtalo otra vez.');
      return;
    }

    const { error: fallo, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/pago?volver=1` },
      // Sin redirección cuando el banco no la pide: la persona se queda en la
      // pantalla y ve el éxito aquí mismo.
      redirect: 'if_required',
    });

    if (fallo) {
      setCobrando(false);
      setError(mensajeDeError(fallo));
      return;
    }

    if (paymentIntent?.status === 'succeeded' || paymentIntent?.status === 'processing') {
      onListo();
      return;
    }

    setCobrando(false);
    setError(mensajeDeError(undefined));
  };

  const cargando = !stripe || !elements || !listoElemento;

  return (
    <form onSubmit={pagar}>
      <div style={{ marginTop: 22, fontFamily: 'var(--disp)', fontSize: 17, fontWeight: 800, letterSpacing: '-.01em' }}>
        Datos de contacto
      </div>
      <div
        style={{
          marginTop: 9,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          height: 58,
          padding: '0 16px',
          borderRadius: 13,
          background: '#fff',
          border: `1.5px solid ${errMail ? 'var(--danger)' : 'var(--line)'}`,
        }}
      >
        <span style={{ color: 'var(--ink-3)', display: 'grid', flex: 'none' }}>
          <Ico name="mail" size={20} width={2} />
        </span>
        <input
          type="email"
          autoComplete="email"
          aria-label="Correo electrónico"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTocado(true)}
          style={{
            flex: 1,
            width: 0,
            minWidth: 0,
            alignSelf: 'stretch',
            border: 'none',
            background: 'none',
            outline: 'none',
            fontSize: 16,
            fontWeight: 500,
            color: 'var(--ink)',
          }}
        />
      </div>
      {errMail ? (
        <div role="alert" style={{ marginTop: 7, fontSize: 13.5, fontWeight: 600, color: 'var(--danger)' }}>
          {errMail}
        </div>
      ) : null}
      <p style={{ marginTop: 7, fontSize: 12.5, lineHeight: 1.45, color: 'var(--ink-3)' }}>
        Ahí te llega tu acceso y tu comprobante.
      </p>

      <div style={{ marginTop: 20, fontFamily: 'var(--disp)', fontSize: 17, fontWeight: 800, letterSpacing: '-.01em' }}>
        Método de pago
      </div>

      <div style={{ marginTop: 9, minHeight: cargando ? 210 : 0 }}>
        {cargando ? <Esqueleto /> : null}
        <div style={{ display: cargando ? 'none' : 'block' }}>
          <PaymentElement
            options={{ layout: 'tabs', fields: { billingDetails: { email: 'never' } } }}
            onReady={() => setListoElemento(true)}
          />
        </div>
      </div>

      {error ? (
        <div
          role="alert"
          style={{
            marginTop: 14,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            padding: '13px 15px',
            borderRadius: 13,
            background: '#FBE9E6',
            color: '#8C2A1F',
            fontSize: 14,
            lineHeight: 1.45,
            fontWeight: 600,
          }}
        >
          <span style={{ flex: 'none', display: 'grid', marginTop: 1 }}>
            <Ico name="shield" size={18} width={2.5} />
          </span>
          {error}
        </div>
      ) : null}

      <button type="submit" className="pg-pay" style={{ marginTop: 18 }} disabled={cobrando || cargando}>
        {cobrando ? (
          <>
            <span className="pg-giro" aria-hidden />
            Procesando tu pago…
          </>
        ) : (
          <>
            <Ico name="lock" size={19} width={2.6} />
            {`Pagar ${money(precio)} MXN`}
            <Arrow />
          </>
        )}
      </button>

      <p style={{ marginTop: 14, textAlign: 'center', fontSize: 13, lineHeight: 1.6, color: 'var(--ink-3)' }}>
        {/* Enlaces dentro de una línea de texto: la excepción documentada al mínimo de 44px. */}
        Al completar tu compra aceptas nuestros{' '}
        <a className="mrl-inline" href="/#faq">
          Términos de uso
        </a>{' '}
        y la{' '}
        <a className="mrl-inline" href="/#faq">
          Política de privacidad
        </a>
        .
      </p>
    </form>
  );
}

/** El hueco de los campos mientras Stripe termina de montarlos. */
function Esqueleto() {
  return (
    <div aria-hidden style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {[52, 52, 52].map((alto, i) => (
        <span key={i} className="pg-hueco" style={{ height: alto }} />
      ))}
    </div>
  );
}
