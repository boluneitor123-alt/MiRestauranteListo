// Generado por scripts/extraer-diseno.mjs desde el prototipo de diseño.
// Plantillas por tipo de negocio (GIROS, TEMPLATES) y rangos de referencia (BENCH).
// No edites a mano: vuelve a correr el script.

export const GIROS: string[][] = [
  [
    "Taquería",
    "$180k – $350k",
    "30% – 33%",
    "$120",
    "3 a 5 personas"
  ],
  [
    "Hamburguesería",
    "$250k – $500k",
    "30% – 34%",
    "$180",
    "4 a 6 personas"
  ],
  [
    "Cafetería",
    "$200k – $450k",
    "22% – 28%",
    "$95",
    "3 a 4 personas"
  ],
  [
    "Marisquería",
    "$350k – $700k",
    "33% – 38%",
    "$290",
    "5 a 8 personas"
  ],
  [
    "Sushi",
    "$300k – $650k",
    "28% – 32%",
    "$250",
    "4 a 6 personas"
  ],
  [
    "Alitas",
    "$200k – $400k",
    "32% – 36%",
    "$190",
    "3 a 5 personas"
  ],
  [
    "Pizzería",
    "$250k – $500k",
    "25% – 30%",
    "$170",
    "3 a 5 personas"
  ],
  [
    "Fonda",
    "$80k – $180k",
    "30% – 35%",
    "$85",
    "2 a 3 personas"
  ],
  [
    "Dark kitchen",
    "$60k – $150k",
    "28% – 32%",
    "$150",
    "2 a 3 personas"
  ],
  [
    "Otro",
    "Depende del formato",
    "28% – 35%",
    "Por definir",
    "Por definir"
  ]
];

export type Bench = { fc: [number, number]; renta: [number, number]; nomina: [number, number]; ticket: number };

/** Rangos de referencia por giro: food cost %, renta y nómina como % de venta. */
export const BENCH: Record<string, Bench> = {
  "Taquería": {
    "fc": [
      28,
      34
    ],
    "renta": [
      6,
      9
    ],
    "nomina": [
      20,
      26
    ],
    "ticket": 130
  },
  "Hamburguesería": {
    "fc": [
      30,
      35
    ],
    "renta": [
      7,
      10
    ],
    "nomina": [
      24,
      30
    ],
    "ticket": 190
  },
  "Cafetería": {
    "fc": [
      24,
      30
    ],
    "renta": [
      8,
      12
    ],
    "nomina": [
      25,
      32
    ],
    "ticket": 105
  },
  "Marisquería": {
    "fc": [
      32,
      38
    ],
    "renta": [
      7,
      10
    ],
    "nomina": [
      24,
      30
    ],
    "ticket": 320
  },
  "Sushi": {
    "fc": [
      30,
      36
    ],
    "renta": [
      8,
      11
    ],
    "nomina": [
      26,
      32
    ],
    "ticket": 280
  },
  "Alitas": {
    "fc": [
      30,
      36
    ],
    "renta": [
      7,
      10
    ],
    "nomina": [
      22,
      28
    ],
    "ticket": 195
  },
  "Pizzería": {
    "fc": [
      26,
      32
    ],
    "renta": [
      7,
      10
    ],
    "nomina": [
      22,
      28
    ],
    "ticket": 180
  },
  "Fonda": {
    "fc": [
      30,
      36
    ],
    "renta": [
      5,
      8
    ],
    "nomina": [
      18,
      24
    ],
    "ticket": 95
  },
  "Dark kitchen": {
    "fc": [
      28,
      34
    ],
    "renta": [
      4,
      7
    ],
    "nomina": [
      18,
      24
    ],
    "ticket": 165
  },
  "Otro": {
    "fc": [
      28,
      32
    ],
    "renta": [
      8,
      10
    ],
    "nomina": [
      25,
      30
    ],
    "ticket": 150
  }
};

export const TEMPLATES = {
  "Taquería": {
    "ticket": 130,
    "margin": 68,
    "budget": {
      "renta": 40000,
      "obra": 35000,
      "cocina": 42000,
      "refri": 20000,
      "mob": 16000,
      "uten": 10000,
      "inv": 15000,
      "permisos": 9000,
      "mkt": 7000,
      "pos": 6000,
      "nomina": 18000,
      "fondo": 15000,
      "otros": 4000
    },
    "fixed": {
      "renta": 18000,
      "nomina": 32000,
      "luz": 5500,
      "gas": 4500,
      "internet": 600,
      "agua": 800,
      "software": 400,
      "conta": 2000,
      "mkt": 2500,
      "otros": 1200
    },
    "dishes": [
      {
        "name": "Taco de pastor",
        "price": 28,
        "cat": "Fuertes",
        "pop": "alta",
        "ing": [
          {
            "name": "Carne al pastor",
            "qty": 70,
            "u": "g",
            "bu": "kg",
            "buyPrice": 165,
            "buyQty": 1,
            "merma": 8
          },
          {
            "name": "Tortilla de maíz",
            "qty": 2,
            "u": "pz",
            "bu": "pz",
            "buyPrice": 0.8,
            "buyQty": 1,
            "merma": 0
          },
          {
            "name": "Piña",
            "qty": 10,
            "u": "g",
            "bu": "kg",
            "buyPrice": 28,
            "buyQty": 1,
            "merma": 35
          },
          {
            "name": "Cebolla y cilantro",
            "qty": 15,
            "u": "g",
            "bu": "kg",
            "buyPrice": 22,
            "buyQty": 1,
            "merma": 20
          }
        ]
      },
      {
        "name": "Taco de bistec",
        "price": 32,
        "cat": "Fuertes",
        "pop": "alta",
        "ing": [
          {
            "name": "Bistec de res",
            "qty": 75,
            "u": "g",
            "bu": "kg",
            "buyPrice": 210,
            "buyQty": 1,
            "merma": 12
          },
          {
            "name": "Tortilla de maíz",
            "qty": 2,
            "u": "pz",
            "bu": "pz",
            "buyPrice": 0.8,
            "buyQty": 1,
            "merma": 0
          },
          {
            "name": "Cebolla y cilantro",
            "qty": 15,
            "u": "g",
            "bu": "kg",
            "buyPrice": 22,
            "buyQty": 1,
            "merma": 20
          }
        ]
      },
      {
        "name": "Gringa",
        "price": 65,
        "cat": "Fuertes",
        "pop": "media",
        "ing": [
          {
            "name": "Carne al pastor",
            "qty": 90,
            "u": "g",
            "bu": "kg",
            "buyPrice": 165,
            "buyQty": 1,
            "merma": 8
          },
          {
            "name": "Tortilla de harina",
            "qty": 1,
            "u": "pz",
            "bu": "pz",
            "buyPrice": 3.5,
            "buyQty": 1,
            "merma": 0
          },
          {
            "name": "Queso manchego",
            "qty": 40,
            "u": "g",
            "bu": "kg",
            "buyPrice": 180,
            "buyQty": 1,
            "merma": 0
          }
        ]
      },
      {
        "name": "Orden de quesadillas",
        "price": 75,
        "cat": "Entradas",
        "pop": "media",
        "ing": [
          {
            "name": "Tortilla de maíz",
            "qty": 3,
            "u": "pz",
            "bu": "pz",
            "buyPrice": 0.8,
            "buyQty": 1,
            "merma": 0
          },
          {
            "name": "Queso Oaxaca",
            "qty": 90,
            "u": "g",
            "bu": "kg",
            "buyPrice": 155,
            "buyQty": 1,
            "merma": 0
          }
        ]
      },
      {
        "name": "Agua de horchata",
        "price": 32,
        "cat": "Bebidas",
        "pop": "alta",
        "ing": [
          {
            "name": "Arroz",
            "qty": 30,
            "u": "g",
            "bu": "kg",
            "buyPrice": 26,
            "buyQty": 1,
            "merma": 0
          },
          {
            "name": "Leche",
            "qty": 150,
            "u": "ml",
            "bu": "l",
            "buyPrice": 26,
            "buyQty": 1,
            "merma": 0
          },
          {
            "name": "Azúcar y canela",
            "qty": 25,
            "u": "g",
            "bu": "kg",
            "buyPrice": 32,
            "buyQty": 1,
            "merma": 0
          },
          {
            "name": "Vaso y popote",
            "qty": 1,
            "u": "pz",
            "bu": "pz",
            "buyPrice": 1.8,
            "buyQty": 1,
            "merma": 0
          }
        ]
      },
      {
        "name": "Refresco de lata",
        "price": 30,
        "cat": "Bebidas",
        "pop": "alta",
        "ing": [
          {
            "name": "Refresco",
            "qty": 1,
            "u": "pz",
            "bu": "pz",
            "buyPrice": 12,
            "buyQty": 1,
            "merma": 0
          }
        ]
      }
    ]
  },
  "Hamburguesería": {
    "ticket": 190,
    "margin": 66,
    "budget": {
      "renta": 50000,
      "obra": 55000,
      "cocina": 60000,
      "refri": 30000,
      "mob": 28000,
      "uten": 14000,
      "inv": 22000,
      "permisos": 9000,
      "mkt": 10000,
      "pos": 8000,
      "nomina": 26000,
      "fondo": 22000,
      "otros": 6000
    },
    "fixed": {
      "renta": 26000,
      "nomina": 46000,
      "luz": 8500,
      "gas": 4200,
      "internet": 800,
      "agua": 1100,
      "software": 700,
      "conta": 2500,
      "mkt": 4000,
      "otros": 1500
    },
    "dishes": [
      {
        "name": "Hamburguesa clásica",
        "price": 129,
        "cat": "Fuertes",
        "pop": "alta",
        "ing": [
          {
            "name": "Carne molida",
            "qty": 150,
            "u": "g",
            "bu": "kg",
            "buyPrice": 168,
            "buyQty": 1,
            "merma": 5
          },
          {
            "name": "Pan brioche",
            "qty": 1,
            "u": "pz",
            "bu": "pz",
            "buyPrice": 8,
            "buyQty": 1,
            "merma": 0
          },
          {
            "name": "Queso cheddar",
            "qty": 20,
            "u": "g",
            "bu": "kg",
            "buyPrice": 210,
            "buyQty": 1,
            "merma": 0
          },
          {
            "name": "Jitomate y lechuga",
            "qty": 30,
            "u": "g",
            "bu": "kg",
            "buyPrice": 38,
            "buyQty": 1,
            "merma": 18
          }
        ]
      },
      {
        "name": "Hamburguesa con tocino",
        "price": 159,
        "cat": "Fuertes",
        "pop": "alta",
        "ing": [
          {
            "name": "Carne molida",
            "qty": 150,
            "u": "g",
            "bu": "kg",
            "buyPrice": 168,
            "buyQty": 1,
            "merma": 5
          },
          {
            "name": "Tocino",
            "qty": 40,
            "u": "g",
            "bu": "kg",
            "buyPrice": 195,
            "buyQty": 1,
            "merma": 12
          },
          {
            "name": "Pan brioche",
            "qty": 1,
            "u": "pz",
            "bu": "pz",
            "buyPrice": 8,
            "buyQty": 1,
            "merma": 0
          },
          {
            "name": "Queso cheddar",
            "qty": 20,
            "u": "g",
            "bu": "kg",
            "buyPrice": 210,
            "buyQty": 1,
            "merma": 0
          }
        ]
      },
      {
        "name": "Papas a la francesa",
        "price": 65,
        "cat": "Entradas",
        "pop": "alta",
        "ing": [
          {
            "name": "Papa",
            "qty": 200,
            "u": "g",
            "bu": "kg",
            "buyPrice": 28,
            "buyQty": 1,
            "merma": 20
          },
          {
            "name": "Aceite",
            "qty": 40,
            "u": "ml",
            "bu": "l",
            "buyPrice": 42,
            "buyQty": 1,
            "merma": 0
          },
          {
            "name": "Sal y especias",
            "qty": 5,
            "u": "g",
            "bu": "kg",
            "buyPrice": 30,
            "buyQty": 1,
            "merma": 0
          }
        ]
      },
      {
        "name": "Aros de cebolla",
        "price": 75,
        "cat": "Entradas",
        "pop": "baja",
        "ing": [
          {
            "name": "Cebolla",
            "qty": 150,
            "u": "g",
            "bu": "kg",
            "buyPrice": 24,
            "buyQty": 1,
            "merma": 25
          },
          {
            "name": "Harina y capeado",
            "qty": 60,
            "u": "g",
            "bu": "kg",
            "buyPrice": 28,
            "buyQty": 1,
            "merma": 0
          },
          {
            "name": "Aceite",
            "qty": 50,
            "u": "ml",
            "bu": "l",
            "buyPrice": 42,
            "buyQty": 1,
            "merma": 0
          }
        ]
      },
      {
        "name": "Malteada",
        "price": 79,
        "cat": "Bebidas",
        "pop": "media",
        "ing": [
          {
            "name": "Helado",
            "qty": 150,
            "u": "g",
            "bu": "kg",
            "buyPrice": 120,
            "buyQty": 1,
            "merma": 0
          },
          {
            "name": "Leche",
            "qty": 120,
            "u": "ml",
            "bu": "l",
            "buyPrice": 26,
            "buyQty": 1,
            "merma": 0
          },
          {
            "name": "Vaso y popote",
            "qty": 1,
            "u": "pz",
            "bu": "pz",
            "buyPrice": 3.5,
            "buyQty": 1,
            "merma": 0
          }
        ]
      },
      {
        "name": "Brownie con helado",
        "price": 79,
        "cat": "Postres",
        "pop": "baja",
        "ing": [
          {
            "name": "Brownie",
            "qty": 1,
            "u": "pz",
            "bu": "pz",
            "buyPrice": 14,
            "buyQty": 1,
            "merma": 0
          },
          {
            "name": "Helado",
            "qty": 90,
            "u": "g",
            "bu": "kg",
            "buyPrice": 120,
            "buyQty": 1,
            "merma": 0
          }
        ]
      }
    ]
  },
  "Cafetería": {
    "ticket": 105,
    "margin": 74,
    "budget": {
      "renta": 45000,
      "obra": 50000,
      "cocina": 30000,
      "refri": 22000,
      "mob": 30000,
      "uten": 12000,
      "inv": 14000,
      "permisos": 8000,
      "mkt": 9000,
      "pos": 7000,
      "nomina": 20000,
      "fondo": 18000,
      "otros": 5000
    },
    "fixed": {
      "renta": 22000,
      "nomina": 34000,
      "luz": 6000,
      "gas": 1800,
      "internet": 900,
      "agua": 700,
      "software": 800,
      "conta": 2000,
      "mkt": 3000,
      "otros": 1200
    },
    "dishes": [
      {
        "name": "Latte 12 oz",
        "price": 58,
        "cat": "Bebidas",
        "pop": "alta",
        "ing": [
          {
            "name": "Café de especialidad",
            "qty": 18,
            "u": "g",
            "bu": "kg",
            "buyPrice": 380,
            "buyQty": 1,
            "merma": 0
          },
          {
            "name": "Leche entera",
            "qty": 240,
            "u": "ml",
            "bu": "l",
            "buyPrice": 26,
            "buyQty": 1,
            "merma": 0
          },
          {
            "name": "Vaso y tapa",
            "qty": 1,
            "u": "pz",
            "bu": "pz",
            "buyPrice": 2.5,
            "buyQty": 1,
            "merma": 0
          }
        ]
      },
      {
        "name": "Americano",
        "price": 45,
        "cat": "Bebidas",
        "pop": "alta",
        "ing": [
          {
            "name": "Café de especialidad",
            "qty": 18,
            "u": "g",
            "bu": "kg",
            "buyPrice": 380,
            "buyQty": 1,
            "merma": 0
          },
          {
            "name": "Vaso y tapa",
            "qty": 1,
            "u": "pz",
            "bu": "pz",
            "buyPrice": 2.5,
            "buyQty": 1,
            "merma": 0
          }
        ]
      },
      {
        "name": "Chai latte",
        "price": 68,
        "cat": "Bebidas",
        "pop": "media",
        "ing": [
          {
            "name": "Concentrado de chai",
            "qty": 60,
            "u": "ml",
            "bu": "l",
            "buyPrice": 190,
            "buyQty": 1,
            "merma": 0
          },
          {
            "name": "Leche entera",
            "qty": 220,
            "u": "ml",
            "bu": "l",
            "buyPrice": 26,
            "buyQty": 1,
            "merma": 0
          },
          {
            "name": "Vaso y tapa",
            "qty": 1,
            "u": "pz",
            "bu": "pz",
            "buyPrice": 2.5,
            "buyQty": 1,
            "merma": 0
          }
        ]
      },
      {
        "name": "Croissant de jamón y queso",
        "price": 79,
        "cat": "Fuertes",
        "pop": "alta",
        "ing": [
          {
            "name": "Croissant",
            "qty": 1,
            "u": "pz",
            "bu": "pz",
            "buyPrice": 14,
            "buyQty": 1,
            "merma": 0
          },
          {
            "name": "Jamón",
            "qty": 40,
            "u": "g",
            "bu": "kg",
            "buyPrice": 145,
            "buyQty": 1,
            "merma": 0
          },
          {
            "name": "Queso manchego",
            "qty": 30,
            "u": "g",
            "bu": "kg",
            "buyPrice": 180,
            "buyQty": 1,
            "merma": 0
          }
        ]
      },
      {
        "name": "Bagel con salmón",
        "price": 145,
        "cat": "Fuertes",
        "pop": "baja",
        "ing": [
          {
            "name": "Bagel",
            "qty": 1,
            "u": "pz",
            "bu": "pz",
            "buyPrice": 18,
            "buyQty": 1,
            "merma": 0
          },
          {
            "name": "Salmón curado",
            "qty": 60,
            "u": "g",
            "bu": "kg",
            "buyPrice": 620,
            "buyQty": 1,
            "merma": 5
          },
          {
            "name": "Queso crema",
            "qty": 40,
            "u": "g",
            "bu": "kg",
            "buyPrice": 190,
            "buyQty": 1,
            "merma": 0
          }
        ]
      },
      {
        "name": "Rebanada de pastel",
        "price": 72,
        "cat": "Postres",
        "pop": "media",
        "ing": [
          {
            "name": "Pastel por rebanada",
            "qty": 1,
            "u": "pz",
            "bu": "pz",
            "buyPrice": 22,
            "buyQty": 1,
            "merma": 0
          }
        ]
      }
    ]
  },
  "Pizzería": {
    "ticket": 180,
    "margin": 70,
    "budget": {
      "renta": 48000,
      "obra": 52000,
      "cocina": 65000,
      "refri": 26000,
      "mob": 24000,
      "uten": 13000,
      "inv": 18000,
      "permisos": 9000,
      "mkt": 9000,
      "pos": 7000,
      "nomina": 24000,
      "fondo": 20000,
      "otros": 5000
    },
    "fixed": {
      "renta": 24000,
      "nomina": 40000,
      "luz": 7000,
      "gas": 6000,
      "internet": 800,
      "agua": 1000,
      "software": 700,
      "conta": 2200,
      "mkt": 3500,
      "otros": 1400
    },
    "dishes": [
      {
        "name": "Pizza margarita mediana",
        "price": 179,
        "cat": "Fuertes",
        "pop": "alta",
        "ing": [
          {
            "name": "Masa",
            "qty": 280,
            "u": "g",
            "bu": "kg",
            "buyPrice": 32,
            "buyQty": 1,
            "merma": 0
          },
          {
            "name": "Salsa de tomate",
            "qty": 120,
            "u": "ml",
            "bu": "l",
            "buyPrice": 48,
            "buyQty": 1,
            "merma": 0
          },
          {
            "name": "Queso mozzarella",
            "qty": 180,
            "u": "g",
            "bu": "kg",
            "buyPrice": 165,
            "buyQty": 1,
            "merma": 0
          },
          {
            "name": "Albahaca",
            "qty": 5,
            "u": "g",
            "bu": "kg",
            "buyPrice": 220,
            "buyQty": 1,
            "merma": 15
          }
        ]
      },
      {
        "name": "Pizza pepperoni mediana",
        "price": 199,
        "cat": "Fuertes",
        "pop": "alta",
        "ing": [
          {
            "name": "Masa",
            "qty": 280,
            "u": "g",
            "bu": "kg",
            "buyPrice": 32,
            "buyQty": 1,
            "merma": 0
          },
          {
            "name": "Salsa de tomate",
            "qty": 120,
            "u": "ml",
            "bu": "l",
            "buyPrice": 48,
            "buyQty": 1,
            "merma": 0
          },
          {
            "name": "Queso mozzarella",
            "qty": 180,
            "u": "g",
            "bu": "kg",
            "buyPrice": 165,
            "buyQty": 1,
            "merma": 0
          },
          {
            "name": "Pepperoni",
            "qty": 70,
            "u": "g",
            "bu": "kg",
            "buyPrice": 240,
            "buyQty": 1,
            "merma": 0
          }
        ]
      },
      {
        "name": "Pan de ajo",
        "price": 69,
        "cat": "Entradas",
        "pop": "media",
        "ing": [
          {
            "name": "Masa",
            "qty": 150,
            "u": "g",
            "bu": "kg",
            "buyPrice": 32,
            "buyQty": 1,
            "merma": 0
          },
          {
            "name": "Mantequilla y ajo",
            "qty": 30,
            "u": "g",
            "bu": "kg",
            "buyPrice": 120,
            "buyQty": 1,
            "merma": 0
          },
          {
            "name": "Queso mozzarella",
            "qty": 50,
            "u": "g",
            "bu": "kg",
            "buyPrice": 165,
            "buyQty": 1,
            "merma": 0
          }
        ]
      },
      {
        "name": "Ensalada césar",
        "price": 95,
        "cat": "Entradas",
        "pop": "baja",
        "ing": [
          {
            "name": "Lechuga romana",
            "qty": 150,
            "u": "g",
            "bu": "kg",
            "buyPrice": 42,
            "buyQty": 1,
            "merma": 25
          },
          {
            "name": "Aderezo césar",
            "qty": 40,
            "u": "ml",
            "bu": "l",
            "buyPrice": 120,
            "buyQty": 1,
            "merma": 0
          },
          {
            "name": "Queso parmesano",
            "qty": 20,
            "u": "g",
            "bu": "kg",
            "buyPrice": 380,
            "buyQty": 1,
            "merma": 0
          }
        ]
      },
      {
        "name": "Refresco 600 ml",
        "price": 35,
        "cat": "Bebidas",
        "pop": "alta",
        "ing": [
          {
            "name": "Refresco",
            "qty": 1,
            "u": "pz",
            "bu": "pz",
            "buyPrice": 14,
            "buyQty": 1,
            "merma": 0
          }
        ]
      }
    ]
  },
  "Alitas": {
    "ticket": 195,
    "margin": 64,
    "budget": {
      "renta": 42000,
      "obra": 42000,
      "cocina": 48000,
      "refri": 24000,
      "mob": 22000,
      "uten": 12000,
      "inv": 20000,
      "permisos": 9000,
      "mkt": 9000,
      "pos": 7000,
      "nomina": 22000,
      "fondo": 18000,
      "otros": 5000
    },
    "fixed": {
      "renta": 21000,
      "nomina": 36000,
      "luz": 7500,
      "gas": 5200,
      "internet": 800,
      "agua": 1000,
      "software": 600,
      "conta": 2000,
      "mkt": 3500,
      "otros": 1300
    },
    "dishes": [
      {
        "name": "Orden de alitas (12 piezas)",
        "price": 189,
        "cat": "Fuertes",
        "pop": "alta",
        "ing": [
          {
            "name": "Alitas de pollo",
            "qty": 700,
            "u": "g",
            "bu": "kg",
            "buyPrice": 95,
            "buyQty": 1,
            "merma": 6
          },
          {
            "name": "Salsa búfalo",
            "qty": 60,
            "u": "ml",
            "bu": "l",
            "buyPrice": 145,
            "buyQty": 1,
            "merma": 0
          },
          {
            "name": "Aderezo ranch",
            "qty": 40,
            "u": "ml",
            "bu": "l",
            "buyPrice": 120,
            "buyQty": 1,
            "merma": 0
          },
          {
            "name": "Apio y zanahoria",
            "qty": 40,
            "u": "g",
            "bu": "kg",
            "buyPrice": 30,
            "buyQty": 1,
            "merma": 20
          }
        ]
      },
      {
        "name": "Boneless 300 g",
        "price": 165,
        "cat": "Fuertes",
        "pop": "alta",
        "ing": [
          {
            "name": "Pechuga de pollo",
            "qty": 300,
            "u": "g",
            "bu": "kg",
            "buyPrice": 145,
            "buyQty": 1,
            "merma": 8
          },
          {
            "name": "Capeado",
            "qty": 60,
            "u": "g",
            "bu": "kg",
            "buyPrice": 30,
            "buyQty": 1,
            "merma": 0
          },
          {
            "name": "Salsa BBQ",
            "qty": 60,
            "u": "ml",
            "bu": "l",
            "buyPrice": 110,
            "buyQty": 1,
            "merma": 0
          }
        ]
      },
      {
        "name": "Papas gajo",
        "price": 75,
        "cat": "Entradas",
        "pop": "media",
        "ing": [
          {
            "name": "Papa",
            "qty": 220,
            "u": "g",
            "bu": "kg",
            "buyPrice": 28,
            "buyQty": 1,
            "merma": 18
          },
          {
            "name": "Aceite",
            "qty": 45,
            "u": "ml",
            "bu": "l",
            "buyPrice": 42,
            "buyQty": 1,
            "merma": 0
          }
        ]
      },
      {
        "name": "Cerveza de barril",
        "price": 65,
        "cat": "Bebidas",
        "pop": "alta",
        "ing": [
          {
            "name": "Cerveza",
            "qty": 400,
            "u": "ml",
            "bu": "l",
            "buyPrice": 38,
            "buyQty": 1,
            "merma": 0
          },
          {
            "name": "Vaso",
            "qty": 1,
            "u": "pz",
            "bu": "pz",
            "buyPrice": 1.2,
            "buyQty": 1,
            "merma": 0
          }
        ]
      }
    ]
  },
  "Fonda": {
    "ticket": 95,
    "margin": 66,
    "budget": {
      "renta": 24000,
      "obra": 18000,
      "cocina": 26000,
      "refri": 14000,
      "mob": 12000,
      "uten": 8000,
      "inv": 10000,
      "permisos": 6000,
      "mkt": 3000,
      "pos": 3500,
      "nomina": 12000,
      "fondo": 10000,
      "otros": 3000
    },
    "fixed": {
      "renta": 11000,
      "nomina": 20000,
      "luz": 3500,
      "gas": 3800,
      "internet": 500,
      "agua": 600,
      "software": 300,
      "conta": 1200,
      "mkt": 800,
      "otros": 900
    },
    "dishes": [
      {
        "name": "Comida corrida",
        "price": 95,
        "cat": "Fuertes",
        "pop": "alta",
        "ing": [
          {
            "name": "Guisado del día",
            "qty": 220,
            "u": "g",
            "bu": "kg",
            "buyPrice": 110,
            "buyQty": 1,
            "merma": 10
          },
          {
            "name": "Arroz",
            "qty": 120,
            "u": "g",
            "bu": "kg",
            "buyPrice": 26,
            "buyQty": 1,
            "merma": 0
          },
          {
            "name": "Frijoles",
            "qty": 100,
            "u": "g",
            "bu": "kg",
            "buyPrice": 38,
            "buyQty": 1,
            "merma": 0
          },
          {
            "name": "Tortillas",
            "qty": 4,
            "u": "pz",
            "bu": "pz",
            "buyPrice": 0.8,
            "buyQty": 1,
            "merma": 0
          },
          {
            "name": "Sopa",
            "qty": 250,
            "u": "ml",
            "bu": "l",
            "buyPrice": 18,
            "buyQty": 1,
            "merma": 0
          }
        ]
      },
      {
        "name": "Sopa del día",
        "price": 35,
        "cat": "Entradas",
        "pop": "media",
        "ing": [
          {
            "name": "Verduras y caldo",
            "qty": 300,
            "u": "ml",
            "bu": "l",
            "buyPrice": 20,
            "buyQty": 1,
            "merma": 12
          }
        ]
      },
      {
        "name": "Agua fresca del día",
        "price": 22,
        "cat": "Bebidas",
        "pop": "alta",
        "ing": [
          {
            "name": "Fruta de temporada",
            "qty": 90,
            "u": "g",
            "bu": "kg",
            "buyPrice": 24,
            "buyQty": 1,
            "merma": 30
          },
          {
            "name": "Azúcar",
            "qty": 25,
            "u": "g",
            "bu": "kg",
            "buyPrice": 32,
            "buyQty": 1,
            "merma": 0
          }
        ]
      },
      {
        "name": "Gelatina",
        "price": 22,
        "cat": "Postres",
        "pop": "media",
        "ing": [
          {
            "name": "Gelatina preparada",
            "qty": 1,
            "u": "pz",
            "bu": "pz",
            "buyPrice": 5,
            "buyQty": 1,
            "merma": 0
          }
        ]
      }
    ]
  },
  "Dark kitchen": {
    "ticket": 165,
    "margin": 62,
    "budget": {
      "renta": 20000,
      "obra": 14000,
      "cocina": 32000,
      "refri": 16000,
      "mob": 6000,
      "uten": 9000,
      "inv": 12000,
      "permisos": 6000,
      "mkt": 12000,
      "pos": 4000,
      "nomina": 12000,
      "fondo": 12000,
      "otros": 3000
    },
    "fixed": {
      "renta": 9000,
      "nomina": 18000,
      "luz": 4200,
      "gas": 3200,
      "internet": 700,
      "agua": 500,
      "software": 1200,
      "conta": 1200,
      "mkt": 6000,
      "otros": 800
    },
    "dishes": [
      {
        "name": "Bowl de pollo",
        "price": 159,
        "cat": "Fuertes",
        "pop": "alta",
        "commission": 30,
        "empaque": 12,
        "ing": [
          {
            "name": "Pechuga de pollo",
            "qty": 180,
            "u": "g",
            "bu": "kg",
            "buyPrice": 145,
            "buyQty": 1,
            "merma": 8
          },
          {
            "name": "Arroz",
            "qty": 150,
            "u": "g",
            "bu": "kg",
            "buyPrice": 26,
            "buyQty": 1,
            "merma": 0
          },
          {
            "name": "Verduras",
            "qty": 120,
            "u": "g",
            "bu": "kg",
            "buyPrice": 34,
            "buyQty": 1,
            "merma": 18
          },
          {
            "name": "Salsa",
            "qty": 40,
            "u": "ml",
            "bu": "l",
            "buyPrice": 110,
            "buyQty": 1,
            "merma": 0
          }
        ]
      },
      {
        "name": "Bowl vegetariano",
        "price": 139,
        "cat": "Fuertes",
        "pop": "media",
        "commission": 30,
        "empaque": 12,
        "ing": [
          {
            "name": "Garbanzo",
            "qty": 150,
            "u": "g",
            "bu": "kg",
            "buyPrice": 48,
            "buyQty": 1,
            "merma": 0
          },
          {
            "name": "Arroz",
            "qty": 150,
            "u": "g",
            "bu": "kg",
            "buyPrice": 26,
            "buyQty": 1,
            "merma": 0
          },
          {
            "name": "Verduras",
            "qty": 150,
            "u": "g",
            "bu": "kg",
            "buyPrice": 34,
            "buyQty": 1,
            "merma": 18
          }
        ]
      },
      {
        "name": "Postre en vaso",
        "price": 69,
        "cat": "Postres",
        "pop": "baja",
        "commission": 30,
        "empaque": 8,
        "ing": [
          {
            "name": "Base de postre",
            "qty": 1,
            "u": "pz",
            "bu": "pz",
            "buyPrice": 16,
            "buyQty": 1,
            "merma": 0
          }
        ]
      }
    ]
  }
} as const;
