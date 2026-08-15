/**
 * Catálogos del producto: giros con benchmarks, preguntas frecuentes y los
 * conceptos base de Números (README § 1.8, § 1.9).
 */

import type { Concept } from '@/domain/finance';

export interface GiroBenchmark {
  name: string;
  /** Inversión típica para abrir. */
  investment: string;
  foodCost: string;
  ticket: string;
  team: string;
}

export const GIROS: readonly GiroBenchmark[] = [
  {
    "name": "Taquería",
    "investment": "$180k – $350k",
    "foodCost": "30% – 33%",
    "ticket": "$120",
    "team": "3 a 5 personas"
  },
  {
    "name": "Hamburguesería",
    "investment": "$250k – $500k",
    "foodCost": "30% – 34%",
    "ticket": "$180",
    "team": "4 a 6 personas"
  },
  {
    "name": "Cafetería",
    "investment": "$200k – $450k",
    "foodCost": "22% – 28%",
    "ticket": "$95",
    "team": "3 a 4 personas"
  },
  {
    "name": "Marisquería",
    "investment": "$350k – $700k",
    "foodCost": "33% – 38%",
    "ticket": "$290",
    "team": "5 a 8 personas"
  },
  {
    "name": "Sushi",
    "investment": "$300k – $650k",
    "foodCost": "28% – 32%",
    "ticket": "$250",
    "team": "4 a 6 personas"
  },
  {
    "name": "Alitas",
    "investment": "$200k – $400k",
    "foodCost": "32% – 36%",
    "ticket": "$190",
    "team": "3 a 5 personas"
  },
  {
    "name": "Pizzería",
    "investment": "$250k – $500k",
    "foodCost": "25% – 30%",
    "ticket": "$170",
    "team": "3 a 5 personas"
  },
  {
    "name": "Fonda",
    "investment": "$80k – $180k",
    "foodCost": "30% – 35%",
    "ticket": "$85",
    "team": "2 a 3 personas"
  },
  {
    "name": "Dark kitchen",
    "investment": "$60k – $150k",
    "foodCost": "28% – 32%",
    "ticket": "$150",
    "team": "2 a 3 personas"
  },
  {
    "name": "Otro",
    "investment": "Depende del formato",
    "foodCost": "28% – 35%",
    "ticket": "Por definir",
    "team": "Por definir"
  }
];

export interface FaqItem {
  q: string;
  a: string;
}

/** 30 preguntas frecuentes. */
export const FAQ: readonly FaqItem[] = [
  {
    "q": "¿Cuánto necesito para abrir un negocio de comida?",
    "a": "Depende del formato. Una fonda o dark kitchen puede arrancar desde $60,000 y una marisquería pasa fácil de $400,000. Lo que no cambia: obra, equipo e inventario suelen llevarse el 70% de tu inversión. Captura tu presupuesto en Números y compáralo con tu tope real."
  },
  {
    "q": "¿Qué es el food cost y cuánto debe ser?",
    "a": "Es el costo de los ingredientes de un platillo dividido entre su precio de venta. En comida casual sano es 28% a 33%. Arriba de 38% el platillo se come tu utilidad, aunque vendas mucho."
  },
  {
    "q": "¿Cómo se calcula el punto de equilibrio?",
    "a": "Gastos fijos del mes ÷ margen bruto. Si pagas $80,000 fijos y tu margen es 68%, necesitas vender $117,600 al mes. Divide entre 30 días y entre tu ticket promedio para saber cuántos clientes diarios necesitas."
  },
  {
    "q": "¿Debo pagar renta antes de abrir?",
    "a": "Casi siempre sí: los meses de obra se pagan. Negocia 1 o 2 meses de gracia para adecuaciones y considera el depósito y la garantía dentro de tu inversión inicial."
  },
  {
    "q": "¿Cuántos platillos debe tener mi menú?",
    "a": "Entre 8 y 12 para abrir. Menú corto significa compras más simples, menos merma, cocina más rápida y personal más fácil de entrenar."
  },
  {
    "q": "¿Qué permisos necesito?",
    "a": "La base es: aviso de funcionamiento sanitario, licencia o permiso municipal, visto bueno de protección civil y alta en el SAT. Si vendes alcohol, se suma la licencia correspondiente. Los requisitos exactos cambian por municipio."
  },
  {
    "q": "¿Con cuánta gente abro?",
    "a": "Con lo mínimo que sostenga tu hora pico. Es más barato empezar corto y contratar cuando la venta lo pida, que cargar nómina desde el mes uno."
  },
  {
    "q": "¿En cuánto tiempo es rentable?",
    "a": "La mayoría de negocios de comida bien planeados llegan a punto de equilibrio entre el mes 3 y el mes 8. Por eso el fondo de emergencia de 3 meses no es opcional."
  },
  {
    "q": "¿Funciona sin internet?",
    "a": "No. MiRestauranteListo necesita conexión para validar tu acceso cada vez que la abres. Tus datos sí se guardan en tu propio teléfono, así que nada se pierde cuando recuperas señal."
  },
  {
    "q": "¿El pago es único?",
    "a": "Sí. Pagas una vez, tienes acceso permanente y las actualizaciones de las herramientas de apertura se incluyen. No hay mensualidad ni renovación automática."
  },
  {
    "q": "¿Cuánta renta puedo pagar sin ahogarme?",
    "a": "Como regla, la renta no debe pasar del 10% de tu venta mensual esperada. Si esperas vender $120,000, tu tope sano de renta es $12,000. Arriba del 15% casi cualquier negocio de comida sufre."
  },
  {
    "q": "¿Cuánto debo dejar de fondo de emergencia?",
    "a": "Tres meses de gastos fijos. Si pagas $80,000 al mes, guarda $240,000 aparte de la inversión. Es lo que te permite aguantar los primeros meses flojos."
  },
  {
    "q": "¿Cómo pongo precio a un platillo?",
    "a": "Divide el costo de tus ingredientes entre tu food cost objetivo. Si el platillo cuesta $30 y quieres 30% de food cost, tu precio es $100. Después compáralo con el mercado y ajusta."
  },
  {
    "q": "¿Qué es el ticket promedio y cómo lo subo?",
    "a": "Es lo que gasta cada cliente en promedio. Súbelo con combos, bebidas, postres y una carta ordenada, no subiendo todos los precios de golpe."
  },
  {
    "q": "¿Conviene rentar o comprar el equipo?",
    "a": "Compra usado y revisado para arrancar: la línea caliente y la refrigeración pierden mucho valor. Renta solo lo que usarás pocas veces o lo que sea muy caro."
  },
  {
    "q": "¿Cómo controlo la merma?",
    "a": "Pesa porciones, usa recetas estándar, marca fechas en todo lo que entra y revisa inventario una vez por semana. La merma casi siempre es falta de estándar, no robo."
  },
  {
    "q": "¿Debo vender por apps de delivery?",
    "a": "Sirven para llenar horas muertas, pero cobran entre 20% y 30% de comisión. Si tu food cost es 33%, ese platillo casi no deja. Haz precios distintos para delivery."
  },
  {
    "q": "¿Qué inventario inicial necesito?",
    "a": "Entre una y dos semanas de insumos de tus platillos estrella. Comprar de más al abrir es dinero congelado que se echa a perder."
  },
  {
    "q": "¿Cómo sé si mi local es bueno?",
    "a": "Cuenta gente en dos horarios distintos, revisa si hay estacionamiento, mira qué negocios de comida están cerca y pregunta cuánto tiempo llevan abiertos."
  },
  {
    "q": "¿Cuánto tiempo tarda la obra?",
    "a": "Una adecuación ligera va de 3 a 6 semanas; una cocina desde cero puede llevar 2 o 3 meses. Presupuesta renta durante toda la obra."
  },
  {
    "q": "¿Cuántas mesas necesito?",
    "a": "Depende de tu venta objetivo: mesas × rotaciones por día × ticket promedio. Si necesitas $6,000 al día con ticket de $150, son 40 clientes, es decir unas 10 mesas con 2 rotaciones."
  },
  {
    "q": "¿Qué precio le pongo a las bebidas?",
    "a": "Las bebidas son tu mejor margen: food cost de 15% a 20%. No las subas tanto como para que el cliente pida agua, pero no las regales."
  },
  {
    "q": "¿Cómo le pago a mi personal?",
    "a": "Sueldo base competitivo de la zona más propina bien repartida. Registra a tu equipo en el IMSS: una demanda laboral cuesta más que toda tu nómina anual."
  },
  {
    "q": "¿Necesito punto de venta o me sirve una libreta?",
    "a": "Puedes abrir con caja simple, pero un punto de venta básico te da ventas por platillo y por hora, y eso te dice qué quitar del menú."
  },
  {
    "q": "¿Cómo mido si mi promoción funcionó?",
    "a": "Compara tickets y venta total de los días con promo contra los mismos días sin promo, y revisa que el food cost no se haya disparado."
  },
  {
    "q": "¿Qué hago si vendo mucho y no me queda dinero?",
    "a": "Casi siempre son tres cosas: food cost alto, renta alta o nómina alta. Revisa esas tres antes de pensar en vender más."
  },
  {
    "q": "¿Cuándo conviene abrir una segunda sucursal?",
    "a": "Cuando la primera es rentable sola por al menos 6 meses seguidos, tiene procesos escritos y alguien puede operarla sin ti."
  },
  {
    "q": "¿Vale la pena un socio?",
    "a": "Solo si aporta algo que no tienes: capital, experiencia operativa o el local. Escriban desde el inicio quién decide qué y cómo se reparte la utilidad."
  },
  {
    "q": "¿Cómo calculo la utilidad real del mes?",
    "a": "Ventas menos costo de insumos menos gastos fijos menos impuestos. Si te queda entre 10% y 20% de la venta, vas bien para un negocio de comida."
  },
  {
    "q": "¿Cada cuánto actualizo mis costos?",
    "a": "Cada mes revisa tus 10 insumos principales y cada trimestre recostea el menú completo. Los precios de insumos suben sin avisar."
  }
];

/** 13 conceptos base del presupuesto de apertura, con montos de referencia. */
export const BUDGET_CONCEPTS: readonly Concept[] = [
  {
    "key": "renta",
    "label": "Renta y depósito",
    "amount": 45000
  },
  {
    "key": "obra",
    "label": "Adecuaciones y obra",
    "amount": 40000
  },
  {
    "key": "cocina",
    "label": "Cocina y línea caliente",
    "amount": 45000
  },
  {
    "key": "refri",
    "label": "Refrigeración",
    "amount": 22000
  },
  {
    "key": "mob",
    "label": "Mobiliario",
    "amount": 18000
  },
  {
    "key": "uten",
    "label": "Utensilios y loza",
    "amount": 12000
  },
  {
    "key": "inv",
    "label": "Inventario inicial",
    "amount": 18000
  },
  {
    "key": "permisos",
    "label": "Permisos y trámites",
    "amount": 9000
  },
  {
    "key": "mkt",
    "label": "Marketing de apertura",
    "amount": 8000
  },
  {
    "key": "pos",
    "label": "Punto de venta",
    "amount": 6500
  },
  {
    "key": "nomina",
    "label": "Nómina del primer mes",
    "amount": 20000
  },
  {
    "key": "fondo",
    "label": "Fondo de emergencia",
    "amount": 15000
  },
  {
    "key": "otros",
    "label": "Otros",
    "amount": 5000
  }
];

/** 10 conceptos base de gastos fijos mensuales. */
export const FIXED_CONCEPTS: readonly Concept[] = [
  {
    "key": "renta",
    "label": "Renta",
    "amount": 22000
  },
  {
    "key": "nomina",
    "label": "Nómina",
    "amount": 38000
  },
  {
    "key": "luz",
    "label": "Luz",
    "amount": 6500
  },
  {
    "key": "gas",
    "label": "Gas",
    "amount": 4200
  },
  {
    "key": "internet",
    "label": "Internet",
    "amount": 700
  },
  {
    "key": "agua",
    "label": "Agua",
    "amount": 900
  },
  {
    "key": "software",
    "label": "Software",
    "amount": 500
  },
  {
    "key": "conta",
    "label": "Contabilidad",
    "amount": 2500
  },
  {
    "key": "mkt",
    "label": "Marketing",
    "amount": 3000
  },
  {
    "key": "otros",
    "label": "Otros",
    "amount": 1500
  }
];
