/**
 * Mi Ruta: 10 módulos y 43 tareas de seed (README § 1.6).
 *
 * Contenido definitivo del producto: título, pista, "por qué importa" y
 * "qué sigue" de cada tarea. `demoDone` marca las tareas que arrancan
 * completadas en los datos de demostración.
 */

import type { RouteModule } from '@/domain/progress';

export interface SeedTask {
  title: string;
  hint: string;
  why: string;
  next: string;
  demoDone: boolean;
}

export interface SeedModule extends RouteModule {
  tasks: SeedTask[];
}

export const ROUTE_MODULES: readonly SeedModule[] = [
  {
    "id": "concepto",
    "name": "Concepto",
    "desc": "Construye la idea central de tu negocio y conéctala con tu cliente ideal.",
    "tasks": [
      {
        "title": "Define el tipo de negocio",
        "hint": "Casual, rápido, temático…",
        "why": "El tipo de negocio define tu inversión, tu personal y tu ticket promedio. Cambiarlo después es carísimo.",
        "next": "Escribe en una frase qué vendes, a quién y en cuánto tiempo lo entregas.",
        "demoDone": true
      },
      {
        "title": "Identifica a tu cliente ideal",
        "hint": "Edad, hábitos y motivaciones.",
        "why": "Sin cliente claro, el menú y los precios se vuelven un volado.",
        "next": "Describe a tu cliente en 3 líneas: quién es, cuándo te visita y cuánto puede pagar.",
        "demoDone": true
      },
      {
        "title": "Crea tu propuesta de valor",
        "hint": "¿Qué te hace único y diferente?",
        "why": "Es la razón por la que te eligen a ti y no al puesto de enfrente.",
        "next": "Completa la frase: \"Somos el único lugar de la zona donde…\".",
        "demoDone": false
      },
      {
        "title": "Investiga a tu competencia",
        "hint": "Conoce sus fortalezas y debilidades.",
        "why": "Sus precios marcan el techo de los tuyos y sus fallas son tu oportunidad.",
        "next": "Visita 5 negocios parecidos y anota precios, tiempos y qué te molestó.",
        "demoDone": false
      },
      {
        "title": "Define tu menú inicial",
        "hint": "Platillos estrella y márgenes objetivo.",
        "why": "Un menú corto se cocina mejor, se compra mejor y deja más utilidad.",
        "next": "Elige entre 8 y 12 platillos y márcalos como estrella.",
        "demoDone": false
      },
      {
        "title": "Valida tu concepto",
        "hint": "Habla con al menos 10 clientes potenciales.",
        "why": "Validar antes de invertir es la forma más barata de equivocarse.",
        "next": "Haz una degustación con 10 personas y pregunta cuánto pagarían.",
        "demoDone": false
      }
    ]
  },
  {
    "id": "local",
    "name": "Local",
    "desc": "Elige dónde vas a abrir y con qué condiciones firmas.",
    "tasks": [
      {
        "title": "Define tu zona objetivo",
        "hint": "Dónde vive o transita tu cliente.",
        "why": "La ubicación es la mitad del éxito en comida.",
        "next": "Elige 2 colonias y cuenta el flujo de gente en dos horarios distintos.",
        "demoDone": true
      },
      {
        "title": "Calcula los metros que necesitas",
        "hint": "Cocina, servicio y almacén.",
        "why": "Rentar de más quema tu presupuesto cada mes.",
        "next": "Dibuja tu cocina mínima y suma el área de mesas que quieres.",
        "demoDone": true
      },
      {
        "title": "Visita al menos 5 locales",
        "hint": "Compara renta, flujo y estado.",
        "why": "El primer local casi nunca es el mejor.",
        "next": "Llena una tabla con renta, metros, flujo y qué obra necesita cada uno.",
        "demoDone": false
      },
      {
        "title": "Negocia renta y depósito",
        "hint": "Meses de gracia y garantía.",
        "why": "Un mes de gracia para obra puede salvarte el arranque.",
        "next": "Pide 1 o 2 meses de gracia para adecuaciones antes de firmar.",
        "demoDone": false
      },
      {
        "title": "Revisa uso de suelo",
        "hint": "Que permita venta de alimentos.",
        "why": "Sin uso de suelo compatible, no hay permisos posibles.",
        "next": "Verifica el uso de suelo del predio con tu municipio.",
        "demoDone": false
      }
    ]
  },
  {
    "id": "equipamiento",
    "name": "Equipamiento",
    "desc": "Compra solo el equipo que tu menú realmente necesita.",
    "tasks": [
      {
        "title": "Lista tu equipo mínimo",
        "hint": "Sin extras que no vas a usar.",
        "why": "La mayoría se sobreequipa y se queda sin capital de trabajo.",
        "next": "Marca cada equipo como indispensable o deseable.",
        "demoDone": true
      },
      {
        "title": "Cotiza la cocina básica",
        "hint": "3 proveedores distintos.",
        "why": "La diferencia entre cotizaciones suele ser de 20% o más.",
        "next": "Consigue 3 cotizaciones formales de tu línea caliente.",
        "demoDone": true
      },
      {
        "title": "Cotiza refrigeración",
        "hint": "Cámara, congelador o refris.",
        "why": "Refrigeración mal calculada se traduce en merma diaria.",
        "next": "Calcula litros necesarios según tus compras semanales.",
        "demoDone": false
      },
      {
        "title": "Define mobiliario y barra",
        "hint": "Mesas, sillas y mostrador.",
        "why": "El mobiliario define cuántos clientes caben, y eso es tu venta máxima.",
        "next": "Dibuja el acomodo y cuenta lugares reales.",
        "demoDone": false
      }
    ]
  },
  {
    "id": "proveedores",
    "name": "Proveedores",
    "desc": "Asegura insumos estables al precio con el que costeaste.",
    "tasks": [
      {
        "title": "Lista tus insumos clave",
        "hint": "Los 10 que mueven tu costo.",
        "why": "Pocos insumos concentran casi todo tu costo de alimentos.",
        "next": "Ordena tus insumos por gasto mensual estimado.",
        "demoDone": false
      },
      {
        "title": "Cotiza 3 proveedores por insumo",
        "hint": "Compara precio y entrega.",
        "why": "Un solo proveedor te deja sin poder negociar.",
        "next": "Arma una tabla comparativa por insumo.",
        "demoDone": false
      },
      {
        "title": "Negocia crédito o descuento",
        "hint": "Pago a 8 o 15 días.",
        "why": "El crédito de proveedor es el financiamiento más barato que existe.",
        "next": "Pide precios por volumen y crédito a 15 días.",
        "demoDone": false
      },
      {
        "title": "Define días de entrega",
        "hint": "Y quién recibe la mercancía.",
        "why": "Entregas desordenadas provocan faltantes en plena venta.",
        "next": "Fija dos días de recepción fijos por semana.",
        "demoDone": false
      }
    ]
  },
  {
    "id": "personal",
    "name": "Personal",
    "desc": "Define con cuánta gente abres sin ahogar tu nómina.",
    "tasks": [
      {
        "title": "Define puestos iniciales",
        "hint": "Quién hace qué en el turno.",
        "why": "Abrir con gente de más es el error de nómina más común.",
        "next": "Escribe el organigrama de tu primer mes.",
        "demoDone": true
      },
      {
        "title": "Calcula tu nómina mensual",
        "hint": "Sueldos más prestaciones.",
        "why": "La nómina es tu segundo gasto fijo más grande.",
        "next": "Suma sueldos + IMSS + prestaciones y llévalo a Gastos fijos.",
        "demoDone": false
      },
      {
        "title": "Define horarios y turnos",
        "hint": "Cubre tus horas pico.",
        "why": "Los turnos mal armados dejan la hora pico sin manos.",
        "next": "Grafica tu venta por hora esperada y asigna personal ahí.",
        "demoDone": false
      },
      {
        "title": "Plan de capacitación",
        "hint": "Receta estándar y servicio.",
        "why": "Sin estándar, cada platillo cuesta distinto y sabe distinto.",
        "next": "Escribe la receta estándar de tus 10 platillos estrella.",
        "demoDone": false
      }
    ]
  },
  {
    "id": "menu",
    "name": "Menú",
    "desc": "Arma una carta corta, rentable y fácil de operar.",
    "tasks": [
      {
        "title": "Elige tus 10 platillos estrella",
        "hint": "Los que te van a distinguir.",
        "why": "El 80% de tu venta vendrá de pocos platillos.",
        "next": "Selecciona 10 y márcalos para costear primero.",
        "demoDone": true
      },
      {
        "title": "Define porciones estándar",
        "hint": "Gramos y piezas exactas.",
        "why": "Sin porción fija, tu costeo no sirve para nada.",
        "next": "Pesa cada ingrediente de tus platillos estrella.",
        "demoDone": true
      },
      {
        "title": "Diseña la carta",
        "hint": "Orden, nombres y precios.",
        "why": "El orden de la carta empuja los platillos que más te dejan.",
        "next": "Coloca tus platillos de mayor margen arriba y a la derecha.",
        "demoDone": false
      },
      {
        "title": "Define tu ticket promedio",
        "hint": "Cuánto gasta cada cliente.",
        "why": "El ticket promedio es la base del punto de equilibrio.",
        "next": "Simula 10 tickets típicos y saca el promedio.",
        "demoDone": false
      }
    ]
  },
  {
    "id": "costeo",
    "name": "Costeo",
    "desc": "Sabe exactamente cuánto cuesta y cuánto deja cada platillo.",
    "tasks": [
      {
        "title": "Costea 10 platillos",
        "hint": "Empieza por los estrella.",
        "why": "Sin costeo, tus precios son adivinanzas y el margen se lo come el insumo.",
        "next": "Abre el Costeador y registra tus 10 platillos estrella.",
        "demoDone": false
      },
      {
        "title": "Define tu food cost objetivo",
        "hint": "Idealmente 28% a 32%.",
        "why": "El food cost objetivo es tu regla para aceptar o rechazar un precio.",
        "next": "Fija tu meta y revisa qué platillos se salen.",
        "demoDone": false
      },
      {
        "title": "Fija precios de venta",
        "hint": "Con base en costo y mercado.",
        "why": "El precio debe cubrir costo, gasto fijo y utilidad, no solo el insumo.",
        "next": "Ajusta precios de los platillos en amarillo y rojo.",
        "demoDone": false
      },
      {
        "title": "Revisa márgenes cada mes",
        "hint": "Los insumos se mueven.",
        "why": "Un aumento de insumos sin ajuste te borra la utilidad.",
        "next": "Agenda una revisión mensual de costos.",
        "demoDone": false
      }
    ]
  },
  {
    "id": "permisos",
    "name": "Permisos",
    "desc": "Abre en regla para no cerrar a los dos meses.",
    "tasks": [
      {
        "title": "Aviso de funcionamiento",
        "hint": "Trámite sanitario básico.",
        "why": "Es el permiso base para vender alimentos.",
        "next": "Reúne comprobante de domicilio, identificación y RFC.",
        "demoDone": true
      },
      {
        "title": "Licencia municipal",
        "hint": "Según tu municipio.",
        "why": "Operar sin licencia expone tu inversión a clausura.",
        "next": "Pregunta requisitos en la ventanilla de tu municipio.",
        "demoDone": false
      },
      {
        "title": "Protección civil",
        "hint": "Extintores y salidas.",
        "why": "Es requisito y también protege a tu gente y a tus clientes.",
        "next": "Cotiza extintores, señalización y capacitación básica.",
        "demoDone": false
      },
      {
        "title": "Alta en el SAT",
        "hint": "Régimen y facturación.",
        "why": "Sin alta fiscal no puedes facturar ni deducir compras.",
        "next": "Elige régimen con tu contador y da de alta actividades.",
        "demoDone": false
      }
    ]
  },
  {
    "id": "marketing",
    "name": "Marketing de apertura",
    "desc": "Que el día uno haya gente, no solo cortina abierta.",
    "tasks": [
      {
        "title": "Crea tu Google Maps",
        "hint": "Con fotos y horarios.",
        "why": "Es el canal gratuito que más clientes nuevos trae en comida.",
        "next": "Publica tu ficha con 10 fotos y horarios correctos.",
        "demoDone": true
      },
      {
        "title": "Abre tus redes sociales",
        "hint": "Nombre y foto consistentes.",
        "why": "La gente valida tu negocio en redes antes de visitarte.",
        "next": "Crea perfiles y publica 6 fotos de tus platillos.",
        "demoDone": false
      },
      {
        "title": "Define tu promoción de apertura",
        "hint": "Rentable, no regalada.",
        "why": "Una promo sin costeo te hace vender perdiendo dinero.",
        "next": "Calcula el food cost de la promo antes de anunciarla.",
        "demoDone": false
      },
      {
        "title": "Consigue 3 aliados locales",
        "hint": "Negocios vecinos.",
        "why": "Los vecinos son tus primeros clientes frecuentes.",
        "next": "Ofrece una degustación a 3 negocios de la cuadra.",
        "demoDone": false
      }
    ]
  },
  {
    "id": "apertura",
    "name": "Apertura",
    "desc": "Ensaya antes del día uno para que nada te tome por sorpresa.",
    "tasks": [
      {
        "title": "Prueba de cocina",
        "hint": "Tiempos y estándar.",
        "why": "Los tiempos de cocina definen cuántos clientes puedes atender.",
        "next": "Cronometra cada platillo en condiciones reales.",
        "demoDone": true
      },
      {
        "title": "Simulacro de servicio",
        "hint": "Con amigos y familia.",
        "why": "Detectas cuellos de botella sin arriesgar reputación.",
        "next": "Invita a 20 personas y opera como si fuera día normal.",
        "demoDone": false
      },
      {
        "title": "Define tu fecha de apertura",
        "hint": "Con permisos en mano.",
        "why": "Abrir sin permisos o sin equipo listo cuesta más que esperar.",
        "next": "Fija la fecha y cuenta hacia atrás las tareas críticas.",
        "demoDone": false
      },
      {
        "title": "Checklist del día 1",
        "hint": "Insumos, gente y caja.",
        "why": "El día uno se olvidan cosas básicas como el cambio en caja.",
        "next": "Imprime tu checklist y asígnale un responsable a cada punto.",
        "demoDone": false
      }
    ]
  }
];

/** 43 tareas repartidas en 10 módulos. */
export const TOTAL_ROUTE_TASKS = ROUTE_MODULES.reduce((a, m) => a + m.tasks.length, 0);

/** Motivos válidos para omitir un módulo (paso 2 del flujo de omisión). */
export const SKIP_REASONS: readonly string[] = [
  "Informalidad temporal de mi negocio",
  "No tengo presupuesto por ahora",
  "No aplica a mi tipo de negocio",
  "Ya lo resolví fuera de la app",
  "Lo haré después de abrir",
  "Otro motivo"
];
