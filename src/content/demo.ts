// Generado por scripts/extraer-diseno.mjs desde el prototipo de diseño.
// El proyecto de ejemplo: presupuesto, gastos fijos, platillos y sub-recetas.
// No edites a mano: vuelve a correr el script.

export const BUDGET: [string, string, number][] = [
  [
    "renta",
    "Renta y depósito",
    45000
  ],
  [
    "obra",
    "Adecuaciones y obra",
    40000
  ],
  [
    "cocina",
    "Cocina y línea caliente",
    45000
  ],
  [
    "refri",
    "Refrigeración",
    22000
  ],
  [
    "mob",
    "Mobiliario",
    18000
  ],
  [
    "uten",
    "Utensilios y loza",
    12000
  ],
  [
    "inv",
    "Inventario inicial",
    18000
  ],
  [
    "permisos",
    "Permisos y trámites",
    9000
  ],
  [
    "mkt",
    "Marketing de apertura",
    8000
  ],
  [
    "pos",
    "Punto de venta",
    6500
  ],
  [
    "nomina",
    "Nómina del primer mes",
    20000
  ],
  [
    "fondo",
    "Fondo de emergencia",
    15000
  ],
  [
    "otros",
    "Otros",
    5000
  ]
];
export const FIXED: [string, string, number][] = [
  [
    "renta",
    "Renta",
    22000
  ],
  [
    "nomina",
    "Nómina",
    38000
  ],
  [
    "luz",
    "Luz",
    6500
  ],
  [
    "gas",
    "Gas",
    4200
  ],
  [
    "internet",
    "Internet",
    700
  ],
  [
    "agua",
    "Agua",
    900
  ],
  [
    "software",
    "Software",
    500
  ],
  [
    "conta",
    "Contabilidad",
    2500
  ],
  [
    "mkt",
    "Marketing",
    3000
  ],
  [
    "otros",
    "Otros",
    1500
  ]
];
export const DISHES = [
  {
    "id": "d1",
    "name": "Taco de pastor",
    "price": 28,
    "ing": [
      {
        "name": "Carne al pastor",
        "qty": 70,
        "u": "g",
        "uc": 0.09
      },
      {
        "name": "Tortilla de maíz",
        "qty": 2,
        "u": "pz",
        "uc": 0.75
      },
      {
        "name": "Piña",
        "qty": 10,
        "u": "g",
        "uc": 0.03
      },
      {
        "name": "Cebolla y cilantro",
        "qty": 15,
        "u": "g",
        "uc": 0.02
      },
      {
        "name": "Salsa de la casa",
        "qty": 15,
        "u": "ml",
        "uc": 0.03
      }
    ]
  },
  {
    "id": "d2",
    "name": "Hamburguesa clásica",
    "price": 129,
    "ing": [
      {
        "name": "Carne molida",
        "qty": 150,
        "u": "g",
        "uc": 0.14
      },
      {
        "name": "Pan brioche",
        "qty": 1,
        "u": "pz",
        "uc": 8
      },
      {
        "name": "Queso cheddar",
        "qty": 20,
        "u": "g",
        "uc": 0.22
      },
      {
        "name": "Jitomate y lechuga",
        "qty": 30,
        "u": "g",
        "uc": 0.04
      },
      {
        "name": "Aderezo de la casa",
        "qty": 20,
        "u": "ml",
        "uc": 0.06
      }
    ]
  },
  {
    "id": "d3",
    "name": "Orden de alitas (12 pz)",
    "price": 149,
    "ing": [
      {
        "name": "Alitas de pollo",
        "qty": 700,
        "u": "g",
        "uc": 0.075
      },
      {
        "name": "Salsa búfalo",
        "qty": 60,
        "u": "ml",
        "uc": 0.09
      },
      {
        "name": "Apio y zanahoria",
        "qty": 40,
        "u": "g",
        "uc": 0.03
      },
      {
        "name": "Aderezo ranch",
        "qty": 40,
        "u": "ml",
        "uc": 0.08
      },
      {
        "name": "Empaque y servilletas",
        "qty": 1,
        "u": "pz",
        "uc": 2
      }
    ]
  },
  {
    "id": "d4",
    "name": "Latte 12 oz",
    "price": 55,
    "ing": [
      {
        "name": "Leche entera",
        "qty": 240,
        "u": "ml",
        "uc": 0.026
      },
      {
        "name": "Café de especialidad",
        "qty": 18,
        "u": "g",
        "uc": 0.35
      },
      {
        "name": "Vaso y tapa",
        "qty": 1,
        "u": "pz",
        "uc": 2.5
      }
    ]
  }
];
export const SUBRECIPES = [
  {
    "id": "sr1",
    "name": "Salsa roja de la casa",
    "yieldQty": 3000,
    "u": "ml",
    "ing": [
      {
        "name": "Jitomate",
        "qty": 3,
        "u": "kg",
        "bu": "kg",
        "buyPrice": 28,
        "buyQty": 1,
        "merma": 10
      },
      {
        "name": "Chile de árbol",
        "qty": 200,
        "u": "g",
        "bu": "kg",
        "buyPrice": 180,
        "buyQty": 1,
        "merma": 5
      },
      {
        "name": "Ajo",
        "qty": 100,
        "u": "g",
        "bu": "kg",
        "buyPrice": 90,
        "buyQty": 1,
        "merma": 12
      },
      {
        "name": "Sal",
        "qty": 60,
        "u": "g",
        "bu": "kg",
        "buyPrice": 14,
        "buyQty": 1,
        "merma": 0
      }
    ]
  },
  {
    "id": "sr2",
    "name": "Adobo para pastor",
    "yieldQty": 2000,
    "u": "g",
    "ing": [
      {
        "name": "Chile guajillo",
        "qty": 500,
        "u": "g",
        "bu": "kg",
        "buyPrice": 160,
        "buyQty": 1,
        "merma": 8
      },
      {
        "name": "Achiote",
        "qty": 300,
        "u": "g",
        "bu": "kg",
        "buyPrice": 120,
        "buyQty": 1,
        "merma": 0
      },
      {
        "name": "Vinagre",
        "qty": 700,
        "u": "ml",
        "bu": "l",
        "buyPrice": 22,
        "buyQty": 1,
        "merma": 0
      },
      {
        "name": "Especias",
        "qty": 120,
        "u": "g",
        "bu": "kg",
        "buyPrice": 210,
        "buyQty": 1,
        "merma": 0
      }
    ]
  }
];
export const LAYOUTS = [
  {
    "id": "p1",
    "name": "1 hoja, 1 página",
    "hint": "Un solo lado impreso",
    "panels": 1,
    "labels": [
      "Página única"
    ]
  },
  {
    "id": "p2",
    "name": "1 hoja, 2 páginas",
    "hint": "Frente y vuelta",
    "panels": 2,
    "labels": [
      "Frente",
      "Vuelta"
    ]
  },
  {
    "id": "tri",
    "name": "Tríptico",
    "hint": "1 hoja doblada en 3 paneles",
    "panels": 3,
    "labels": [
      "Panel 1 (portada interior)",
      "Panel 2 (centro)",
      "Panel 3"
    ]
  },
  {
    "id": "book",
    "name": "2 hojas tipo libro",
    "hint": "4 páginas",
    "panels": 4,
    "labels": [
      "Página 1",
      "Página 2",
      "Página 3",
      "Página 4"
    ]
  }
];
export const UNITS: [string, number, string][] = [
  [
    "g",
    1,
    "masa"
  ],
  [
    "kg",
    1000,
    "masa"
  ],
  [
    "oz",
    28.35,
    "masa"
  ],
  [
    "lb",
    453.6,
    "masa"
  ],
  [
    "ml",
    1,
    "vol"
  ],
  [
    "l",
    1000,
    "vol"
  ],
  [
    "taza",
    240,
    "vol"
  ],
  [
    "cda",
    15,
    "vol"
  ],
  [
    "pz",
    1,
    "pieza"
  ],
  [
    "manojo",
    1,
    "pieza"
  ]
];
/** Explicaciones de los botones (i): [título, qué es, cómo se calcula]. */
export const INFO: Record<string, [string, string, string]> = {
  "costo": [
    "Costo por porción",
    "Es la suma de lo que te cuestan los ingredientes de UNA porción del platillo, tal como lo sirves.",
    "Suma de (cantidad × precio unitario) de cada ingrediente"
  ],
  "food": [
    "Food cost (% costo de alimentos)",
    "Qué parte del precio de venta se va en ingredientes. Es el indicador más importante de tu carta: hasta 30% es sano, de 30% a 38% hay que revisarlo y arriba de 38% el platillo casi no deja utilidad.",
    "Costo por porción ÷ precio de venta × 100"
  ],
  "precio": [
    "Precio de venta",
    "Lo que le cobras al cliente por el platillo. Debe cubrir ingredientes, gastos fijos y tu utilidad, no solo el insumo.",
    "Costo por porción ÷ food cost objetivo"
  ],
  "utilidad": [
    "Utilidad bruta",
    "Lo que te queda de cada platillo después de pagar sus ingredientes. Todavía no descuenta renta, nómina ni luz.",
    "Precio de venta − costo por porción"
  ],
  "margen": [
    "Margen bruto",
    "La utilidad bruta expresada en porcentaje del precio. Es el complemento del food cost y alimenta tu punto de equilibrio.",
    "(Precio − costo) ÷ precio × 100"
  ],
  "semaforo": [
    "Semáforo de rentabilidad",
    "Traduce tu food cost a una señal simple: verde para conservar el platillo, amarillo para ajustarlo y rojo para subir precio, reducir porción o quitarlo de la carta.",
    "Verde ≤ 30% · Amarillo 30–38% · Rojo > 38%"
  ],
  "sugerido": [
    "Precio sugerido",
    "El precio que necesitarías para alcanzar tu food cost objetivo con el costo actual de ingredientes. Úsalo como piso, luego compáralo con el mercado.",
    "Costo por porción ÷ food cost objetivo"
  ],
  "unitario": [
    "Precio unitario",
    "Cuánto te cuesta UNA unidad del insumo: un gramo, un mililitro o una pieza. Si compras un kilo en $90, tu precio unitario es $0.09 por gramo.",
    "Precio de compra ÷ unidades compradas"
  ]
};

// ── Adaptador al dominio ───────────────────────────────────────────────────

import type { Dish, Subrecipe, Ingredient } from '@/domain/types';
import type { UnitCode } from '@/domain/units';

type ProtoIng = {
  name: string;
  qty: number;
  u: string;
  uc?: number;
  bu?: string;
  buyPrice?: number;
  buyQty?: number;
  merma?: number;
  sub?: string;
};

const toIngredient = (ing: ProtoIng, id: string): Ingredient => ({
  id,
  name: ing.name,
  qty: ing.qty,
  unit: ing.u as UnitCode,
  ...(ing.uc !== undefined ? { unitPrice: ing.uc } : {}),
  ...(ing.buyPrice !== undefined ? { buyPrice: ing.buyPrice } : {}),
  ...(ing.buyQty !== undefined ? { buyQty: ing.buyQty } : {}),
  ...(ing.bu !== undefined ? { buyUnit: ing.bu as UnitCode } : {}),
  ...(ing.merma !== undefined ? { waste: ing.merma } : {}),
  ...(ing.sub !== undefined ? { subrecipeId: ing.sub } : {}),
});

export const DEMO_DISHES: readonly Dish[] = DISHES.map((d) => ({
  id: d.id,
  name: d.name,
  price: d.price,
  ingredients: (d.ing as ProtoIng[]).map((ing, i) => toIngredient(ing, d.id + 'i' + i)),
}));

export const DEMO_SUBRECIPES: readonly Subrecipe[] = SUBRECIPES.map((s) => ({
  id: s.id,
  name: s.name,
  yieldQty: s.yieldQty,
  unit: s.u as UnitCode,
  ingredients: (s.ing as ProtoIng[]).map((ing, i) => toIngredient(ing, s.id + 'i' + i)),
}));
