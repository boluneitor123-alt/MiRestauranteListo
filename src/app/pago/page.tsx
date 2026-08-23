'use client';

import { Pago } from '@/components/pago/Pago';
import '../landing.css';

/**
 * Pantalla previa al pago (entrega-v2 § 4).
 *
 * Resume el pedido y la garantía; el cobro se hace en el Checkout hospedado de
 * Stripe. Comparte la hoja de la landing porque es la misma página de venta,
 * un paso más adelante.
 */
export default function PagoPage() {
  return <Pago />;
}
