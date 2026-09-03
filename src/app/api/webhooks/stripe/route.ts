import type Stripe from 'stripe';
import { getLicenseService } from '@/server/licensing';
import { getStripe, interpretEvent, stripeConfigured } from '@/server/payments/stripe';
import { json } from '@/server/http';
import { mandarCompraAMeta } from '@/server/medicion/compra';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Webhook de Stripe.
 *
 * Es la puerta del producto: sin firma válida no se emite nada. Al confirmarse
 * el pago se emite la licencia y, si el cobro trae el equipo que pagó, se activa
 * ahí mismo — el usuario no teclea ningún código.
 *
 * **La URL que se registre en Stripe tiene que ser la canónica.** Stripe no
 * sigue redirecciones: si el dominio manda de `mirestaurantelisto.com` a
 * `www.mirestaurantelisto.com`, la entrega muere en un 308 y nunca se emite la
 * licencia, aunque el cobro haya entrado. Eso pasó una vez y no se ve por
 * ningún lado desde la aplicación: el redirect ocurre en el borde, antes de
 * que esta función exista. El `GET` de abajo sirve para comprobarlo de un
 * vistazo.
 */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripeConfigured() || !secret) {
    return json({ ok: false, error: 'webhook-no-configurado' }, 503);
  }

  const raw = await request.text();
  const signature = request.headers.get('stripe-signature');
  if (!signature) return json({ ok: false, error: 'firma-faltante' }, 401);

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(raw, signature, secret);
  } catch (error) {
    console.warn('[webhook] firma inválida', error);
    return json({ ok: false, error: 'firma-invalida' }, 401);
  }

  const payment = interpretEvent(event);
  if (payment.kind === 'ignorar') return json({ ok: true, ignorado: event.type });

  const service = await getLicenseService();

  if (payment.kind === 'reembolso') {
    if (!payment.paymentRef) return json({ ok: true, ignorado: 'reembolso-sin-referencia' });
    const store = (await import('@/server/licensing')).getLicenseStore;
    const license = await (await store()).findLicenseByPaymentRef(payment.paymentRef);
    if (license) await service.refund(license.code, payment.amount);
    return json({ ok: true, reembolsado: license?.code ?? null });
  }

  if (!payment.email) return json({ ok: false, error: 'pago-sin-correo' }, 400);

  const { code, alreadyIssued } = await service.issue({
    email: payment.email,
    name: payment.name,
    // De quién es la compra y desde dónde se pagó. Los dos venían en el
    // `metadata` del intent y se estaban tirando: la licencia quedaba atada
    // sólo al aparato, así que pagar en el celular dejaba la laptop afuera.
    userId: payment.userId,
    originDeviceId: payment.deviceId,
    source: 'stripe',
    amount: payment.amount,
    paymentRef: payment.paymentRef,
  });

  // Activación automática en el equipo que pagó: cuando la app pregunte por su
  // acceso, ya estará desbloqueada.
  let activated = false;
  if (payment.deviceId && !alreadyIssued) {
    const result = await service.activate({ code, deviceId: payment.deviceId });
    activated = result.ok;
  }

  /*
    La compra a Meta va al final y aparte, después de que la licencia ya quedó
    emitida. Si Meta falla o se tarda, `mandarCompraAMeta` lo dice y sigue: sin
    el 200 de abajo, Stripe reintentaría y se emitiría la licencia otra vez.
    Una sola vez por evento, garantizado por su propia tabla.
  */
  const medicion = await mandarCompraAMeta({
    eventId: event.id,
    intent: event.data.object as Stripe.PaymentIntent,
    email: payment.email,
    nombre: payment.name,
  });

  return json({ ok: true, code, alreadyIssued, activated, medicion });
}


/**
 * `GET /api/webhooks/stripe` — comprobación de que la URL es la buena.
 *
 * Abrirla en el navegador responde 200 con este JSON si es la canónica, o
 * enseña el 308 si el dominio redirige. Es la forma más barata de no repetir
 * la entrega fallida: pega en Stripe la URL que devuelva 200 aquí.
 */
export async function GET() {
  return json({
    ok: true,
    destino: 'webhook de Stripe',
    escucha: ['payment_intent.succeeded', 'charge.refunded'],
    configurado: stripeConfigured() && !!process.env.STRIPE_WEBHOOK_SECRET,
    nota: 'Registra en Stripe exactamente esta URL. Stripe no sigue redirecciones.',
  });
}
