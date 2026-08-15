import type Stripe from 'stripe';
import { getLicenseService } from '@/server/licensing';
import { getStripe, interpretEvent, stripeConfigured } from '@/server/payments/stripe';
import { json } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Webhook de Stripe.
 *
 * Es la puerta del producto: sin firma válida no se emite nada. Al confirmarse
 * el pago se emite la licencia y, si el cobro trae el equipo que pagó, se activa
 * ahí mismo — el usuario no teclea ningún código.
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

  return json({ ok: true, code, alreadyIssued, activated });
}
