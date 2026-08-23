/**
 * Cobro con Stripe (paso 3 de la continuación del plan).
 *
 * Pago único de $2,450 MXN con 3 meses sin intereses. Nada de esto se decide en
 * el cliente: el precio se lee de los ajustes del panel y la licencia se emite
 * cuando Stripe confirma el pago, no cuando el navegador regresa.
 */

import Stripe from 'stripe';
import { LICENSE_DEFAULTS } from '@/domain/license';
import { TOTAL_ROUTE_TASKS } from '@/content/route';

export const CURRENCY = 'mxn';

/** Meses sin intereses ofrecidos en el checkout (México). */
export const INSTALLMENT_PLANS = [3] as const;

let client: Stripe | undefined;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('Falta STRIPE_SECRET_KEY');
  client ??= new Stripe(key, { apiVersion: '2025-10-29.clover' as Stripe.LatestApiVersion });
  return client;
}

export function stripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}

export interface CheckoutInput {
  /** Precio en pesos (no en centavos). */
  price: number;
  email?: string;
  /** Equipo que paga: permite activar solo al volver. */
  deviceId: string;
  userId?: string;
  appUrl: string;
  /** A dónde volver al terminar. */
  returnPath?: string;
  /** Equipos que cubre la licencia; sale de los ajustes del panel. */
  maxDevices?: number;
}

/**
 * El producto no vive en el catálogo de Stripe: se arma aquí con `price_data`
 * para que el precio salga de los ajustes del panel y el número de pasos del
 * contenido real de la ruta. Así nunca se desfasa una copia escrita a mano.
 */
export function productName(): string {
  return 'MiRestauranteListo · acceso de por vida';
}

export function productDescription(maxDevices = LICENSE_DEFAULTS.maxDevices): string {
  return `Pago único. Tu ruta de ${TOTAL_ROUTE_TASKS} pasos, el costeador de platillos y tus números, en hasta ${maxDevices} equipos.`;
}

/**
 * Crea la sesión de checkout. `metadata` lleva el equipo y el usuario para que
 * el webhook pueda emitir y activar la licencia sin preguntarle nada a nadie.
 */
export async function createCheckoutSession(input: CheckoutInput): Promise<{ id: string; url: string | null }> {
  const stripe = getStripe();
  const success = new URL(input.returnPath ?? '/app?pago=1', input.appUrl);
  const cancel = new URL('/app?pago=cancelado', input.appUrl);

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    // Meses sin intereses: Stripe los ofrece cuando la tarjeta es mexicana y el
    // monto alcanza el mínimo del plan.
    payment_method_types: ['card'],
    payment_method_options: {
      card: { installments: { enabled: true } },
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: CURRENCY,
          unit_amount: Math.round(input.price * 100),
          product_data: {
            name: productName(),
            description: productDescription(input.maxDevices),
          },
        },
      },
    ],
    customer_email: input.email,
    client_reference_id: input.userId ?? input.deviceId,
    metadata: {
      deviceId: input.deviceId,
      ...(input.userId ? { userId: input.userId } : {}),
    },
    payment_intent_data: {
      metadata: {
        deviceId: input.deviceId,
        ...(input.userId ? { userId: input.userId } : {}),
      },
    },
    success_url: success.toString(),
    cancel_url: cancel.toString(),
    locale: 'es',
  });

  return { id: session.id, url: session.url };
}

export interface PaymentEvent {
  kind: 'pago' | 'reembolso' | 'ignorar';
  email?: string;
  name?: string;
  /** Monto en pesos. */
  amount?: number;
  paymentRef?: string;
  deviceId?: string;
  userId?: string;
}

/**
 * Traduce un evento de Stripe a lo que necesita el servicio de licencias.
 * Se ignora todo lo que no sea un pago completado o un reembolso.
 */
export function interpretEvent(event: Stripe.Event): PaymentEvent {
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    // `payment_status` distingue un checkout terminado de uno que quedó pendiente.
    if (session.payment_status !== 'paid') return { kind: 'ignorar' };
    return {
      kind: 'pago',
      email: session.customer_details?.email ?? session.customer_email ?? undefined,
      name: session.customer_details?.name ?? undefined,
      amount: (session.amount_total ?? 0) / 100,
      // El PaymentIntent es la referencia estable del cobro.
      paymentRef:
        (typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id) ??
        session.id,
      deviceId: session.metadata?.deviceId ?? undefined,
      userId: session.metadata?.userId ?? undefined,
    };
  }

  if (event.type === 'charge.refunded' || event.type === 'refund.created') {
    const charge = event.data.object as Stripe.Charge & { payment_intent?: string | Stripe.PaymentIntent };
    return {
      kind: 'reembolso',
      amount: (charge.amount_refunded ?? 0) / 100,
      paymentRef:
        typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id,
    };
  }

  return { kind: 'ignorar' };
}

/** Precio por defecto si el panel todavía no tiene uno guardado. */
export const DEFAULT_PRICE = LICENSE_DEFAULTS.price;
