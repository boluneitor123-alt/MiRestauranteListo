/**
 * Revisión de realidad (entrega-v2 § "Números").
 *
 * Cruza los números del proyecto entre sí en lugar de mirarlos uno por uno:
 * la venta que hace falta contra lo que la cocina y el local aguantan, la
 * renta y la nómina contra esa venta, y la inversión contra el presupuesto.
 *
 * Módulo puro: no toca React, ni almacenamiento, ni fechas.
 */

import { money } from './format';
import type { Bench } from '@/content/giros';

/** Valores con los que arranca la capacidad mientras el dueño no la mida. */
export const CAPACITY_DEFAULTS = {
  /** Órdenes que la cocina saca por hora. */
  ordersPerHour: 20,
  /** Horas de venta pico al día. */
  peakHours: 3,
  /** Lugares sentados del local. */
  seats: 20,
} as const;

/** Rotaciones de mesa al día con las que se calcula el aforo. */
export const TURNS_PER_DAY = 4;

export interface CapacityInput {
  ordersPerHour: number;
  peakHours: number;
  seats: number;
}

export interface RealityInput {
  capacity: CapacityInput;
  /** Tickets al día que hay que vender para llegar a la meta. */
  ticketsNeeded: number;
  /** Venta mensual proyectada: la de la meta, o la de equilibrio. */
  monthlySales: number;
  /** Renta mensual capturada en gastos fijos. */
  rent: number;
  /** Nómina mensual capturada en gastos fijos. */
  payroll: number;
  /** Inversión estimada del presupuesto de apertura. */
  investment: number;
  /** Tope de presupuesto que declaró el dueño. */
  budgetCap: number;
  /** Giro del negocio, para nombrarlo en las lecturas. */
  giro: string;
  bench: Bench;
}

export interface RealityRow {
  id: string;
  label: string;
  /** La cifra corta que va en la insignia. */
  value: string;
  /** Está en rango. */
  ok: boolean;
  /**
   * Está fuera de rango pero por poco. Se pinta en gris en lugar de en
   * naranja: no es un problema todavía, es algo que vigilar.
   */
  warn: boolean;
  /** Qué significa el número, en una frase. */
  read: string;
  /** Cómo se arregla. Sólo cuando no está en rango. */
  fix: string;
}

export interface RealityResult {
  rows: RealityRow[];
  /** Cuántos cruces salieron fuera de rango. */
  bad: number;
  /** El titular de la tarjeta de Números. */
  head: string;
  /** La bajada del titular. */
  sub: string;
  /** Los rangos contra los que se comparó, en una línea. */
  benchLine: string;
}

/** Cuántas órdenes saca la cocina en su pico. */
export const kitchenCapacity = (c: CapacityInput): number =>
  Math.max(1, Math.round(c.ordersPerHour) * Math.round(c.peakHours));

/** Cuántos clientes caben en el local en un día. */
export const seatCapacity = (c: CapacityInput): number => Math.max(1, Math.round(c.seats) * TURNS_PER_DAY);

/** Porcentaje de la venta que se lleva un gasto, con un decimal. */
const shareOfSales = (amount: number, sales: number): number =>
  sales > 0 ? Math.round((amount / sales) * 1000) / 10 : 0;

export function realityCheck(input: RealityInput): RealityResult {
  const { bench: b, capacity } = input;
  const cap = kitchenCapacity(capacity);
  const aforo = seatCapacity(capacity);
  const venta = input.monthlySales > 0 ? input.monthlySales : 1;
  const need = Math.max(0, Math.round(input.ticketsNeeded));
  const rentaPct = shareOfSales(input.rent, venta);
  const nomPct = shareOfSales(input.payroll, venta);
  const giro = input.giro || 'tu giro';

  const rows: RealityRow[] = [
    {
      id: 'cocina',
      label: 'Tu cocina aguanta lo que necesitas vender',
      value: `${need} de ${cap} órdenes`,
      ok: need <= cap,
      warn: false,
      read:
        need <= cap
          ? `Necesitas ${need} tickets al día y tu cocina puede sacar ${cap} en hora pico. Cabe.`
          : `Necesitas ${need} tickets al día y tu cocina saca ${cap} en hora pico. Es un tema de capacidad, y se resuelve con capacidad.`,
      fix: 'Tres caminos: una estación más de cocina, subir el ticket promedio para necesitar menos clientes, o alargar tu horario de pico.',
    },
    {
      id: 'lugares',
      label: 'Tu local tiene lugares suficientes',
      value: `${need} de ${aforo} clientes`,
      ok: need <= aforo,
      warn: false,
      read:
        need <= aforo
          ? `Con ${Math.round(capacity.seats)} lugares y ${TURNS_PER_DAY} rotaciones al día caben ${aforo} clientes. Suficiente.`
          : `Con ${Math.round(capacity.seats)} lugares y ${TURNS_PER_DAY} rotaciones al día caben ${aforo} clientes, y la cuenta pide ${need}.`,
      fix: 'Se puede sumar lugares, abrir venta para llevar o delivery, o subir el ticket promedio para necesitar menos clientes.',
    },
    {
      id: 'renta',
      label: 'Tu renta contra tu venta',
      value: `${rentaPct}%`,
      ok: rentaPct <= b.renta[1],
      warn: rentaPct > b.renta[1] && rentaPct <= b.renta[1] + 3,
      read: `Tu renta se lleva ${rentaPct}% de tu venta proyectada. En ${giro} el rango sano es ${b.renta[0]} a ${b.renta[1]}%.`,
      fix: `Para tu venta, una renta cómoda sería de hasta ${money((venta * b.renta[1]) / 100)} al mes. Se puede negociar el monto, buscar otro local, o revisar si tu venta proyectada está conservadora.`,
    },
    {
      id: 'nomina',
      label: 'Tu nómina contra tu venta',
      value: `${nomPct}%`,
      ok: nomPct <= b.nomina[1],
      warn: nomPct > b.nomina[1] && nomPct <= b.nomina[1] + 4,
      read: `Tu nómina se lleva ${nomPct}% de tu venta proyectada. El rango sano es ${b.nomina[0]} a ${b.nomina[1]}%.`,
      fix: `Una nómina cómoda para tu venta llega hasta ${money((venta * b.nomina[1]) / 100)} al mes. Muchos arrancan con un puesto menos y lo suman en cuanto la venta lo pide.`,
    },
    {
      id: 'inversion',
      label: 'Tu inversión cabe en tu presupuesto',
      value: money(input.investment),
      ok: input.investment <= input.budgetCap,
      warn: false,
      read:
        input.investment <= input.budgetCap
          ? `Tu inversión de ${money(input.investment)} cabe en tu presupuesto de ${money(input.budgetCap)}.`
          : `Tu inversión de ${money(input.investment)} va ${money(input.investment - input.budgetCap)} arriba de tu presupuesto.`,
      fix: 'Lo más común: recortar adecuaciones y comprar equipo semi-nuevo con garantía. Si el proyecto lo amerita, también se puede sumar ese capital antes de firmar renta.',
    },
  ];

  const bad = rows.filter((r) => !r.ok).length;

  return {
    rows,
    bad,
    head: bad === 0 ? 'Tu negocio cuadra' : bad === 1 ? 'Hay un punto por ajustar' : `Hay ${bad} puntos por ajustar`,
    sub:
      bad === 0
        ? `Los ${rows.length} cruces salen en rango. Sigue con tu ruta.`
        : 'Nada de esto está mal de origen: son ajustes normales en esta etapa, y cada punto trae la forma de resolverlo.',
    benchLine: `Rangos de referencia para ${giro}: food cost ${b.fc[0]}-${b.fc[1]}%, renta ${b.renta[0]}-${b.renta[1]}%, nómina ${b.nomina[0]}-${b.nomina[1]}%, ticket típico ${money(b.ticket)}.`,
  };
}
