/**
 * "Lo que este negocio te va a dar": los números que dicen a dónde te lleva
 * tu esfuerzo, en pesos y en meses.
 *
 * Portado de `survival()` del prototipo. Los textos son literales: están
 * escritos para un dueño de fonda y no se reescriben aquí.
 *
 * Las cuatro tarjetas de arriba responden preguntas distintas:
 *   1. ¿me alcanza el colchón para los meses de arranque?
 *   2. ¿cuánto me queda a mí al mes?
 *   3. ¿cuánto vale mi hora?
 *   4. ¿cuándo vuelve mi inversión?
 *
 * Abajo van cuatro números de operación y una prueba de estrés.
 */

import { dishCostPerPortion, netPrice, type CostingContext } from './costing';
import { money } from './format';
import type { Dish, Popularity } from './types';

/** Valores con los que arranca la sección, iguales a los del prototipo. */
export const SURVIVAL_DEFAULTS = {
  /** Horas que trabaja el dueño a la semana. */
  weeklyHours: 70,
  /** Minutos que tarda el platillo promedio. */
  prepMinutes: 6,
  /** Platillos que salen al día en total. */
  dailyMix: 100,
};

/** Semanas por mes que usa el prototipo para pasar de horas semanales a mensuales. */
const WEEKS_PER_MONTH = 4.33;

/** Comisión de tarjeta: 3.6% sobre el 40% de la venta que se paga con tarjeta. */
const CARD_SHARE = 0.4;
const CARD_FEE = 0.036;

/** Impuestos estimados sobre la utilidad antes de impuestos. */
const TAX_RATE = 0.1;

/** Nadie vende al 100% desde el día uno. */
export const SALES_RAMP = [0.4, 0.65, 0.85, 1] as const;

/** Peso de cada platillo en la mezcla diaria, según qué tanto se vende. */
const POPULARITY_WEIGHT: Record<Popularity, number> = { alta: 5, media: 3, baja: 1 };

export interface SurvivalInput {
  /** Venta mensual objetivo. Si no hay meta, la de equilibrio. */
  monthlySales: number;
  /** Gastos fijos del mes. */
  fixedExpenses: number;
  /** Sólo la renta: es lo único que mueve la prueba de estrés. */
  rent: number;
  /** Días de venta al mes: 30, o 26 si cierra un día. */
  days: number;
  /** Margen bruto, en porcentaje. */
  marginPct: number;
  /** Ticket promedio. */
  ticket: number;
  /** Tickets diarios que pide la meta, para comparar contra el estrés. */
  goalTicketsPerDay: number;
  /** Inversión de apertura. */
  investment: number;
  /** Presupuesto disponible. */
  budgetCap: number;
  /** Horas de operación al día. */
  hoursPerDay: number;
  /** Horas que trabaja el dueño a la semana. */
  weeklyHours: number;
  /** Minutos del platillo promedio. */
  prepMinutes: number;
  /** Platillos que salen al día. */
  dailyMix: number;
  dishes: readonly Dish[];
  costing?: CostingContext;
  stress: { supplies: number; rent: number; sales: number };
}

export interface RampRow {
  label: string;
  /** "40% de tu venta". */
  pct: string;
  sales: number;
  /** Utilidad del mes. Negativa = pierdes. */
  result: number;
}

export interface SurvivalCard {
  kicker: string;
  /** La cifra grande. */
  big: string;
  /** La nota que la explica. */
  note: string;
  ok: boolean;
}

export interface SurvivalRow {
  label: string;
  value: string;
  note: string;
}

export interface SurvivalResult {
  /** ── Los números crudos, para pruebas y para la UI ────────────────── */
  /** Lo que queda del presupuesto después de invertir. Negativo = te pasaste. */
  free: number;
  /** Pérdida acumulada de los meses en que la venta todavía no llega. */
  hole: number;
  /** Lo que falta por conseguir. ≤ 0 = vas cubierto. */
  gap: number;
  /** Meses de colchón que aguanta lo libre. 99 = sin pérdida proyectada. */
  monthsCushion: number;
  /** Mes en que el negocio ya se paga solo. 0 = no cierra al 100%. */
  breakEvenMonth: number;
  /** Sueldo real del dueño al mes. */
  ownerSalary: number;
  /** Lo que vale su hora. */
  hourlyRate: number;
  /** Meses para recuperar la inversión. 0 = todavía no sale la cuenta. */
  paybackMonths: number;
  /** Lo que cuesta cada hora que el negocio está abierto. */
  costPerOpenHour: number;
  /** Merma promedio de las recetas capturadas, en porcentaje. */
  wastePct: number;
  /** Lo que se tira al mes por esa merma. */
  monthlyWaste: number;
  /** Compra de insumos al mes. */
  monthlySupplies: number;
  /** Utilidad del platillo promedio. */
  averageDishProfit: number;
  /** Utilidad por minuto de cocina. */
  profitPerMinute: number;

  /** ── Lo que se pinta ──────────────────────────────────────────────── */
  cards: SurvivalCard[];
  ramp: RampRow[];
  rampNote: string;
  cushionLabel: string;
  ops: SurvivalRow[];

  /** ── Prueba de estrés ─────────────────────────────────────────────── */
  stressOn: boolean;
  stressTicketsPerDay: number;
  stressOwnerSalary: number;
  stressNote: string;
}

/* ────────────────────────  Los ocho indicadores  ──────────────────────── */

/**
 * El colchón para los meses de arranque.
 *
 * Nadie vende al 100% desde el día uno: se proyectan 40%, 65%, 85% y 100% en
 * los primeros cuatro meses. El hueco es lo que se pierde mientras la venta
 * toma vuelo, y el mes de equilibrio es cuando el negocio ya se paga solo.
 */
export function colchonDeArranque(input: {
  monthlySales: number;
  fixedExpenses: number;
  marginPct: number;
  investment: number;
  budgetCap: number;
}): { ramp: RampRow[]; hole: number; free: number; gap: number; monthsCushion: number; breakEvenMonth: number } {
  const margin = input.marginPct / 100;
  const sales = input.monthlySales || 1;
  const free = input.budgetCap - input.investment;

  let accumulated = 0;
  let breakEvenMonth = 0;
  const ramp: RampRow[] = SALES_RAMP.map((r, i) => {
    const monthSales = sales * r;
    const result = monthSales * margin - input.fixedExpenses;
    if (result < 0) accumulated += result;
    else if (!breakEvenMonth) breakEvenMonth = i + 1;
    return { label: `Mes ${i + 1}`, pct: `${Math.round(r * 100)}% de tu venta`, sales: monthSales, result };
  });

  const hole = Math.abs(accumulated);
  return {
    ramp,
    hole,
    free,
    gap: hole - free,
    monthsCushion: hole > 0 ? Math.round((free / (hole / 4)) * 10) / 10 : 99,
    breakEvenMonth,
  };
}

/**
 * El sueldo real del dueño al mes.
 *
 *   venta × margen − gastos fijos − comisión de tarjeta − impuestos estimados
 *
 * La comisión es 3.6% sobre el 40% de la venta, que es la parte que se paga
 * con tarjeta. Es más chico que el margen bruto, y por eso sirve para planear.
 */
export function sueldoRealDelDueno(input: {
  monthlySales: number;
  fixedExpenses: number;
  marginPct: number;
}): number {
  const sales = input.monthlySales || 1;
  const gross = sales * (input.marginPct / 100);
  const beforeTax = gross - input.fixedExpenses - sales * CARD_SHARE * CARD_FEE;
  return beforeTax - Math.max(0, beforeTax * TAX_RATE);
}

/** Lo que vale tu hora: el sueldo real entre las horas que de verdad trabajas. */
export function valorDeTuHora(ownerSalary: number, weeklyHours: number): number {
  return ownerSalary / Math.max(1, weeklyHours * WEEKS_PER_MONTH);
}

/** Meses para recuperar la inversión. 0 = todavía no sale la cuenta. */
export function retornoDeInversion(investment: number, ownerSalary: number): number {
  return ownerSalary > 0 ? Math.ceil(investment / ownerSalary) : 0;
}

/** Lo que cuesta cada hora que el negocio está abierto. */
export function costoPorHoraAbierto(fixedExpenses: number, hoursPerDay: number, days: number): number {
  return fixedExpenses / Math.max(1, hoursPerDay * days);
}

/**
 * Compra de insumos al mes.
 *
 * Cada platillo pesa según qué tanto se vende, y ese peso reparte la mezcla
 * diaria. Es una estimación: sirve para negociar volumen, no para contabilidad.
 */
export function compraDeInsumosAlMes(
  dishes: readonly Dish[],
  dailyMix: number,
  ctx?: CostingContext,
): number {
  const priced = dishes.filter((d) => d.price > 0);
  const weightOf = (d: Dish) => POPULARITY_WEIGHT[d.popularity ?? 'media'] ?? 3;
  const weightSum = priced.reduce((a, d) => a + weightOf(d), 0) || 1;
  const unitsPerDay = (d: Dish) => Math.max(1, Math.round((weightOf(d) / weightSum) * dailyMix));
  return priced.reduce((a, d) => a + unitsPerDay(d) * dishCostPerPortion(d, ctx), 0) * 30;
}

/**
 * Merma mensual: el promedio de merma de las recetas capturadas aplicado a la
 * compra del mes. Sin recetas con merma, `pct` es 0 y la UI dice "Sin datos".
 */
export function mermaMensual(dishes: readonly Dish[], monthlySupplies: number): { pct: number; amount: number } {
  let sum = 0;
  let count = 0;
  for (const d of dishes.filter((x) => x.price > 0)) {
    for (const ing of d.ingredients ?? []) {
      if (ing.waste != null) {
        sum += ing.waste;
        count += 1;
      }
    }
  }
  const pct = count ? sum / count : 0;
  return { pct, amount: monthlySupplies * (pct / 100) };
}

/** Utilidad por minuto de cocina: en hora pico, el tiempo es el recurso escaso. */
export function utilidadPorMinutoDeCocina(
  dishes: readonly Dish[],
  prepMinutes: number,
  ctx?: CostingContext,
): { averageProfit: number; perMinute: number } {
  const priced = dishes.filter((d) => d.price > 0);
  const averageProfit = priced.length
    ? priced.reduce((a, d) => a + (netPrice(d) - dishCostPerPortion(d, ctx)), 0) / priced.length
    : 0;
  return { averageProfit, perMinute: averageProfit / Math.max(1, prepMinutes) };
}

/**
 * Prueba de estrés: qué pasa si los insumos suben, la renta sube o la venta
 * baja. El alza de insumos se come parte de lo que hoy es margen; el alza de
 * renta sube sólo la renta, no todo el gasto fijo.
 */
export function pruebaDeEstres(input: {
  monthlySales: number;
  fixedExpenses: number;
  rent: number;
  marginPct: number;
  ticket: number;
  days: number;
  stress: { supplies: number; rent: number; sales: number };
}): { margin: number; fixedExpenses: number; ticketsPerDay: number; ownerSalary: number } {
  const margin = input.marginPct / 100;
  const stressMargin = Math.max(0.05, margin - (1 - margin) * (input.stress.supplies / 100));
  const stressFixed = input.fixedExpenses + input.rent * (input.stress.rent / 100);
  const stressSales = (input.monthlySales || 1) * (1 - input.stress.sales / 100);

  return {
    margin: stressMargin,
    fixedExpenses: stressFixed,
    ticketsPerDay: Math.ceil(stressFixed / stressMargin / input.days / Math.max(1, input.ticket)),
    ownerSalary: stressSales * stressMargin - stressFixed - stressSales * CARD_SHARE * CARD_FEE,
  };
}

/* ──────────────────  La sección completa, ya redactada  ────────────────── */

export function survival(input: SurvivalInput): SurvivalResult {
  const { ramp, hole, free, gap, monthsCushion, breakEvenMonth } = colchonDeArranque(input);

  const ownerSalary = sueldoRealDelDueno(input);
  const weeklyHours = input.weeklyHours;
  const hourlyRate = valorDeTuHora(ownerSalary, weeklyHours);
  const paybackMonths = retornoDeInversion(input.investment, ownerSalary);

  const costPerOpenHour = costoPorHoraAbierto(input.fixedExpenses, input.hoursPerDay, input.days);
  const monthlySupplies = compraDeInsumosAlMes(input.dishes, input.dailyMix, input.costing);
  const { pct: wastePct, amount: monthlyWaste } = mermaMensual(input.dishes, monthlySupplies);

  const prepMinutes = Math.max(1, input.prepMinutes);
  const { averageProfit: averageDishProfit, perMinute: profitPerMinute } = utilidadPorMinutoDeCocina(
    input.dishes,
    prepMinutes,
    input.costing,
  );

  const stress = pruebaDeEstres(input);
  const stressTicketsPerDay = stress.ticketsPerDay;
  const stressOwnerSalary = stress.ownerSalary;

  const cards: SurvivalCard[] = [
    {
      kicker: 'Tu colchón para los meses de arranque',
      big: gap > 0 ? `Por conseguir: ${money(gap)}` : 'Vas cubierto',
      note:
        free < 0
          ? `Buena noticia: ya sabes tu número. Tu inversión va ${money(-free)} arriba del presupuesto y el arranque pide ${money(hole)} mientras la venta toma vuelo, así que te conviene sumar ${money(gap)}. Dos caminos que funcionan bien: equipo semi-nuevo con garantía, que suele bajar bastante, o conseguir ese capital antes de firmar renta. Con eso arrancas tranquilo.`
          : gap > 0
            ? `Vas bien encaminado: te quedan ${money(free)} libres después de invertir. El arranque pide ${money(hole)} mientras la venta toma vuelo, así que te conviene sumar ${money(gap)} más. Se resuelve recortando inversión o consiguiendo ese apoyo antes de firmar renta, y quedas listo.`
            : `Muy bien: te quedan ${money(free)} libres y el arranque necesita ${money(hole)}. Tienes con qué cubrir los meses de subida, y eso es exactamente lo que te va a dejar trabajar con la cabeza tranquila.`,
      ok: gap <= 0,
    },
    {
      kicker: 'Lo que te va a quedar a ti',
      big: `${money(ownerSalary)} al mes`,
      note: 'Es tu sueldo real, ya descontados insumos, gastos fijos, comisiones de tarjeta e impuestos estimados. Es más chico que el margen bruto y por eso vale: con este número puedes planear tu vida, no solo tu negocio.',
      ok: ownerSalary >= 15000,
    },
    {
      kicker: 'Lo que vale tu hora',
      big: `${money(hourlyRate)} por hora`,
      note: `Con ${weeklyHours} horas a la semana. Como referencia, un cocinero con experiencia cobra entre $60 y $80. Este número es tu palanca: cada peso que subes al ticket o cada hora que delegas lo mueve hacia arriba.`,
      ok: hourlyRate >= 60,
    },
    {
      kicker: 'Cuándo vuelve tu inversión',
      big: paybackMonths ? `Mes ${paybackMonths}` : 'Aún por calcular',
      note: paybackMonths
        ? `Invertiste ${money(input.investment)} y el negocio te devuelve ${money(ownerSalary)} al mes. Reinvirtiendo todo, tu dinero regresa en ${paybackMonths} meses. En comida lo común es entre 18 y 30, y a partir de ahí todo lo que entra ya es tuyo.`
        : 'Con los números de hoy todavía no sale el cálculo, y es normal a esta altura. Ajusta precios y gastos fijos en Números y este número aparece solo.',
      ok: paybackMonths > 0 && paybackMonths <= 30,
    },
  ];

  const ops: SurvivalRow[] = [
    {
      label: 'Cada hora abierto te cuesta',
      value: money(costPerOpenHour),
      note: `Gastos fijos entre tus horas de operación. Si en las primeras dos horas del día no vendes ${money(costPerOpenHour * 2)}, esas horas te cuestan dinero.`,
    },
    {
      label: 'Tiras al mes en merma',
      value: wastePct ? money(monthlyWaste) : 'Sin datos',
      note: wastePct
        ? `Es el ${Math.round(wastePct)}% promedio de merma de tus recetas sobre ${money(monthlySupplies)} de compra mensual. Bajarla 3 puntos son ${money(monthlySupplies * 0.03)} al mes.`
        : 'Captura el porcentaje de merma en los ingredientes de tus recetas y aquí verás cuánto dinero tiras al mes.',
    },
    {
      label: 'Utilidad por minuto de cocina',
      value: money(profitPerMinute),
      note: `Tu platillo promedio deja ${money(averageDishProfit)} y tarda ${prepMinutes} minutos. En hora pico un platillo rápido con menos margen puede dejarte más que uno lento y rentable.`,
    },
    {
      label: 'Compra de insumos al mes',
      value: money(monthlySupplies),
      note: 'Con esto negocias volumen y crédito. Es tu segundo gasto más grande después de la nómina.',
    },
  ];

  return {
    free,
    hole,
    gap,
    monthsCushion,
    breakEvenMonth,
    ownerSalary,
    hourlyRate,
    paybackMonths,
    costPerOpenHour,
    wastePct,
    monthlyWaste,
    monthlySupplies,
    averageDishProfit,
    profitPerMinute,

    cards,
    ramp,
    rampNote: breakEvenMonth
      ? `A partir del mes ${breakEvenMonth} el negocio ya se paga solo. Los meses previos suman ${money(hole)}, y tenerlos contemplados desde hoy es lo que hace que llegues sin apuros.`
      : 'Con los números de hoy la cuenta todavía no cierra al 100% de venta. Casi siempre es gasto fijo alto o margen apretado, y las dos cosas están en tus manos: pruébalo en Números.',
    cushionLabel:
      monthsCushion >= 99
        ? 'Sin pérdida proyectada'
        : free <= 0
          ? `Colchón por armar: ${money(hole)}`
          : `${monthsCushion} meses de colchón`,
    ops,

    stressOn: !!(input.stress.supplies || input.stress.rent || input.stress.sales),
    stressTicketsPerDay,
    stressOwnerSalary,
    stressNote:
      stressOwnerSalary > 0
        ? `Aguanta bien: te seguirían quedando ${money(stressOwnerSalary)} al mes, con ${stressTicketsPerDay} tickets diarios en lugar de ${input.goalTicketsPerDay}. Tu plan tiene margen de sobra para moverse.`
        : `Ahí la cuenta queda ${money(Math.abs(stressOwnerSalary))} corta, y saberlo hoy es una ventaja: te da tiempo de preparar la respuesta con un poco más de precio, un ticket más alto o menos gasto fijo.`,
  };
}

/** Los tres supuestos de la prueba de estrés, con las opciones del prototipo. */
export const STRESS_CONTROLS = [
  { key: 'supplies' as const, label: 'Si tus insumos suben', sign: '+' },
  { key: 'rent' as const, label: 'Si tu renta sube', sign: '+' },
  { key: 'sales' as const, label: 'Si vendes menos de lo que esperas', sign: '−' },
];

export const STRESS_STEPS = [0, 10, 20, 30] as const;

/** Límites del control de horas por semana. */
export const WEEKLY_HOURS_RANGE = { min: 1, max: 120 } as const;
