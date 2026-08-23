import { describe, expect, it } from 'vitest';
import type Stripe from 'stripe';
import { interpretEvent, INSTALLMENT_PLANS, CURRENCY, productDescription, productName } from '../stripe';
import { TOTAL_ROUTE_TASKS } from '@/content/route';

const event = (type: string, object: unknown): Stripe.Event =>
  ({ type, data: { object } }) as unknown as Stripe.Event;

describe('el cobro que se confirma en nuestra pantalla', () => {
  it('traduce un PaymentIntent pagado', () => {
    const result = interpretEvent(
      event('payment_intent.succeeded', {
        id: 'pi_777',
        amount: 245000,
        amount_received: 245000,
        receipt_email: 'ana@correo.com',
        latest_charge: 'ch_1',
        metadata: { deviceId: 'eq-9', userId: 'u9' },
      }),
    );

    expect(result).toEqual({
      kind: 'pago',
      email: 'ana@correo.com',
      name: undefined,
      amount: 2450,
      // La referencia estable del cobro es el propio PaymentIntent.
      paymentRef: 'pi_777',
      deviceId: 'eq-9',
      userId: 'u9',
    });
  });

  it('toma el correo y el nombre del cargo cuando Stripe lo manda expandido', () => {
    const result = interpretEvent(
      event('payment_intent.succeeded', {
        id: 'pi_778',
        amount: 245000,
        amount_received: 245000,
        receipt_email: null,
        latest_charge: { billing_details: { email: 'luis@correo.com', name: 'Luis Pérez' } },
        metadata: { deviceId: 'eq-10' },
      }),
    );

    expect(result.email).toBe('luis@correo.com');
    expect(result.name).toBe('Luis Pérez');
    expect(result.userId).toBeUndefined();
  });

  it('traduce un reembolso con su referencia de cobro', () => {
    const result = interpretEvent(
      event('charge.refunded', { id: 'ch_1', amount_refunded: 245000, payment_intent: 'pi_123' }),
    );
    expect(result).toEqual({ kind: 'reembolso', amount: 2450, paymentRef: 'pi_123' });
  });

  it('ignora los eventos que no son pago ni reembolso', () => {
    expect(interpretEvent(event('customer.created', {})).kind).toBe('ignorar');
    expect(interpretEvent(event('payment_intent.created', {})).kind).toBe('ignorar');
  });

  it('ya no atiende el Checkout hospedado: ese camino se quitó', () => {
    const result = interpretEvent(
      event('checkout.session.completed', {
        id: 'cs_1',
        payment_status: 'paid',
        amount_total: 245000,
        customer_email: 'ana@correo.com',
      }),
    );
    expect(result.kind).toBe('ignorar');
  });

  it('cobra en pesos y ofrece 3 meses sin intereses', () => {
    expect(CURRENCY).toBe('mxn');
    expect(INSTALLMENT_PLANS).toEqual([3]);
  });
});

describe('el producto que ve el cliente al pagar', () => {
  it('lleva el nombre de la marca', () => {
    expect(productName()).toContain('MiRestauranteListo');
  });

  it('cuenta los pasos que trae la ruta de verdad, no un número escrito a mano', () => {
    expect(productDescription(3)).toContain(`${TOTAL_ROUTE_TASKS} pasos`);
    expect(productDescription(3)).toContain('hasta 3 equipos');
  });

  it('sigue el límite de equipos que tenga el panel', () => {
    expect(productDescription(5)).toContain('hasta 5 equipos');
  });
});
