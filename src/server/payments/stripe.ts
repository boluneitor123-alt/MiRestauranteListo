/**
 * Cobro con Stripe.
 *
 * Pago único de $2,450 MXN con 3 meses sin intereses, confirmado en nuestra
 * propia pantalla con el Payment Element. Nada de esto se decide en el cliente:
 * el precio se lee de los ajustes del panel y la licencia se emite cuando
 * Stripe confirma el pago, no cuando el navegador regresa.
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

/**
 * El producto no vive en el catálogo de Stripe: se arma en cada cobro para que
 * el precio salga de los ajustes del panel y el número de pasos del contenido
 * real de la ruta. Así nunca se desfasa una copia escrita a mano.
 */
export function productName(): string {
  return 'MiRestauranteListo · acceso de por vida';
}

export function productDescription(maxDevices = LICENSE_DEFAULTS.maxDevices): string {
  return `Pago único. Tu ruta de ${TOTAL_ROUTE_TASKS} pasos, el costeador de platillos y tus números, en hasta ${maxDevices} equipos.`;
}

/* ─────────────────────────  Cobro en nuestra pantalla  ───────────────────── */

export interface IntentInput {
  /** Precio en pesos. Sale de los ajustes del panel, nunca del navegador. */
  price: number;
  /** Equipo que paga: permite activar la licencia sola al confirmar. */
  deviceId: string;
  email?: string;
  userId?: string;
  maxDevices?: number;
  /**
   * Atribución de Meta. Viaja en el `metadata` porque al webhook lo llaman los
   * servidores de Stripe: ahí no hay cookies, ni IP del cliente, ni URL. Sin
   * esto la compra llega a Meta pero no se atribuye a ninguna campaña.
   */
  fbp?: string;
  fbc?: string;
  clientIp?: string;
  clientUa?: string;
  eventSourceUrl?: string;
}

export interface IntentResult {
  id: string;
  clientSecret: string;
  /** Monto en centavos, tal como quedó en Stripe. */
  amount: number;
}

/**
 * Crea el PaymentIntent que alimenta al Payment Element.
 *
 * El monto se fija aquí, en el servidor: el navegador recibe un `client_secret`
 * que sirve para confirmar ese cobro y nada más. Mandar otro precio desde la
 * pantalla no cambia lo que se cobra.
 *
 * `automatic_payment_methods` deja que Stripe decida qué métodos ofrecer según
 * lo que esté prendido en el panel. Sin él el intent quedaba con
 * `automatic_payment_methods: null` y el Payment Element podía montarse sin un
 * método válido detrás.
 *
 * Los meses sin intereses siguen: viven en `payment_method_options.card`, que
 * se aplica a la tarjeta venga de donde venga la lista de métodos.
 */
/** Fuera las llaves vacías: Stripe topa en 50 y no vale gastarlas en nada. */
function limpiarMetadata(campos: Record<string, string | undefined>): Record<string, string> {
  return Object.fromEntries(Object.entries(campos).filter(([, v]) => !!v)) as Record<string, string>;
}

export async function createPaymentIntent(input: IntentInput): Promise<IntentResult> {
  const stripe = getStripe();
  const intent = await stripe.paymentIntents.create({
    amount: Math.round(input.price * 100),
    currency: CURRENCY,
    automatic_payment_methods: { enabled: true },
    payment_method_options: {
      card: { installments: { enabled: true } },
    },
    description: productDescription(input.maxDevices),
    statement_descriptor_suffix: 'MRL',
    receipt_email: input.email,
    metadata: {
      deviceId: input.deviceId,
      producto: productName(),
      ...(input.userId ? { userId: input.userId } : {}),
      // Sólo lo que Meta necesita. Ni correo ni nombre: esos se buscan en
      // nuestra base dentro del webhook, para no replicarlos en Stripe.
      // Stripe corta a 500 caracteres por valor y el user agent se acerca.
      ...limpiarMetadata({
        fbp: input.fbp,
        fbc: input.fbc,
        client_ip: input.clientIp,
        client_ua: input.clientUa?.slice(0, 500),
        event_source_url: input.eventSourceUrl?.slice(0, 500),
      }),
    },
  });

  if (!intent.client_secret) throw new Error('Stripe no devolvió client_secret');
  return { id: intent.id, clientSecret: intent.client_secret, amount: intent.amount };
}

/**
 * Guarda el correo del comprador en un cobro ya abierto.
 *
 * Se hace en el servidor y no en `confirmParams` para que el correo con el que
 * se emite la licencia sea uno que nosotros validamos, y para poder comprobar
 * que quien lo cambia es el mismo equipo que abrió el cobro.
 */
export async function setIntentEmail(intentId: string, email: string, deviceId: string): Promise<boolean> {
  const stripe = getStripe();
  const intent = await stripe.paymentIntents.retrieve(intentId);
  if (intent.metadata?.deviceId !== deviceId) return false;
  if (intent.status !== 'requires_payment_method' && intent.status !== 'requires_confirmation') return false;
  await stripe.paymentIntents.update(intentId, { receipt_email: email });
  return true;
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
  // El cobro llega como el PaymentIntent que confirmó el Payment Element.
  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object as Stripe.PaymentIntent;
    const charge = typeof intent.latest_charge === 'object' ? intent.latest_charge : undefined;
    return {
      kind: 'pago',
      email: intent.receipt_email ?? charge?.billing_details?.email ?? undefined,
      name: charge?.billing_details?.name ?? undefined,
      amount: (intent.amount_received || intent.amount) / 100,
      paymentRef: intent.id,
      deviceId: intent.metadata?.deviceId ?? undefined,
      userId: intent.metadata?.userId ?? undefined,
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
