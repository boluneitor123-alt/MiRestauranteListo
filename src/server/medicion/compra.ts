/**
 * `Purchase` a Meta desde el webhook de Stripe. Ver `MEDICION.md` § 5 y § 6.
 *
 * Sólo desde el servidor: en el navegador la pantalla de gracias es recargable
 * y cada recarga sería otra compra.
 */

import type Stripe from 'stripe';
import { getPrisma } from '../licensing/prismaStore';
import { capiConfigurada, enviarACapi } from './capi';

/**
 * ¿Es el choque de llave primaria, o algo más?
 *
 * Prisma marca el duplicado con `P2002`. Todo lo demás —`P2021` tabla
 * inexistente, la base sin responder— no es un duplicado y no debe leerse
 * como uno.
 */
export function esLlaveRepetida(error: unknown): boolean {
  return typeof error === 'object' && error !== null && (error as { code?: string }).code === 'P2002';
}

/** Lo que Meta necesita y sólo el navegador sabía, guardado en el cobro. */
function atribucion(intent: Stripe.PaymentIntent) {
  const m = intent.metadata ?? {};
  return {
    fbp: m.fbp || undefined,
    fbc: m.fbc || undefined,
    ip: m.client_ip || undefined,
    userAgent: m.client_ua || undefined,
    urlDeOrigen: m.event_source_url || undefined,
    userId: m.userId || undefined,
  };
}

export interface ResumenDeCompra {
  enviado: boolean;
  motivo?: string;
}

/**
 * Manda la compra, una sola vez por evento de Stripe.
 *
 * `event.id` va a una tabla propia antes de llamar a Meta: si el mismo webhook
 * llega otra vez, se sale sin mandar nada. La ventana de 48 horas de Meta no
 * basta, porque un reintento puede caer después.
 *
 * Nunca lanza. El cobro ya ocurrió y la licencia ya se emitió: un fallo de
 * medición no puede impedir que el webhook conteste 200, o Stripe reintentaría
 * y se emitiría la licencia dos veces.
 */
export async function mandarCompraAMeta(input: {
  eventId: string;
  intent: Stripe.PaymentIntent;
  /** Del cliente, buscado en nuestra base: nunca viaja por el `metadata`. */
  email?: string;
  nombre?: string;
}): Promise<ResumenDeCompra> {
  if (!capiConfigurada()) return { enviado: false, motivo: 'sin-token' };

  try {
    const db = getPrisma();

    /*
      Reservar el evento antes de mandarlo. Si otra entrega del mismo webhook ya
      pasó por aquí, la llave primaria lo impide y no se manda dos veces.

      Sólo el choque de llave significa "ya se mandó". Cualquier otro fallo
      —la tabla sin crear porque falta la migración, la base caída— es un
      problema distinto, y llamarlo "ya enviado" mandaría a buscar del lado
      equivocado mientras Meta no recibe una sola compra.
    */
    const reserva = await db.metaEvent
      .create({ data: { id: input.eventId, eventName: 'Purchase' } })
      .then(() => 'reservado' as const)
      .catch((error: unknown) => (esLlaveRepetida(error) ? ('repetido' as const) : ('sin-registro' as const)));

    if (reserva === 'repetido') return { enviado: false, motivo: 'ya-enviado' };
    if (reserva === 'sin-registro') {
      /*
        Sin la tabla no hay cómo deduplicar del lado nuestro. Se manda de todas
        formas: Meta descarta repetidos por `event_name` + `event_id` dentro de
        48 horas, y el nuestro es el id del cobro, estable entre reintentos. Un
        doble contado en un reintento tardío es menos malo que no medir nada, y
        el aviso de abajo dice qué revisar.
      */
      console.error(
        '[medicion] no se pudo registrar el evento en meta_events: ¿falta correr la migración? Se manda sin deduplicar.',
      );
    }

    const a = atribucion(input.intent);
    const monto = (input.intent.amount_received || input.intent.amount) / 100;

    const resultado = await enviarACapi({
      nombre: 'Purchase',
      // El id del cobro es único y estable entre reintentos. Un UUID nuevo en
      // cada llamada es justo lo que rompe la deduplicación de Meta.
      eventId: input.intent.id,
      cuando: (input.intent.created ?? Math.floor(Date.now() / 1000)) * 1000,
      urlDeOrigen: a.urlDeOrigen,
      persona: {
        email: input.email,
        nombre: input.nombre,
        userId: a.userId,
        fbp: a.fbp,
        fbc: a.fbc,
        ip: a.ip,
        userAgent: a.userAgent,
      },
      datos: {
        value: monto,
        // Stripe devuelve "mxn"; Meta espera "MXN".
        currency: input.intent.currency.toUpperCase(),
        order_id: input.intent.id,
        content_name: 'MiRestauranteListo · Acceso de por vida',
        content_type: 'product',
        content_ids: ['mrl-lifetime'],
      },
    });

    if (!resultado.ok) {
      // Queda el rastro para poder reintentar a mano desde el panel de Meta.
      if (reserva === 'reservado') {
        await db.metaEvent
          .update({ where: { id: input.eventId }, data: { ok: false, detail: resultado.detalle ?? resultado.motivo } })
          .catch(() => undefined);
      }
      console.warn('[medicion] Purchase no llegó a Meta:', resultado.motivo, resultado.detalle);
      return { enviado: false, motivo: resultado.motivo };
    }

    return { enviado: true };
  } catch (error) {
    console.warn('[medicion] Purchase falló y se ignora:', error);
    return { enviado: false, motivo: 'error' };
  }
}
