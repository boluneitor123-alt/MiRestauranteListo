// Generado por scripts/extraer-diseno.mjs desde el prototipo de diseño.
// Los 14 módulos de Mi Ruta con sus 90 tareas (const CATS).
// No edites a mano: vuelve a correr el script.

export type RouteTask = {
  /** Título exacto de la tarea. Es la llave de LESSONS y de las ilustraciones. */
  t: string;
  /** Pista corta que se ve bajo el título. */
  h: string;
  /** 1 si el proyecto de ejemplo la trae completada. */
  d?: number;
  /** Por qué importa. */
  why: string;
  /** Tu tarea de hoy. */
  n: string;
};

export type RouteModule = {
  id: string;
  /** Token de color del módulo, sin el prefijo --color-. */
  col: string;
  name: string;
  desc: string;
  /** true en los cuatro mini cursos con estrella. */
  course?: boolean;
  tasks: RouteTask[];
};

export const CATS: RouteModule[] = [
  {
    "id": "concepto",
    "col": "accent-500",
    "name": "Concepto",
    "desc": "Construye la idea central de tu negocio y conéctala con tu cliente ideal.",
    "tasks": [
      {
        "t": "Define el tipo de negocio",
        "h": "Casual, rápido, temático…",
        "d": 1,
        "why": "El tipo de negocio define tu inversión, tu personal y tu ticket promedio. Cambiarlo más adelante resulta costoso.",
        "n": "Escribe en una frase qué vendes, a quién y en cuánto tiempo lo entregas."
      },
      {
        "t": "Identifica a tu cliente ideal",
        "h": "Edad, hábitos y motivaciones.",
        "d": 1,
        "why": "Con un cliente claro, el menú y los precios se deciden mucho más rápido.",
        "n": "Describe a tu cliente en 3 líneas: quién es, cuándo te visita y cuánto puede pagar."
      },
      {
        "t": "Crea tu propuesta de valor",
        "h": "¿Qué te hace único y diferente?",
        "d": 0,
        "why": "Es la razón por la que te eligen a ti y no al puesto de enfrente.",
        "n": "Completa la frase: \"Somos el único lugar de la zona donde…\"."
      },
      {
        "t": "Investiga a tu competencia",
        "h": "Conoce sus fortalezas y debilidades.",
        "d": 0,
        "why": "Sus precios marcan el techo de los tuyos y sus fallas son tu oportunidad.",
        "n": "Visita 5 negocios parecidos y anota precios, tiempos y qué te molestó."
      },
      {
        "t": "Define tu menú inicial",
        "h": "Platillos estrella y márgenes objetivo.",
        "d": 0,
        "why": "Un menú corto se cocina mejor, se compra mejor y deja más utilidad.",
        "n": "Elige entre 8 y 12 platillos y márcalos como estrella."
      },
      {
        "t": "Valida tu concepto",
        "h": "Habla con al menos 10 clientes potenciales.",
        "d": 0,
        "why": "Validar antes de invertir es la forma más barata de afinar la idea.",
        "n": "Haz una degustación con 10 personas y pregunta cuánto pagarían."
      }
    ]
  },
  {
    "id": "local",
    "col": "accent-2-500",
    "name": "Local",
    "desc": "Elige dónde vas a abrir y con qué condiciones firmas.",
    "tasks": [
      {
        "t": "Define tu zona objetivo",
        "h": "Dónde vive o transita tu cliente.",
        "d": 1,
        "why": "La ubicación es la mitad del éxito en comida.",
        "n": "Elige 2 colonias y cuenta el flujo de gente en dos horarios distintos."
      },
      {
        "t": "Calcula los metros que necesitas",
        "h": "Cocina, servicio y almacén.",
        "d": 1,
        "why": "Rentar de más quema tu presupuesto cada mes.",
        "n": "Dibuja tu cocina mínima y suma el área de mesas que quieres."
      },
      {
        "t": "Visita al menos 5 locales",
        "h": "Compara renta, flujo y estado.",
        "d": 0,
        "why": "El primer local casi nunca es el mejor.",
        "n": "Llena una tabla con renta, metros, flujo y qué obra necesita cada uno."
      },
      {
        "t": "Negocia renta y depósito",
        "h": "Meses de gracia y garantía.",
        "d": 0,
        "why": "Un mes de gracia para obra puede salvarte el arranque.",
        "n": "Pide 1 o 2 meses de gracia para adecuaciones antes de firmar."
      },
      {
        "t": "Revisa uso de suelo",
        "h": "Que permita venta de alimentos.",
        "d": 0,
        "why": "El uso de suelo compatible es la base de todos los permisos.",
        "n": "Verifica el uso de suelo del predio con tu municipio."
      }
    ]
  },
  {
    "id": "equipamiento",
    "col": "accent-600",
    "name": "Equipamiento",
    "desc": "Compra solo el equipo que tu menú realmente necesita.",
    "tasks": [
      {
        "t": "Lista tu equipo mínimo",
        "h": "Sin extras que no vas a usar.",
        "d": 1,
        "why": "Conviene reservar capital de trabajo antes de sumar equipo opcional.",
        "n": "Marca cada equipo como indispensable o deseable."
      },
      {
        "t": "Cotiza la cocina básica",
        "h": "3 proveedores distintos.",
        "d": 1,
        "why": "La diferencia entre cotizaciones suele ser de 20% o más.",
        "n": "Consigue 3 cotizaciones formales de tu línea caliente."
      },
      {
        "t": "Cotiza refrigeración",
        "h": "Cámara, congelador o refris.",
        "d": 0,
        "why": "Refrigeración bien calculada te ahorra merma diaria.",
        "n": "Calcula litros necesarios según tus compras semanales."
      },
      {
        "t": "Define mobiliario y barra",
        "h": "Mesas, sillas y mostrador.",
        "d": 0,
        "why": "El mobiliario define cuántos clientes caben, y eso es tu venta máxima.",
        "n": "Dibuja el acomodo y cuenta lugares reales."
      }
    ]
  },
  {
    "id": "proveedores",
    "col": "accent-800",
    "name": "Proveedores",
    "desc": "Asegura insumos estables al precio con el que costeaste.",
    "tasks": [
      {
        "t": "Lista tus insumos clave",
        "h": "Los 10 que mueven tu costo.",
        "d": 0,
        "why": "Pocos insumos concentran casi todo tu costo de alimentos.",
        "n": "Ordena tus insumos por gasto mensual estimado."
      },
      {
        "t": "Cotiza 3 proveedores por insumo",
        "h": "Compara precio y entrega.",
        "d": 0,
        "why": "Tener alternativas te da poder de negociación.",
        "n": "Arma una tabla comparativa por insumo."
      },
      {
        "t": "Negocia crédito o descuento",
        "h": "Pago a 8 o 15 días.",
        "d": 0,
        "why": "El crédito de proveedor es el financiamiento más barato que existe.",
        "n": "Pide precios por volumen y crédito a 15 días."
      },
      {
        "t": "Define días de entrega",
        "h": "Y quién recibe la mercancía.",
        "d": 0,
        "why": "Entregas ordenadas evitan faltantes en plena venta.",
        "n": "Fija dos días de recepción fijos por semana."
      }
    ]
  },
  {
    "id": "personal",
    "col": "accent-2-800",
    "name": "Personal",
    "desc": "Define con cuánta gente abres sin ahogar tu nómina.",
    "tasks": [
      {
        "t": "Define puestos iniciales",
        "h": "Quién hace qué en el turno.",
        "d": 1,
        "why": "Ajustar la plantilla al inicio es la decisión de nómina más rentable.",
        "n": "Escribe el organigrama de tu primer mes."
      },
      {
        "t": "Calcula tu nómina mensual",
        "h": "Sueldos más prestaciones.",
        "d": 0,
        "why": "La nómina suele ser tu segundo gasto fijo más grande.",
        "n": "Suma sueldos + IMSS + prestaciones y llévalo a Gastos fijos."
      },
      {
        "t": "Define horarios y turnos",
        "h": "Cubre tus horas pico.",
        "d": 0,
        "why": "Los turnos alineados a tus picos te dan manos cuando más se necesitan.",
        "n": "Grafica tu venta por hora esperada y asigna personal ahí."
      },
      {
        "t": "Plan de capacitación",
        "h": "Receta estándar y servicio.",
        "d": 0,
        "why": "Con estándar, cada platillo cuesta y sabe igual.",
        "n": "Escribe la receta estándar de tus 10 platillos estrella."
      }
    ]
  },
  {
    "id": "menu",
    "col": "accent-700",
    "name": "Menú",
    "desc": "Arma una carta corta, rentable y fácil de operar.",
    "tasks": [
      {
        "t": "Elige tus 10 platillos estrella",
        "h": "Los que te van a distinguir.",
        "d": 1,
        "why": "El 80% de tu venta vendrá de pocos platillos.",
        "n": "Selecciona 10 y márcalos para costear primero."
      },
      {
        "t": "Define porciones estándar",
        "h": "Gramos y piezas exactas.",
        "d": 1,
        "why": "Con porción fija tu costeo se sostiene mes con mes.",
        "n": "Pesa cada ingrediente de tus platillos estrella."
      },
      {
        "t": "Diseña la carta",
        "h": "Orden, nombres y precios.",
        "d": 0,
        "why": "El orden de la carta empuja los platillos que más te dejan.",
        "n": "Coloca tus platillos de mayor margen arriba y a la derecha."
      },
      {
        "t": "Define tu ticket promedio",
        "h": "Cuánto gasta cada cliente.",
        "d": 0,
        "why": "El ticket promedio es la base del punto de equilibrio.",
        "n": "Simula 10 tickets típicos y saca el promedio."
      }
    ]
  },
  {
    "id": "costeo",
    "col": "accent-2-700",
    "name": "Costeo",
    "desc": "Sabe exactamente cuánto cuesta y cuánto deja cada platillo.",
    "tasks": [
      {
        "t": "Costea 10 platillos",
        "h": "Empieza por los estrella.",
        "d": 0,
        "why": "Con costeo tus precios dejan de ser estimados y el margen queda a la vista.",
        "n": "Abre el Costeador y registra tus 10 platillos estrella."
      },
      {
        "t": "Define tu food cost objetivo",
        "h": "Idealmente 28% a 32%.",
        "d": 0,
        "why": "El food cost objetivo es tu regla para aceptar o rechazar un precio.",
        "n": "Fija tu meta y revisa qué platillos se salen."
      },
      {
        "t": "Fija precios de venta",
        "h": "Con base en costo y mercado.",
        "d": 0,
        "why": "El precio debe cubrir costo, gasto fijo y utilidad, no solo el insumo.",
        "n": "Ajusta precios de los platillos en amarillo y rojo."
      },
      {
        "t": "Revisa márgenes cada mes",
        "h": "Los insumos se mueven.",
        "d": 0,
        "why": "Revisar cada mes mantiene la utilidad en su lugar cuando suben los insumos.",
        "n": "Agenda una revisión mensual de costos."
      }
    ]
  },
  {
    "id": "permisos",
    "col": "accent-900",
    "name": "Permisos",
    "desc": "Abre en regla para no cerrar a los dos meses.",
    "tasks": [
      {
        "t": "Aviso de funcionamiento",
        "h": "Trámite sanitario básico.",
        "d": 1,
        "why": "Es el permiso base para vender alimentos.",
        "n": "Reúne comprobante de domicilio, identificación y RFC."
      },
      {
        "t": "Licencia municipal",
        "h": "Según tu municipio.",
        "d": 0,
        "why": "La licencia protege la inversión que ya hiciste.",
        "n": "Pregunta requisitos en la ventanilla de tu municipio."
      },
      {
        "t": "Protección civil",
        "h": "Extintores y salidas.",
        "d": 0,
        "why": "Es requisito y también protege a tu gente y a tus clientes.",
        "n": "Cotiza extintores, señalización y capacitación básica."
      },
      {
        "t": "Alta en el SAT",
        "h": "Régimen y facturación.",
        "d": 0,
        "why": "Sin alta fiscal no puedes facturar ni deducir compras.",
        "n": "Elige régimen con tu contador y da de alta actividades."
      }
    ]
  },
  {
    "id": "marketing",
    "col": "accent-2-600",
    "name": "Marketing de apertura",
    "desc": "Que el día uno haya gente, no solo cortina abierta.",
    "tasks": [
      {
        "t": "Crea tu Google Maps",
        "h": "Con fotos y horarios.",
        "d": 1,
        "why": "Es el canal gratuito que más clientes nuevos trae en comida.",
        "n": "Publica tu ficha con 10 fotos y horarios correctos."
      },
      {
        "t": "Abre tus redes sociales",
        "h": "Nombre y foto consistentes.",
        "d": 0,
        "why": "La gente valida tu negocio en redes antes de visitarte.",
        "n": "Crea perfiles y publica 6 fotos de tus platillos."
      },
      {
        "t": "Define tu promoción de apertura",
        "h": "Rentable, no regalada.",
        "d": 0,
        "why": "Costear la promo antes de anunciarla te asegura que siga dejando utilidad.",
        "n": "Calcula el food cost de la promo antes de anunciarla."
      },
      {
        "t": "Consigue 3 aliados locales",
        "h": "Negocios vecinos.",
        "d": 0,
        "why": "Los vecinos son tus primeros clientes frecuentes.",
        "n": "Ofrece una degustación a 3 negocios de la cuadra."
      }
    ]
  },
  {
    "id": "apertura",
    "col": "accent-2-900",
    "name": "Apertura",
    "desc": "Ensaya antes del día uno para que nada te tome por sorpresa.",
    "tasks": [
      {
        "t": "Prueba de cocina",
        "h": "Tiempos y estándar.",
        "d": 1,
        "why": "Los tiempos de cocina definen cuántos clientes puedes atender.",
        "n": "Cronometra cada platillo en condiciones reales."
      },
      {
        "t": "Simulacro de servicio",
        "h": "Con amigos y familia.",
        "d": 0,
        "why": "Detectas cuellos de botella sin arriesgar reputación.",
        "n": "Invita a 20 personas y opera como si fuera día normal."
      },
      {
        "t": "Define tu fecha de apertura",
        "h": "Con permisos en mano.",
        "d": 0,
        "why": "Abrir con permisos y equipo listos sale mejor que adelantar la fecha.",
        "n": "Fija la fecha y cuenta hacia atrás las tareas críticas."
      },
      {
        "t": "Checklist del día 1",
        "h": "Insumos, gente y caja.",
        "d": 0,
        "why": "El día uno se olvidan cosas básicas, como el cambio en caja.",
        "n": "Imprime tu checklist y asígnale un responsable a cada punto."
      }
    ]
  },
  {
    "id": "ventas",
    "col": "text",
    "name": "¿Cómo lo venderás?",
    "desc": "Tu mini curso de Meta Ads, todo desde el celular. Es el módulo al que vas a volver cada semana.",
    "course": true,
    "tasks": [
      {
        "t": "Prepara tu página de Facebook e Instagram",
        "h": "La base de todo anuncio.",
        "d": 1,
        "why": "Meta no deja anunciar sin una página, y es lo primero que revisa quien ve tu anuncio.",
        "n": "Crea la página, conéctala con Instagram y sube tu foto de portada."
      },
      {
        "t": "Toma las 9 fotos que sí venden",
        "h": "Con tu celular, sin fotógrafo.",
        "d": 1,
        "why": "La foto decide si alguien se detiene. Pesa más que el texto y que el presupuesto.",
        "n": "Junta 9 fotos: 3 de platillo, 3 de local y 3 de proceso."
      },
      {
        "t": "Instala el Administrador de anuncios",
        "h": "La app gratuita de Meta.",
        "d": 1,
        "why": "Desde ahí controlas presupuesto y resultados; el botón Promocionar te deja a ciegas.",
        "n": "Descarga la app, entra con tu cuenta y ubica el botón Crear."
      },
      {
        "t": "Tu primer anuncio: 3 km a la redonda",
        "h": "El anuncio que todos deben correr.",
        "d": 1,
        "why": "Tus clientes viven o trabajan cerca. Anunciar lejos gasta dinero en gente que nunca irá.",
        "n": "Crea un anuncio de alcance con radio de 3 km alrededor de tu negocio."
      },
      {
        "t": "Define cuánto invertir al día",
        "h": "Empieza chico, sube con datos.",
        "d": 1,
        "why": "Con presupuesto claro pruebas sin arriesgar y sabes cuánto te cuesta cada cliente.",
        "n": "Fija tu presupuesto diario y el número de días de la primera prueba."
      },
      {
        "t": "Escribe el texto que hace que vengan",
        "h": "Tres líneas y una dirección.",
        "d": 1,
        "why": "El texto no vende el platillo: quita las dudas que impiden venir.",
        "n": "Escribe tus tres líneas con la fórmula antojo, razón y cómo llegar."
      },
      {
        "t": "Lee tus resultados sin volverte loco",
        "h": "Solo tres números importan.",
        "d": 1,
        "why": "El panel muestra veinte métricas y solo tres deciden si el anuncio sirve.",
        "n": "Revisa alcance, costo por resultado y mensajes recibidos."
      },
      {
        "t": "Contesta y convierte en WhatsApp",
        "h": "El anuncio no cierra la venta.",
        "d": 1,
        "why": "La mayoría de los clientes se pierde entre el comentario y la respuesta.",
        "n": "Deja listas tus tres respuestas guardadas de WhatsApp."
      },
      {
        "t": "Repite lo que funcionó",
        "h": "Tu rutina semanal de 20 minutos.",
        "d": 0,
        "why": "Anunciar una vez no sirve. La constancia barata gana a la campaña grande.",
        "n": "Agenda 20 minutos cada lunes para revisar y repetir el mejor anuncio."
      }
    ]
  },
  {
    "id": "maps",
    "col": "accent-700",
    "name": "¿Cómo serás el #1 en Google Maps?",
    "desc": "Tu mini curso para llegar a 4.8–5.0 estrellas y aparecer primero cuando alguien busque comida en tu zona.",
    "course": true,
    "tasks": [
      {
        "t": "Reclama tu Perfil de Empresa",
        "h": "El paso que casi nadie completa bien.",
        "d": 1,
        "why": "Sin perfil verificado no apareces en el mapa, y el mapa trae más clientes nuevos que cualquier anuncio pagado.",
        "n": "Crea o reclama tu ficha y elige la categoría exacta de tu giro."
      },
      {
        "t": "Llena tu perfil al 100%",
        "h": "Google premia las fichas completas.",
        "d": 1,
        "why": "Google muestra primero las fichas completas. Cada campo vacío te baja posiciones frente a un vecino que sí lo llenó.",
        "n": "Completa los 12 campos de tu ficha, incluidos atributos y servicios."
      },
      {
        "t": "Sube las fotos que te posicionan",
        "h": "Cuántas, de qué y cada cuándo.",
        "d": 1,
        "why": "Las fichas con más de 20 fotos reciben muchas más solicitudes de indicaciones y llamadas que las que tienen tres.",
        "n": "Sube 20 fotos en el orden que te indicamos y agenda 3 nuevas por semana."
      },
      {
        "t": "Escribe tu descripción y tus servicios",
        "h": "Con las palabras que la gente busca.",
        "d": 1,
        "why": "Google lee tu texto para decidir en qué búsquedas apareces. Las palabras que usa tu cliente son las que te traen.",
        "n": "Escribe tus 750 caracteres con las búsquedas reales de tu zona."
      },
      {
        "t": "Carga tu menú y tus productos",
        "h": "Con precios y fotos por platillo.",
        "d": 1,
        "why": "Un menú cargado en la ficha resuelve la duda del precio antes de que el cliente se vaya a buscar otra opción.",
        "n": "Da de alta tus 10 platillos estrella con foto, descripción y precio."
      },
      {
        "t": "Aprende a detectar al cliente satisfecho",
        "h": "El momento exacto para pedir la reseña.",
        "d": 1,
        "why": "La reseña se pide en el momento del gusto, no en la puerta. Detectar ese momento es toda la técnica.",
        "n": "Aprende las 5 señales y practica identificarlas en un turno."
      },
      {
        "t": "Crea tu QR de reseñas",
        "h": "Gratis y en 10 minutos.",
        "d": 1,
        "why": "Un enlace directo al formulario de reseña convierte muchísimo más que pedirle a alguien que te busque en Google.",
        "n": "Genera tu enlace corto, conviértelo en QR e imprímelo."
      },
      {
        "t": "Coloca el QR donde sí funciona",
        "h": "Cinco lugares, uno gana.",
        "d": 1,
        "why": "El mismo QR en la mesa o en el ticket da resultados muy distintos. La colocación es la mitad del resultado.",
        "n": "Coloca tu QR en los 5 puntos y mide cuál trae más reseñas."
      },
      {
        "t": "Enseña a tu equipo la frase exacta",
        "h": "Ocho palabras, sin presionar.",
        "d": 1,
        "why": "Si cada quien lo pide como puede, casi nadie lo pide. Con un guion corto todos lo hacen igual.",
        "n": "Entrena a tu equipo con el guion y ensáyalo en dos turnos."
      },
      {
        "t": "Responde todas las reseñas",
        "h": "Las buenas y las malas.",
        "d": 0,
        "why": "Responder es señal de actividad para Google y de respeto para quien lee. Una mala reseña bien contestada vende más que diez buenas sin responder.",
        "n": "Contesta las reseñas pendientes usando las plantillas."
      },
      {
        "t": "Publica novedades cada semana",
        "h": "20 minutos, mismo día.",
        "d": 0,
        "why": "Las publicaciones mantienen tu ficha activa, y Google favorece los perfiles que se actualizan.",
        "n": "Programa una publicación semanal con foto y oferta."
      },
      {
        "t": "Mide y sube de nivel",
        "h": "Tres números de tu ficha.",
        "d": 0,
        "why": "Tu ficha te dice cuánta gente te buscó, pidió indicaciones y llamó. Con eso sabes si vas subiendo.",
        "n": "Revisa tus estadísticas y fija tu meta de reseñas del mes."
      }
    ]
  },
  {
    "id": "delivery",
    "col": "accent-2-800",
    "name": "¿Cuánto ganas de verdad en Rappi y UberEats?",
    "desc": "Tu mini curso extendido: te doy de alta paso a paso en cada app y te enseño a calcular lo que te queda después de la comisión. Es donde más gente pierde dinero sin darse cuenta.",
    "course": true,
    "tasks": [
      {
        "t": "Decide si el delivery te conviene",
        "h": "Antes de firmar nada.",
        "d": 1,
        "why": "Las apps cobran entre 25% y 30% de cada venta. Si tu platillo ya trae food cost alto, en la app pierdes dinero en cada pedido.",
        "n": "Corre la calculadora con tu platillo más vendido y mira qué te queda."
      },
      {
        "t": "Reúne tus papeles para el alta",
        "h": "Todo en una carpeta del celular.",
        "d": 1,
        "why": "El alta se atora casi siempre por un documento faltante. Tenerlos juntos convierte tres semanas en tres días.",
        "n": "Junta RFC, constancia fiscal, INE, CLABE y comprobante de domicilio."
      },
      {
        "t": "Date de alta en Rappi paso a paso",
        "h": "Desde el celular, sin intermediarios.",
        "d": 1,
        "why": "Hay gente que cobra por darte de alta. Es gratis y lo haces tú en media hora.",
        "n": "Entra al portal de aliados, llena el formulario y sube tus documentos."
      },
      {
        "t": "Date de alta en UberEats y DiDi Food",
        "h": "Las otras dos que valen.",
        "d": 1,
        "why": "Estar en dos apps duplica tu alcance sin duplicar tu trabajo: es la misma cocina y la misma carta.",
        "n": "Repite el alta en las otras dos plataformas con los mismos papeles."
      },
      {
        "t": "Negocia tu comisión antes de firmar",
        "h": "Sí se puede, casi nadie lo intenta.",
        "d": 1,
        "why": "La comisión no es fija. Según tu categoría y volumen puedes bajarla varios puntos, y cada punto es dinero cada mes.",
        "n": "Pide por escrito tu porcentaje y pregunta por planes de menor comisión."
      },
      {
        "t": "Calcula tu precio de delivery",
        "h": "No es el mismo del local.",
        "d": 1,
        "why": "Vender al mismo precio dentro y en la app es regalar la comisión. El precio de app se calcula al revés.",
        "n": "Usa la calculadora y fija el precio de app de tus 5 platillos más vendidos."
      },
      {
        "t": "Decide qué platillos NO van en la app",
        "h": "La mitad de tu carta no debe ir.",
        "d": 1,
        "why": "Los platillos de food cost alto o que llegan mal a domicilio te queman dinero y reputación al mismo tiempo.",
        "n": "Saca de la app los de food cost arriba de 35% y los que no viajan bien."
      },
      {
        "t": "Costea tu empaque de verdad",
        "h": "El costo que nadie suma.",
        "d": 1,
        "why": "Envase, tapa, bolsa, servilletas y cubiertos suman entre $8 y $22 por pedido. Casi nadie lo mete al costo.",
        "n": "Pesa y cotiza tu empaque completo y súbelo al Costeador."
      },
      {
        "t": "Arma tu carta digital con fotos",
        "h": "En la app, la foto ES el mesero.",
        "d": 1,
        "why": "En una app nadie te pregunta qué recomiendas. La foto y el nombre deciden solos.",
        "n": "Sube foto a cada platillo con fondo limpio y descripción de una línea."
      },
      {
        "t": "Configura horario, zona y tiempos",
        "h": "Lo que más califican los clientes.",
        "d": 1,
        "why": "Prometer 20 minutos y tardar 45 te baja la calificación, y la app castiga con menos visibilidad.",
        "n": "Pon tiempos reales de cocina y cierra la tienda cuando no puedas surtir."
      },
      {
        "t": "Entiende las promociones y quién las paga",
        "h": "El 2x1 sale de tu bolsa.",
        "d": 1,
        "why": "Las apps ofrecen promociones que suenan a favor, pero el descuento lo absorbes tú además de la comisión.",
        "n": "Antes de aceptar una promoción, corre el número con la calculadora."
      },
      {
        "t": "Lee tu estado de cuenta y reclama",
        "h": "Los cobros mal aplicados existen.",
        "d": 0,
        "why": "Entre comisiones, cancelaciones y ajustes se cuelan cargos que no te tocan. Nadie te los devuelve si no reclamas.",
        "n": "Revisa tu depósito semanal contra tus pedidos y reclama diferencias."
      },
      {
        "t": "Empuja el pedido directo por WhatsApp",
        "h": "Tu margen sin comisión.",
        "d": 0,
        "why": "El mismo cliente que te pide por app te puede pedir directo. Ahí te queda todo.",
        "n": "Mete un volante con tu WhatsApp en cada pedido de la app."
      },
      {
        "t": "Revisa cada mes si sigue conviniendo",
        "h": "Una hoja, cinco minutos.",
        "d": 0,
        "why": "El delivery conviene o no según tus números de ese mes, no según lo que decidiste al principio.",
        "n": "Cada mes compara tu utilidad de app contra la de mostrador."
      }
    ]
  },
  {
    "id": "contratar",
    "col": "accent-800",
    "name": "¿Cómo contratar a mi primer trabajador?",
    "desc": "Tu mini curso para contratar sin equivocarte: dónde publicar, qué pedir, cómo filtrar y cómo enseñarle en su primera semana. La primera contratación marca a todas las que siguen.",
    "course": true,
    "tasks": [
      {
        "t": "Define el puesto antes de buscar",
        "h": "Una hoja, cinco renglones.",
        "d": 1,
        "why": "Si no sabes exactamente qué va a hacer, vas a contratar a la primera persona que te caiga bien y a los quince días vas a estar buscando de nuevo.",
        "n": "Escribe el puesto: qué hace, horario, sueldo y a quién le reporta."
      },
      {
        "t": "Pon tus tres filtros obligatorios",
        "h": "Los que no se negocian.",
        "d": 1,
        "why": "Sin filtros vas a entrevistar a veinte personas y a contratar mal. Con estos tres, de veinte te quedan cinco y las cinco sirven.",
        "n": "Fija los tres: 6 meses de cocina, vivir a 5 km y traer solicitud llena."
      },
      {
        "t": "Publica en los grupos de bolsa de trabajo",
        "h": "Facebook, gratis, mismo día.",
        "d": 1,
        "why": "Los grupos de empleo de tu zona te traen candidatos que ya viven cerca. Es el canal más rápido y no cuesta nada.",
        "n": "Publica tu vacante en 5 grupos de bolsa de trabajo de tu ciudad."
      },
      {
        "t": "Pide la solicitud de empleo de papelería",
        "h": "La de $5, llenada a mano.",
        "d": 1,
        "why": "La solicitud llena a mano te dice más que una entrevista: si la trae completa y legible, ya te habló de cómo va a trabajar.",
        "n": "Pide solicitud llena con foto y comprobante de domicilio."
      },
      {
        "t": "Verifica que viva a 5 km",
        "h": "El filtro que casi nadie aplica.",
        "d": 1,
        "why": "El que vive lejos llega tarde, gasta más de lo que gana en pasajes y renuncia al mes. No es su culpa: es distancia.",
        "n": "Revisa su domicilio en el mapa y mide la distancia real a tu local."
      },
      {
        "t": "Confirma sus 6 meses de cocina",
        "h": "Con una llamada de tres minutos.",
        "d": 1,
        "why": "Todo el mundo pone experiencia en la solicitud. La llamada al trabajo anterior es lo que la vuelve cierta.",
        "n": "Llama a su último trabajo y pregunta las tres cosas del guion."
      },
      {
        "t": "Haz la entrevista corta",
        "h": "Quince minutos, cinco preguntas.",
        "d": 1,
        "why": "Las entrevistas largas no predicen nada. Cinco preguntas bien elegidas te dicen si aguanta un turno pesado.",
        "n": "Entrevista con las cinco preguntas y toma nota de cada respuesta."
      },
      {
        "t": "Ponle prueba en cocina de una hora",
        "h": "Pagada, en tu turno flojo.",
        "d": 1,
        "why": "Una hora frente a la plancha te dice lo que ninguna entrevista: si es limpio, si aguanta el ritmo y si pregunta o inventa.",
        "n": "Págale la hora de prueba y califica limpieza, ritmo y actitud."
      },
      {
        "t": "Deja claro el sueldo y el horario",
        "h": "Por escrito, antes de empezar.",
        "d": 1,
        "why": "Casi todos los pleitos con el primer trabajador salen de un acuerdo de palabra que cada uno recuerda distinto.",
        "n": "Escribe sueldo, horario, día de descanso y día de pago, y fírmenlo."
      },
      {
        "t": "Dale de alta como se debe",
        "h": "IMSS y contrato, sin abogado.",
        "d": 1,
        "why": "Un trabajador sin alta te puede costar mucho más que las cuotas, y el alta también te protege a ti si se accidenta.",
        "n": "Da de alta en el IMSS y firma contrato por escrito."
      },
      {
        "t": "Enséñale su primera semana",
        "h": "Tres días, tres cosas.",
        "d": 0,
        "why": "La gente no renuncia del trabajo: renuncia de no saber qué hacer. Una semana bien enseñada te ahorra rotación todo el año.",
        "n": "Arma el plan de sus primeros 3 días y acompáñalo."
      },
      {
        "t": "Evalúa a los 30 días",
        "h": "Sigue o no sigue.",
        "d": 0,
        "why": "Dejar correr a alguien que no funciona por no tener la conversación es el error más caro de un negocio chico.",
        "n": "Ten la conversación de los 30 días con cuatro puntos concretos."
      }
    ]
  }
];

/** Los 10 módulos de la ruta normal. */
export const RUTA_CATS = CATS.filter((c) => !c.course);
/** Los 4 mini cursos con estrella. */
export const CURSO_CATS = CATS.filter((c) => c.course);

export const TOTAL_TASKS = CATS.reduce((a, c) => a + c.tasks.length, 0);
export const TOTAL_MODULES = CATS.length;

/** Llave estable de una tarea dentro de su módulo: id del módulo + índice. */
export const taskKey = (catId: string, index: number) => catId + index;

export const SKIP_REASONS: string[] = [
  "Informalidad temporal de mi negocio",
  "No tengo presupuesto por ahora",
  "No aplica a mi tipo de negocio",
  "Ya lo resolví fuera de la app",
  "Lo haré después de abrir",
  "Otro motivo"
];

// ── Adaptador para el dominio ──────────────────────────────────────────────
// El dominio (progreso, diagnóstico, landing) habla en español largo; el
// prototipo abrevia. Traducimos aquí, una sola vez.

export interface SeedTask {
  title: string;
  hint: string;
  why: string;
  next: string;
  demoDone: boolean;
}

export interface SeedModule {
  id: string;
  name: string;
  desc: string;
  col: string;
  course: boolean;
  tasks: SeedTask[];
}

export const ROUTE_MODULES: readonly SeedModule[] = CATS.map((c) => ({
  id: c.id,
  name: c.name,
  desc: c.desc,
  col: c.col,
  course: !!c.course,
  tasks: c.tasks.map((t) => ({
    title: t.t,
    hint: t.h,
    why: t.why,
    next: t.n,
    demoDone: !!t.d,
  })),
}));

/** Los 90 pasos de la ruta completa, cursos incluidos. */
export const TOTAL_ROUTE_TASKS = TOTAL_TASKS;
