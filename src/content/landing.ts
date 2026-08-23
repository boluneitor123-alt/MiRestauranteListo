/**
 * Contenido de la landing de venta (README § 12).
 *
 * Sin cifras de escasez: el contador de lugares y la cuenta regresiva de
 * lanzamiento salieron porque no venían de licencias vendidas de verdad, y
 * una cifra inventada de urgencia envenena todo lo demás que dice la página.
 */

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

/* ═══════════════  Copia de `LandingMRL v2.dc.html`  ═══════════════ */

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

export interface Herramienta {
  name: string;
  desc: string;
  /** Token del pastel de la landing, sin el prefijo --lp-. */
  tone: string;
}

/** Las seis herramientas: la lista que aparece dos veces en la página. */
export const TOOL_LIST: readonly Herramienta[] = [
  { name: 'Calculadoras y números', desc: 'Punto de equilibrio, inversión, ventas necesarias y más.', tone: 'amber' },
  { name: 'Menú rentable', desc: 'Costea cada platillo y define precios ganadores.', tone: 'rose' },
  { name: 'Permisos y trámites', desc: 'Checklist completo según ubicación y tipo de negocio.', tone: 'sky' },
  { name: 'Marketing y ventas', desc: 'Estrategias prácticas para conseguir clientes.', tone: 'sage' },
  { name: 'Operación y equipo', desc: 'Perfiles, procesos, roles y organización.', tone: 'lila' },
  { name: 'Herramientas y plantillas', desc: 'Formatos listos para usar en tu restaurante.', tone: 'amber' },
];

/** Las dos promesas cortas bajo el titular. */
export const HERO_MICRO: ReadonlyArray<[string, string, string]> = [
  ['Con números reales', 'Calculadoras y métricas que dicen la verdad.', 'amber'],
  ['Paso a paso', 'Sigue tu ruta de apertura sin perderte.', 'sage'],
];

/** La tira de confianza que va bajo el producto. */
export const TRUST: ReadonlyArray<[string, string]> = [
  ['Hecho en México', 'Para negocios de comida mexicanos.'],
  ['Pago 100% seguro', 'Tus datos protegidos con encriptación.'],
  ['Acceso de por vida', 'Un solo pago y es tuyo para siempre.'],
  ['Soporte humano', 'Te ayudamos cuando lo necesites.'],
];

/** Lo que se ve en el demo. */
export const DEMO_LIST: ReadonlyArray<[string, string, string]> = [
  ['Onboarding personalizado', 'Responde 3 preguntas y crea tu plan.', 'amber'],
  ['Tu ruta de apertura', 'Paso a paso, en el orden correcto.', 'sage'],
  ['Calculadoras en acción', 'Números reales para decidir mejor.', 'sky'],
  ['Todo lo que incluye', 'Permisos, proveedores, menú, marketing y más.', 'lila'],
  ['Resultados que dan claridad', 'Sabes qué hacer, cuánto cuesta y cuánto puedes ganar.', 'rose'],
];

export interface EtapaLanding {
  n: string;
  name: string;
  desc: string;
  items: readonly string[];
  tone: string;
}

/** Las tres etapas, las mismas de Mi Ruta. */
export const HOW_STEPS: readonly EtapaLanding[] = [
  {
    n: '1',
    name: 'DEFINE',
    desc: 'Aclaras tu concepto, conoces tu mercado y haces tus números.',
    items: ['Calculadoras en vivo', 'Análisis de ubicación', 'Inversión inicial', 'Punto de equilibrio'],
    tone: 'amber',
  },
  {
    n: '2',
    name: 'CONSTRUYE',
    desc: 'Armas tu restaurante sobre números reales: menú, costos, proveedores y permisos.',
    items: ['Costeador de menú', 'Checklist de permisos', 'Proveedores y compras', 'Plan de marketing'],
    tone: 'rose',
  },
  {
    n: '3',
    name: 'ABRE',
    desc: 'Preparas la operación, organizas tu equipo y abres con confianza.',
    items: ['Contratación y sueldos', 'Manuales y procesos', 'Métricas y metas', 'Checklist de apertura'],
    tone: 'sage',
  },
];

/** Lo que no somos, en el post-it del cierre. */
export const NO_PROMISES = ['SIN SUSCRIPCIONES', 'SIN LETRAS CHIQUITAS', '100% PAGO ÚNICO'] as const;

/** Los cinco beneficios del cierre. */
export const BENEFITS: ReadonlyArray<[string, string, string]> = [
  ['AHORRA TIEMPO', 'Todo lo que necesitas reunido en un solo lugar.', 'sage'],
  ['AHORRA DINERO', 'Detecta errores antes de gastar.', 'amber'],
  ['PASOS CLAROS', 'Sabes exactamente qué sigue.', 'rose'],
  ['DECISIONES REALES', 'Calculadoras y métricas basadas en tus números.', 'sky'],
  ['ABRE CON CONFIANZA', 'Más preparación y menos improvisación.', 'sage'],
];

/** Lo que trae el pago único. */
export const INCLUDED = [
  'Acceso completo al contenido interactivo',
  'Calculadoras, plantillas y herramientas',
  'Acceso desde celular, tablet y computadora',
  'Actualizaciones incluidas según las condiciones actuales del producto',
  'Soporte por correo',
  'Un solo pago, sin mensualidades',
] as const;

/** La tira de confianza del pie. */
export const FOOT_TRUST: ReadonlyArray<[string, string]> = [
  ['Pago seguro', 'Tus datos están protegidos con encriptación.'],
  ['Úsalo donde quieras', 'Funciona en celular, tablet y computadora.'],
  ['Siempre actualizado', 'Mejoras y nuevos contenidos sin costo adicional.'],
  ['Hecho en México', 'Pensado para negocios de aquí.'],
];

/** El bloque de la garantía. */
export const GUARANTEE_LINE = `Pruébala ${LAUNCH.trialDays} días sin tarjeta. Si pagas y no te ayuda, pides tu reembolso dentro de los ${LAUNCH.warrantyDays} días de garantía.`;

export const GUARANTEE_ITEMS = [
  `${LAUNCH.trialDays} días completos para probar todo`,
  'Sin tarjeta de crédito',
  `Garantía de reembolso de ${LAUNCH.warrantyDays} días`,
] as const;

export const GUARANTEE =
  `${LAUNCH.trialDays} días de prueba sin pedirte tarjeta, para verla completa por dentro. Después del pago, ` +
  `${LAUNCH.warrantyDays} días de garantía: escribes por WhatsApp y te devolvemos el dinero, sin preguntas ni formularios.`;

export const GUARANTEE_SHORT = `${LAUNCH.trialDays} días gratis · ${LAUNCH.warrantyDays} días de garantía · sin suscripción`;

export interface FaqItem {
  q: string;
  a: string;
}

export const FAQ: readonly FaqItem[] = [
  {
    q: '¿Esto es un curso o una app?',
    a: 'Las dos cosas, y ahí está el punto. El contenido es un curso — lecciones ordenadas, con pasos y ejemplos — pero vive dentro de una app que hace las cuentas por ti y guarda tu proyecto.',
  },
  {
    q: '¿Por qué pago único y no suscripción?',
    a: 'Porque abrir un negocio tiene un principio y un final. No tiene sentido cobrarte cada mes por algo que usas durante tu apertura. Pagas una vez y es tuyo.',
  },
  {
    q: 'No soy bueno con apps ni con Excel, ¿me va a costar?',
    a: 'No te pide fórmulas ni celdas. Te pregunta cosas que ya sabes de tu negocio — en cuánto compras el kilo de carne, cuánto pagas de renta — y la app hace el resto.',
  },
  {
    q: '¿Sirve para un puesto chico o solo para restaurantes?',
    a: 'Sirve mejor para lo chico, porque es donde cada peso pesa más. Al entrar eliges tu giro y la app omite los módulos que no aplican.',
  },
  {
    q: '¿Y si ya abrí mi negocio?',
    a: 'También te sirve, y muchas veces más. El diagnóstico detecta lo que ya tienes hecho y te salta directo a costeo e ingeniería de menú.',
  },
];

/** La maqueta de la app dentro de la laptop: el menú lateral. */
export const MOCK_NAV = [
  'Inicio',
  'Ruta',
  'Calculadoras',
  'Menú',
  'Permisos',
  'Proveedores',
  'Marketing',
  'Personal',
  'Recursos',
  'Mi avance',
] as const;

/** La maqueta de la ruta: 1 = hecha, 2 = en curso, 0 = pendiente. */
export const MOCK_ROUTE: ReadonlyArray<[string, 0 | 1 | 2]> = [
  ['Define tu concepto', 1],
  ['Números y costos', 1],
  ['Menú rentable', 1],
  ['Permisos y trámites', 2],
  ['Proveedores y compras', 0],
  ['Equipo y operación', 0],
  ['Apertura y primeros clientes', 0],
];

/** La maqueta del plan de marketing. */
export const MOCK_MKT: ReadonlyArray<[string, 0 | 1 | 2]> = [
  ['Define tu cliente ideal', 1],
  ['Crea tu propuesta de valor', 1],
  ['Estrategia de redes sociales', 2],
  ['Promociones de apertura', 0],
  ['Programa de referidos', 0],
  ['Publicidad local', 0],
  ['Mide y ajusta', 0],
];

/** El costeo del ramen que se ve en las maquetas. */
export const MOCK_DISH = {
  name: 'Ramen Tori Tonkotsu',
  rows: [
    ['Ingredientes', '$28.45'],
    ['Costos indirectos', '$6.20'],
    ['Empaque', '$3.00'],
  ] as ReadonlyArray<[string, string]>,
  total: '$37.65',
  price: '$89',
  margin: 65,
};

/** Las tres etapas de la maqueta, con su avance. */
export const MOCK_STAGES: ReadonlyArray<[string, string, number, string]> = [
  ['1. Define', '4/6', 66, 'sage'],
  ['2. Construye', '3/7', 43, 'amber'],
  ['3. Abre', '2/6', 33, 'ink'],
];
