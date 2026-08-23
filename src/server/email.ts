/**
 * Correo transaccional (README § 13 · "Correos transaccionales a crear").
 *
 * Sin `RESEND_API_KEY` no truena: registra el envío y sigue. Un fallo de correo
 * nunca puede bloquear una activación.
 */

import type { Mailer, MailTemplate } from './licensing/service';

interface Template {
  subject: string;
  body: (data: Record<string, unknown>) => string;
}

const FROM = 'MiRestauranteListo <hola@mirestaurantelisto.com>';

export const TEMPLATES: Record<MailTemplate, Template> = {
  'compra-confirmada': {
    subject: 'Tu compra de MiRestauranteListo está confirmada',
    body: (d) =>
      `Gracias por tu compra. Tu acceso ya está desbloqueado en el equipo donde pagaste.\n\n` +
      `Guarda este código como comprobante: ${d.code}\n\n` +
      `Sólo lo vas a necesitar si cambias de teléfono o computadora: en la app, ` +
      `entra a Más › Recuperar acceso.`,
  },
  'acceso-activado': {
    subject: 'Tu acceso quedó activado',
    body: (d) =>
      `Listo: tu acceso a MiRestauranteListo quedó activado en este equipo con el código ${d.code}.\n\n` +
      `Si no fuiste tú, escríbenos y lo revisamos.`,
  },
  'recuperar-acceso': {
    subject: 'Tu código de MiRestauranteListo',
    body: (d) =>
      `Aquí está tu código: ${d.code}\n\n` +
      `Entra a la app, ve a Más › Recuperar acceso y escríbelo para desbloquear este equipo.`,
  },
  'recordatorio-dia-6': {
    subject: 'Mañana termina tu prueba',
    body: () =>
      `Mañana se cierra tu prueba de MiRestauranteListo. Tu ruta, tus platillos costeados y tus ` +
      `números quedan guardados tal como los dejaste: con el pago único los recuperas completos, ` +
      `sin mensualidades.`,
  },
  'prueba-terminada': {
    subject: 'Tu prueba terminó (tus datos siguen ahí)',
    body: () =>
      `Tu prueba de MiRestauranteListo terminó. Nada se borró: al hacer el pago único recuperas ` +
      `Inicio, Mi Ruta, el Costeador de Platillos y Números tal como los dejaste.`,
  },
};

export class ResendMailer implements Mailer {
  constructor(private apiKey = process.env.RESEND_API_KEY) {}

  async send({ to, template, data }: { to: string; template: MailTemplate; data: Record<string, unknown> }) {
    const { subject, body } = TEMPLATES[template];

    if (!this.apiKey) {
      console.info(`[correo omitido: falta RESEND_API_KEY] ${template} → ${to}: ${subject}`);
      return;
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: FROM, to, subject, text: body(data) }),
    });

    if (!response.ok) {
      throw new Error(`Resend respondió ${response.status}`);
    }
  }
}
