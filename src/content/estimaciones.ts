/**
 * ─── La tabla de estimaciones ───────────────────────────────────────────────
 *
 * De aquí sale lo que la app le enseña a alguien en sus primeros diez
 * segundos, antes de que capture nada. Con lo que contestó en el diagnóstico
 * —su giro, su presupuesto y cuánta gente piensa contratar— se arma un
 * proyecto completo: presupuesto de apertura, gastos fijos, punto de
 * equilibrio y platillos costeados.
 *
 * **Este archivo es para editarse a mano.** No lo genera ningún script. Los
 * montos son un punto de partida discutible, no una verdad: si conoces mejor
 * el mercado, corrígelos aquí y la app entera cambia con ellos.
 *
 * Nada de lo que pongas aquí se le presenta a nadie como un dato suyo. Todo
 * sale marcado como estimado, con la etiqueta de dónde vino, y en cuanto la
 * persona corrige un valor deja de ser estimación y pasa a ser dato suyo para
 * siempre — la app nunca vuelve a pisarlo.
 *
 *
 * CÓMO AGREGAR UN GIRO NUEVO
 *
 * Copia un bloque completo, cámbiale el nombre y ajusta los montos. El nombre
 * tiene que estar escrito **igual** que en la pregunta 1 del diagnóstico
 * (`src/content/onboarding.ts`), con acentos y mayúsculas: si no coincide, la
 * app usa el bloque `Otro` y lo dice en la etiqueta.
 *
 * Llaves obligatorias en cada giro:
 *
 *   ticket        Ticket promedio en pesos. Cuánto gasta un cliente.
 *   margin        Margen bruto en porcentaje. 68 quiere decir que de cada $100
 *                 de venta, $68 quedan después de pagar los insumos.
 *   presupuesto   Los 13 conceptos de la inversión para abrir, en pesos. Van
 *                 los 13, aunque alguno vaya en 0.
 *   gastosFijos   Los 10 conceptos del gasto de cada mes, en pesos.
 *   platillos     Lista de platillos con sus ingredientes. Puede ir vacía; si
 *                 va vacía, ese giro simplemente abre sin platillos.
 *
 * Las llaves de `presupuesto` y `gastosFijos` no se inventan: son las del
 * catálogo (`src/content/demo.ts`). Si te falta una o sobra una, la prueba
 * `estimaciones.test.ts` truena y te dice cuál.
 *
 * En cada platillo, los ingredientes llevan:
 *
 *   nombre      qty   cuánto lleva el platillo
 *   u           la unidad de esa cantidad: 'g', 'ml', 'pz'
 *   bu          la unidad en que lo compras: 'kg', 'l', 'pz'
 *   buyPrice    cuánto cuesta esa unidad de compra
 *   buyQty      cuántas unidades de compra trae la presentación
 *   merma       cuánto se desperdicia, en porcentaje
 *
 *
 * DE DÓNDE SALIÓ CADA BLOQUE
 *
 * Los siete primeros vienen de las plantillas del prototipo, que llevaban
 * meses en el código sin que nadie las usara. Marisquería, Sushi y Otro los
 * derivé de los rangos de referencia y **están pendientes de tu revisión**:
 * llevan el aviso arriba del bloque. Los platillos de esos tres van vacíos a
 * propósito — no invento recetas de un giro que no conozco.
 */

import type { UnitCode } from '@/domain/units';

export interface IngredienteEstimado {
  nombre: string;
  qty: number;
  u: UnitCode;
  bu: UnitCode;
  buyPrice: number;
  buyQty: number;
  merma: number;
}

export interface PlatilloEstimado {
  nombre: string;
  precio: number;
  ingredientes: IngredienteEstimado[];
}

export interface EstimacionDeGiro {
  ticket: number;
  margin: number;
  presupuesto: Record<string, number>;
  gastosFijos: Record<string, number>;
  platillos: PlatilloEstimado[];
}

/** El bloque que se usa cuando el giro no está en la tabla. */
export const GIRO_GENERICO = 'Otro';

export const ESTIMACIONES: Record<string, EstimacionDeGiro> = {
  "Taquería": {
    ticket: 130,
    margin: 68,

    presupuesto: {
      renta: 40000,
      obra: 35000,
      cocina: 42000,
      refri: 20000,
      mob: 16000,
      uten: 10000,
      inv: 15000,
      permisos: 9000,
      mkt: 7000,
      pos: 6000,
      nomina: 18000,
      fondo: 15000,
      otros: 4000,
    },

    gastosFijos: {
      renta: 18000,
      nomina: 32000,
      luz: 5500,
      gas: 4500,
      internet: 600,
      agua: 800,
      software: 400,
      conta: 2000,
      mkt: 2500,
      otros: 1200,
    },

    platillos: [
      {
        nombre: "Taco de pastor",
        precio: 28,
        ingredientes: [
          { nombre: "Carne al pastor", qty: 70, u: "g", bu: "kg", buyPrice: 165, buyQty: 1, merma: 8 },
          { nombre: "Tortilla de maíz", qty: 2, u: "pz", bu: "pz", buyPrice: 0.8, buyQty: 1, merma: 0 },
          { nombre: "Piña", qty: 10, u: "g", bu: "kg", buyPrice: 28, buyQty: 1, merma: 35 },
          { nombre: "Cebolla y cilantro", qty: 15, u: "g", bu: "kg", buyPrice: 22, buyQty: 1, merma: 20 },
        ],
      },
      {
        nombre: "Taco de bistec",
        precio: 32,
        ingredientes: [
          { nombre: "Bistec de res", qty: 75, u: "g", bu: "kg", buyPrice: 210, buyQty: 1, merma: 12 },
          { nombre: "Tortilla de maíz", qty: 2, u: "pz", bu: "pz", buyPrice: 0.8, buyQty: 1, merma: 0 },
          { nombre: "Cebolla y cilantro", qty: 15, u: "g", bu: "kg", buyPrice: 22, buyQty: 1, merma: 20 },
        ],
      },
      {
        nombre: "Agua de horchata",
        precio: 32,
        ingredientes: [
          { nombre: "Arroz", qty: 30, u: "g", bu: "kg", buyPrice: 26, buyQty: 1, merma: 0 },
          { nombre: "Leche", qty: 150, u: "ml", bu: "l", buyPrice: 26, buyQty: 1, merma: 0 },
          { nombre: "Azúcar y canela", qty: 25, u: "g", bu: "kg", buyPrice: 32, buyQty: 1, merma: 0 },
          { nombre: "Vaso y popote", qty: 1, u: "pz", bu: "pz", buyPrice: 1.8, buyQty: 1, merma: 0 },
        ],
      },
    ],
  },

  "Hamburguesería": {
    ticket: 190,
    margin: 66,

    presupuesto: {
      renta: 50000,
      obra: 55000,
      cocina: 60000,
      refri: 30000,
      mob: 28000,
      uten: 14000,
      inv: 22000,
      permisos: 9000,
      mkt: 10000,
      pos: 8000,
      nomina: 26000,
      fondo: 22000,
      otros: 6000,
    },

    gastosFijos: {
      renta: 26000,
      nomina: 46000,
      luz: 8500,
      gas: 4200,
      internet: 800,
      agua: 1100,
      software: 700,
      conta: 2500,
      mkt: 4000,
      otros: 1500,
    },

    platillos: [
      {
        nombre: "Hamburguesa clásica",
        precio: 129,
        ingredientes: [
          { nombre: "Carne molida", qty: 150, u: "g", bu: "kg", buyPrice: 168, buyQty: 1, merma: 5 },
          { nombre: "Pan brioche", qty: 1, u: "pz", bu: "pz", buyPrice: 8, buyQty: 1, merma: 0 },
          { nombre: "Queso cheddar", qty: 20, u: "g", bu: "kg", buyPrice: 210, buyQty: 1, merma: 0 },
          { nombre: "Jitomate y lechuga", qty: 30, u: "g", bu: "kg", buyPrice: 38, buyQty: 1, merma: 18 },
        ],
      },
      {
        nombre: "Hamburguesa con tocino",
        precio: 159,
        ingredientes: [
          { nombre: "Carne molida", qty: 150, u: "g", bu: "kg", buyPrice: 168, buyQty: 1, merma: 5 },
          { nombre: "Tocino", qty: 40, u: "g", bu: "kg", buyPrice: 195, buyQty: 1, merma: 12 },
          { nombre: "Pan brioche", qty: 1, u: "pz", bu: "pz", buyPrice: 8, buyQty: 1, merma: 0 },
          { nombre: "Queso cheddar", qty: 20, u: "g", bu: "kg", buyPrice: 210, buyQty: 1, merma: 0 },
        ],
      },
      {
        nombre: "Papas a la francesa",
        precio: 65,
        ingredientes: [
          { nombre: "Papa", qty: 200, u: "g", bu: "kg", buyPrice: 28, buyQty: 1, merma: 20 },
          { nombre: "Aceite", qty: 40, u: "ml", bu: "l", buyPrice: 42, buyQty: 1, merma: 0 },
          { nombre: "Sal y especias", qty: 5, u: "g", bu: "kg", buyPrice: 30, buyQty: 1, merma: 0 },
        ],
      },
    ],
  },

  "Cafetería": {
    ticket: 105,
    margin: 74,

    presupuesto: {
      renta: 45000,
      obra: 50000,
      cocina: 30000,
      refri: 22000,
      mob: 30000,
      uten: 12000,
      inv: 14000,
      permisos: 8000,
      mkt: 9000,
      pos: 7000,
      nomina: 20000,
      fondo: 18000,
      otros: 5000,
    },

    gastosFijos: {
      renta: 22000,
      nomina: 34000,
      luz: 6000,
      gas: 1800,
      internet: 900,
      agua: 700,
      software: 800,
      conta: 2000,
      mkt: 3000,
      otros: 1200,
    },

    platillos: [
      {
        nombre: "Latte 12 oz",
        precio: 58,
        ingredientes: [
          { nombre: "Café de especialidad", qty: 18, u: "g", bu: "kg", buyPrice: 380, buyQty: 1, merma: 0 },
          { nombre: "Leche entera", qty: 240, u: "ml", bu: "l", buyPrice: 26, buyQty: 1, merma: 0 },
          { nombre: "Vaso y tapa", qty: 1, u: "pz", bu: "pz", buyPrice: 2.5, buyQty: 1, merma: 0 },
        ],
      },
      {
        nombre: "Americano",
        precio: 45,
        ingredientes: [
          { nombre: "Café de especialidad", qty: 18, u: "g", bu: "kg", buyPrice: 380, buyQty: 1, merma: 0 },
          { nombre: "Vaso y tapa", qty: 1, u: "pz", bu: "pz", buyPrice: 2.5, buyQty: 1, merma: 0 },
        ],
      },
      {
        nombre: "Croissant de jamón y queso",
        precio: 79,
        ingredientes: [
          { nombre: "Croissant", qty: 1, u: "pz", bu: "pz", buyPrice: 14, buyQty: 1, merma: 0 },
          { nombre: "Jamón", qty: 40, u: "g", bu: "kg", buyPrice: 145, buyQty: 1, merma: 0 },
          { nombre: "Queso manchego", qty: 30, u: "g", bu: "kg", buyPrice: 180, buyQty: 1, merma: 0 },
        ],
      },
    ],
  },

  "Pizzería": {
    ticket: 180,
    margin: 70,

    presupuesto: {
      renta: 48000,
      obra: 52000,
      cocina: 65000,
      refri: 26000,
      mob: 24000,
      uten: 13000,
      inv: 18000,
      permisos: 9000,
      mkt: 9000,
      pos: 7000,
      nomina: 24000,
      fondo: 20000,
      otros: 5000,
    },

    gastosFijos: {
      renta: 24000,
      nomina: 40000,
      luz: 7000,
      gas: 6000,
      internet: 800,
      agua: 1000,
      software: 700,
      conta: 2200,
      mkt: 3500,
      otros: 1400,
    },

    platillos: [
      {
        nombre: "Pizza margarita mediana",
        precio: 179,
        ingredientes: [
          { nombre: "Masa", qty: 280, u: "g", bu: "kg", buyPrice: 32, buyQty: 1, merma: 0 },
          { nombre: "Salsa de tomate", qty: 120, u: "ml", bu: "l", buyPrice: 48, buyQty: 1, merma: 0 },
          { nombre: "Queso mozzarella", qty: 180, u: "g", bu: "kg", buyPrice: 165, buyQty: 1, merma: 0 },
          { nombre: "Albahaca", qty: 5, u: "g", bu: "kg", buyPrice: 220, buyQty: 1, merma: 15 },
        ],
      },
      {
        nombre: "Pizza pepperoni mediana",
        precio: 199,
        ingredientes: [
          { nombre: "Masa", qty: 280, u: "g", bu: "kg", buyPrice: 32, buyQty: 1, merma: 0 },
          { nombre: "Salsa de tomate", qty: 120, u: "ml", bu: "l", buyPrice: 48, buyQty: 1, merma: 0 },
          { nombre: "Queso mozzarella", qty: 180, u: "g", bu: "kg", buyPrice: 165, buyQty: 1, merma: 0 },
          { nombre: "Pepperoni", qty: 70, u: "g", bu: "kg", buyPrice: 240, buyQty: 1, merma: 0 },
        ],
      },
      {
        nombre: "Refresco 600 ml",
        precio: 35,
        ingredientes: [
          { nombre: "Refresco", qty: 1, u: "pz", bu: "pz", buyPrice: 14, buyQty: 1, merma: 0 },
        ],
      },
    ],
  },

  "Alitas": {
    ticket: 195,
    margin: 64,

    presupuesto: {
      renta: 42000,
      obra: 42000,
      cocina: 48000,
      refri: 24000,
      mob: 22000,
      uten: 12000,
      inv: 20000,
      permisos: 9000,
      mkt: 9000,
      pos: 7000,
      nomina: 22000,
      fondo: 18000,
      otros: 5000,
    },

    gastosFijos: {
      renta: 21000,
      nomina: 36000,
      luz: 7500,
      gas: 5200,
      internet: 800,
      agua: 1000,
      software: 600,
      conta: 2000,
      mkt: 3500,
      otros: 1300,
    },

    platillos: [
      {
        nombre: "Orden de alitas (12 piezas)",
        precio: 189,
        ingredientes: [
          { nombre: "Alitas de pollo", qty: 700, u: "g", bu: "kg", buyPrice: 95, buyQty: 1, merma: 6 },
          { nombre: "Salsa búfalo", qty: 60, u: "ml", bu: "l", buyPrice: 145, buyQty: 1, merma: 0 },
          { nombre: "Aderezo ranch", qty: 40, u: "ml", bu: "l", buyPrice: 120, buyQty: 1, merma: 0 },
          { nombre: "Apio y zanahoria", qty: 40, u: "g", bu: "kg", buyPrice: 30, buyQty: 1, merma: 20 },
        ],
      },
      {
        nombre: "Boneless 300 g",
        precio: 165,
        ingredientes: [
          { nombre: "Pechuga de pollo", qty: 300, u: "g", bu: "kg", buyPrice: 145, buyQty: 1, merma: 8 },
          { nombre: "Capeado", qty: 60, u: "g", bu: "kg", buyPrice: 30, buyQty: 1, merma: 0 },
          { nombre: "Salsa BBQ", qty: 60, u: "ml", bu: "l", buyPrice: 110, buyQty: 1, merma: 0 },
        ],
      },
      {
        nombre: "Cerveza de barril",
        precio: 65,
        ingredientes: [
          { nombre: "Cerveza", qty: 400, u: "ml", bu: "l", buyPrice: 38, buyQty: 1, merma: 0 },
          { nombre: "Vaso", qty: 1, u: "pz", bu: "pz", buyPrice: 1.2, buyQty: 1, merma: 0 },
        ],
      },
    ],
  },

  "Fonda": {
    ticket: 95,
    margin: 66,

    presupuesto: {
      renta: 24000,
      obra: 18000,
      cocina: 26000,
      refri: 14000,
      mob: 12000,
      uten: 8000,
      inv: 10000,
      permisos: 6000,
      mkt: 3000,
      pos: 3500,
      nomina: 12000,
      fondo: 10000,
      otros: 3000,
    },

    gastosFijos: {
      renta: 11000,
      nomina: 20000,
      luz: 3500,
      gas: 3800,
      internet: 500,
      agua: 600,
      software: 300,
      conta: 1200,
      mkt: 800,
      otros: 900,
    },

    platillos: [
      {
        nombre: "Comida corrida",
        precio: 95,
        ingredientes: [
          { nombre: "Guisado del día", qty: 220, u: "g", bu: "kg", buyPrice: 110, buyQty: 1, merma: 10 },
          { nombre: "Arroz", qty: 120, u: "g", bu: "kg", buyPrice: 26, buyQty: 1, merma: 0 },
          { nombre: "Frijoles", qty: 100, u: "g", bu: "kg", buyPrice: 38, buyQty: 1, merma: 0 },
          { nombre: "Tortillas", qty: 4, u: "pz", bu: "pz", buyPrice: 0.8, buyQty: 1, merma: 0 },
          { nombre: "Sopa", qty: 250, u: "ml", bu: "l", buyPrice: 18, buyQty: 1, merma: 0 },
        ],
      },
      {
        nombre: "Agua fresca del día",
        precio: 22,
        ingredientes: [
          { nombre: "Fruta de temporada", qty: 90, u: "g", bu: "kg", buyPrice: 24, buyQty: 1, merma: 30 },
          { nombre: "Azúcar", qty: 25, u: "g", bu: "kg", buyPrice: 32, buyQty: 1, merma: 0 },
        ],
      },
      {
        nombre: "Sopa del día",
        precio: 35,
        ingredientes: [
          { nombre: "Verduras y caldo", qty: 300, u: "ml", bu: "l", buyPrice: 20, buyQty: 1, merma: 12 },
        ],
      },
    ],
  },

  "Dark kitchen": {
    ticket: 165,
    margin: 62,

    presupuesto: {
      renta: 20000,
      obra: 14000,
      cocina: 32000,
      refri: 16000,
      mob: 6000,
      uten: 9000,
      inv: 12000,
      permisos: 6000,
      mkt: 12000,
      pos: 4000,
      nomina: 12000,
      fondo: 12000,
      otros: 3000,
    },

    gastosFijos: {
      renta: 9000,
      nomina: 18000,
      luz: 4200,
      gas: 3200,
      internet: 700,
      agua: 500,
      software: 1200,
      conta: 1200,
      mkt: 6000,
      otros: 800,
    },

    platillos: [
      {
        nombre: "Bowl de pollo",
        precio: 159,
        ingredientes: [
          { nombre: "Pechuga de pollo", qty: 180, u: "g", bu: "kg", buyPrice: 145, buyQty: 1, merma: 8 },
          { nombre: "Arroz", qty: 150, u: "g", bu: "kg", buyPrice: 26, buyQty: 1, merma: 0 },
          { nombre: "Verduras", qty: 120, u: "g", bu: "kg", buyPrice: 34, buyQty: 1, merma: 18 },
          { nombre: "Salsa", qty: 40, u: "ml", bu: "l", buyPrice: 110, buyQty: 1, merma: 0 },
        ],
      },
      {
        nombre: "Bowl vegetariano",
        precio: 139,
        ingredientes: [
          { nombre: "Garbanzo", qty: 150, u: "g", bu: "kg", buyPrice: 48, buyQty: 1, merma: 0 },
          { nombre: "Arroz", qty: 150, u: "g", bu: "kg", buyPrice: 26, buyQty: 1, merma: 0 },
          { nombre: "Verduras", qty: 150, u: "g", bu: "kg", buyPrice: 34, buyQty: 1, merma: 18 },
        ],
      },
      {
        nombre: "Postre en vaso",
        precio: 69,
        ingredientes: [
          { nombre: "Base de postre", qty: 1, u: "pz", bu: "pz", buyPrice: 16, buyQty: 1, merma: 0 },
        ],
      },
    ],
  },

  "Marisquería": {
    // PENDIENTE DE REVISIÓN: derivado de BENCH, no medido. Corrige estos montos.
    ticket: 320,
    margin: 65,

    presupuesto: {
      renta: 80000,
      obra: 76000,
      cocina: 91000,
      refri: 46000,
      mob: 40000,
      uten: 24000,
      inv: 34000,
      permisos: 17500,
      mkt: 18500,
      pos: 13000,
      nomina: 40000,
      fondo: 35000,
      otros: 9500,
    },

    gastosFijos: {
      renta: 36500,
      nomina: 63500,
      luz: 12000,
      gas: 8000,
      internet: 1400,
      agua: 1600,
      software: 1300,
      conta: 3500,
      mkt: 6500,
      otros: 2500,
    },

    // Sin platillos todavía: no invento recetas de un giro que no conozco.
    platillos: [],
  },

  "Sushi": {
    // PENDIENTE DE REVISIÓN: derivado de BENCH, no medido. Corrige estos montos.
    ticket: 280,
    margin: 67,

    presupuesto: {
      renta: 72500,
      obra: 69000,
      cocina: 82500,
      refri: 42000,
      mob: 36000,
      uten: 22000,
      inv: 30500,
      permisos: 16000,
      mkt: 17000,
      pos: 11500,
      nomina: 36500,
      fondo: 31500,
      otros: 8500,
    },

    gastosFijos: {
      renta: 33000,
      nomina: 57500,
      luz: 10500,
      gas: 7500,
      internet: 1300,
      agua: 1400,
      software: 1200,
      conta: 3500,
      mkt: 6000,
      otros: 2000,
    },

    // Sin platillos todavía: no invento recetas de un giro que no conozco.
    platillos: [],
  },

  "Otro": {
    // PENDIENTE DE REVISIÓN: promedio de los demás giros. No presume un giro.
    ticket: 150,
    margin: 67,

    presupuesto: {
      renta: 38500,
      obra: 38000,
      cocina: 43500,
      refri: 21500,
      mob: 19500,
      uten: 11000,
      inv: 16000,
      permisos: 8000,
      mkt: 8500,
      pos: 6000,
      nomina: 19000,
      fondo: 16500,
      otros: 4500,
    },

    gastosFijos: {
      renta: 18500,
      nomina: 32500,
      luz: 6000,
      gas: 4000,
      internet: 700,
      agua: 800,
      software: 700,
      conta: 1900,
      mkt: 3500,
      otros: 1200,
    },

    // Sin platillos todavía: no invento recetas de un giro que no conozco.
    platillos: [],
  },
};
