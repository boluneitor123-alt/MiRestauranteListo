/**
 * Datos de demostración: los mismos platillos, sub-recetas, notas y proveedores
 * del prototipo. Se usan como plantilla del giro, como semilla de la demo y
 * como fixtures de las pruebas del dominio.
 */

import type { Dish, Subrecipe } from '@/domain/types';

export const DEMO_DISHES: readonly Dish[] = [
  {
    "id": "d1",
    "name": "Taco de pastor",
    "price": 28,
    "ingredients": [
      {
        "id": "d1i0",
        "name": "Carne al pastor",
        "qty": 70,
        "unit": "g",
        "unitPrice": 0.09
      },
      {
        "id": "d1i1",
        "name": "Tortilla de maíz",
        "qty": 2,
        "unit": "pz",
        "unitPrice": 0.75
      },
      {
        "id": "d1i2",
        "name": "Piña",
        "qty": 10,
        "unit": "g",
        "unitPrice": 0.03
      },
      {
        "id": "d1i3",
        "name": "Cebolla y cilantro",
        "qty": 15,
        "unit": "g",
        "unitPrice": 0.02
      },
      {
        "id": "d1i4",
        "name": "Salsa de la casa",
        "qty": 15,
        "unit": "ml",
        "unitPrice": 0.03
      }
    ]
  },
  {
    "id": "d2",
    "name": "Hamburguesa clásica",
    "price": 129,
    "ingredients": [
      {
        "id": "d2i0",
        "name": "Carne molida",
        "qty": 150,
        "unit": "g",
        "unitPrice": 0.14
      },
      {
        "id": "d2i1",
        "name": "Pan brioche",
        "qty": 1,
        "unit": "pz",
        "unitPrice": 8
      },
      {
        "id": "d2i2",
        "name": "Queso cheddar",
        "qty": 20,
        "unit": "g",
        "unitPrice": 0.22
      },
      {
        "id": "d2i3",
        "name": "Jitomate y lechuga",
        "qty": 30,
        "unit": "g",
        "unitPrice": 0.04
      },
      {
        "id": "d2i4",
        "name": "Aderezo de la casa",
        "qty": 20,
        "unit": "ml",
        "unitPrice": 0.06
      }
    ]
  },
  {
    "id": "d3",
    "name": "Orden de alitas (12 pz)",
    "price": 149,
    "ingredients": [
      {
        "id": "d3i0",
        "name": "Alitas de pollo",
        "qty": 700,
        "unit": "g",
        "unitPrice": 0.075
      },
      {
        "id": "d3i1",
        "name": "Salsa búfalo",
        "qty": 60,
        "unit": "ml",
        "unitPrice": 0.09
      },
      {
        "id": "d3i2",
        "name": "Apio y zanahoria",
        "qty": 40,
        "unit": "g",
        "unitPrice": 0.03
      },
      {
        "id": "d3i3",
        "name": "Aderezo ranch",
        "qty": 40,
        "unit": "ml",
        "unitPrice": 0.08
      },
      {
        "id": "d3i4",
        "name": "Empaque y servilletas",
        "qty": 1,
        "unit": "pz",
        "unitPrice": 2
      }
    ]
  },
  {
    "id": "d4",
    "name": "Latte 12 oz",
    "price": 55,
    "ingredients": [
      {
        "id": "d4i0",
        "name": "Leche entera",
        "qty": 240,
        "unit": "ml",
        "unitPrice": 0.026
      },
      {
        "id": "d4i1",
        "name": "Café de especialidad",
        "qty": 18,
        "unit": "g",
        "unitPrice": 0.35
      },
      {
        "id": "d4i2",
        "name": "Vaso y tapa",
        "qty": 1,
        "unit": "pz",
        "unitPrice": 2.5
      }
    ]
  }
] as Dish[];

export const DEMO_SUBRECIPES: readonly Subrecipe[] = [
  {
    "id": "sr1",
    "name": "Salsa roja de la casa",
    "yieldQty": 3000,
    "unit": "ml",
    "ingredients": [
      {
        "id": "sr1i0",
        "name": "Jitomate",
        "qty": 3,
        "unit": "kg",
        "buyUnit": "kg",
        "buyPrice": 28,
        "buyQty": 1,
        "waste": 10
      },
      {
        "id": "sr1i1",
        "name": "Chile de árbol",
        "qty": 200,
        "unit": "g",
        "buyUnit": "kg",
        "buyPrice": 180,
        "buyQty": 1,
        "waste": 5
      },
      {
        "id": "sr1i2",
        "name": "Ajo",
        "qty": 100,
        "unit": "g",
        "buyUnit": "kg",
        "buyPrice": 90,
        "buyQty": 1,
        "waste": 12
      },
      {
        "id": "sr1i3",
        "name": "Sal",
        "qty": 60,
        "unit": "g",
        "buyUnit": "kg",
        "buyPrice": 14,
        "buyQty": 1,
        "waste": 0
      }
    ]
  },
  {
    "id": "sr2",
    "name": "Adobo para pastor",
    "yieldQty": 2000,
    "unit": "g",
    "ingredients": [
      {
        "id": "sr2i0",
        "name": "Chile guajillo",
        "qty": 500,
        "unit": "g",
        "buyUnit": "kg",
        "buyPrice": 160,
        "buyQty": 1,
        "waste": 8
      },
      {
        "id": "sr2i1",
        "name": "Achiote",
        "qty": 300,
        "unit": "g",
        "buyUnit": "kg",
        "buyPrice": 120,
        "buyQty": 1,
        "waste": 0
      },
      {
        "id": "sr2i2",
        "name": "Vinagre",
        "qty": 700,
        "unit": "ml",
        "buyUnit": "l",
        "buyPrice": 22,
        "buyQty": 1,
        "waste": 0
      },
      {
        "id": "sr2i3",
        "name": "Especias",
        "qty": 120,
        "unit": "g",
        "buyUnit": "kg",
        "buyPrice": 210,
        "buyQty": 1,
        "waste": 0
      }
    ]
  }
] as Subrecipe[];

export interface DemoNote {
  id: string;
  title: string;
  body: string;
  date: string;
}

export const DEMO_NOTES: readonly DemoNote[] = [
  {
    "id": "n1",
    "title": "Local de Av. Juárez",
    "body": "Renta $18,000, 62 m², cocina a medias. Pedir 2 meses de gracia para obra y revisar uso de suelo.",
    "date": "Hoy"
  },
  {
    "id": "n2",
    "title": "Idea de promoción de apertura",
    "body": "2x1 solo en pastor de 6 a 8 pm la primera semana. Costear antes de anunciar.",
    "date": "Ayer"
  }
];

export interface DemoSupplier {
  id: string;
  name: string;
  item: string;
  contact: string;
  terms: string;
  delivery: string;
}

export const DEMO_SUPPLIERS: readonly DemoSupplier[] = [
  {
    "id": "s1",
    "name": "Carnes El Rancho",
    "item": "Carne de res y cerdo",
    "contact": "55 1234 5678",
    "terms": "Crédito 8 días",
    "delivery": "Martes y viernes"
  },
  {
    "id": "s2",
    "name": "Verduras Don Beto",
    "item": "Frutas y verduras",
    "contact": "55 8765 4321",
    "terms": "Contado",
    "delivery": "Lunes, miércoles y sábado"
  },
  {
    "id": "s3",
    "name": "Distribuidora Central",
    "item": "Abarrotes y desechables",
    "contact": "55 2468 1357",
    "terms": "Crédito 15 días",
    "delivery": "Jueves"
  }
];
