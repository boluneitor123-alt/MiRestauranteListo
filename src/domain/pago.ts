/**
 * Lo que la pantalla de pago decide sin ayuda de nadie: si un correo sirve, qué
 * decirle a la persona cuando algo sale mal y cómo se ve el formulario de
 * Stripe para que no parezca injertado.
 *
 * Módulo puro: no toca red, ni DOM, ni Stripe. Así se puede probar solo.
 */

const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function correoValido(email: string): boolean {
  return CORREO.test(email.trim());
}

/** El aviso bajo el campo de correo, con el tono del prototipo. */
export function errorDeCorreo(email: string, tocado: boolean): string {
  if (!tocado) return '';
  if (!email.trim()) return 'Escribe tu correo.';
  return correoValido(email) ? '' : 'Ese correo no se ve bien. Revísalo.';
}

export interface FalloDeStripe {
  type?: string;
  code?: string;
  message?: string;
}

/**
 * Lo que se dice cuando el fallo no le pertenece a quien paga: no hubo cargo y
 * hay algo que hacer. Sirve también para un error inesperado del navegador.
 */
export const FALLO_GENERICO =
  'No pudimos completar el cobro y no se hizo ningún cargo. Inténtalo otra vez o usa otra tarjeta.';

/**
 * Traduce un fallo de Stripe a algo que se entienda.
 *
 * Los errores de tarjeta y de validación vienen redactados por Stripe en
 * español y le hablan a quien paga ("Tu tarjeta fue rechazada"), así que esos se
 * dejan pasar. Todo lo demás son fallas nuestras o de la red: ahí nadie
 * necesita leer un código, necesita saber que no le cobraron y qué hacer.
 */
export function mensajeDeError(fallo: FalloDeStripe | undefined): string {
  const generico = FALLO_GENERICO;
  if (!fallo) return generico;

  if (fallo.code === 'payment_intent_authentication_failure') {
    return 'Tu banco no autorizó el pago. Vuelve a intentarlo o usa otra tarjeta.';
  }

  const suyo = fallo.type === 'card_error' || fallo.type === 'validation_error';
  const texto = fallo.message?.trim();
  return suyo && texto ? texto : generico;
}

/**
 * Lo que se le pasa a `stripe.confirmPayment` además de los elementos.
 *
 * El correo va aquí a la fuerza, no por gusto: el Payment Element se monta con
 * `fields.billingDetails.email: 'never'` para no pedir dos veces el mismo dato,
 * y cuando se declara `never` Stripe.js exige recibirlo en la confirmación. Si
 * falta, `confirmPayment` **lanza** un `IntegrationError` en vez de devolver un
 * error: la promesa se rompe, nadie la atrapa y el botón se queda girando en
 * "Procesando tu pago…" para siempre, sin que se llegue a pedir el cobro.
 *
 * Por eso vive aquí y tiene prueba: es la clase de detalle que se pierde de
 * vista al mover el formulario de sitio.
 */
export function parametrosDeConfirmacion(email: string, origen: string) {
  return {
    return_url: `${origen}/pago?volver=1`,
    payment_method_data: {
      billing_details: { email: email.trim() },
    },
  };
}

/** Los estados en los que puede quedar un cobro al volver del banco. */
export type EstadoDeCobro = 'listo' | 'confirmando' | 'reintentar' | 'pendiente';

export function estadoDeCobro(status: string | undefined): EstadoDeCobro {
  if (status === 'succeeded') return 'listo';
  if (status === 'processing') return 'confirmando';
  if (status === 'requires_payment_method') return 'reintentar';
  return 'pendiente';
}

export const AVISO_DE_ESTADO: Record<EstadoDeCobro, string> = {
  listo: '',
  confirmando: 'Tu banco está confirmando el pago. En cuanto termine se desbloquea tu acceso.',
  reintentar: 'El pago no se completó y no se hizo ningún cargo. Prueba otra vez o con otra tarjeta.',
  pendiente: 'El pago quedó a medias. Si ves el cargo en tu banco, escríbenos y lo activamos a mano.',
};

/* ─────────────────────────  El aspecto de los campos  ────────────────────── */

/**
 * Tema del Payment Element.
 *
 * Los campos son de Stripe y viven dentro de su iframe, así que la única forma
 * de que combinen con la tarjeta que los rodea es pasarle estas variables. Los
 * valores son los mismos tokens del diseño, escritos en firme porque dentro del
 * iframe no existen las variables CSS de nuestra hoja.
 */
export const TEMA_ELEMENTS = {
  theme: 'flat' as const,
  variables: {
    colorPrimary: '#F5A623',
    colorBackground: '#FFFFFF',
    colorText: '#1C1A17',
    colorTextSecondary: '#4A453D',
    colorTextPlaceholder: '#878175',
    colorDanger: '#C0392B',
    fontFamily: "'Figtree', system-ui, sans-serif",
    fontSizeBase: '16px',
    fontWeightNormal: '500',
    borderRadius: '13px',
    spacingUnit: '4px',
    gridRowSpacing: '16px',
  },
  rules: {
    '.Input': {
      border: '1.5px solid #E7DECD',
      boxShadow: 'none',
      padding: '15px 16px',
      fontSize: '16px',
    },
    '.Input:focus': {
      border: '1.5px solid #F5A623',
      boxShadow: '0 0 0 3px rgba(245, 166, 35, 0.22)',
      outline: 'none',
    },
    '.Input--invalid': { border: '1.5px solid #C0392B', boxShadow: 'none' },
    '.Label': {
      fontSize: '13.5px',
      fontWeight: '600',
      color: '#4A453D',
      marginBottom: '7px',
    },
    '.Error': { fontSize: '13.5px', fontWeight: '600', color: '#C0392B' },
    '.Tab': { border: '1.5px solid #E7DECD', boxShadow: 'none' },
    '.Tab--selected': { border: '1.5px solid #F5A623', boxShadow: 'none' },
  },
};

/** Figtree, la misma del resto de la pantalla, cargada dentro del iframe. */
export const FUENTE_ELEMENTS = [
  { cssSrc: 'https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&display=swap' },
];
