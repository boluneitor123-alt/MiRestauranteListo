import { describe, expect, it } from 'vitest';
import {
  AVISO_DE_ESTADO,
  correoValido,
  errorDeCorreo,
  estadoDeCobro,
  mensajeDeError,
  parametrosDeConfirmacion,
  TEMA_ELEMENTS,
} from '../pago';

describe('el correo del comprador', () => {
  it('acepta un correo normal', () => {
    expect(correoValido('ana@correo.com')).toBe(true);
    expect(correoValido('  ana@correo.com  ')).toBe(true);
  });

  it('rechaza lo que no lo es', () => {
    expect(correoValido('ana@correo')).toBe(false);
    expect(correoValido('ana correo.com')).toBe(false);
    expect(correoValido('')).toBe(false);
  });

  it('no regaña antes de tiempo', () => {
    expect(errorDeCorreo('', false)).toBe('');
    expect(errorDeCorreo('ana@', false)).toBe('');
  });

  it('pide el correo cuando está vacío y lo corrige cuando está mal', () => {
    expect(errorDeCorreo('', true)).toBe('Escribe tu correo.');
    expect(errorDeCorreo('ana@', true)).toBe('Ese correo no se ve bien. Revísalo.');
    expect(errorDeCorreo('ana@correo.com', true)).toBe('');
  });
});

describe('qué se le dice a quien paga cuando algo falla', () => {
  it('deja pasar el mensaje de Stripe cuando es de la tarjeta', () => {
    expect(mensajeDeError({ type: 'card_error', message: 'Tu tarjeta fue rechazada.' })).toBe(
      'Tu tarjeta fue rechazada.',
    );
  });

  it('esconde las fallas técnicas detrás de algo que se entiende', () => {
    const generico = mensajeDeError({ type: 'api_error', message: 'Request failed with status 500' });
    expect(generico).not.toContain('500');
    expect(generico).toContain('no se hizo ningún cargo');
  });

  it('explica el rechazo del banco sin códigos', () => {
    expect(mensajeDeError({ type: 'invalid_request_error', code: 'payment_intent_authentication_failure' })).toBe(
      'Tu banco no autorizó el pago. Vuelve a intentarlo o usa otra tarjeta.',
    );
  });

  it('tiene algo que decir aunque no venga fallo', () => {
    expect(mensajeDeError(undefined)).toContain('Inténtalo otra vez');
  });
});

describe('cómo terminó el cobro al volver del banco', () => {
  it('lee los estados de Stripe', () => {
    expect(estadoDeCobro('succeeded')).toBe('listo');
    expect(estadoDeCobro('processing')).toBe('confirmando');
    expect(estadoDeCobro('requires_payment_method')).toBe('reintentar');
    expect(estadoDeCobro('requires_action')).toBe('pendiente');
    expect(estadoDeCobro(undefined)).toBe('pendiente');
  });

  it('cada estado que no es el bueno trae su aviso, y ninguno menciona un cargo que no se hizo', () => {
    expect(AVISO_DE_ESTADO.listo).toBe('');
    expect(AVISO_DE_ESTADO.confirmando).not.toBe('');
    expect(AVISO_DE_ESTADO.reintentar).toContain('no se hizo ningún cargo');
    expect(AVISO_DE_ESTADO.pendiente).toContain('escríbenos');
  });
});

describe('el tema del formulario de Stripe', () => {
  it('usa el naranja de la marca y la tipografía de la pantalla', () => {
    expect(TEMA_ELEMENTS.variables.colorPrimary).toBe('#F5A623');
    expect(TEMA_ELEMENTS.variables.fontFamily).toContain('Figtree');
  });

  it('marca el foco con el mismo naranja, no con el azul de fábrica', () => {
    expect(TEMA_ELEMENTS.rules['.Input:focus'].border).toContain('#F5A623');
  });
});

describe('los parámetros con los que se confirma el cobro', () => {
  /*
    La regresión que costó un pago ciclado: el Payment Element se monta con
    `billingDetails.email: 'never'`, y si el correo no viaja en la confirmación
    Stripe.js lanza un error de integración en vez de devolverlo. La promesa se
    rompe, el botón gira para siempre y no se llega ni a pedir el cobro.
  */
  it('siempre lleva el correo, que es lo que el Payment Element ya no pide', () => {
    const p = parametrosDeConfirmacion('  ana@ejemplo.mx ', 'https://mirestaurantelisto.com');
    expect(p.payment_method_data.billing_details.email).toBe('ana@ejemplo.mx');
  });

  it('vuelve a la pantalla de pago del mismo sitio, no a otro dominio', () => {
    const p = parametrosDeConfirmacion('ana@ejemplo.mx', 'https://mirestaurantelisto.com');
    expect(p.return_url).toBe('https://mirestaurantelisto.com/pago?volver=1');
  });
});
