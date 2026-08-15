/**
 * Onboarding: 12 preguntas, una por pantalla (README § 1.3).
 */

export interface OnboardingQuestion {
  id: string;
  /** Kicker 11px uppercase sobre la pregunta. */
  kicker: string;
  question: string;
  help: string;
  options: string[];
}

export const ONBOARDING_QUESTIONS: readonly OnboardingQuestion[] = [
  {
    "id": "giro",
    "kicker": "Tu negocio",
    "question": "¿Qué tipo de negocio de comida quieres abrir?",
    "help": "Con esto ajustamos tus costos y tu ruta.",
    "options": [
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
    "kicker": "Tu etapa",
    "question": "¿En qué etapa estás actualmente?",
    "help": "Sé honesto: define por dónde empezamos.",
    "options": [
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
    "kicker": "Tu marca",
    "question": "¿Ya tienes nombre para tu negocio?",
    "help": "",
    "options": [
      "Sí",
      "No"
    ]
  },
  {
    "id": "localq",
    "kicker": "Tu local",
    "question": "¿Ya tienes local?",
    "help": "",
    "options": [
      "No",
      "Estoy buscando",
      "Sí, rentado",
      "Sí, propio"
    ]
  },
  {
    "id": "presupuesto",
    "kicker": "Tu dinero",
    "question": "¿Cuál es tu presupuesto aproximado para abrir?",
    "help": "Solo lo que puedes invertir sin quedarte sin colchón.",
    "options": [
      "Menos de $50,000",
      "$50,000 a $100,000",
      "$100,000 a $250,000",
      "$250,000 a $500,000",
      "Más de $500,000"
    ]
  },
  {
    "id": "menuq",
    "kicker": "Tu menú",
    "question": "¿Ya tienes menú definido?",
    "help": "",
    "options": [
      "Sí",
      "Más o menos",
      "No"
    ]
  },
  {
    "id": "costeo",
    "kicker": "Tus costos",
    "question": "¿Ya has costeado tus platillos?",
    "help": "",
    "options": [
      "Sí",
      "No"
    ]
  },
  {
    "id": "ventas",
    "kicker": "Tus ventas",
    "question": "¿Ya sabes cuánto necesitas vender al mes?",
    "help": "",
    "options": [
      "Sí",
      "No"
    ]
  },
  {
    "id": "permisos",
    "kicker": "Trámites",
    "question": "¿Ya revisaste permisos o trámites?",
    "help": "",
    "options": [
      "Sí",
      "No",
      "Parcialmente"
    ]
  },
  {
    "id": "personal",
    "kicker": "Tu equipo",
    "question": "¿Cuántas personas piensas contratar al inicio?",
    "help": "",
    "options": [
      "Solo yo",
      "1 a 2",
      "3 a 5",
      "6 o más"
    ]
  },
  {
    "id": "cuando",
    "kicker": "Tu fecha",
    "question": "¿Cuándo planeas abrir?",
    "help": "Nos ayuda a marcarte el ritmo de tu ruta.",
    "options": [
      "En menos de 3 meses",
      "En 3 a 6 meses",
      "En 6 a 12 meses",
      "Todavía no lo sé"
    ]
  },
  {
    "id": "miedo",
    "kicker": "Tu prioridad",
    "question": "¿Qué es lo que más te preocupa?",
    "help": "Pondremos esto al frente de tu tablero.",
    "options": [
      "No saber cuánto invertir",
      "No saber cuánto cobrar",
      "No saber si será rentable",
      "No saber qué me falta",
      "No saber por dónde empezar",
      "No saber cómo organizarme"
    ]
  }
];

/** El recorrido guiado de 7 pasos que sigue al diagnóstico. */
export interface TourStep {
  tab: string;
  view?: string;
  fab?: boolean;
  title: string;
  body: string;
  tip: string;
}

export const TOUR_STEPS: readonly TourStep[] = [
  {
    "tab": "inicio",
    "title": "Este es tu tablero",
    "body": "Aquí ves qué tan listo está tu proyecto, tu siguiente paso concreto y si tu inversión cabe en tu presupuesto. Si solo abres una pantalla al día, que sea esta.",
    "tip": "El anillo de avance sube cada vez que completas una tarea."
  },
  {
    "tab": "ruta",
    "title": "Mi Ruta: qué te falta para abrir",
    "body": "Diez módulos, del concepto a la apertura. Toca una tarea para ver por qué importa y qué hacer exactamente. Si un módulo no aplica todavía, puedes omitirlo y no cuenta en tu avance.",
    "tip": "Puedes agregar tus propias tareas a cualquier módulo."
  },
  {
    "tab": "costeador",
    "title": "Costeador: cuánto cuesta cada platillo",
    "body": "Captura ingredientes con su precio de compra y su merma, y la app calcula el costo real por porción, tu food cost y el precio al que deberías venderlo.",
    "tip": "Los botones (i) explican cada término sin tecnicismos."
  },
  {
    "tab": "costeador",
    "view": "menu",
    "title": "Mi Menú: tu carta con números",
    "body": "Tus platillos agrupados por sección, con precio, food cost y utilidad. Te dice cuáles son estrella y cuáles conviene ajustar o quitar.",
    "tip": "Marca qué tanto se vende cada platillo para clasificarlo mejor."
  },
  {
    "tab": "numeros",
    "title": "Números: inversión y punto de equilibrio",
    "body": "Presupuesto de apertura con subconceptos, gastos fijos del mes y cuánto necesitas vender al día para no perder dinero.",
    "tip": "Toca un concepto del presupuesto para desglosarlo por partes."
  },
  {
    "tab": "inicio",
    "fab": true,
    "title": "El botón + captura rápido",
    "body": "Desde cualquier pantalla agregas un platillo, un gasto de apertura, una tarea, un proveedor o una nota. Está a la derecha, junto a tu pulgar.",
    "tip": "Necesita conexión para validar tu acceso; tus datos se guardan en tu teléfono."
  },
  {
    "tab": "mas",
    "title": "Más: tu proyecto y ayuda",
    "body": "Tu perfil, los datos de tu negocio, notas, proveedores, 30 preguntas frecuentes, recursos descargables y los ajustes de color y modo noche.",
    "tip": "Puedes repetir este recorrido cuando quieras desde aquí."
  },
  {
    "tab": "inicio",
    "title": "Listo, empieza por aquí",
    "body": "Regresamos a Inicio: es tu punto de partida cada día. Haz lo que dice \"Tu siguiente paso\" y tu avance sube solo.",
    "tip": "Tu prueba dura 7 días; después desbloqueas todo con un pago único."
  }
];
