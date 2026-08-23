import { getLicenseService } from '@/server/licensing';
import { currentUser } from '@/server/auth';
import { createPaymentIntent, setIntentEmail, stripeConfigured } from '@/server/payments/stripe';
import { badRequest, json, readJson, str } from '@/server/http';
import { correoValido } from '@/domain/pago';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * `GET /api/pago/intent` — la llave pública y el precio, sin abrir ningún cobro.
 *
 * Lo usa la pantalla cuando vuelve del banco: ahí el cobro ya existe y lo único
 * que falta es poder preguntarle a Stripe cómo terminó.
 */
export async function GET() {
  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
  if (!stripeConfigured() || !publishableKey) {
    return json({ ok: false, error: 'cobro-no-configurado' }, 503);
  }
  const settings = await (await getLicenseService()).settings();
  return json({ ok: true, publishableKey, price: settings.price, warrantyDays: settings.warrantyDays });
}

/**
 * `POST /api/pago/intent` — abre el cobro que se confirma en nuestra pantalla.
 *
 * Devuelve el `client_secret` del PaymentIntent y la llave pública de Stripe.
 * El precio se lee de los ajustes del panel: el navegador no manda montos, sólo
 * confirma el cobro que ya quedó fijado aquí.
 */
export async function POST(request: Request) {
  const body = await readJson(request);
  const deviceId = str(body.deviceId);
  if (!deviceId) return badRequest('Falta el identificador del equipo.');

  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
  if (!stripeConfigured() || !publishableKey) {
    return json(
      {
        ok: false,
        error: 'cobro-no-configurado',
        message: 'El cobro todavía no está disponible. Escríbenos y lo resolvemos.',
      },
      503,
    );
  }

  const service = await getLicenseService();
  const settings = await service.settings();
  const user = await currentUser(request);
  const email = user?.email ?? str(body.email);

  try {
    const intent = await createPaymentIntent({
      price: settings.price,
      deviceId,
      userId: user?.id,
      email: email && correoValido(email) ? email : undefined,
      maxDevices: settings.maxDevices,
    });

    return json({
      ok: true,
      clientSecret: intent.clientSecret,
      intentId: intent.id,
      publishableKey,
      price: settings.price,
      warrantyDays: settings.warrantyDays,
      // El correo de la sesión llena el campo sin que lo teclee otra vez.
      email: user?.email ?? null,
    });
  } catch (error) {
    console.error('[pago] no se pudo abrir el cobro', error);
    return json(
      { ok: false, error: 'cobro-fallido', message: 'No pudimos abrir el pago. Inténtalo otra vez en un momento.' },
      502,
    );
  }
}

/**
 * `PATCH /api/pago/intent` — guarda el correo del comprador en el cobro.
 *
 * La licencia se emite al correo que trae el cobro, así que ese dato se fija en
 * el servidor y sólo lo puede cambiar el mismo equipo que abrió el PaymentIntent.
 */
export async function PATCH(request: Request) {
  const body = await readJson(request);
  const deviceId = str(body.deviceId);
  const intentId = str(body.intentId);
  const email = str(body.email);

  if (!deviceId || !intentId) return badRequest('Falta el identificador del cobro.');
  if (!email || !correoValido(email)) return badRequest('Ese correo no se ve bien. Revísalo.');
  if (!stripeConfigured()) return json({ ok: false, error: 'cobro-no-configurado' }, 503);

  try {
    const ok = await setIntentEmail(intentId, email, deviceId);
    return json({ ok });
  } catch (error) {
    console.error('[pago] no se pudo guardar el correo del cobro', error);
    return json({ ok: false, error: 'correo-no-guardado' }, 502);
  }
}
