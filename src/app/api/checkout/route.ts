import { getLicenseService } from '@/server/licensing';
import { currentUser } from '@/server/auth';
import { createCheckoutSession, stripeConfigured } from '@/server/payments/stripe';
import { badRequest, json, readJson, str } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * `POST /api/checkout` — abre el cobro de Stripe.
 *
 * El precio se lee de los ajustes del panel, nunca del cliente: mandar otro
 * monto desde el navegador no cambia lo que se cobra.
 */
export async function POST(request: Request) {
  const body = await readJson(request);
  const deviceId = str(body.deviceId);
  if (!deviceId) return badRequest('Falta el identificador del equipo.');

  if (!stripeConfigured()) {
    return json(
      { ok: false, error: 'cobro-no-configurado', message: 'Falta configurar STRIPE_SECRET_KEY en el servidor.' },
      503,
    );
  }

  const service = await getLicenseService();
  const settings = await service.settings();
  const user = await currentUser(request);

  try {
    const session = await createCheckoutSession({
      price: settings.price,
      email: user?.email ?? str(body.email),
      deviceId,
      userId: user?.id,
      appUrl: process.env.APP_URL || new URL(request.url).origin,
      returnPath: str(body.returnPath),
    });
    return json({ ok: true, url: session.url, id: session.id });
  } catch (error) {
    console.error('[checkout] no se pudo crear la sesión', error);
    return json({ ok: false, error: 'checkout-fallido', message: 'No pudimos abrir el pago. Intenta de nuevo.' }, 502);
  }
}
