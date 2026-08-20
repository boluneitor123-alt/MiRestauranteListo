/**
 * Calculadora de delivery: cuánto te queda después de la comisión.
 *
 * Portada de `deliveryCalc()` del prototipo. La fórmula que decide es el
 * precio sugerido, calculado al revés desde la utilidad de mostrador:
 *
 *   sugerido = (costo + empaque + utilidad de mostrador) ÷ (1 − comisión)
 *
 * y luego se redondea hacia arriba al múltiplo de 5.
 */

export interface DeliveryInput {
  /** Lo que paga el cliente dentro de Rappi o UberEats. */
  appPrice: number;
  /** El precio del mismo platillo en tu local. */
  counterPrice: number;
  /** Costo del platillo, sin empaque. El que da el Costeador. */
  cost: number;
  /** Envase, tapa, bolsa, servilletas, cubiertos y salsas. */
  packaging: number;
  /** Comisión de la app, en porcentaje. Se topa a 60%. */
  commissionPct: number;
  /** Pedidos de app al día, para calcular el impacto al mes. */
  ordersPerDay: number;
}

/** Valores con los que arranca la calculadora. */
export const DELIVERY_DEFAULTS: DeliveryInput = {
  appPrice: 45,
  counterPrice: 32,
  cost: 9.12,
  packaging: 3.5,
  commissionPct: 27,
  ordersPerDay: 10,
};

/** Tope de comisión que acepta la calculadora. */
export const MAX_COMMISSION_PCT = 60;

export type DeliveryLevel =
  /** Cada pedido te cuesta dinero. */
  | 'perdida'
  /** Te queda casi nada. */
  | 'flaco'
  /** Deja, pero menos que tu mostrador. */
  | 'justo'
  /** El delivery te está dejando. */
  | 'sano';

export interface DeliveryResult {
  /** Lo que se lleva la app. */
  commissionAmount: number;
  /** Lo que te queda por pedido en la app. */
  keptOnApp: number;
  /** Lo que te deja el mismo platillo en mostrador. */
  keptOnCounter: number;
  /** Margen del pedido de app, en porcentaje del precio. */
  appMarginPct: number;
  /** El precio que deberías poner en la app, sin redondear. */
  suggestedPrice: number;
  /** El mismo precio redondeado hacia arriba al múltiplo de 5. */
  suggestedRounded: number;
  /** Diferencia por pedido entre app y mostrador. Negativa = pierdes. */
  perOrderGap: number;
  /** La misma diferencia al mes, con los pedidos diarios capturados. */
  monthlyGap: number;
  level: DeliveryLevel;
}

/** Los cuatro veredictos, con su etiqueta y su titular. */
export const DELIVERY_VERDICTS: Record<DeliveryLevel, { kicker: string; title: string }> = {
  perdida: { kicker: 'Cuidado', title: 'Pierdes dinero en cada pedido' },
  flaco: { kicker: 'Muy apretado', title: 'Te queda casi nada' },
  justo: { kicker: 'Aceptable', title: 'Deja, pero menos que tu mostrador' },
  sano: { kicker: 'Va bien', title: 'El delivery te está dejando' },
};

export function calculateDelivery(input: DeliveryInput): DeliveryResult {
  const commission = Math.min(MAX_COMMISSION_PCT, input.commissionPct) / 100;

  const commissionAmount = input.appPrice * commission;
  const keptOnApp = input.appPrice - commissionAmount - input.cost - input.packaging;
  const keptOnCounter = input.counterPrice - input.cost;
  const appMarginPct = input.appPrice ? (keptOnApp / input.appPrice) * 100 : 0;

  const suggestedPrice =
    commission < 1 ? (input.cost + input.packaging + keptOnCounter) / (1 - commission) : 0;
  const suggestedRounded = Math.ceil(suggestedPrice / 5) * 5;

  const perOrderGap = keptOnApp - keptOnCounter;
  const monthlyGap = perOrderGap * input.ordersPerDay * 30;

  const level: DeliveryLevel =
    keptOnApp <= 0 ? 'perdida' : appMarginPct < 15 ? 'flaco' : appMarginPct < 25 ? 'justo' : 'sano';

  return {
    commissionAmount,
    keptOnApp,
    keptOnCounter,
    appMarginPct,
    suggestedPrice,
    suggestedRounded,
    perOrderGap,
    monthlyGap,
    level,
  };
}

/**
 * Qué hacer con el resultado. El prototipo muestra como mucho cuatro
 * consejos, en este orden.
 */
export function deliveryActions(
  input: DeliveryInput,
  result: DeliveryResult,
  money: (n: number) => string,
  money2: (n: number) => string,
): string[] {
  const actions: string[] = [];
  const commission = Math.min(MAX_COMMISSION_PCT, input.commissionPct) / 100;

  if (result.suggestedRounded > input.appPrice) {
    actions.push(
      `Sube el precio de app de este platillo a ${money(result.suggestedRounded)}. Es el cambio de un minuto que arregla el módulo entero.`,
    );
  }
  if (input.packaging === 0) {
    actions.push(
      'No capturaste empaque. Súmalo: casi siempre son entre $8 y $22 por pedido y es donde se esconde la pérdida.',
    );
  } else if (input.appPrice && input.packaging / input.appPrice > 0.12) {
    actions.push(
      `Tu empaque se lleva el ${Math.round((input.packaging / input.appPrice) * 100)}% del precio. Cotiza por millar: la diferencia contra comprar de a poco suele ser del 40%.`,
    );
  }
  if (commission > 0.27) {
    actions.push(
      `Tu comisión de ${Math.round(commission * 100)}% está en el tope del mercado. Pide el plan de comisión más baja y pregunta por la opción con tu propio repartidor.`,
    );
  }
  if (result.keptOnApp > 0 && result.keptOnApp < result.keptOnCounter) {
    actions.push(
      `Mete un volante con tu WhatsApp en cada pedido: el mismo cliente pidiendo directo te deja ${money2(result.keptOnCounter - result.keptOnApp)} más por pedido.`,
    );
  }
  if (result.appMarginPct >= 25) {
    actions.push(
      'Este platillo sí funciona en app. Revisa los demás de tu carta con esta misma calculadora y saca los que no lleguen a 15%.',
    );
  }
  return actions.slice(0, 4);
}
