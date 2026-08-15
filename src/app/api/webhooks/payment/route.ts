import { getLicenseService } from '@/server/licensing';
import { json, verifySignature } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Webhook del proveedor de cobro (Stripe o Mercado Pago).
 *
 * Emite la licencia y manda el correo con el código como comprobante. La app
 * del cliente ya está preguntando por `/licenses/claim`, así que el acceso se
 * desbloquea solo, en la misma sesión y sin que el usuario escriba nada.
 *
 * El cuerpo se lee crudo para poder verificar la firma. Sin firma válida no se
 * emite nada: este endpoint es la puerta del producto.
 */
export async function POST(request: Request) {
  const raw = await request.text();
  const signature =
    request.headers.get('x-mrl-signature') ??
    request.headers.get('stripe-signature') ??
    request.headers.get('x-signature');

  if (!verifySignature(raw, signature, process.env.STRIPE_WEBHOOK_SECRET)) {
    return json({ ok: false, error: 'firma-invalida' }, 401);
  }

  let event: PaymentEvent;
  try {
    event = normalize(JSON.parse(raw));
  } catch {
    return json({ ok: false, error: 'cuerpo-invalido' }, 400);
  }

  const service = await getLicenseService();

  if (event.type === 'refund') {
    if (!event.code) return json({ ok: false, error: 'falta-codigo' }, 400);
    await service.refund(event.code, event.amount);
    return json({ ok: true, refunded: event.code });
  }

  if (!event.email) return json({ ok: false, error: 'falta-correo' }, 400);

  const { code, alreadyIssued } = await service.issue({
    email: event.email,
    name: event.name,
    source: event.source,
    amount: event.amount,
    paymentRef: event.paymentRef,
  });

  return json({ ok: true, code, alreadyIssued });
}

interface PaymentEvent {
  type: 'payment' | 'refund';
  email?: string;
  name?: string;
  amount?: number;
  source: string;
  paymentRef?: string;
  code?: string;
}

/**
 * Normaliza lo que manda el proveedor. Stripe anida los datos en
 * `data.object`; Mercado Pago manda `payer` y `transaction_amount`.
 */
function normalize(payload: unknown): PaymentEvent {
  const body = (payload ?? {}) as Record<string, never>;
  const stripeObject = ((body.data as Record<string, never> | undefined)?.object ?? {}) as Record<string, never>;
  const type = String(body.type ?? '');

  const isRefund = type.includes('refund') || type.includes('charge.refunded');
  const email =
    (stripeObject.customer_email as string | undefined) ??
    ((stripeObject.customer_details as Record<string, never> | undefined)?.email as string | undefined) ??
    ((body.payer as Record<string, never> | undefined)?.email as string | undefined) ??
    (body.email as string | undefined);

  const amountCents = stripeObject.amount_total ?? stripeObject.amount;
  const amount =
    typeof amountCents === 'number'
      ? amountCents / 100
      : ((body.transaction_amount as number | undefined) ?? (body.amount as number | undefined));

  return {
    type: isRefund ? 'refund' : 'payment',
    email: email?.trim().toLowerCase(),
    name:
      ((stripeObject.customer_details as Record<string, never> | undefined)?.name as string | undefined) ??
      (body.name as string | undefined),
    amount,
    source: (body.source as string | undefined) ?? 'checkout',
    paymentRef: (stripeObject.id as string | undefined) ?? (body.id as string | undefined),
    code: (body.code as string | undefined) ?? ((stripeObject.metadata as Record<string, never> | undefined)?.code as string | undefined),
  };
}
