// Generado por scripts/extraer-diseno.mjs desde el prototipo de diseño.
// Las 12 preguntas del diagnóstico (const QS) y el recorrido guiado (const TOUR).
// No edites a mano: vuelve a correr el script.

export type Question = {
  id: string;
  /** Categoría que se ve arriba, en mayúsculas. */
  k: string;
  q: string;
  /** Ayuda opcional bajo la pregunta. */
  help?: string;
  /** Opciones, como botones grandes. */
  o: string[];
};

export const QS: Question[] = [
  {
    "id": "giro",
    "k": "Tu negocio",
    "q": "¿Qué tipo de negocio de comida quieres abrir?",
    "help": "Con esto ajustamos tus costos y tu ruta.",
    "o": [
      "Taquería",
      "Hamburguesería",
      "Cafetería",
      "Marisquería",
      "Sushi",
      "Alitas",
      "Pizzería",
      "Fonda",
      "Dark kitchen",
      "Otro"
    ]
  },
  {
    "id": "etapa",
    "k": "Tu etapa",
    "q": "¿En qué etapa estás actualmente?",
    "help": "Sé honesto: define por dónde empezamos.",
    "o": [
      "Apenas tengo la idea",
      "Ya estoy planeando",
      "Ya tengo local en vista",
      "Ya tengo local",
      "Ya tengo menú",
      "Ya casi abro",
      "Ya abrí, pero sigo desordenado"
    ]
  },
  {
    "id": "nombre",
    "k": "Tu marca",
    "q": "¿Ya tienes nombre para tu negocio?",
    "help": "",
    "o": [
      "Sí",
      "No"
    ]
  },
  {
    "id": "localq",
    "k": "Tu local",
    "q": "¿Ya tienes local?",
    "help": "",
    "o": [
      "No",
      "Estoy buscando",
      "Sí, rentado",
      "Sí, propio"
    ]
  },
  {
    "id": "presupuesto",
    "k": "Tu dinero",
    "q": "¿Cuál es tu presupuesto aproximado para abrir?",
    "help": "Solo lo que puedes invertir sin quedarte sin colchón.",
    "o": [
      "Menos de $50,000",
      "$50,000 a $100,000",
      "$100,000 a $250,000",
      "$250,000 a $500,000",
      "Más de $500,000"
    ]
  },
  {
    "id": "menuq",
    "k": "Tu menú",
    "q": "¿Ya tienes menú definido?",
    "help": "",
    "o": [
      "Sí",
      "Más o menos",
      "No"
    ]
  },
  {
    "id": "costeo",
    "k": "Tus costos",
    "q": "¿Ya has costeado tus platillos?",
    "help": "",
    "o": [
      "Sí",
      "No"
    ]
  },
  {
    "id": "ventas",
    "k": "Tus ventas",
    "q": "¿Ya sabes cuánto necesitas vender al mes?",
    "help": "",
    "o": [
      "Sí",
      "No"
    ]
  },
  {
    "id": "permisos",
    "k": "Trámites",
    "q": "¿Ya revisaste permisos o trámites?",
    "help": "",
    "o": [
      "Sí",
      "No",
      "Parcialmente"
    ]
  },
  {
    "id": "personal",
    "k": "Tu equipo",
    "q": "¿Cuántas personas piensas contratar al inicio?",
    "help": "",
    "o": [
      "Solo yo",
      "1 a 2",
      "3 a 5",
      "6 o más"
    ]
  },
  {
    "id": "cuando",
    "k": "Tu fecha",
    "q": "¿Cuándo planeas abrir?",
    "help": "Nos ayuda a marcarte el ritmo de tu ruta.",
    "o": [
      "En menos de 3 meses",
      "En 3 a 6 meses",
      "En 6 a 12 meses",
      "Todavía no lo sé"
    ]
  },
  {
    "id": "miedo",
    "k": "Tu prioridad",
    "q": "¿Qué es lo que más te preocupa?",
    "help": "Pondremos esto al frente de tu tablero.",
    "o": [
      "No saber cuánto invertir",
      "No saber cuánto cobrar",
      "No saber si será rentable",
      "No saber qué me falta",
      "No saber por dónde empezar",
      "No saber cómo organizarme"
    ]
  }
];

export type TourStep = {
  tab: string;
  view?: string;
  fab?: boolean;
  t: string;
  b: string;
  tip: string;
};

export const TOUR: TourStep[] = [
  {
    "tab": "inicio",
    "t": "Este es tu tablero",
    "b": "Aquí ves qué tan listo está tu proyecto, tu siguiente paso concreto y si tu inversión cabe en tu presupuesto. Si solo abres una pantalla al día, que sea esta.",
    "tip": "El anillo de avance sube cada vez que completas una tarea."
  },
  {
    "tab": "ruta",
    "t": "Mi Ruta: qué te falta para abrir",
    "b": "Diez módulos, del concepto a la apertura. Toca una tarea para ver por qué importa y qué hacer exactamente. Si un módulo no aplica todavía, puedes omitirlo y no cuenta en tu avance.",
    "tip": "Puedes agregar tus propias tareas a cualquier módulo."
  },
  {
    "tab": "costeador",
    "t": "Costeador: cuánto cuesta cada platillo",
    "b": "Captura ingredientes con su precio de compra y su merma, y la app calcula el costo real por porción, tu food cost y el precio al que deberías venderlo.",
    "tip": "Los botones (i) explican cada término sin tecnicismos."
  },
  {
    "tab": "costeador",
    "view": "menu",
    "t": "Mi Menú: tu carta con números",
    "b": "Tus platillos agrupados por sección, con precio, food cost y utilidad. Te dice cuáles son estrella y cuáles conviene ajustar o quitar.",
    "tip": "Marca qué tanto se vende cada platillo para clasificarlo mejor."
  },
  {
    "tab": "numeros",
    "t": "Números: inversión y punto de equilibrio",
    "b": "Presupuesto de apertura con subconceptos, gastos fijos del mes y cuánto necesitas vender al día para no perder dinero.",
    "tip": "Toca un concepto del presupuesto para desglosarlo por partes."
  },
  {
    "tab": "inicio",
    "fab": true,
    "t": "El botón + captura rápido",
    "b": "Desde cualquier pantalla agregas un platillo, un gasto de apertura, una tarea, un proveedor o una nota. Está a la derecha, junto a tu pulgar.",
    "tip": "Necesita conexión para validar tu acceso; tus datos se guardan en tu teléfono."
  },
  {
    "tab": "mas",
    "t": "Más: tu proyecto y ayuda",
    "b": "Tu perfil, los datos de tu negocio, notas, proveedores, 30 preguntas frecuentes, recursos descargables y los ajustes de color y modo noche.",
    "tip": "Puedes repetir este recorrido cuando quieras desde aquí."
  },
  {
    "tab": "inicio",
    "t": "Listo, empieza por aquí",
    "b": "Regresamos a Inicio: es tu punto de partida cada día. Haz lo que dice \"Tu siguiente paso\" y tu avance sube solo.",
    "tip": "Tu prueba dura 7 días; después desbloqueas todo con un pago único."
  }
];

// ── Adaptador ──────────────────────────────────────────────────────────────

export interface OnboardingQuestion {
  id: string;
  /** Categoría en mayúsculas sobre la pregunta. */
  kicker: string;
  question: string;
  help: string;
  options: string[];
}

export const ONBOARDING_QUESTIONS: readonly OnboardingQuestion[] = QS.map((q) => ({
  id: q.id,
  kicker: q.k,
  question: q.q,
  help: q.help ?? '',
  options: q.o,
}));

export interface TourStepView {
  tab: string;
  view?: string;
  fab?: boolean;
  title: string;
  body: string;
  tip: string;
}

export const TOUR_STEPS: readonly TourStepView[] = TOUR.map((s) => ({
  tab: s.tab,
  view: s.view,
  fab: s.fab,
  title: s.t,
  body: s.b,
  tip: s.tip,
}));
