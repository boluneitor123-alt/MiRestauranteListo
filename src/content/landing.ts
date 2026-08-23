/**
 * Contenido de la landing de venta (README § 12).
 *
 * Sin cifras de escasez: el contador de lugares y la cuenta regresiva de
 * lanzamiento salieron porque no venían de licencias vendidas de verdad, y
 * una cifra inventada de urgencia envenena todo lo demás que dice la página.
 */

import { ROUTE_MODULES, TOTAL_ROUTE_TASKS } from './route';

export interface Launch {
  listPrice: number;
  price: number;
  installments: number;
  installmentAmount: number;
  warrantyDays: number;
  trialDays: number;
}

export const LAUNCH: Launch = {
  listPrice: 3900,
  price: 2450,
  installments: 3,
  installmentAmount: 817,
  warrantyDays: 14,
  trialDays: 7,
};

/** Inversión típica para abrir, contra la que se compara el precio. */
export const TYPICAL_INVESTMENT = 263500;

/** Ticket promedio por defecto de la calculadora. */
export const DEFAULT_TICKET = 120;

export const GIROS_LANDING = [
  'Taquería',
  'Cafetería',
  'Food truck',
  'Restaurante',
  'Fonda / cocina económica',
  'Otro',
] as const;

export interface LandingStep {
  title: string;
  /** Qué hacer exactamente: mismo texto que la app. */
  instruction: string;
  /** Por qué importa: mismo texto que la app. */
  why: string;
}

/**
 * Los primeros pasos de la ruta. Se derivan de la ruta del producto en lugar de
 * copiarse: así el texto de la landing y el de la app **no pueden** separarse.
 */
export const LANDING_ROUTE: readonly LandingStep[] = ROUTE_MODULES.flatMap((module) =>
  module.tasks.map((task) => ({ title: task.title, instruction: task.next, why: task.why })),
).slice(0, 8);

/** Total de pasos de la ruta completa del producto. Sale del contenido, no de una constante suelta. */
export const TOTAL_STEPS = TOTAL_ROUTE_TASKS;
/** Módulos de la ruta, cursos incluidos. */
export const TOTAL_MODULES = ROUTE_MODULES.length;

export interface StartingPoint {
  label: string;
  /** Paso en el que queda el usuario. */
  step: number;
  /** Índice del siguiente paso dentro de LANDING_ROUTE. */
  nextIndex: number;
  /** Se saltó pasos por buscar o tener local. */
  skipped: boolean;
}

export const STARTING_POINTS: readonly StartingPoint[] = [
  { label: 'Solo tengo la idea', step: 1, nextIndex: 0, skipped: false },
  { label: 'Ya sé qué voy a vender', step: 3, nextIndex: 1, skipped: false },
  { label: 'Estoy buscando local', step: 4, nextIndex: 2, skipped: true },
  { label: 'Ya tengo el local', step: 6, nextIndex: 4, skipped: true },
];

export interface CostRow {
  label: string;
  cost: string;
  note: string;
  /** Fila destacada en rojo. */
  highlight?: boolean;
}

/** Comparativa de costos (README § 3, sección 5). */
export const COST_COMPARISON: readonly CostRow[] = [
  { label: 'Un curso para abrir tu restaurante', cost: '$2,490 – $3,960', note: 'Te enseña; no te hace los números.' },
  { label: 'Software de restaurante', cost: 'desde $811/mes', note: '$9,732 al año, para siempre.' },
  { label: 'Un asesor gastronómico', cost: '$15,000 – $30,000', note: 'Por un proyecto, una sola vez.' },
  { label: 'MiRestauranteListo', cost: '$2,450 una vez', note: 'Sin mensualidades. Acceso de por vida.', highlight: true },
];

export const OBJECTIONS = [
  {
    id: 'obj-0',
    title: '¿Por qué pago único y no mensualidad?',
    summary:
      'Un software de restaurante te cobraría todos los meses para siempre. Aquí pagas una vez porque abrir es un proyecto, no una suscripción.',
  },
  {
    id: 'obj-1',
    title: 'No soy bueno con los números',
    summary:
      'No tienes que serlo. Capturas lo que pagas por tus insumos y la app hace las cuentas: costo por porción, precio sugerido y cuánto vender al día.',
  },
  {
    id: 'obj-2',
    title: '¿Reemplaza a un asesor?',
    summary:
      'Reemplaza la parte que un asesor haría en Excel: ruta, costeo y números. Para negociar tu renta o tu contrato, sigue buscando a un humano.',
  },
  {
    id: 'obj-3',
    title: '¿Y si no me sirve?',
    summary: `Pruébala ${LAUNCH.trialDays} días gratis y, si pagas, tienes ${LAUNCH.warrantyDays} días de garantía completa.`,
  },
] as const;

export const INCLUDED = [
  'Tu ruta de 90 pasos, en orden y con fechas',
  'Costeador de platillos con sub-recetas y merma',
  'Precio sugerido y precio para apps de delivery',
  'Presupuesto de apertura con subconceptos',
  'Punto de equilibrio con tu meta de ganancia',
  'Ficha técnica y resumen financiero para imprimir',
] as const;

export const TOOLS = [
  {
    slot: 'shot-ruta',
    title: 'Mi Ruta',
    body: '90 pasos en 14 módulos, cuatro de ellos mini cursos. Cada uno te dice por qué importa y qué hacer exactamente.',
  },
  {
    slot: 'shot-costeador',
    title: 'Costeador de platillos',
    body: 'Captura lo que pagas por tus insumos y ve tu costo real por porción, con merma incluida.',
  },
  {
    slot: 'shot-numeros',
    title: 'Números',
    body: 'Cuánto necesitas para abrir y cuánto tienes que vender al día para no perder dinero.',
  },
] as const;

/* ═══════════════  Copia de LandingMiRestauranteListo.dc.html  ═══════════════ */

/** Margen bruto con el que calcula la landing. */
export const LANDING_MARGIN_PCT = 68;

/** Con lo que arranca la calculadora en vivo, como en el diseño. */
export const CALC_DEFAULTS = {
  rent: '18000',
  payroll: '32000',
  other: '9000',
  goal: '25000',
  ticket: '200',
};

export const HERO_CHIPS = [
  '7 días gratis, sin tarjeta',
  'Pago único, nunca mensualidad',
  'Se usa desde tu celular',
] as const;

/** La marquesina: lo que no es, tachado, contra lo que sí es. */
export const MARQUEE: ReadonlyArray<[string, boolean]> = [
  ['PDF que nadie abre', true],
  ['TUS NÚMEROS', false],
  ['plantilla de Excel prestada', true],
  ['PAGO ÚNICO', false],
  ['consultor de $35,000', true],
  ['CURSO INTERACTIVO', false],
  ['suscripción mensual', true],
  ['DE POR VIDA', false],
];

export const HOW_STEPS = [
  {
    n: '1',
    k: 'Contestas',
    lead: '12 preguntas rápidas.',
    d: 'La app te dice en qué etapa estás, qué te falta y arma tu ruta con solo los módulos que te aplican. Un food truck no ve tareas de mesas.',
  },
  {
    n: '2',
    k: 'Capturas',
    lead: 'Una lección al día.',
    d: 'Cada una trae los pasos, un ejemplo con números reales, el detalle que se pasa por alto y cómo saber que ya quedó. Tú pones tus cifras; las cuentas las hace la app.',
  },
  {
    n: '3',
    k: 'Sales con',
    lead: 'Tus documentos listos.',
    d: 'Plan de apertura, fichas técnicas y resumen financiero en PDF, con tus datos, para el banco, un socio o el arrendador.',
  },
] as const;

export const BIG_NUMBERS = [
  {
    v: '$9.12',
    u: 'MXN',
    d: 'lo que cuesta de verdad un taco de pastor, contando carne, tortilla, salsa, empaque y merma. Casi nadie llega a este número.',
    hand: 'y por eso el precio sale mal ✓',
  },
  {
    v: '38%',
    u: 'food cost',
    d: 'si lo vendes en $28. Arriba del rango sano de 28 a 32%. Subirlo a $32 lo baja a 28.5% y son $14,400 más al mes con el mismo trabajo.',
    hand: '3 pesos cambian el año →',
  },
  {
    v: '$0',
    u: '/mes',
    d: 'en suscripciones. Para siempre. Abrir un negocio tiene un principio y un final: no te vamos a cobrar cada mes por eso.',
    hand: 'adiós mensualidades',
  },
] as const;

export const LEDGER = [
  { k: 'Hoy, una sola vez', v: 'el acceso completo — pago único, el precio está abajo en la hoja de pedido' },
  { k: 'Después, cada mes', v: '$0. Nada. Tu tarjeta no queda suscrita a nada.' },
  {
    k: 'Nunca',
    v: 'créditos nuestros, comisiones sobre tus ventas, ni módulos que se venden aparte',
  },
] as const;

/** Las cuatro herramientas, con su demostración de números. */
export const LANDING_TOOLS = [
  {
    k: 'Herramienta 01',
    tag: 'incluida',
    t: 'Costeador de platillos',
    d: 'Capturas precio de compra, presentación y merma por ingrediente. Te da costo limpio, food cost, precio sugerido y semáforo. Con sub-recetas para salsas y bases por lote.',
    demoK: 'Ejemplo real · taco de pastor',
    demo: [
      ['Carne 70 g', '$6.30'],
      ['Tortilla 2 pz', '$1.50'],
      ['Salsa y guarnición', '$0.87'],
      ['Empaque', '$0.45'],
      ['Costo total', '$9.12'],
    ],
  },
  {
    k: 'Herramienta 02',
    tag: 'incluida',
    t: 'Números',
    d: 'Presupuesto de apertura con 13 conceptos, gastos fijos, punto de equilibrio, tu sueldo real, cuánto vale tu hora, cuándo recuperas y prueba de estrés.',
    demoK: 'Lo que este negocio te va a dar',
    demo: [
      ['Tu sueldo real', '$14,300/mes'],
      ['Lo que vale tu hora', '$51'],
      ['Recuperas en', 'mes 19'],
      ['Colchón necesario', '$63,060'],
    ],
  },
  {
    k: 'Herramienta 03',
    tag: 'incluida',
    t: 'Mi Menú',
    d: 'Food cost ponderado por venta y un plan de acción ordenado por dinero: qué precio subir, qué platillo destacar y cuál sacar, con el impacto mensual calculado. Aplicas el cambio con un toque.',
    demoK: 'Plan de acción, ordenado por dinero',
    demo: [
      ['Sube pastor a $32', '+$10,800/mes'],
      ['Destaca la gringa', '+$3,400/mes'],
      ['Saca la ensalada', '+$1,400/mes'],
      ['Total del plan', '+$15,600/mes'],
    ],
  },
  {
    k: 'Herramienta 04',
    tag: 'incluida',
    t: 'Analizador de anuncios',
    d: 'Copias 5 números del Administrador de Meta y te dice si tu anuncio deja dinero, qué cambiar primero, y hasta cuánto puedes pagar por cliente según tu propio ticket.',
    demoK: 'Diagnóstico de un anuncio real',
    demo: [
      ['Invertido en 5 días', '$750'],
      ['Mensajes recibidos', '38'],
      ['Costo por cliente', '$68'],
      ['Veredicto', 'sirve ✓'],
    ],
  },
] as const;

export const INSIDE_SUB =
  'Tres de las pantallas que más vas a usar, redibujadas aquí con los colores de esta página. Los números y los textos son los de la app; el acento cambia porque adentro puedes elegir entre seis.';

export const INSIDE_CHIPS = [
  'Se instala en tu pantalla de inicio',
  'Funciona en iPhone, Android y computadora',
  'Hasta 3 dispositivos',
  'Modo oscuro incluido',
] as const;

/** Los ingredientes que se ven en la maqueta del Costeador. */
export const SHOT_INGREDIENTS: ReadonlyArray<[string, string]> = [
  ['Carne al pastor · 70 g', '$6.30'],
  ['Tortilla · 2 pz', '$1.50'],
  ['Salsa roja · 20 ml', '$0.87'],
  ['Empaque', '$0.45'],
  ['Costo total', '$9.12'],
];

/** El plan de acción que se ve en la maqueta de Mi Menú. */
export const SHOT_ACTIONS = [
  { n: '1', kind: 'Subir precio', title: 'Sube pastor a $32', imp: '+$10,800', col: 'var(--color-accent)' },
  { n: '2', kind: 'Destacar', title: 'Destaca la gringa', imp: '+$3,400', col: 'var(--color-accent-600)' },
  { n: '3', kind: 'Sacar del menú', title: 'Saca la ensalada César', imp: '+$1,400', col: 'var(--color-accent-2-500)' },
] as const;

export const SHOT_MENU = { now: 47200, after: 61800, delta: 14600 };

/** Antes y después de la misma carta: [platillo, precio, food cost]. */
export const BEFORE_AFTER = {
  sub: 'Una taquería real de 45 m². Los mismos platillos, los mismos clientes al día y el mismo gasto de insumos. Lo único que cambió fueron cinco precios y un platillo que salió del menú.',
  before: [
    ['Taco de pastor', 28, 38],
    ['Taco de suadero', 26, 37],
    ['Gringa', 62, 40],
    ['Quesadilla', 48, 38],
    ['Ensalada César', 78, 46],
  ] as ReadonlyArray<[string, number, number]>,
  after: [
    ['Taco de pastor', 32, 28],
    ['Taco de suadero', 30, 32],
    ['Gringa', 70, 35],
    ['Quesadilla', 54, 34],
    ['— fuera del menú', 0, 0],
  ] as ReadonlyArray<[string, number, number]>,
  beforeTotal: 47200,
  afterTotal: 61800,
  delta: 14600,
  year: 175200,
  note: 'Son $175,200 al año que ya estaban sobre la mesa. El único trabajo fue costear los platillos y aplicar lo que la app señaló.',
  hand: 'Cinco cambios de precio. Cero clientes nuevos. Cero gasto extra.',
};

export const CONFESSION = [
  'Esto no te va a cocinar. No te va a conseguir el local, ni te va a atender la caja el día de la apertura. Nada de lo que hay aquí sustituye el trabajo.',
  'Lo que sí hace es quitarte la parte donde la gente se equivoca: los números. Cuánto cuesta de verdad tu platillo, cuánto necesitas vender, cuánto dinero tienes que tener guardado antes de firmar una renta, y a partir de qué mes el negocio se paga solo.',
  'Y no lo hace con ejemplos de un restaurante ajeno en otro país. Lo hace con tus cifras: tu renta, tus proveedores, tu ticket, tu zona.',
  'Si ya sabes costear, ya tienes tu punto de equilibrio calculado y tus anuncios te traen clientes al costo que quieres, esto te va a quedar corto. Te lo digo antes de que pagues.',
] as const;

export const TEMARIO_CHIPS = [
  'Ruta que se adapta a tu giro',
  'Ejemplos con números reales',
  'Cuatro mini cursos con estrella',
  'Actualizaciones de por vida',
] as const;

/** La cuenta clara: lo que cuesta equivocarse una vez. */
export const MISTAKE_COSTS: ReadonlyArray<[string, string, boolean]> = [
  ['Un mes de renta en el local equivocado', '$18,000', false],
  ['Equipo que compraste y usas una vez a la semana', '$31,000', false],
  ['Vender un año con el precio 3 pesos abajo', '$172,800', false],
  ['Un consultor gastronómico por proyecto', '$35,000 – $80,000', false],
  ['MiRestauranteListo, una sola vez', '$2,450', true],
];

/** Lo que incluye el pago único. `false` = lo que no incluye. */
export const LANDING_INCLUDES: ReadonlyArray<[boolean, string]> = [
  [true, '90 lecciones en 14 módulos, con ejemplos numéricos reales'],
  [true, 'Los cuatro puntos extra: Meta Ads, Google Maps, apps de delivery y tu primera contratación'],
  [true, 'Costeador con merma, sub-recetas y semáforo de food cost'],
  [true, 'Números completos: presupuesto, punto de equilibrio, tu sueldo real y prueba de estrés'],
  [true, 'Mi Menú con plan de acción ordenado por dinero'],
  [true, 'Analizador de anuncios de Meta'],
  [true, 'Plan de apertura, fichas técnicas y resumen financiero en PDF'],
  [true, 'Hasta 3 dispositivos y actualizaciones incluidas de por vida'],
  [false, 'No incluye asesoría uno a uno ni revisión de tu proyecto'],
];

export const FINEPRINT = [
  {
    k: 'Qué recibes al pagar',
    v: 'Acceso inmediato. La app se desbloquea sola en cuanto se confirma el pago, sin códigos ni esperas.',
  },
  {
    k: 'Cómo se usa',
    v: 'Se instala en tu pantalla de inicio como cualquier app, en iPhone o Android, y también funciona en computadora.',
  },
  {
    k: 'Qué pasa con tus datos',
    v: 'Tu proyecto se guarda en tu cuenta. Cambias de teléfono, entras y sigue todo ahí.',
  },
  { k: 'Actualizaciones', v: 'Las que salgan entran gratis. No se venden por separado ni por volúmenes.' },
] as const;

export const GUARANTEE_LINE =
  '7 días de prueba sin pedirte tarjeta, para verla completa por dentro. Después del pago, 14 días de garantía: escribes por WhatsApp y te devolvemos el dinero, sin preguntas ni formularios.';
export const GUARANTEE_SHORT = '7 días gratis · 14 días de garantía · sin suscripción';
export const PAY_METHODS = ['VISA', 'MASTERCARD', 'AMEX', 'PAYPAL', 'APPLE PAY', 'OXXO', 'SPEI', '3 MSI'] as const;

/** Las ocho preguntas de la landing. */
export const LANDING_FAQS = [
  {
    q: '¿Esto es un curso o una app?',
    a: 'Las dos cosas, y ahí está el punto. El contenido es un curso — lecciones ordenadas, con pasos y ejemplos — pero vive dentro de una app que hace las cuentas contigo. No lees "así se calcula el food cost": capturas tus ingredientes y la app te lo calcula, te lo pinta en semáforo y te dice qué precio poner.',
  },
  {
    q: '¿Por qué pago único y no suscripción?',
    a: 'Porque abrir un negocio tiene un principio y un final. No tiene sentido cobrarte cada mes por algo que usas durante tu apertura. Pagas una vez, es tuyo de por vida, y las actualizaciones van incluidas. Tu tarjeta no queda suscrita a nada.',
  },
  {
    q: 'No soy bueno con apps ni con Excel, ¿me va a costar?',
    a: 'No te pide fórmulas ni celdas. Te pregunta cosas que ya sabes de tu negocio — en cuánto compras el kilo de carne, cuánto pagas de renta, cuántas tortillas lleva el plato — y ella hace la matemática. Está hecha para usarse con una mano en el celular, entre pedido y pedido. Y trae un recorrido guiado la primera vez.',
  },
  {
    q: '¿Sirve para un puesto chico o solo para restaurantes?',
    a: 'Sirve mejor para lo chico, porque es donde cada peso pesa más. Cuando eliges tu giro al entrar, la app omite los módulos que no te aplican: un food truck no ve tareas de mesas ni de mobiliario de salón. Los cálculos son los mismos; la ruta se ajusta a ti.',
  },
  {
    q: '¿Y si ya abrí mi negocio?',
    a: 'También te sirve, y muchas veces más. El diagnóstico detecta lo que ya tienes hecho y te salta directo a costeo, ingeniería de menú y los cuatro puntos extra. Ahí es donde un negocio que ya opera suele encontrar dinero que estaba dejando en la mesa: precios abajo de su costo real, platillos que no rotan, anuncios que no cierran.',
  },
  {
    q: '¿Qué pasa si no me gusta?',
    a: 'Tienes 7 días de prueba sin tarjeta para verla completa por dentro antes de pagar nada. Y si pagas y no te convence, tienes 14 días de garantía: escribes por WhatsApp y te devolvemos el dinero. Sin preguntas, sin formularios, sin "déjame ofrecerte otra cosa".',
  },
  {
    q: '¿Puedo usarla en varios dispositivos?',
    a: 'Sí, hasta 3 con la misma cuenta: tu celular, el de tu socio y una computadora. Tu proyecto se sincroniza entre los tres, así que puedes capturar en la cocina y revisar en casa.',
  },
  {
    q: '¿Necesito internet para usarla?',
    a: 'Sí. La app valida tu acceso en el servidor y guarda tu proyecto en tu cuenta, así que necesita conexión. La ventaja es que no pierdes nada si se te cae el teléfono al agua.',
  },
] as const;

export const CLOSE_HAND = 'Y son 7 días gratis. No hay nada que perder aquí.';
