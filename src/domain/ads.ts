/**
 * Analizador de anuncios de Meta.
 *
 * Portado de `adDoctor()` del prototipo. Toma los cinco números que se ven en
 * el Administrador de anuncios y dice si el anuncio deja dinero.
 *
 * El número que decide es el costo real por cliente que llegó: mientras esté
 * por debajo de la utilidad que deja un cliente, el anuncio se paga solo.
 */

export interface AdsInput {
  /** Lo que llevas invertido. */
  spend: number;
  /** Días que lleva corriendo. Mínimo 1. */
  days: number;
  /** Cuántas personas lo vieron. */
  reach: number;
  /** Mensajes o clics que trajo. */
  results: number;
  /** De los que escribieron, cuántos llegaron al negocio. */
  visits: number;
  /** Ticket promedio del negocio. */
  ticket: number;
  /** Margen bruto, en porcentaje. */
  marginPct: number;
}

export type AdsBand = 'bien' | 'medio' | 'mal';

export interface AdsMetrics {
  /** Inversión diaria. */
  perDay: number;
  /** Costo por mensaje o clic. */
  costPerResult: number;
  /** Costo real por cliente que llegó. */
  costPerVisit: number;
  /** De los que lo vieron, qué porcentaje respondió. */
  showRate: number;
  /** De los que escribieron, qué porcentaje llegó. */
  closeRate: number;
  /** Venta que trajo el anuncio. */
  income: number;
  /** Utilidad menos la inversión. */
  profit: number;
  /** Venta entre inversión. */
  roas: number;
  /** Utilidad que deja un cliente. */
  profitPerCustomer: number;
  /** Hasta aquí conviene pagar por traer a alguien. */
  maxCostPerVisit: number;
  /** Hay datos suficientes para analizar. */
  hasData: boolean;
}

export function adsMetrics(input: AdsInput): AdsMetrics {
  const days = Math.max(1, input.days);
  const margin = input.marginPct / 100;

  const perDay = input.spend / days;
  const costPerResult = input.results ? input.spend / input.results : 0;
  const costPerVisit = input.visits ? input.spend / input.visits : 0;
  const showRate = input.reach ? (input.results / input.reach) * 100 : 0;
  const closeRate = input.results ? (input.visits / input.results) * 100 : 0;
  const income = input.visits * input.ticket;
  const profit = income * margin - input.spend;
  const roas = input.spend ? income / input.spend : 0;
  const profitPerCustomer = input.ticket * margin;

  return {
    perDay,
    costPerResult,
    costPerVisit,
    showRate,
    closeRate,
    income,
    profit,
    roas,
    profitPerCustomer,
    maxCostPerVisit: profitPerCustomer,
    hasData: input.spend > 0 && input.results > 0,
  };
}

/** Las cuatro bandas del diagnóstico, con el umbral de cada una. */
export function adsBands(m: AdsMetrics): {
  costPerResult: AdsBand;
  showRate: AdsBand;
  closeRate: AdsBand;
  costPerVisit: AdsBand;
} {
  return {
    costPerResult: m.costPerResult <= 25 ? 'bien' : m.costPerResult <= 40 ? 'medio' : 'mal',
    showRate: m.showRate >= 1.5 ? 'bien' : m.showRate >= 0.7 ? 'medio' : 'mal',
    closeRate: m.closeRate >= 30 ? 'bien' : m.closeRate >= 15 ? 'medio' : 'mal',
    costPerVisit:
      m.costPerVisit > 0 && m.costPerVisit < m.maxCostPerVisit * 0.5
        ? 'bien'
        : m.costPerVisit < m.maxCostPerVisit
          ? 'medio'
          : 'mal',
  };
}

export type AdsVerdictKind = 'sin-datos' | 'falta-visitas' | 'sirve' | 'no-sirve';

export function adsVerdict(input: AdsInput, m: AdsMetrics): AdsVerdictKind {
  if (!m.hasData) return 'sin-datos';
  if (!input.visits) return 'falta-visitas';
  return m.profit > 0 ? 'sirve' : 'no-sirve';
}

export interface AdsHeadline {
  head: string;
  sub: string;
}

/**
 * El titular del diagnóstico. Vive aquí, y no en la pantalla, porque el
 * documento imprimible dice exactamente lo mismo.
 */
export function adsHeadline(
  input: AdsInput,
  m: AdsMetrics,
  verdict: AdsVerdictKind,
  money: (n: number) => string,
): AdsHeadline {
  const textos: Record<AdsVerdictKind, AdsHeadline> = {
    'sin-datos': {
      head: 'Captura tus números',
      sub: 'Con lo que ves en el Administrador de anuncios de Meta te digo en un minuto si tu anuncio sirve.',
    },
    'falta-visitas': {
      head: 'Falta el dato que decide',
      sub: 'Ya tengo tu costo por mensaje. Captura cuántos llegaron al negocio y te digo si el anuncio deja dinero.',
    },
    sirve: {
      head: 'Este anuncio sirve',
      sub: `Invertiste ${money(input.spend)} y trajiste ${input.visits} clientes que dejan ${money(m.income * (input.marginPct / 100))} de utilidad. Ganas ${money(m.profit)}. Súbele presupuesto 20% y déjalo correr 3 días más.`,
    },
    'no-sirve': {
      head: 'Este anuncio todavía no sirve',
      sub: `Invertiste ${money(input.spend)} y la utilidad de los ${input.visits} clientes que llegaron suma ${money(m.income * (input.marginPct / 100))}. Te falta ${money(-m.profit)}. Abajo está qué cambiar, en orden.`,
    },
  };
  return textos[verdict];

}

export interface AdsReading {
  label: string;
  value: string;
  band: AdsBand;
  /** Qué significa ese número. */
  read: string;
  /** Qué hacer al respecto. Vacío cuando el número está bien. */
  fix: string;
}

/** Las cuatro lecturas del diagnóstico. Vacío si todavía no hay datos. */
export function adsReadings(input: AdsInput, m: AdsMetrics, money: (n: number) => string): AdsReading[] {
  const bands = adsBands(m);
  return m.hasData
    ? [
        {
          label: 'Costo por mensaje o clic',
          value: money(m.costPerResult),
          band: bands.costPerResult,
          read:
            bands.costPerResult === 'bien'
              ? 'Está en el rango sano de comida local ($8 a $25). Tu foto y tu texto están haciendo su trabajo.'
              : bands.costPerResult === 'medio'
                ? 'Un poco arriba del rango sano. Suele arreglarse cambiando la foto antes que subiendo presupuesto.'
                : 'Arriba de $40 por mensaje. En comida local eso indica que la foto no detiene o que el radio está muy abierto.',
          fix:
            bands.costPerResult === 'bien'
              ? ''
              : 'Cambia la foto por una con manos, vapor o movimiento. Si sigue igual, cierra el radio a 3 km.',
        },
        {
          label: 'De los que lo vieron, cuántos respondieron',
          value: `${m.showRate.toFixed(1)}%`,
          band: bands.showRate,
          read:
            bands.showRate === 'bien'
              ? `Buena respuesta: de cada 100 que lo ven, ${m.showRate.toFixed(1)} te escriben.`
              : bands.showRate === 'medio'
                ? 'Respuesta tibia. El anuncio se ve, pero no convence de dar el paso.'
                : 'Casi nadie responde. El anuncio llega a la gente pero no le está diciendo por qué venir hoy.',
          fix:
            bands.showRate === 'bien'
              ? ''
              : 'Revisa la línea 2 de tu texto: necesita una razón con fecha (promoción, día especial, algo que solo tú tienes).',
        },
        {
          label: 'De los que escribieron, cuántos llegaron',
          value: `${Math.round(m.closeRate)}%`,
          band: bands.closeRate,
          read:
            bands.closeRate === 'bien'
              ? 'Estás cerrando bien: contestas rápido y das la información que hace falta.'
              : bands.closeRate === 'medio'
                ? 'Se te va gente entre el mensaje y la visita. Casi siempre es tiempo de respuesta.'
                : 'La mayoría escribe y no llega. El problema ya no es el anuncio, es la conversación.',
          fix:
            bands.closeRate === 'bien'
              ? ''
              : 'Contesta en menos de 10 minutos en horas de venta y deja listas tus 3 respuestas rápidas: menú con precios, ubicación con liga y horario.',
        },
        {
          label: 'Costo real por cliente que llegó',
          value: input.visits ? money(m.costPerVisit) : 'Sin datos',
          band: bands.costPerVisit,
          read: !input.visits
            ? 'Captura cuántos de los que escribieron llegaron al negocio y aquí verás el número que de verdad importa.'
            : bands.costPerVisit === 'bien'
              ? `Te cuesta ${money(m.costPerVisit)} traer a alguien que te deja ${money(m.profitPerCustomer)} de utilidad. Este anuncio se paga solo.`
              : bands.costPerVisit === 'medio'
                ? `Te cuesta ${money(m.costPerVisit)} y cada cliente deja ${money(m.profitPerCustomer)}. Todavía ganas, pero el margen es corto.`
                : `Te cuesta ${money(m.costPerVisit)} traer a alguien que deja ${money(m.profitPerCustomer)}. Con estos números el anuncio te cuesta dinero.`,
          fix:
            bands.costPerVisit === 'mal' && input.visits
              ? `Tu tope para seguir ganando es ${money(m.maxCostPerVisit)} por cliente. Sube el ticket promedio o baja el costo por mensaje antes de subir presupuesto.`
              : '',
        },
      ]
    : [];

}

/**
 * Plan de inversión del primer mes. La base sale del 6% de tus gastos fijos
 * diarios, con un piso de $80 y redondeada a la decena.
 */
export function adsBudgetPlan(monthlyFixed: number): { base: number; week2: number; week34: number; month: number } {
  const base = Math.max(80, Math.round(((monthlyFixed / 30) * 0.06) / 10) * 10);
  return {
    base,
    week2: base * 2,
    week34: base * 2.4,
    month: base * 5 + base * 2 * 7 + base * 2.4 * 14,
  };
}
