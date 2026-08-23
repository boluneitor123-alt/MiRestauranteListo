'use client';

import { Pago } from '@/components/pago/Pago';
import '../landing.css';
import './pago.css';

/**
 * Pantalla de pago (entrega-v2 § 4).
 *
 * Resume el pedido, cobra con el Payment Element de Stripe y da la garantía.
 * Comparte la hoja de la landing porque es la misma página de venta, un paso
 * más adelante; `pago.css` sólo trae lo suyo.
 */
export default function PagoPage() {
  return <Pago />;
}
