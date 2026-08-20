// Generado por scripts/extraer-diseno.mjs desde el prototipo de diseño.
// El contenido de las 90 lecciones (const LESSONS), indexado por título de tarea.
// No edites a mano: vuelve a correr el script.

export type LessonExample = {
  /** Título de la tabla de ejemplo. */
  t: string;
  /** Renglones [concepto, valor]. */
  r: [string, string][];
  /** Nota que explica qué significan los números. */
  n: string;
};

export type Lesson = {
  /** Minutos que toma. */
  m: number;
  /** Descripción de la ilustración (texto alternativo). */
  img?: string;
  /** Pasos, en orden. */
  s: string[];
  /** El error típico. */
  e: string;
  /** Checklist de "ya quedó cuando…". */
  d: string[];
  /** Tabla de ejemplo. Solo 44 de las 90 lecciones la traen: si falta, no se pinta. */
  x?: LessonExample;
};

export const LESSONS: Record<string, Lesson> = {
  "Define el tipo de negocio": {
    "m": 15,
    "img": "Foto de un negocio del formato que quieres: puesto, local para llevar o local con mesas",
    "s": [
      "Elige el formato: puesto o food truck, local para llevar, o local con mesas. Cada uno cambia tu inversión de 3 a 10 veces.",
      "Escribe tu frase de negocio: qué vendes, a quién y en cuánto tiempo lo entregas. Si no cabe en una línea, todavía no está claro.",
      "Decide tu horario de operación y tus días de descanso. Eso define tu nómina y tus gastos fijos."
    ],
    "e": "Abrir con desayunos, comidas, cenas y eventos a la vez. Empezar por un solo momento del día hace la cocina mucho más manejable.",
    "d": [
      "Puedes explicar tu negocio en una sola frase sin dudar",
      "Sabes si abres con mesas o solo para llevar"
    ]
  },
  "Identifica a tu cliente ideal": {
    "m": 20,
    "img": "Foto del lugar donde está tu cliente: la oficina, la escuela o la obra de junto",
    "s": [
      "Describe a una sola persona real: edad, en qué trabaja, cuánto gana y a qué hora tiene hambre.",
      "Define cuánto puede pagar sin pensarlo. Ese es tu techo de precio, no lo que tú quieras cobrar.",
      "Anota de dónde viene: oficina de al lado, escuela, obra, gente de paso o vecinos del rumbo."
    ],
    "e": "Contestar \"todos\". Cuando el cliente es todos, cuesta mucho más decidir el menú y el precio.",
    "d": [
      "Puedes nombrar a una persona concreta que sería tu cliente típico",
      "Sabes cuánto está dispuesta a pagar por comer contigo"
    ]
  },
  "Crea tu propuesta de valor": {
    "m": 15,
    "img": "Tu frase escrita a mano en una hoja, para verla todos los días",
    "s": [
      "Completa la frase: \"Somos el único lugar de la zona donde…\".",
      "Verifica que sea verdad y que el cliente lo note en el primer bocado o en el primer minuto.",
      "Descarta lo que todos dicen: \"calidad\", \"buen servicio\", \"sazón casero\". Eso no diferencia nada."
    ],
    "e": "Confundir propuesta con eslogan. La propuesta es una razón concreta para preferirte.",
    "d": [
      "Tu frase menciona algo que los vecinos no ofrecen",
      "Alguien ajeno al negocio la entendió sin que le expliques"
    ]
  },
  "Investiga a tu competencia": {
    "m": 90,
    "img": "Fotos de los 5 negocios que visitaste, con sus precios anotados",
    "s": [
      "Visita 5 negocios parecidos como cliente normal. Paga, come y cronometra.",
      "Anota de cada uno: precio del platillo más vendido, tiempo de entrega, cuánta gente había y qué te molestó.",
      "Marca la falla que más se repite. Esa es tu oportunidad más barata."
    ],
    "e": "Ir solo a ver precios. Los tiempos y los detalles del servicio son donde suele estar tu oportunidad.",
    "d": [
      "Tienes precios reales de 5 competidores, no estimados",
      "Identificaste al menos una falla que se repite en varios"
    ]
  },
  "Define tu menú inicial": {
    "m": 40,
    "img": "Tu lista de platillos escrita, con los 3 estrella marcados",
    "s": [
      "Escribe todo lo que te gustaría vender, sin filtro.",
      "Recorta a entre 8 y 12 platillos. Menos es más: se cocina mejor, se compra mejor y sobra menos.",
      "Marca 3 como estrella: los que quieres que la gente pida y recuerde."
    ],
    "e": "Cartas muy largas. Obligan a comprar de todo, y lo que no rota se convierte en merma.",
    "d": [
      "Tu menú tiene 12 platillos o menos",
      "Los ingredientes se repiten entre platillos"
    ]
  },
  "Valida tu concepto": {
    "m": 120,
    "img": "Foto de tu degustación con las 10 personas probando",
    "s": [
      "Prepara tus 3 platillos estrella en tu cocina, tal como los venderías.",
      "Invita a 10 personas que NO sean tu familia. La familia siempre dice que está bueno.",
      "Pregunta una sola cosa clave: \"¿cuánto pagarías por esto?\" y anota la cifra sin discutir."
    ],
    "e": "Preguntar \"¿te gustó?\". Casi todos dicen sí. Preguntar cuánto pagarían da información mucho más útil.",
    "d": [
      "Tienes 10 cifras anotadas de cuánto pagaría cada persona",
      "El promedio se parece al precio que pensabas cobrar"
    ]
  },
  "Define tu zona objetivo": {
    "m": 60,
    "img": "Foto de la banqueta en hora pico, donde contaste el flujo de gente",
    "s": [
      "Elige 2 colonias donde vive o pasa tu cliente ideal.",
      "Párate en la banqueta y cuenta cuánta gente pasa en 15 minutos, en dos horarios distintos.",
      "Compara: la zona con más flujo en TU horario de venta gana, no la que tenga más flujo en general."
    ],
    "e": "Elegir la zona por cercanía a tu casa. Vale la pena revisar primero dónde está tu cliente.",
    "d": [
      "Tienes conteos de flujo de dos horarios en dos zonas",
      "Sabes cuál zona gana y por qué"
    ]
  },
  "Calcula los metros que necesitas": {
    "m": 45,
    "img": "Tu croquis a mano de la cocina y el acomodo de mesas",
    "s": [
      "Dibuja tu cocina mínima: qué equipos entran y cuánto espacio necesita cada uno para trabajar.",
      "Suma el área de mesas que quieres. Cuenta 1.2 m² por comensal, incluyendo pasillos.",
      "Agrega almacén y baño. Ese total es tu mínimo real; rentar más de eso es quemar dinero cada mes."
    ],
    "e": "Rentar grande pensando en crecer. La renta se paga desde el día uno y el crecimiento llega más adelante.",
    "d": [
      "Tienes un número de m² en papel, con desglose",
      "Descartaste locales que se salen de ese número"
    ],
    "x": {
      "t": "Cafetería para 20 comensales",
      "r": [
        [
          "Cocina y barra",
          "14 m²"
        ],
        [
          "Mesas: 20 × 1.2 m²",
          "24 m²"
        ],
        [
          "Almacén y baño",
          "7 m²"
        ],
        [
          "Mínimo real",
          "45 m²"
        ]
      ],
      "n": "Un local de 70 m² a $350/m² te cuesta $8,750 más al mes que uno de 45 m². Son $105,000 al año en espacio que no usas."
    }
  },
  "Visita al menos 5 locales": {
    "m": 180,
    "img": "Fotos de los locales que visitaste, para compararlos después",
    "s": [
      "Agenda 5 visitas el mismo día o el mismo fin de semana, para comparar en caliente.",
      "De cada uno anota: renta, metros, si tiene gas y drenaje de grasa, y qué obra necesita.",
      "Calcula renta por metro cuadrado de cada uno. Ahí se ve quién te está cobrando de más."
    ],
    "e": "Quedarte con el primero. Comparando cinco casi siempre aparece mejor precio o mejor instalación.",
    "d": [
      "Tienes una tabla con los 5 comparados",
      "Sabes cuál tiene el costo de adecuación más bajo"
    ]
  },
  "Negocia renta y depósito": {
    "m": 60,
    "img": "Foto o captura de tu contrato, con las cláusulas de aumento marcadas",
    "s": [
      "Pide 1 o 2 meses de gracia para hacer la obra. Es lo más fácil de conseguir y lo que más te salva.",
      "Negocia el depósito: intenta bajarlo de 2 meses a 1, o pagarlo en dos partes.",
      "Fija por escrito quién paga qué obra y cuánto puede subir la renta cada año."
    ],
    "e": "Firmar sin tope de aumento anual. Dejarlo por escrito te protege el punto de equilibrio del segundo año.",
    "d": [
      "El contrato dice el tope de aumento anual",
      "Tienes al menos un mes de gracia por escrito"
    ],
    "x": {
      "t": "Local de $18,000 al mes",
      "r": [
        [
          "Sin negociar: depósito 2 meses + 1er mes",
          "$54,000"
        ],
        [
          "Negociado: depósito 1 mes + 2 de gracia",
          "$18,000"
        ],
        [
          "Diferencia disponible para equipo",
          "$36,000"
        ]
      ],
      "n": "Esos $36,000 son tu refrigeración completa. La misma renta, distinto arranque."
    }
  },
  "Revisa uso de suelo": {
    "m": 30,
    "img": "Captura de la constancia de uso de suelo que te dio el municipio",
    "s": [
      "Pide al dueño el número de predio o la boleta predial del local.",
      "Consulta en la ventanilla de desarrollo urbano de tu municipio si permite venta de alimentos.",
      "Pide el resultado por escrito antes de firmar cualquier contrato."
    ],
    "e": "Confiar en el \"sí se puede\" verbal. Conviene tenerlo por escrito antes de invertir en obra, porque de ahí dependen todos los permisos.",
    "d": [
      "Tienes constancia o respuesta escrita del municipio",
      "Confirmaste que permite giro de alimentos con preparación"
    ]
  },
  "Lista tu equipo mínimo": {
    "m": 45,
    "img": "Tu lista de equipos dividida en indispensable y deseable",
    "s": [
      "Revisa tu menú platillo por platillo y anota con qué se cocina cada uno.",
      "Marca cada equipo como indispensable o deseable. Si un platillo se puede hacer sin ese equipo, es deseable.",
      "Compra solo indispensables en el arranque. Lo deseable se compra con la utilidad del tercer mes."
    ],
    "e": "Comprar equipo que se usa una vez a la semana. Ese dinero rinde más como capital de trabajo los primeros meses.",
    "d": [
      "Tu lista está dividida en indispensable y deseable",
      "Cada equipo indispensable se justifica con un platillo del menú"
    ]
  },
  "Cotiza la cocina básica": {
    "m": 120,
    "img": "Fotos de las 3 cotizaciones que pediste, para compararlas",
    "s": [
      "Arma una lista idéntica de equipos con medidas y capacidades.",
      "Pide 3 cotizaciones formales por escrito con la MISMA lista. Si cambias la lista, no puedes comparar.",
      "Pregunta por equipo semi-nuevo con garantía. En línea caliente de acero es una compra sensata."
    ],
    "e": "Comparar cotizaciones con equipos distintos. Con la misma lista en las tres, la comparación es real.",
    "d": [
      "Tienes 3 cotizaciones por escrito de la misma lista",
      "Sabes qué incluye instalación y qué no"
    ],
    "x": {
      "t": "Línea caliente de cafetería",
      "r": [
        [
          "Cotización A (nuevo)",
          "$58,000"
        ],
        [
          "Cotización B (nuevo)",
          "$47,500"
        ],
        [
          "Cotización C (semi-nuevo, garantía 6 meses)",
          "$31,000"
        ],
        [
          "Ahorro contra la más alta",
          "$27,000"
        ]
      ],
      "n": "Cotizar tres veces suele mover el precio 20% o más. Es la hora mejor pagada de tu proyecto."
    }
  },
  "Cotiza refrigeración": {
    "m": 60,
    "img": "Foto del refrigerador o cámara que estás considerando, con su ficha técnica",
    "s": [
      "Calcula cuánto compras por semana de producto que necesita frío, en kilos y litros.",
      "Convierte a litros de capacidad: como regla, necesitas el doble del volumen de tu compra semanal.",
      "Cotiza contra ese número y verifica el consumo eléctrico, porque se paga cada mes."
    ],
    "e": "Comprar refrigeración justa. Un poco de holgura te ahorra compras diarias y merma.",
    "d": [
      "Tienes un número de litros calculado, no estimado a ojo",
      "Revisaste el consumo eléctrico de cada opción"
    ]
  },
  "Define mobiliario y barra": {
    "m": 45,
    "img": "Tu croquis con el acomodo de mesas y los pasillos medidos",
    "s": [
      "Dibuja el acomodo de mesas respetando pasillos de 90 cm.",
      "Cuenta lugares reales. Ese número por tu rotación diaria es tu venta máxima posible.",
      "Verifica que ese máximo alcance para cubrir tu punto de equilibrio. Si no alcanza, cambia el local o el precio."
    ],
    "e": "Meter mesas de más. Con pasillos holgados el servicio fluye y la gente vuelve.",
    "d": [
      "Tienes número de lugares reales",
      "Ese número por tu ticket cubre tu punto de equilibrio"
    ]
  },
  "Lista tus insumos clave": {
    "m": 30,
    "img": "Tu lista de insumos ordenada por gasto mensual",
    "s": [
      "Lista todos tus insumos y estima cuánto gastas al mes en cada uno.",
      "Ordénalos de mayor a menor gasto.",
      "Marca los primeros 10. Ahí está la mayor parte de tu costo, y ahí es donde negociar sirve."
    ],
    "e": "Negociar los insumos chicos y dejar los grandes sin revisar. El orden por gasto te dice dónde empezar.",
    "d": [
      "Tu lista está ordenada por gasto mensual",
      "Identificaste tus 10 insumos que mueven el costo"
    ]
  },
  "Cotiza 3 proveedores por insumo": {
    "m": 120,
    "img": "Foto de la central de abasto o de tu tabla comparativa de precios",
    "s": [
      "Para cada uno de tus 10 insumos clave, consigue 3 precios: central de abasto, distribuidor y mayorista local.",
      "Anota precio, unidad de venta, mínimo de compra y días de entrega.",
      "Compara siempre por unidad limpia (peso o litro), no por bulto, o te confundes."
    ],
    "e": "Quedarte con un solo proveedor. Tener alternativas te da con qué negociar cuando llegue un alza.",
    "d": [
      "Tienes 3 precios por cada insumo clave",
      "Los comparaste en la misma unidad de medida"
    ]
  },
  "Negocia crédito o descuento": {
    "m": 45,
    "img": "Captura del mensaje donde tu proveedor acepta el crédito o el descuento",
    "s": [
      "Pide precio por volumen comprometiendo una compra semanal fija.",
      "Pide crédito a 8 o 15 días. Es el financiamiento más barato que existe: no cobra intereses.",
      "Cierra el acuerdo por escrito, aunque sea por mensaje, con precio y plazo."
    ],
    "e": "Pagar todo de contado desde el arranque. El crédito de proveedor te deja efectivo disponible para los meses de subida.",
    "d": [
      "Al menos un proveedor te dio crédito o descuento por volumen",
      "Tienes el acuerdo por escrito"
    ]
  },
  "Define días de entrega": {
    "m": 20,
    "img": "Foto de tu calendario de recepción pegado en la cocina",
    "s": [
      "Fija dos días de recepción por semana y respétalos.",
      "Asigna quién recibe, revisa peso y firma. Sin responsable, entra mercancía que no pediste.",
      "Establece qué pasa si llega incompleto o en mal estado, antes de que pase."
    ],
    "e": "Recibir a cualquier hora. Con días fijos alguien puede pesar y revisar con calma.",
    "d": [
      "Tienes dos días fijos de recepción",
      "Hay un responsable con nombre para recibir y pesar"
    ]
  },
  "Define puestos iniciales": {
    "m": 40,
    "img": "Tu organigrama del primer mes dibujado a mano",
    "s": [
      "Escribe qué tareas hay en un turno completo, de la apertura al cierre.",
      "Agrupa esas tareas en el menor número de personas posible.",
      "Define qué haces tú personalmente el primer mes. Ese es tu ahorro más grande."
    ],
    "e": "Abrir con la plantilla que quieres tener en dos años. Conviene que la nómina crezca al ritmo de la venta.",
    "d": [
      "Tienes organigrama del primer mes con nombres de puesto",
      "Sabes qué tareas cubres tú"
    ]
  },
  "Calcula tu nómina mensual": {
    "m": 40,
    "img": "Tu cálculo de nómina con prestaciones incluidas",
    "s": [
      "Suma los sueldos netos que vas a pagar.",
      "Agrega entre 25% y 35% por IMSS, vacaciones y aguinaldo. Ese cargo existe aunque no lo veas cada mes.",
      "Lleva ese total a Gastos fijos en la sección Números, para que entre a tu punto de equilibrio."
    ],
    "e": "Presupuestar solo el sueldo neto. Contemplar prestaciones desde ahora evita que el aguinaldo salga del capital de trabajo.",
    "d": [
      "Tu nómina incluye prestaciones, no solo sueldos",
      "Ya está capturada en Gastos fijos"
    ],
    "x": {
      "t": "3 personas",
      "r": [
        [
          "Sueldos netos",
          "$24,000"
        ],
        [
          "+ prestaciones (30%)",
          "$7,200"
        ],
        [
          "Costo real mensual",
          "$31,200"
        ],
        [
          "Diferencia anual contra lo presupuestado",
          "$86,400"
        ]
      ],
      "n": "Si presupuestas $24,000 y el costo real es $31,200, tu punto de equilibrio está mal calculado todo el año."
    }
  },
  "Define horarios y turnos": {
    "m": 30,
    "img": "Tu tabla de venta por hora con los turnos encima",
    "s": [
      "Dibuja tu venta esperada hora por hora. Casi todo negocio de comida tiene 2 picos claros.",
      "Asigna más personal en los picos y menos en los valles.",
      "Evita turnos partidos si puedes: cansan y provocan rotación."
    ],
    "e": "Plantilla igual todo el día. Ajustarla a tus picos rinde mucho más.",
    "d": [
      "Tienes una gráfica o tabla de venta por hora",
      "Los turnos coinciden con los picos"
    ]
  },
  "Plan de capacitación": {
    "m": 90,
    "img": "Foto de tus recetas estándar impresas y pegadas en la cocina",
    "s": [
      "Escribe la receta estándar de tus 10 platillos estrella: gramos exactos y pasos numerados.",
      "Imprímelas y pégalas en la cocina, a la vista.",
      "Define el guion de atención: saludo, toma de orden, entrega y despedida."
    ],
    "e": "Enseñar sin receta escrita. Con estándar, cada platillo cuesta y sabe igual, y tu costeo se sostiene.",
    "d": [
      "Tienes 10 recetas estándar por escrito",
      "Cualquiera puede prepararlas leyendo la hoja"
    ]
  },
  "Elige tus 10 platillos estrella": {
    "m": 30,
    "img": "Foto de tus 10 platillos estrella juntos",
    "s": [
      "De tu menú, elige los que quieres que se vuelvan tu firma.",
      "Verifica que compartan ingredientes entre sí, para comprar menos claves y bajar merma.",
      "Márcalos para costearlos primero en el Costeador."
    ],
    "e": "Elegir solo por gusto propio. Cruzarlo con lo que pide el cliente y lo que deja margen da mejor resultado.",
    "d": [
      "Tienes 10 platillos marcados como estrella",
      "Comparten al menos la mitad de sus insumos"
    ]
  },
  "Define porciones estándar": {
    "m": 120,
    "img": "Foto del utensilio con el que sirves cada porción, junto al plato montado",
    "s": [
      "Consigue una báscula de cocina. Es la herramienta más rentable de tu negocio.",
      "Pesa cada ingrediente de cada platillo estrella y anótalo en gramos o mililitros.",
      "Elige el utensilio con el que se sirve esa porción: cucharón, cuchara medidora, vaso."
    ],
    "e": "Servir sin medir. Una porción 15% más grande en tu platillo más vendido se nota en la utilidad del mes.",
    "d": [
      "Tienes gramaje escrito de cada ingrediente",
      "Cada porción tiene un utensilio asignado"
    ]
  },
  "Diseña la carta": {
    "m": 60,
    "img": "Foto o captura de tu carta, o de una carta que te guste como referencia",
    "s": [
      "Ordena por momento de consumo, no por precio.",
      "Coloca tus platillos de mayor margen arriba de cada sección y del lado derecho: es donde va la vista primero.",
      "Quita el signo de pesos y alinea los precios pegados al nombre, no en columna. Reduce la comparación por precio."
    ],
    "e": "Alinear los precios en columna. Invita a comparar por precio en lugar de elegir por antojo.",
    "d": [
      "Tus platillos de mayor margen están en las posiciones de arriba",
      "Los precios no forman columna"
    ]
  },
  "Define tu ticket promedio": {
    "m": 30,
    "img": "Tus 10 tickets simulados con el promedio calculado",
    "s": [
      "Simula 10 tickets típicos: qué pediría una persona sola, una pareja, una familia.",
      "Suma cada ticket y divide entre 10.",
      "Captura ese número en Números. De ahí sale tu punto de equilibrio."
    ],
    "e": "Usar el precio de un platillo como ticket. Casi siempre se pide bebida, así que tu ticket real es más alto.",
    "d": [
      "Tienes un ticket promedio calculado de 10 simulaciones",
      "Ya está capturado en Números"
    ],
    "x": {
      "t": "Cafetería",
      "r": [
        [
          "4 tickets de 1 persona",
          "$95 c/u"
        ],
        [
          "4 tickets de pareja",
          "$210 c/u"
        ],
        [
          "2 tickets de familia",
          "$390 c/u"
        ],
        [
          "Ticket promedio",
          "$200"
        ]
      ],
      "n": "Con gastos fijos de $59,000 al mes y ticket de $200, necesitas 10 clientes al día para cubrir renta, no 5."
    }
  },
  "Costea 10 platillos": {
    "m": 120,
    "img": "Foto de tu platillo estrella junto a la báscula con los gramos a la vista",
    "s": [
      "Abre el Costeador y captura tus 10 estrella, uno por uno.",
      "Por cada ingrediente pon el precio de compra y la presentación en que lo compras. La app saca el costo por gramo.",
      "No olvides la merma: el limón que se seca y la carne que se recorta ya se pagaron."
    ],
    "e": "Costear solo el ingrediente principal. El aceite, la tortilla, la servilleta y el empaque suman más de lo que parece.",
    "d": [
      "Tus 10 estrella tienen food cost calculado",
      "Cada receta incluye empaque y merma"
    ],
    "x": {
      "t": "Taco de pastor",
      "r": [
        [
          "Carne 70 g",
          "$6.30"
        ],
        [
          "Tortilla 2 pz",
          "$1.50"
        ],
        [
          "Guarnición y salsa",
          "$0.87"
        ],
        [
          "Empaque",
          "$0.45"
        ],
        [
          "Costo total",
          "$9.12"
        ],
        [
          "Precio $28 → food cost",
          "38%"
        ]
      ],
      "n": "38% está arriba del rango sano. O subes el precio a $30 o bajas la porción de carne a 60 g."
    }
  },
  "Define tu food cost objetivo": {
    "m": 20,
    "img": "Captura del Costeador con tus platillos y su semáforo",
    "s": [
      "Fija tu meta entre 28% y 32% del precio sin IVA. Ese es el rango sano en comida en México.",
      "Revisa qué platillos se salen de tu meta y márcalos.",
      "Decide para cada uno: subir precio, bajar porción, cambiar proveedor o sacarlo del menú."
    ],
    "e": "Aceptar cualquier food cost. Tener una meta clara te da con qué decidir cuando suba un insumo.",
    "d": [
      "Tienes tu meta escrita",
      "Sabes cuáles platillos se salen y qué vas a hacer con cada uno"
    ],
    "x": {
      "t": "Qué te queda de cada $100 vendidos",
      "r": [
        [
          "Food cost 30%",
          "$30"
        ],
        [
          "Nómina 25%",
          "$25"
        ],
        [
          "Renta y servicios 20%",
          "$20"
        ],
        [
          "Te queda",
          "$25"
        ],
        [
          "Con food cost 45% te queda",
          "$10"
        ]
      ],
      "n": "Cada punto de food cost que bajas se va directo a tu bolsa."
    }
  },
  "Fija precios de venta": {
    "m": 60,
    "img": "Tu lista de precios finales junto a los de la competencia",
    "s": [
      "Toma el precio sugerido que te da el Costeador como piso, no como precio final.",
      "Compáralo con lo que cobran tus 5 competidores por lo mismo.",
      "Redondea hacia arriba a cifra limpia y verifica que el food cost siga en tu rango."
    ],
    "e": "Poner el precio un peso abajo del vecino. Su precio te sirve de referencia, pero tu piso lo marca tu costo.",
    "d": [
      "Todos tus platillos están dentro de tu food cost objetivo",
      "Ningún precio quedó abajo del piso que te dio la app"
    ],
    "x": {
      "t": "Platillo con costo de $9.12",
      "r": [
        [
          "Piso al 32% de food cost",
          "$28.50"
        ],
        [
          "Competencia cobra",
          "$30 a $34"
        ],
        [
          "Tu precio",
          "$32"
        ],
        [
          "Food cost resultante",
          "28.5%"
        ],
        [
          "Utilidad por pieza",
          "$22.88"
        ]
      ],
      "n": "Vender 120 piezas al día a $32 en lugar de $28 son $14,400 más al mes, con el mismo trabajo."
    }
  },
  "Revisa márgenes cada mes": {
    "m": 30,
    "img": "Captura de tu calendario con la cita mensual de revisión",
    "s": [
      "Agenda un día fijo al mes para revisar precios de compra.",
      "Actualiza en el Costeador los insumos que se movieron más de 10%.",
      "Revisa el semáforo: los que pasaron a amarillo o rojo necesitan ajuste este mes, no el próximo."
    ],
    "e": "Costear una vez y no volver. Los insumos se mueven solos, así que conviene revisarlos cada mes.",
    "d": [
      "Tienes fecha fija de revisión en tu calendario",
      "Tus precios de compra son de este mes"
    ]
  },
  "Aviso de funcionamiento": {
    "m": 60,
    "img": "Captura del acuse de tu aviso de funcionamiento",
    "s": [
      "Reúne identificación oficial, comprobante de domicilio del local y tu RFC.",
      "Presenta el aviso ante la autoridad sanitaria de tu estado. En la mayoría es gratuito y en línea.",
      "Imprime el acuse y tenlo visible en el negocio."
    ],
    "e": "Dejarlo para después de abrir. Es el permiso base para vender alimentos y el primero que se revisa en una visita.",
    "d": [
      "Tienes el acuse impreso",
      "Está a la vista en el local"
    ]
  },
  "Licencia municipal": {
    "m": 120,
    "img": "Foto de tu expediente completo antes de ingresarlo",
    "s": [
      "Pregunta en la ventanilla única de tu municipio la lista exacta de requisitos para tu giro.",
      "Junta el expediente completo antes de ir. Ir dos veces cuesta más que preparar bien.",
      "Guarda copia digital de todo en tu teléfono."
    ],
    "e": "Abrir mientras sale el trámite. Vale más esperar el permiso que arriesgar la inversión ya hecha.",
    "d": [
      "Tienes la lista oficial de requisitos",
      "Tu expediente está completo o ya ingresado"
    ]
  },
  "Protección civil": {
    "m": 90,
    "img": "Foto de tus extintores instalados y la señalización de salida",
    "s": [
      "Cotiza extintores según los metros y el tipo de riesgo de tu cocina.",
      "Instala señalización de salida y ruta de evacuación.",
      "Capacita a tu personal en uso de extintor. No es trámite, es que nadie salga lastimado."
    ],
    "e": "Los extintores se vencen. Conviene agendar la recarga desde que los instalas.",
    "d": [
      "Extintores instalados y vigentes",
      "Tu personal sabe usarlos"
    ]
  },
  "Alta en el SAT": {
    "m": 90,
    "img": "Captura de tu constancia de situación fiscal",
    "s": [
      "Define con un contador tu régimen. En negocios de comida chicos suele convenir RESICO.",
      "Da de alta tu actividad económica correcta: preparación de alimentos.",
      "Solicita tu certificado para facturar."
    ],
    "e": "Elegir régimen sin asesoría. La consulta con un contador cuesta bastante menos que cambiarlo después.",
    "d": [
      "Tienes régimen definido y actividad dada de alta",
      "Puedes emitir una factura de prueba"
    ]
  },
  "Crea tu Google Maps": {
    "m": 45,
    "img": "Captura: tu ficha de Google con fotos y horarios cargados",
    "s": [
      "Crea tu Perfil de Empresa con nombre, dirección exacta y categoría correcta.",
      "Sube 10 fotos: fachada, interior, y sobre todo platillos bien iluminados.",
      "Captura horarios reales y actualízalos cuando cambien."
    ],
    "e": "Poner horarios que no cumples. Un cliente que llega y encuentra cerrado suele decirlo en las reseñas.",
    "d": [
      "Tu ficha aparece al buscar tu nombre",
      "Tiene 10 fotos y horarios correctos"
    ]
  },
  "Abre tus redes sociales": {
    "m": 60,
    "img": "Captura: tu perfil de Instagram con las primeras 6 publicaciones",
    "s": [
      "Usa el mismo nombre y la misma foto en todas. Que te encuentren sin adivinar.",
      "Publica 6 fotos de platillos antes de abrir, no después.",
      "Pon tu dirección y horario en la biografía, no solo en un post."
    ],
    "e": "Abrir la cuenta el mismo día, vacía. Con seis fotos previas la gente ya tiene qué ver.",
    "d": [
      "Perfiles creados con nombre consistente",
      "Al menos 6 publicaciones antes de abrir"
    ]
  },
  "Define tu promoción de apertura": {
    "m": 45,
    "img": "Tu promoción diseñada, como la vas a publicar",
    "s": [
      "Elige la promo y cuenta cuánto te cuesta en insumo con el Costeador.",
      "Verifica que aun con descuento el food cost no pase de 45%.",
      "Ponle fecha de término. Una promo sin fecha se vuelve tu precio normal."
    ],
    "e": "El 2x1 sobre el platillo estrella. Duplica el costo del que más te deja; un descuento menor suele funcionar igual.",
    "d": [
      "Calculaste el food cost de la promo",
      "La promo tiene fecha de inicio y de fin"
    ],
    "x": {
      "t": "Platillo de $32 con costo de $9.12",
      "r": [
        [
          "Precio normal · food cost",
          "$32 · 28.5%"
        ],
        [
          "Con 2x1: cobras",
          "$32"
        ],
        [
          "Costo de dos piezas",
          "$18.24"
        ],
        [
          "Food cost del 2x1",
          "57%"
        ],
        [
          "Alternativa: 20% de descuento",
          "$25.60 · 35.6%"
        ]
      ],
      "n": "El 2x1 te deja fuera de rango. El 20% de descuento atrae casi igual y sigue dejando utilidad."
    }
  },
  "Consigue 3 aliados locales": {
    "m": 90,
    "img": "Foto de la degustación que llevaste a los negocios vecinos",
    "s": [
      "Identifica 3 negocios de la cuadra que no compitan contigo pero compartan cliente.",
      "Llévales una degustación gratis a sus empleados, en persona.",
      "Propón algo concreto: descuento a su personal a cambio de que te recomienden."
    ],
    "e": "Confiar solo en volantes. La recomendación de un vecino llega mucho más lejos.",
    "d": [
      "Tres negocios probaron tu comida",
      "Al menos uno aceptó recomendarte"
    ]
  },
  "Prueba de cocina": {
    "m": 180,
    "img": "Foto de tu prueba de cocina en marcha, con el cronómetro visible",
    "s": [
      "Prepara cada platillo en condiciones reales, con tu equipo y tu personal.",
      "Cronometra desde que entra la orden hasta que sale el plato.",
      "Calcula cuántas órdenes por hora aguanta tu cocina. Ese es tu tope real de venta."
    ],
    "e": "Probar los platillos de uno en uno. En hora pico entran varias órdenes juntas, y ahí es donde se miden los tiempos reales.",
    "d": [
      "Tienes tiempo cronometrado por platillo",
      "Sabes cuántas órdenes por hora aguantas"
    ],
    "x": {
      "t": "Capacidad real",
      "r": [
        [
          "Tiempo por orden",
          "6 min"
        ],
        [
          "Estaciones simultáneas",
          "2"
        ],
        [
          "Órdenes por hora",
          "20"
        ],
        [
          "Horas pico al día",
          "3"
        ],
        [
          "Tope de venta en pico",
          "60 órdenes"
        ]
      ],
      "n": "Si tu punto de equilibrio pide 90 órdenes al día y tu cocina aguanta 60 en pico, el problema es de capacidad, no de marketing."
    }
  },
  "Simulacro de servicio": {
    "m": 240,
    "img": "Foto del simulacro con tus 20 invitados",
    "s": [
      "Invita a 20 personas a una hora fija y opera como día normal, cobrando de mentiras.",
      "Que alguien anote los cuellos de botella: dónde se acumula, qué falta, quién se queda parado.",
      "Corrige lo que salió mal y repite el simulacro una segunda vez."
    ],
    "e": "Hacer el simulacro con pocas personas y escalonadas. Con 20 al mismo tiempo aparecen los cuellos de botella.",
    "d": [
      "Hiciste al menos un simulacro con 20 personas a la vez",
      "Tienes lista escrita de qué falló"
    ]
  },
  "Define tu fecha de apertura": {
    "m": 30,
    "img": "Tu calendario con la fecha marcada y la cuenta hacia atrás",
    "s": [
      "Confirma que tienes permisos en mano y equipo instalado y probado.",
      "Cuenta hacia atrás las tareas críticas desde la fecha que quieres.",
      "Deja una semana de colchón. Siempre se atrasa algo."
    ],
    "e": "Anunciar la fecha antes de tener permisos. Conviene avisar cuando ya sea segura, para no gastar la expectativa.",
    "d": [
      "Tienes fecha con permisos ya obtenidos",
      "Tu cuenta hacia atrás incluye una semana de colchón"
    ]
  },
  "Checklist del día 1": {
    "m": 45,
    "img": "Foto de tu checklist impresa y pegada en la cocina",
    "s": [
      "Escribe todo: insumos, cambio en caja, terminal de pago, gas, hielo, uniformes, limpieza.",
      "Asigna un responsable con nombre a cada punto.",
      "Imprímela y pégala en la cocina. La memoria falla el día uno."
    ],
    "e": "El cambio en caja. Es lo más sencillo de la lista y lo que más se olvida el día uno.",
    "d": [
      "Tu checklist está impresa y pegada",
      "Cada punto tiene responsable con nombre"
    ]
  },
  "Prepara tu página de Facebook e Instagram": {
    "m": 30,
    "img": "Captura: tu página ya creada, con foto de perfil, portada y el botón de WhatsApp visible",
    "s": [
      "En la app de Facebook toca tu foto de perfil, luego Páginas y Crear. Ponle exactamente el nombre de tu negocio, sin agregar palabras como \"oficial\" o la colonia.",
      "Elige la categoría Restaurante y captura dirección, teléfono de WhatsApp y horario real. Ese horario es el que Meta le enseña a la gente.",
      "Cambia tu Instagram a cuenta profesional: Configuración, Tipo de cuenta, Cambiar a cuenta profesional. Luego enlázala con tu página desde Configuración de la página, Cuentas vinculadas.",
      "Sube foto de perfil (tu logo, cuadrado) y portada (tu mejor platillo, horizontal). Publica 6 fotos antes de anunciar: nadie confía en una página vacía."
    ],
    "e": "Anunciar con la página recién creada y sin publicaciones. La gente sí entra a ver quién eres antes de decidir, y una página vacía frena la visita.",
    "d": [
      "Tu página aparece al buscar tu negocio en Facebook",
      "Instagram y Facebook están enlazados",
      "Tienes al menos 6 publicaciones y tu WhatsApp visible"
    ]
  },
  "Toma las 9 fotos que sí venden": {
    "m": 60,
    "img": "Tus 9 fotos en cuadrícula: 3 de platillo, 3 de local, 3 de proceso",
    "s": [
      "Ponte junto a una ventana en la mañana o a las 6 de la tarde. Nunca uses flash ni la luz del techo: la comida se ve gris.",
      "Toma 3 fotos de platillo: una desde arriba, una de frente a la altura de la mesa, y una a medio comer o con la mano sirviendo. La tercera es la que más funciona.",
      "Toma 3 del lugar: la fachada con la cortina abierta, el interior con gente si se puede, y un detalle bonito de tu barra o tu plancha.",
      "Toma 3 del proceso: las manos preparando, el vapor saliendo, el trompo girando. El movimiento detiene el dedo.",
      "Guárdalas en un álbum del celular llamado \"Anuncios\". Vas a usarlas durante meses."
    ],
    "e": "Usar fotos de internet o de catálogo. La gente nota que no es tu comida, y cuando llega y no se parece, no vuelve.",
    "d": [
      "Tienes 9 fotos propias tomadas con luz natural",
      "Están juntas en un álbum del celular",
      "Al menos una tiene movimiento o manos"
    ],
    "x": {
      "t": "Qué tanto cambia la foto",
      "r": [
        [
          "Foto con flash de noche · gente que se detiene",
          "1 de cada 100"
        ],
        [
          "Foto con luz de ventana · gente que se detiene",
          "3 de cada 100"
        ],
        [
          "Mismo presupuesto de $150 al día",
          "el triple de alcance útil"
        ]
      ],
      "n": "La foto es lo más barato de arreglar y lo que más mueve tus resultados. Antes de subir presupuesto, cambia la foto."
    }
  },
  "Instala el Administrador de anuncios": {
    "m": 20,
    "img": "Captura: la pantalla de inicio del Administrador de anuncios con el botón Crear",
    "s": [
      "Descarga \"Meta Ads Manager\" (Administrador de anuncios) de la tienda de tu celular. Es gratis y es de Meta.",
      "Entra con la misma cuenta de Facebook donde creaste tu página.",
      "La primera vez te pide crear una cuenta publicitaria: elige México, peso mexicano y tu zona horaria. Esto no se puede cambiar después, revísalo bien.",
      "Agrega tu tarjeta en Configuración de pagos. Meta te cobra cuando acumulas cierto monto, no por adelantado."
    ],
    "e": "Usar el botón azul de \"Promocionar publicación\". Es más fácil, pero no te deja elegir radio exacto ni ver el costo por resultado, y suele salir más caro por el mismo dinero.",
    "d": [
      "Tienes la app instalada y tu cuenta en pesos mexicanos",
      "Tu método de pago está cargado",
      "Encuentras el botón Crear en la app"
    ]
  },
  "Tu primer anuncio: 3 km a la redonda": {
    "m": 40,
    "img": "Captura: el mapa del anuncio con el círculo de 3 km alrededor de tu negocio",
    "s": [
      "En la app toca Crear, y elige el objetivo Interacción si quieres que te escriban, o Tráfico si quieres que vean tu menú. Para empezar: Interacción, con destino Mensajes de WhatsApp.",
      "En Ubicación borra \"México\" y escribe tu dirección. Baja el radio a 3 km. Este es el paso que más dinero te ahorra.",
      "Edad de 18 a 55. No pongas intereses ni segmentaciones raras: en un radio de 3 km el algoritmo trabaja mejor solo.",
      "Sube tu mejor foto de platillo, pega tu texto, y en el botón elige Enviar mensaje de WhatsApp.",
      "Antes de publicar revisa la vista previa en Instagram y en Facebook. Si el texto se corta feo, acórtalo."
    ],
    "e": "Dejar el radio en 25 km o en toda la ciudad. Le pagas a Meta por enseñarle tu taquería a gente que vive a 40 minutos y nunca va a cruzar la ciudad por unos tacos.",
    "d": [
      "Tu anuncio está activo con radio de 3 km",
      "El botón lleva a tu WhatsApp",
      "La vista previa se ve bien en las dos redes"
    ],
    "x": {
      "t": "Mismo presupuesto, distinto radio",
      "r": [
        [
          "Radio 25 km · personas alcanzadas",
          "9,800"
        ],
        [
          "Radio 25 km · las que viven cerca",
          "~700"
        ],
        [
          "Radio 3 km · personas alcanzadas",
          "3,100"
        ],
        [
          "Radio 3 km · las que viven cerca",
          "3,100"
        ],
        [
          "Clientes potenciales reales",
          "4 veces más"
        ]
      ],
      "n": "Menos alcance y más resultados. En comida, cerca vale más que mucho."
    }
  },
  "Define cuánto invertir al día": {
    "m": 25,
    "img": "Captura: la pantalla de presupuesto con tus $150 diarios y los 5 días de duración",
    "s": [
      "Empieza con $100 a $150 pesos al día durante 5 días. Con menos de $80 Meta no junta datos suficientes para aprender.",
      "No lo pongas todo en un solo anuncio: corre 2 anuncios con la misma foto y distinto texto, o el mismo texto y distinta foto. A los 5 días uno va a ganar claramente.",
      "Apaga el que perdió y pásale su presupuesto al que ganó. Eso es todo el secreto.",
      "Sube el presupuesto de a poco: máximo 20% cada 3 días. Si lo duplicas de golpe, Meta reinicia su aprendizaje y el costo sube.",
      "Fija tu tope mensual y no lo pases hasta tener un anuncio que ya te trae clientes."
    ],
    "e": "Gastar $2,000 en un solo día de apertura. Un anuncio necesita días para aprender a quién enseñarse; el mismo dinero repartido en dos semanas rinde mucho más.",
    "d": [
      "Tienes 2 anuncios corriendo con presupuesto de prueba",
      "Sabes tu tope mensual",
      "Anotaste la fecha en que vas a comparar"
    ],
    "x": {
      "t": "Tu primer mes, presupuesto sugerido",
      "r": [
        [
          "Semana 1 · prueba, 2 anuncios a $75 c/u",
          "$1,050"
        ],
        [
          "Semana 2 · el ganador a $150 al día",
          "$1,050"
        ],
        [
          "Semanas 3 y 4 · el ganador a $180 al día",
          "$2,520"
        ],
        [
          "Inversión del mes",
          "$4,620"
        ],
        [
          "Si cada cliente deja $200 de utilidad",
          "con 24 clientes ya salió"
        ]
      ],
      "n": "La pregunta correcta no es cuánto gastas, es cuánto te cuesta traer un cliente. Si te cuesta $40 traer a alguien que deja $200, invierte todo lo que puedas."
    }
  },
  "Escribe el texto que hace que vengan": {
    "m": 30,
    "img": "Captura: la vista previa de tu anuncio como se ve en Instagram",
    "s": [
      "Línea 1, el antojo: nombra el platillo con detalle sensorial. \"Tacos de pastor con piña asada, del trompo directo a tu plato.\"",
      "Línea 2, la razón para hoy: precio, promoción con fecha, o algo que solo tú tienes. \"Martes de 3 tacos por $59, hasta el 30 de agosto.\"",
      "Línea 3, cómo llegar: calle y referencia real, no solo la colonia. \"Av. Juárez 214, frente a la farmacia. Abrimos 6 a 11 pm.\"",
      "Cierra con una instrucción directa: \"Mándanos mensaje y te apartamos mesa.\"",
      "Léelo en voz alta. Si suena a folleto, quítale adjetivos: \"delicioso\", \"único\", \"el mejor sabor\" no convencen a nadie."
    ],
    "e": "Escribir un párrafo largo de historia familiar. Se lee en dos segundos y medio: lo que no cabe en tres líneas no se lee.",
    "d": [
      "Tu texto tiene antojo, razón y dirección",
      "Cabe en tres líneas cortas",
      "Alguien ajeno al negocio supo a dónde llegar con solo leerlo"
    ]
  },
  "Lee tus resultados sin volverte loco": {
    "m": 20,
    "img": "Captura: tu tablero con alcance, costo por resultado y mensajes",
    "s": [
      "Abre la app y mira solo tres columnas: personas alcanzadas, costo por resultado, y resultados (mensajes o clics).",
      "El número que manda es el costo por resultado. En comida local, un mensaje de WhatsApp entre $8 y $25 pesos está bien; arriba de $40 algo hay que cambiar.",
      "Si el costo está alto pero el alcance es bueno, el problema es la foto o el texto. Si el alcance está bajo, el problema es el presupuesto o el radio.",
      "No revises cada hora. Deja correr 3 días completos antes de juzgar: los primeros dos días Meta está aprendiendo y el costo siempre sale más caro."
    ],
    "e": "Apagar el anuncio el primer día porque \"no funcionó\". Casi todos los anuncios se ven mal el día uno y se acomodan al tercero.",
    "d": [
      "Sabes tu costo por resultado",
      "Dejaste correr al menos 3 días antes de decidir",
      "Identificaste si el problema es creativo o de configuración"
    ],
    "x": {
      "t": "Cómo leer tu tablero",
      "r": [
        [
          "Invertiste en 5 días",
          "$750"
        ],
        [
          "Mensajes recibidos",
          "38"
        ],
        [
          "Costo por mensaje",
          "$19.70"
        ],
        [
          "De esos, llegaron al negocio",
          "11"
        ],
        [
          "Costo real por cliente",
          "$68"
        ],
        [
          "Si tu ticket promedio es $200",
          "vale la pena repetir"
        ]
      ],
      "n": "Compara siempre el costo por cliente contra tu ticket. Mientras traer a alguien cueste menos que la utilidad que deja, sigue invirtiendo."
    }
  },
  "Contesta y convierte en WhatsApp": {
    "m": 25,
    "img": "Captura: tus respuestas rápidas guardadas en WhatsApp Business",
    "s": [
      "Activa WhatsApp Business (es gratis) y pon tu mensaje de bienvenida automático con horario y dirección.",
      "Crea 3 respuestas rápidas en Herramientas, Respuestas rápidas: el menú con precios, la ubicación con liga de mapa, y el horario.",
      "Contesta en menos de 10 minutos durante tus horas de venta. Después de 30 minutos la mitad ya comió en otro lado.",
      "Responde también los comentarios del anuncio, aunque sean preguntas obvias. Cada comentario contestado le enseña el anuncio a más gente, gratis.",
      "Guarda el número de quien te escribió. Esa lista es tuya, no de Meta, y te sirve para avisar de promociones."
    ],
    "e": "Dejar los comentarios sin responder. Meta interpreta que el anuncio no genera conversación y deja de mostrarlo, aunque estés pagando.",
    "d": [
      "Tienes WhatsApp Business con mensaje de bienvenida",
      "Tus 3 respuestas rápidas están guardadas",
      "Contestas comentarios el mismo día"
    ]
  },
  "Repite lo que funcionó": {
    "m": 30,
    "img": "Captura: tus dos anuncios comparados, con el ganador marcado",
    "s": [
      "Agenda 20 minutos fijos cada lunes. Es la única rutina de marketing que necesitas.",
      "Revisa cuál anuncio tuvo el costo por resultado más bajo la semana pasada.",
      "Duplícalo (botón Duplicar), cámbiale solo la foto, y déjalo correr contra el original. Siempre debes tener dos compitiendo.",
      "Cambia la foto cada 3 semanas aunque funcione: la misma imagen deja de detener a la gente que ya la vio.",
      "Guarda en una nota de tu celular qué foto y qué texto ganó cada mes. En medio año vas a saber exactamente qué le gusta a tu zona."
    ],
    "e": "Dejar el mismo anuncio corriendo tres meses. Funciona bien las primeras semanas y luego el costo sube solo, porque tu zona ya lo vio muchas veces.",
    "d": [
      "Tienes cita fija semanal en tu calendario",
      "Siempre hay dos anuncios compitiendo",
      "Llevas tu nota de qué ganó cada mes"
    ]
  },
  "Reclama tu Perfil de Empresa": {
    "m": 30,
    "img": "Captura: tu ficha verificada, con el aviso de Google confirmando la propiedad",
    "s": [
      "Busca tu negocio en Google Maps. Si ya aparece, toca el nombre y luego \"¿Es tu empresa?\". Si no aparece, entra a google.com/business y toca Agregar tu empresa.",
      "Escribe el nombre EXACTO de tu rótulo. Nada de \"Tacos El Güero - Los mejores de Coyoacán\": Google penaliza las palabras clave metidas en el nombre y puede suspender tu ficha.",
      "Elige la categoría principal con precisión: \"Taquería\", no \"Restaurante\". La categoría es el factor que más pesa para aparecer en las búsquedas de tu giro.",
      "Agrega 2 o 3 categorías secundarias reales: \"Restaurante mexicano\", \"Comida para llevar\", \"Servicio de comida a domicilio\".",
      "Verifica con el método que te ofrezca: video, postal o teléfono. El video es el más rápido; ten a mano tu rótulo, tu cocina y tu comprobante de domicilio."
    ],
    "e": "Meter palabras clave o la colonia en el nombre del negocio. Da un empujón corto y termina en suspensión de la ficha, que es lo peor que te puede pasar.",
    "d": [
      "Tu ficha aparece con la insignia de verificado",
      "La categoría principal es la de tu giro exacto",
      "Tienes 2 o 3 categorías secundarias"
    ],
    "x": {
      "t": "Por qué importa la categoría",
      "r": [
        [
          "Categoría \"Restaurante\" · búsquedas donde apareces",
          "genéricas"
        ],
        [
          "Categoría \"Taquería\" · búsquedas donde apareces",
          "\"tacos cerca de mí\""
        ],
        [
          "Fichas verificadas contra no verificadas",
          "muchas más visitas"
        ],
        [
          "Costo de verificar",
          "$0"
        ]
      ],
      "n": "Esta lección es gratis y es la que más mueve la aguja de todo el curso. Hazla hoy."
    }
  },
  "Llena tu perfil al 100%": {
    "m": 45,
    "img": "Captura: tu ficha con todos los campos llenos y el indicador de perfil completo",
    "s": [
      "Dirección exacta con número. Si es local interior, escríbelo: \"Local 4, Plaza del Sol\". Luego arrastra el pin al punto real de tu puerta, no al centro de la manzana.",
      "Horario de cada día por separado, incluidos los días que cierras. Agrega horarios especiales de días festivos: Google los muestra y evita que alguien llegue a puerta cerrada.",
      "Teléfono con WhatsApp y tu sitio web. Si no tienes sitio, pon tu Instagram o tu menú en línea: cualquier enlace es mejor que el campo vacío.",
      "Marca todos los atributos que apliquen: acepta tarjeta, servicio a domicilio, para llevar, wifi, accesible en silla de ruedas, terraza, apto para niños, baño. Cada atributo te mete en un filtro de búsqueda distinto.",
      "Llena \"Desde el negocio\": propietario local, negocio familiar. Aparece como insignia y genera cercanía."
    ],
    "e": "Dejar el pin donde Google lo puso por defecto. Si el pin está a media cuadra, las indicaciones llevan a tu cliente al lugar equivocado y eso sí se refleja en las reseñas.",
    "d": [
      "Tu pin cae exactamente en tu puerta",
      "Tienes horarios de los 7 días y de festivos",
      "Marcaste todos los atributos que aplican"
    ]
  },
  "Sube las fotos que te posicionan": {
    "m": 60,
    "img": "Tu cuadrícula de 20 fotos en la ficha: fachada, platillos, interior y equipo",
    "s": [
      "Empieza por las tres obligatorias: logo (cuadrado), portada (horizontal, tu mejor platillo) y fachada con el rótulo visible y la cortina abierta.",
      "Sube 10 de platillos, una por platillo estrella, con luz de ventana. Nómbralas antes de subirlas: \"tacos-de-pastor.jpg\" en lugar de \"IMG_4821.jpg\".",
      "Sube 4 del interior: mesas puestas, la barra, la cocina limpia y una con gente comiendo (pide permiso).",
      "Sube 3 del equipo trabajando: manos preparando, el trompo girando, alguien sirviendo. Estas son las que más se ven.",
      "Agenda 3 fotos nuevas cada semana, siempre el mismo día. Google favorece las fichas con fotos recientes, y las viejas dejan de detener a la gente."
    ],
    "e": "Subir 30 fotos el primer día y ninguna después. Google lee la frecuencia, no solo la cantidad: tres por semana durante un mes rinde más que treinta de golpe.",
    "d": [
      "Tienes 20 fotos o más en tu ficha",
      "Todas son propias y con luz natural",
      "Tienes agendado tu día de subir fotos"
    ],
    "x": {
      "t": "Lo que cambia con las fotos",
      "r": [
        [
          "Ficha con 3 fotos · solicitudes de indicaciones",
          "base"
        ],
        [
          "Ficha con 20+ fotos",
          "muy por arriba"
        ],
        [
          "Fotos nuevas cada semana",
          "sube el posicionamiento"
        ],
        [
          "Costo",
          "$0 y tu celular"
        ]
      ],
      "n": "Es el trabajo mejor pagado por hora que existe en tu negocio: gratis, y decide quién aparece primero."
    }
  },
  "Escribe tu descripción y tus servicios": {
    "m": 40,
    "img": "Captura: tu descripción de 750 caracteres escrita en la ficha",
    "s": [
      "Abre Google Maps y escribe lo que buscaría tu cliente: \"tacos cerca de mí\", \"desayunos [tu colonia]\", \"comida para llevar [tu zona]\". Anota las frases que salen en las sugerencias: esas son las búsquedas reales de tu zona.",
      "Escribe 750 caracteres usando esas frases de forma natural. Primera oración: qué eres y dónde. Después: tus platillos con nombre propio, tu horario fuerte y tus formas de pago.",
      "Menciona tus referencias de ubicación: \"frente a la farmacia\", \"a una cuadra del metro\". La gente busca así y Google lo lee.",
      "No repitas la misma palabra clave cinco veces. Google lo detecta y castiga; una o dos menciones naturales bastan.",
      "Da de alta tus servicios uno por uno: comer en el lugar, para llevar, entrega a domicilio, eventos. Cada uno es una puerta de entrada distinta."
    ],
    "e": "Copiar la descripción de otro negocio o llenarla de adjetivos. Google compara textos, y \"el mejor sabor, calidad y servicio\" no aparece en ninguna búsqueda de nadie.",
    "d": [
      "Tu descripción usa frases que la gente sí busca",
      "Menciona referencias reales de ubicación",
      "Tus servicios están dados de alta uno por uno"
    ]
  },
  "Carga tu menú y tus productos": {
    "m": 50,
    "img": "Captura: tus platillos cargados en la ficha con foto, descripción y precio",
    "s": [
      "En tu ficha entra a Menú (o Productos si tu categoría no muestra menú) y da de alta tus 10 platillos estrella.",
      "Cada platillo con su nombre real, una descripción de una línea con los ingredientes, su precio exacto y su foto propia.",
      "Usa los precios que salieron de tu Costeador, no números redondos inventados. Si el precio del anuncio no coincide con el de la caja, pierdes la venta y ganas una mala reseña.",
      "Agrupa por secciones: entradas, fuertes, bebidas, postres. Aparece ordenado y se ve profesional.",
      "Actualiza los precios el mismo día que los cambias en tu carta física."
    ],
    "e": "Cargar solo cuatro platillos \"de muestra\". El menú incompleto hace que el cliente se vaya a la ficha del vecino que sí puso todo.",
    "d": [
      "Tus 10 estrella están cargados con foto y precio",
      "Los precios coinciden con tu carta física",
      "Están agrupados por secciones"
    ]
  },
  "Aprende a detectar al cliente satisfecho": {
    "m": 25,
    "img": "Escena: alguien comiendo con gesto de gusto, el momento exacto de pedir la reseña",
    "s": [
      "Aprende las 5 señales: (1) se comió todo y limpió el plato, (2) dijo algo bueno en voz alta, (3) le tomó foto a la comida, (4) pidió algo más o repitió, (5) vino recomendado por alguien.",
      "El momento correcto es justo cuando pasa la señal, con el plato todavía en la mesa. No en la puerta cuando ya va de salida y con las manos ocupadas.",
      "Nunca lo pidas si algo salió mal, si esperó de más, o si notas prisa o mal gesto. Ahí lo que toca es resolver, no pedir.",
      "Que lo pida quien atendió, no el cajero. La relación ya está hecha y el sí llega más fácil.",
      "Una regla simple: pide máximo a 3 mesas por turno, a las que dieron señal clara. Vale más pocas reseñas de 5 estrellas que muchas tibias."
    ],
    "e": "Pedirle a todos por igual, incluido a quien salió a medias. Ahí es donde nacen las reseñas de 3 estrellas, que pesan más de lo que crees en tu promedio.",
    "d": [
      "Puedes nombrar las 5 señales de memoria",
      "Identificaste al menos 3 clientes satisfechos en un turno",
      "Sabes en qué casos NO pedirla"
    ],
    "x": {
      "t": "Por qué pedirle solo al satisfecho",
      "r": [
        [
          "20 reseñas · 18 de cinco y 2 de cuatro",
          "4.9 ★"
        ],
        [
          "20 reseñas pedidas a todos · mezcladas",
          "4.2 ★"
        ],
        [
          "Lo que muestra Google arriba de 4.7",
          "insignia y mejor posición"
        ],
        [
          "Umbral donde la gente duda",
          "abajo de 4.3 ★"
        ]
      ],
      "n": "La diferencia entre 4.9 y 4.2 no es la comida: es a quién le pediste la reseña."
    }
  },
  "Crea tu QR de reseñas": {
    "m": 25,
    "img": "Tu QR impreso en un pequeño soporte de mesa, junto a la frase de la reseña",
    "s": [
      "Entra a tu Perfil de Empresa desde el celular, toca Reseñas y busca \"Obtener más reseñas\" o \"Compartir formulario de reseña\". Google te da un enlace corto tipo g.page/r/…",
      "Copia ese enlace: abre directo el formulario con las estrellas listas, sin que la persona tenga que buscarte.",
      "Convierte el enlace en QR con cualquier generador gratuito. Descárgalo en PNG grande.",
      "Diseña la tarjeta: el QR grande al centro, arriba la frase \"¿Nos dejarías una reseña? Nos ayudarías muchísimo\", abajo tu nombre y tus estrellas actuales.",
      "Imprime 10 en papel grueso y mándalas plastificar. Con salsa y manos grasosas, el papel simple dura dos días."
    ],
    "e": "Usar un QR que lleva a tu ficha en lugar de al formulario. La persona tiene que buscar el botón de escribir reseña y ahí se pierden la mitad.",
    "d": [
      "Tu QR abre directo el formulario con estrellas",
      "Tienes 10 tarjetas impresas y plastificadas",
      "Probaste el QR con tu propio teléfono"
    ]
  },
  "Coloca el QR donde sí funciona": {
    "m": 30,
    "img": "Los cinco puntos de colocación: mesa, ticket, mostrador, empaque y entrada",
    "s": [
      "Punto 1, en la mesa junto al salero: es el que más funciona, porque está ahí en el momento del gusto.",
      "Punto 2, en el portacuentas o junto al ticket: llega justo cuando la persona ya decidió que estuvo bien.",
      "Punto 3, en el mostrador de la caja, a la altura de la vista.",
      "Punto 4, pegado en el empaque de la comida para llevar: alcanza a quien no se sentó contigo.",
      "Punto 5, en la puerta al salir, con la tarjeta a la mano de quien despide.",
      "Prueba dos semanas, cuenta cuántas reseñas entraron y quédate con los dos puntos que más trajeron."
    ],
    "e": "Un solo QR pegado en la pared del fondo. Nadie se levanta a escanear algo que está lejos: tiene que estar al alcance de la mano.",
    "d": [
      "Tienes QR en los 5 puntos",
      "Llevas la cuenta de reseñas nuevas por semana",
      "Identificaste tus 2 puntos ganadores"
    ]
  },
  "Enseña a tu equipo la frase exacta": {
    "m": 30,
    "img": "Alguien del equipo entregando la tarjeta con el QR a un cliente en la mesa",
    "s": [
      "La frase es corta y no presiona: \"¿Nos dejarías una reseña? Nos ayudarías muchísimo.\" Nada más. Sin explicar, sin insistir.",
      "Se entrega la tarjeta con el QR en la mano mientras se dice. El objeto físico hace la mitad del trabajo.",
      "Si dice que no o no contesta, se responde \"sin problema, gracias por venir\" y se retira la tarjeta. Nunca se repite la petición.",
      "Nunca se ofrece nada a cambio: ni descuento, ni bebida, ni postre. Google prohíbe incentivar reseñas y puede borrarte todas.",
      "Ensáyalo dos turnos completos con tu equipo y revisa juntos cuántas entraron. Cuando ven el número subir, lo hacen solos."
    ],
    "e": "Ofrecer un refresco gratis por la reseña. Además de prohibido, te trae reseñas huecas de una línea que Google detecta y filtra.",
    "d": [
      "Todo tu equipo dice la misma frase",
      "Nadie ofrece nada a cambio",
      "Ensayaron al menos dos turnos"
    ]
  },
  "Responde todas las reseñas": {
    "m": 30,
    "img": "Captura: tus reseñas con respuesta del propietario debajo de cada una",
    "s": [
      "Responde en menos de 48 horas. Google cuenta la actividad de la ficha, y quien lee ve que estás presente.",
      "A las de 5 estrellas: agradece por su nombre y menciona el platillo que pidió. \"Gracias Laura, nos alegra que el pastor te haya gustado. Te esperamos el jueves.\" Dos líneas.",
      "A las de 1 a 3 estrellas: agradece, reconoce lo que pasó sin excusas, di qué vas a corregir y ofrece resolverlo en privado. Nunca discutas ni des explicaciones largas.",
      "No copies y pegues la misma respuesta. Se nota, y la respuesta genérica resta credibilidad.",
      "La respuesta a una mala reseña no es para quien se quejó: es para los siguientes cien que la van a leer."
    ],
    "e": "Defenderse o dar explicaciones largas en una mala reseña. Quien lee no juzga lo que pasó, juzga cómo respondiste.",
    "d": [
      "No tienes reseñas sin responder",
      "Tus respuestas mencionan el nombre y el platillo",
      "Ninguna respuesta está copiada de otra"
    ]
  },
  "Publica novedades cada semana": {
    "m": 20,
    "img": "Captura: tu publicación semanal en la ficha con foto y oferta",
    "s": [
      "En tu ficha entra a Publicaciones y elige Novedad, Oferta o Evento.",
      "Cada semana, mismo día: una foto nueva, dos líneas de texto y un botón. Rota entre platillo del día, oferta con fecha, y algo que pasa en el negocio.",
      "Las publicaciones caducan a los 7 días, así que la constancia es el punto: una ficha con publicación de esta semana se ve viva.",
      "Usa el botón de Llamar o Pedir indicaciones, no el de Más información. Los dos primeros llevan a acción directa.",
      "Agéndalo junto a tu revisión de anuncios del lunes: son 20 minutos que cubren las dos cosas."
    ],
    "e": "Publicar tres veces la primera semana y abandonarlo. Google mide constancia; una publicación semanal sostenida vale más que cinco de golpe.",
    "d": [
      "Tienes publicación de esta semana",
      "Tu día de publicar está en el calendario",
      "Usas botones de acción directa"
    ]
  },
  "Define el puesto antes de buscar": {
    "m": 20,
    "img": "Hoja con el puesto definido en cinco renglones",
    "s": [
      "Escribe en una hoja cinco cosas: qué va a hacer exactamente (no \"ayudar\", sino \"preparar la plancha, cortar verdura, lavar loza\"), el horario con hora de entrada y salida, el sueldo semanal, el día de descanso y a quién le reporta.",
      "Decide si necesitas cocinero, ayudante de cocina o alguien de mostrador. No es lo mismo y el sueldo cambia mucho.",
      "Calcula el sueldo con prestaciones incluidas, no el sueldo pelón: al sueldo súmale entre 25% y 30% por IMSS, aguinaldo y vacaciones. Ese es tu costo real.",
      "Verifica en Números que ese costo real cabe en tus gastos fijos. Si no cabe, ajusta el puesto o las horas antes de publicar.",
      "Ponle nombre al puesto tal como lo vas a publicar: \"Ayudante de cocina, turno matutino, colonia Centro\"."
    ],
    "e": "Contratar \"alguien que me ayude\". Sin puesto definido nadie sabe qué hacer, y a los quince días vuelves a buscar.",
    "d": [
      "Tienes el puesto escrito en cinco renglones",
      "Sabes tu costo real con prestaciones",
      "Verificaste que cabe en tus gastos fijos"
    ],
    "x": {
      "t": "Tu costo real de un ayudante",
      "r": [
        [
          "Sueldo semanal",
          "$1,800"
        ],
        [
          "Al mes",
          "$7,800"
        ],
        [
          "Más prestaciones (28%)",
          "+$2,184"
        ],
        [
          "Costo real al mes",
          "$9,984"
        ],
        [
          "Lo que debes presupuestar",
          "$10,000"
        ]
      ],
      "n": "Casi todo mundo presupuesta $7,800 y se sorprende con la diferencia. Los $2,184 no son opcionales: son la ley."
    }
  },
  "Pon tus tres filtros obligatorios": {
    "m": 15,
    "img": "Tres filtros marcados: experiencia, distancia y solicitud",
    "s": [
      "Filtro 1 · Mínimo 6 meses de experiencia en cocina, en un solo lugar. No importa si fue una fonda o un restaurante grande: importa que aguantó seis meses.",
      "Filtro 2 · Que viva a máximo 5 km de tu local. Este filtro es el que más rotación te ahorra y el que casi nadie aplica.",
      "Filtro 3 · Que traiga la solicitud de empleo de papelería llena a mano, con foto. Si no la trae, no hay entrevista.",
      "Escribe los tres filtros en tu publicación, tal cual. Vas a recibir menos candidatos, pero los que lleguen van a servir.",
      "No negocies los filtros por simpatía. El día que le des la vuelta a uno, es el día en que empieza el problema."
    ],
    "e": "Bajar un filtro porque \"se ve buena persona\". Los tres filtros no miden si es buena persona: miden si va a durar.",
    "d": [
      "Tus tres filtros están escritos",
      "Están en tu publicación",
      "Decidiste no negociarlos"
    ],
    "x": {
      "t": "Por qué estos tres",
      "r": [
        [
          "6 meses de cocina",
          "ya sabe el ritmo y el calor"
        ],
        [
          "Vivir a 5 km",
          "llega temprano y no gasta en pasajes"
        ],
        [
          "Solicitud llena a mano",
          "muestra orden y compromiso"
        ],
        [
          "De 20 candidatos",
          "te quedan 5"
        ],
        [
          "De esos 5",
          "los 5 sirven"
        ]
      ],
      "n": "Filtrar antes de entrevistar te ahorra diez entrevistas inútiles. El filtro trabaja por ti mientras tú cocinas."
    }
  },
  "Publica en los grupos de bolsa de trabajo": {
    "m": 30,
    "img": "Publicación de vacante en un grupo de empleo de Facebook",
    "s": [
      "En Facebook busca \"bolsa de trabajo\" más el nombre de tu ciudad o tu colonia. Vas a encontrar varios grupos con miles de personas de tu zona. Pide entrar a cinco.",
      "Escribe la publicación así: puesto, colonia, horario, sueldo semanal, los tres requisitos y cómo contactarte. Corta y directa.",
      "Pon el sueldo. Las vacantes sin sueldo reciben la mitad de respuestas y atraen a quien está desesperado, no a quien te conviene.",
      "Agrega una foto de tu local o de tu cocina limpia. La vacante con foto se ve real; la que no, parece estafa.",
      "Pide que te escriban por WhatsApp con una frase clave, por ejemplo \"vengo por la vacante de cocina\". Así separas a quien leyó de quien solo reaccionó.",
      "Vuelve a publicar cada tres días, no todos los días. Publicar diario te saca del grupo por spam.",
      "Complementa con un cartel impreso en tu propia cortina: quien pasa por tu calle ya vive cerca."
    ],
    "e": "Publicar sin sueldo y sin horario. Te llenas de mensajes de gente que ni siquiera puede cubrir el turno.",
    "d": [
      "Estás en al menos 5 grupos de tu zona",
      "Tu publicación trae sueldo, horario y los tres requisitos",
      "Tienes un cartel en tu local"
    ],
    "x": {
      "t": "Tu publicación, línea por línea",
      "r": [
        [
          "Título",
          "Ayudante de cocina · col. Centro"
        ],
        [
          "Horario",
          "L a S, 9 a 6, descanso domingo"
        ],
        [
          "Sueldo",
          "$1,800 a la semana"
        ],
        [
          "Requisitos",
          "6 meses cocina · vivir cerca · solicitud"
        ],
        [
          "Contacto",
          "WhatsApp con la frase clave"
        ],
        [
          "Costo total",
          "$0"
        ]
      ],
      "n": "Este canal es gratis y te da candidatos de tu propia colonia. Antes de pagar un anuncio, agota los cinco grupos."
    }
  },
  "Pide la solicitud de empleo de papelería": {
    "m": 15,
    "img": "Solicitud de empleo llenada a mano con fotografía",
    "s": [
      "Pide la solicitud de empleo común, la que venden en cualquier papelería por unos pesos. Llenada a mano, con fotografía pegada.",
      "Que la traiga el día de la entrevista, ya llena. No se la llenes tú ni le des la hoja ahí mismo: la tarea es parte de la prueba.",
      "Cuando la recibas, revisa cuatro cosas antes de hablar: que esté completa sin campos vacíos, que la letra se entienda, que el domicilio esté escrito y que traiga teléfonos de sus trabajos anteriores.",
      "La solicitud llena a mano te dice cómo va a trabajar: quien la entrega completa y limpia suele ser ordenado en la cocina. Quien la trae a medias, también trabaja a medias.",
      "Guarda todas las solicitudes en una carpeta física, aunque no contrates. Cuando necesites cubrir un turno de urgencia, ahí tienes a quién llamar.",
      "Pídele también copia de INE y comprobante de domicilio: los vas a necesitar para el alta en el IMSS."
    ],
    "e": "Aceptar \"luego se la traigo\". Quien no cumple el primer compromiso antes de entrar, tampoco cumple los de adentro.",
    "d": [
      "Tienes solicitud llena a mano con foto",
      "Revisaste los cuatro puntos",
      "Tienes copia de INE y comprobante de domicilio"
    ],
    "x": {
      "t": "Qué revisar en la solicitud",
      "r": [
        [
          "Campos vacíos",
          "ninguno"
        ],
        [
          "Letra",
          "que se entienda"
        ],
        [
          "Domicilio completo",
          "con calle y colonia"
        ],
        [
          "Teléfonos anteriores",
          "al menos uno"
        ],
        [
          "Foto pegada",
          "sí"
        ],
        [
          "Costo para ti",
          "$0"
        ]
      ],
      "n": "Es el filtro más barato que existe y te dice más que media hora de entrevista. Una solicitud a medias te ahorró el problema."
    }
  },
  "Verifica que viva a 5 km": {
    "m": 10,
    "img": "Mapa con el radio de 5 km alrededor del local",
    "s": [
      "Toma el domicilio de la solicitud y búscalo en el mapa de tu celular. Mide la distancia real hasta tu local.",
      "Si pasa de 5 km, calcula cuánto va a gastar en pasajes al mes. Muchas veces son $1,200 o más: casi un cuarto de su sueldo.",
      "Pregúntale cómo se va a trasladar y cuánto tarda. Si son dos camiones y hora y media, va a llegar tarde tarde o temprano, y no por flojera.",
      "El que vive cerca puede cubrirte una urgencia, cerrar tarde sin miedo y llegar caminando cuando llueve. Eso no lo compras con sueldo.",
      "Si te llega alguien excelente que vive lejos, la única salida honesta es ajustar el sueldo o el horario para que le funcione. Si no puedes, no lo contrates: se va a ir solo."
    ],
    "e": "Contratar a alguien de la otra punta de la ciudad porque cayó bien. Es la causa número uno de renuncia al mes.",
    "d": [
      "Mediste la distancia real en el mapa",
      "Preguntaste cómo se traslada y cuánto tarda",
      "Descartaste a quien no puede sostener el traslado"
    ],
    "x": {
      "t": "Lo que cuesta vivir lejos",
      "r": [
        [
          "Vive a 3 km",
          "llega caminando, $0 de pasaje"
        ],
        [
          "Vive a 12 km",
          "$1,200 al mes en pasajes"
        ],
        [
          "Sobre un sueldo de $7,800",
          "el 15% de su sueldo"
        ],
        [
          "Riesgo de renuncia",
          "alto al primer mes"
        ],
        [
          "Riesgo de retardos",
          "alto todos los días"
        ]
      ],
      "n": "No es un capricho tuyo: es que el traslado se le come el sueldo. Contratar cerca es cuidarlo y cuidarte."
    }
  },
  "Confirma sus 6 meses de cocina": {
    "m": 15,
    "img": "Llamada al trabajo anterior con el guion de tres preguntas",
    "s": [
      "Toma el teléfono del trabajo anterior que puso en la solicitud y llama. Tres minutos, tres preguntas.",
      "Pregunta 1 · \"¿Cuánto tiempo trabajó con ustedes y qué hacía?\" — con esto verificas los seis meses y el puesto real.",
      "Pregunta 2 · \"¿Cómo era su asistencia?\" — la respuesta a esta pregunta predice más que todo lo demás.",
      "Pregunta 3 · \"¿Lo volvería a contratar?\" — la pausa antes de responder te dice tanto como la respuesta.",
      "Si el teléfono no existe o nadie contesta después de dos intentos, trátalo como experiencia no comprobada. No lo descartes, pero tampoco lo cuentes.",
      "Si no tiene los seis meses pero tiene ganas evidentes, considéralo solo para ayudante y dilo claro: entra a aprender, con sueldo de ayudante."
    ],
    "e": "No llamar \"por no molestar\". La llamada dura tres minutos y te ahorra tres meses de problema.",
    "d": [
      "Llamaste al menos a un trabajo anterior",
      "Confirmaste tiempo y puesto",
      "Preguntaste por asistencia"
    ],
    "x": {
      "t": "Tus tres preguntas",
      "r": [
        [
          "¿Cuánto tiempo y qué hacía?",
          "verifica la experiencia"
        ],
        [
          "¿Cómo era su asistencia?",
          "predice su comportamiento"
        ],
        [
          "¿Lo volvería a contratar?",
          "la pausa te dice todo"
        ],
        [
          "Duración de la llamada",
          "3 minutos"
        ],
        [
          "Lo que te ahorra",
          "meses de rotación"
        ]
      ],
      "n": "Es la llamada que casi nadie hace y la que más problemas previene. Hazla siempre, aunque te dé pena."
    }
  },
  "Haz la entrevista corta": {
    "m": 25,
    "img": "Entrevista breve en la mesa del local con la solicitud enfrente",
    "s": [
      "Quince minutos, en tu local, con la solicitud enfrente. No necesitas oficina ni formalidad.",
      "Pregunta 1 · \"Cuéntame un día completo de tu trabajo anterior, de que llegabas a que te ibas.\" — se detecta enseguida quién sí estuvo en una cocina.",
      "Pregunta 2 · \"¿Qué fue lo más pesado que te tocó y qué hiciste?\" — buscas cómo reacciona bajo presión, no una respuesta bonita.",
      "Pregunta 3 · \"¿Por qué te salíste del último trabajo?\" — escucha si habla mal de todos. Quien culpa a todos sus jefes anteriores, va a hablar así de ti.",
      "Pregunta 4 · \"¿Qué horario necesitas para estar bien?\" — aquí salen las cosas reales: escuela, hijos, otro trabajo. Mejor saberlo ahora.",
      "Pregunta 5 · \"¿Alguna duda de lo que te ofrezco?\" — quien no pregunta nada del sueldo ni del horario, no está poniendo atención.",
      "Toma nota de cada respuesta en la misma solicitud. Al tercer candidato ya no vas a recordar quién dijo qué."
    ],
    "e": "Hablar tú el 80% del tiempo. La entrevista es para escucharlo; si hablas tú, te contrataste a ti mismo.",
    "d": [
      "Usaste las cinco preguntas",
      "Tomaste nota en cada solicitud",
      "Escuchaste más de lo que hablaste"
    ],
    "x": {
      "t": "Qué buscas en cada respuesta",
      "r": [
        [
          "Un día completo",
          "si conoce el ritmo real"
        ],
        [
          "Lo más pesado",
          "cómo aguanta presión"
        ],
        [
          "Por qué se salió",
          "si culpa a todos"
        ],
        [
          "Horario que necesita",
          "si el tuyo le funciona"
        ],
        [
          "Sus dudas",
          "si está atento"
        ]
      ],
      "n": "Quince minutos bien usados. La entrevista larga no predice nada; estas cinco preguntas sí."
    }
  },
  "Ponle prueba en cocina de una hora": {
    "m": 60,
    "img": "Prueba práctica en la plancha durante el turno flojo",
    "s": [
      "Agenda una hora en tu turno más flojo, cuando puedas verlo sin que te tumbe el servicio.",
      "Págale esa hora. Es de justicia y además te pone en otra posición: le estás comprando su tiempo, no pidiéndole un favor.",
      "Ponle tres tareas reales: preparar el platillo más vendido, cortar y limpiar, y lavar su área al terminar.",
      "Califica cuatro cosas y anótalas: si se lava las manos sin que le digas, si deja limpio al terminar, si aguanta el ritmo y si pregunta cuando no sabe en lugar de inventar.",
      "La cuarta es la más importante. Quien inventa en la cocina te descompone platillos toda la vida; quien pregunta se puede enseñar.",
      "Si dos candidatos vienen parejos en la entrevista, la prueba decide. Nunca contrates sin prueba: es una hora contra meses de arrepentimiento."
    ],
    "e": "Saltarse la prueba por prisa. La prisa de hoy es la rotación del mes que entra.",
    "d": [
      "Le pagaste su hora de prueba",
      "Calificaste limpieza, ritmo y actitud",
      "Notaste si pregunta o inventa"
    ],
    "x": {
      "t": "Tu hoja de prueba",
      "r": [
        [
          "Se lava las manos solo",
          "sí / no"
        ],
        [
          "Deja limpia su área",
          "sí / no"
        ],
        [
          "Aguanta el ritmo",
          "sí / no"
        ],
        [
          "Pregunta cuando no sabe",
          "el punto clave"
        ],
        [
          "Costo de la prueba",
          "una hora de sueldo"
        ]
      ],
      "n": "Una hora pagada es la inversión más rentable de todo el curso. Ahí ves lo que ninguna entrevista muestra."
    }
  },
  "Deja claro el sueldo y el horario": {
    "m": 20,
    "img": "Acuerdo escrito y firmado por las dos partes",
    "s": [
      "Escribe en una hoja seis cosas: sueldo semanal exacto, día de pago, hora de entrada y salida, día de descanso, qué pasa si trabaja un festivo y qué incluye la comida del personal.",
      "Léelo con él en voz alta antes de que empiece. Que él lo lea también. Fírmenlo los dos y quédense con una copia cada uno.",
      "Define la comida del personal con precisión: qué puede comer, cuánto y en qué horario. Es la fuga silenciosa más común y el pleito más frecuente.",
      "Si vas a dar propina compartida, explica cómo se reparte exactamente, con números. Las propinas mal repartidas rompen equipos.",
      "No prometas aumentos con fecha si no estás seguro. Promete revisión a los tres meses, que sí puedes cumplir.",
      "Todo lo que quede de palabra se va a recordar distinto. No es desconfianza: es claridad para los dos."
    ],
    "e": "Acordar el sueldo de palabra y \"ya luego vemos lo demás\". Ahí nacen casi todos los pleitos del primer trabajador.",
    "d": [
      "Los seis puntos están escritos",
      "Los dos firmaron y tienen copia",
      "La comida del personal está definida"
    ],
    "x": {
      "t": "Los seis puntos del acuerdo",
      "r": [
        [
          "Sueldo semanal",
          "cantidad exacta"
        ],
        [
          "Día de pago",
          "siempre el mismo"
        ],
        [
          "Horario",
          "entrada y salida"
        ],
        [
          "Día de descanso",
          "cuál"
        ],
        [
          "Festivos",
          "cómo se pagan"
        ],
        [
          "Comida de personal",
          "qué y cuánto"
        ]
      ],
      "n": "Una hoja firmada al inicio evita la discusión del mes tres. Es el documento más barato y más útil que vas a firmar."
    }
  },
  "Dale de alta como se debe": {
    "m": 40,
    "img": "Alta en el IMSS y contrato firmado sobre la mesa",
    "s": [
      "Da de alta en el IMSS desde el portal del patrón. Si no estás registrado como patrón, ese es tu primer trámite y se hace en línea.",
      "Necesitas su CURP, su número de seguridad social (si no lo tiene, se saca en línea gratis) y su INE.",
      "Firma un contrato por escrito. Puedes usar un formato de contrato por tiempo indeterminado con periodo de prueba de 30 días: no necesitas abogado para el primer trabajador.",
      "Calcula tus cuotas patronales. Andan alrededor del 25% al 30% del sueldo, y ese es el número que ya presupuestaste en la primera lección.",
      "Lleva un control simple de asistencia, aunque sea una libreta firmada cada día. Si algún día hay un problema, esa libreta es tu respaldo.",
      "El alta no es solo obligación: si se corta un dedo en tu cocina y no está dado de alta, el costo lo pagas tú completo."
    ],
    "e": "Dejarlo \"unas semanas de prueba sin alta\". Un accidente en esas semanas te puede costar más que un año de cuotas.",
    "d": [
      "Está dado de alta en el IMSS",
      "Firmaron contrato por escrito",
      "Llevas control de asistencia"
    ],
    "x": {
      "t": "Lo que te protege el alta",
      "r": [
        [
          "Accidente en cocina",
          "lo cubre el IMSS"
        ],
        [
          "Sin alta",
          "lo pagas tú completo"
        ],
        [
          "Cuotas patronales",
          "25% a 30% del sueldo"
        ],
        [
          "Periodo de prueba",
          "30 días, legal"
        ],
        [
          "Control de asistencia",
          "tu respaldo"
        ]
      ],
      "n": "El alta cuesta menos de lo que crees y te protege más de lo que imaginas. No es un gasto: es un seguro."
    }
  },
  "Enséñale su primera semana": {
    "m": 45,
    "img": "Plan de los primeros tres días pegado en la cocina",
    "s": [
      "Día 1 · Recorrido completo: dónde está todo, cómo se prende y se apaga cada equipo, dónde va la basura, cómo se lava. Nada de producción todavía.",
      "Día 2 · Una sola tarea, la más repetitiva, hasta que le salga bien. Preparación o lavado. Una, no cinco.",
      "Día 3 · Su platillo, el que va a hacer siempre, con la ficha técnica enfrente. Ahí es donde tus fichas del Costeador valen oro.",
      "Pega las fichas técnicas de los platillos en la pared de la cocina, a la altura de los ojos. Enseñar con el papel enfrente es diez veces más rápido que enseñar de memoria.",
      "Acompáñalo tú los tres primeros días, aunque te cueste tiempo. Delegar la enseñanza al que ya está cansado es cómo se propagan los errores.",
      "Al final de cada día pregúntale dos cosas: qué le costó y qué no entendió. La gente no pregunta sola el primer día.",
      "La rotación del primer mes casi siempre es falta de enseñanza, no falta de ganas."
    ],
    "e": "Ponerlo a producir el primer día \"porque hay chamba\". Es la manera más rápida de perderlo en dos semanas.",
    "d": [
      "Tienes el plan de los tres días escrito",
      "Las fichas técnicas están pegadas en cocina",
      "Lo acompañaste tú los primeros días"
    ],
    "x": {
      "t": "Sus primeros tres días",
      "r": [
        [
          "Día 1",
          "recorrido y equipo, sin producir"
        ],
        [
          "Día 2",
          "una sola tarea repetitiva"
        ],
        [
          "Día 3",
          "su platillo con ficha enfrente"
        ],
        [
          "Cada día al cerrar",
          "qué te costó, qué no entendiste"
        ],
        [
          "Resultado",
          "menos rotación al mes"
        ]
      ],
      "n": "Tres días de enseñanza ordenada te ahorran volver a contratar. Es la inversión con mejor retorno del módulo."
    }
  },
  "Evalúa a los 30 días": {
    "m": 25,
    "img": "Conversación de evaluación al mes con cuatro puntos anotados",
    "s": [
      "Agenda la conversación desde el primer día y dile que existe. Saber que hay una evaluación al mes cambia cómo trabaja las cuatro semanas.",
      "Evalúa cuatro puntos concretos, no impresiones: asistencia y puntualidad, limpieza de su área, si ya hace su tarea sin que le digas, y cómo se lleva con el resto.",
      "Si va bien, dilo con claridad y dale algo concreto: confirmación del puesto, o una tarea más importante. La gente que no recibe respuesta asume que va mal.",
      "Si va mal, sé específico con ejemplos y fechas, no con \"es que no le echas ganas\". Dale dos semanas con puntos claros a corregir.",
      "Si no funciona después de esas dos semanas, termina la relación bien: paga lo que corresponde, dale las gracias y cierra en buenos términos. Tu colonia es chica y todo se sabe.",
      "Dejar correr a alguien que no funciona por evitar la conversación es el error más caro que comete un negocio chico: te cuesta el sueldo, la calidad y al final también a los buenos."
    ],
    "e": "No tener la conversación y aguantar meses. El equipo lo nota y los que sí trabajan se desmoralizan.",
    "d": [
      "Tuviste la conversación de los 30 días",
      "Evaluaste los cuatro puntos concretos",
      "Dijiste claro si sigue o no"
    ],
    "x": {
      "t": "Tus cuatro puntos de evaluación",
      "r": [
        [
          "Asistencia y puntualidad",
          "sin excusas repetidas"
        ],
        [
          "Limpieza de su área",
          "sin recordatorio"
        ],
        [
          "Autonomía",
          "ya no le dices qué hacer"
        ],
        [
          "Trato con el equipo",
          "suma o resta"
        ],
        [
          "Decisión",
          "sigue o dos semanas más"
        ]
      ],
      "n": "Una conversación de veinte minutos al mes te ahorra el problema de seis meses. Tenla siempre, aunque incomode."
    }
  },
  "Decide si el delivery te conviene": {
    "m": 20,
    "img": "Comparación: el mismo platillo vendido en mostrador y en app",
    "s": [
      "Toma tu platillo más vendido y anota tres cosas: en cuánto lo vendes, cuánto te cuesta hacerlo y cuánto cuesta su empaque.",
      "Abre la calculadora de delivery de este módulo y captura esos tres números con la comisión que te ofrecieron.",
      "Mira el renglón \"te queda\". Si es menos del 15% del precio, el delivery a ese precio te está costando dinero, no ganándolo.",
      "Antes de descartarlo, prueba subir el precio en la app: es la salida correcta y es lo que hace todo el mundo, aunque nadie lo diga.",
      "Decide con el número, no con la ilusión del volumen. Vender el doble perdiendo $3 por pedido te deja el doble de pérdida."
    ],
    "e": "Entrar a la app porque \"todos están ahí\". El volumen sin margen solo acelera el cierre.",
    "d": [
      "Sabes cuánto te deja tu platillo estrella en app",
      "Sabes si necesitas subir el precio",
      "Decidiste con números, no por presión"
    ],
    "x": {
      "t": "Ejemplo real · taco de pastor a $32",
      "r": [
        [
          "Precio en la app",
          "$32.00"
        ],
        [
          "Comisión 27%",
          "-$8.64"
        ],
        [
          "Costo del platillo",
          "-$9.12"
        ],
        [
          "Empaque",
          "-$3.50"
        ],
        [
          "Te queda",
          "$10.74"
        ],
        [
          "Contra mostrador",
          "$19.36"
        ],
        [
          "Diferencia por taco",
          "-$8.62"
        ]
      ],
      "n": "El mismo taco te deja 44% menos en la app. No significa que no entres: significa que en la app debe costar más."
    }
  },
  "Reúne tus papeles para el alta": {
    "m": 25,
    "img": "Carpeta del celular con los cinco documentos del alta",
    "s": [
      "Toma foto o descarga en PDF: constancia de situación fiscal actualizada (la del SAT, no una vieja), INE por los dos lados, comprobante de domicilio del local de menos de 3 meses, y estado de cuenta bancario donde se lea tu CLABE.",
      "Si estás como persona moral, agrega acta constitutiva y poder del representante legal.",
      "Guarda todo en una carpeta del celular llamada \"Alta delivery\". Vas a subir los mismos archivos tres veces, una por app.",
      "Revisa que el nombre en tu constancia fiscal, tu banco y tu comprobante de domicilio sea idéntico. Una letra distinta detiene el alta una semana.",
      "Ten a mano el régimen fiscal en el que estás. Si estás en RESICO, tenlo claro porque cambia cómo te facturan la comisión."
    ],
    "e": "Subir la constancia fiscal vieja. Es el rechazo número uno y te hace repetir todo el proceso.",
    "d": [
      "Tienes los cinco documentos en una carpeta",
      "El nombre coincide en los tres documentos",
      "Sabes tu régimen fiscal"
    ],
    "x": {
      "t": "Tu carpeta de alta",
      "r": [
        [
          "Constancia fiscal",
          "del mes en curso"
        ],
        [
          "INE",
          "frente y vuelta"
        ],
        [
          "Comprobante de domicilio",
          "menos de 3 meses"
        ],
        [
          "Estado de cuenta",
          "con CLABE visible"
        ],
        [
          "Persona moral",
          "acta + poder legal"
        ]
      ],
      "n": "Con esta carpeta lista, cada alta te toma media hora en lugar de tres semanas de ida y vuelta."
    }
  },
  "Date de alta en Rappi paso a paso": {
    "m": 35,
    "img": "Pantalla del portal de aliados con el formulario de registro",
    "s": [
      "Busca en Google \"Rappi aliados registro\" y entra al portal oficial. Nunca por un tercero que te cobre: el alta es gratis.",
      "Llena el formulario con el nombre comercial exacto que quieres que vea el cliente, tu categoría (tacos, hamburguesas, café) y tu dirección con referencias.",
      "Sube los documentos de tu carpeta. Espera el correo de confirmación: tarda entre 3 y 10 días hábiles.",
      "Cuando te contacte un ejecutivo, pregunta tres cosas por escrito: tu porcentaje de comisión, cada cuándo depositan, y si hay cuota de alta o mensualidad.",
      "Antes de firmar, pide el contrato completo en PDF y busca la palabra \"comisión\" y \"promociones\". Lee esos dos párrafos con calma.",
      "Al recibir el acceso al portal de comercios, cambia la contraseña y activa la app de aliado en tu celular para ver pedidos en tiempo real."
    ],
    "e": "Firmar sin ver el porcentaje por escrito. De palabra te dicen un número y en el contrato aparece otro.",
    "d": [
      "Estás dado de alta sin pagar intermediarios",
      "Tienes tu comisión por escrito",
      "Tienes acceso al portal y a la app de aliado"
    ],
    "x": {
      "t": "Lo que debes pedir por escrito",
      "r": [
        [
          "Comisión por pedido",
          "tu % exacto"
        ],
        [
          "Frecuencia de depósito",
          "semanal o quincenal"
        ],
        [
          "Cuota de alta",
          "debe ser $0"
        ],
        [
          "Quién paga las promociones",
          "punto clave del contrato"
        ],
        [
          "Plazo forzoso",
          "evita los de 12 meses"
        ]
      ],
      "n": "Estas cinco respuestas por escrito valen más que cualquier promesa de un ejecutivo por teléfono."
    }
  },
  "Date de alta en UberEats y DiDi Food": {
    "m": 30,
    "img": "Las tres apps de delivery lado a lado con su comisión",
    "s": [
      "Repite el proceso en \"UberEats para restaurantes\" y en el portal de comercios de DiDi Food. Los documentos son los mismos.",
      "Compara las tres comisiones que te ofrecen. Casi nunca son iguales, y la diferencia entre la mejor y la peor suele ser de 5 a 8 puntos.",
      "Empieza con dos apps, no con tres. Manejar tres tablets el primer mes te va a saturar la cocina y te va a bajar la calificación en todas.",
      "Pide que tu carta se dé de alta con los precios de app, no con los del local. Si la suben con los del mostrador, arrancas perdiendo.",
      "Cuando ya domines la operación, activa la tercera. Estar en las tres multiplica el alcance con la misma cocina."
    ],
    "e": "Abrir las tres el mismo día. La calificación de la primera semana es la que más pesa y saturarte la arruina.",
    "d": [
      "Estás en al menos dos apps",
      "Comparaste las tres comisiones",
      "Tu carta subió con precios de app"
    ],
    "x": {
      "t": "Comisiones típicas en México",
      "r": [
        [
          "Rappi",
          "25% a 30%"
        ],
        [
          "UberEats",
          "25% a 30%"
        ],
        [
          "DiDi Food",
          "20% a 28%"
        ],
        [
          "Pedido directo por WhatsApp",
          "0%"
        ],
        [
          "Lo que decide",
          "tu categoría y volumen"
        ]
      ],
      "n": "Los rangos se mueven. Lo que no se mueve es que el pedido directo siempre te deja más: por eso la lección 13 de este curso es empujarlo."
    }
  },
  "Negocia tu comisión antes de firmar": {
    "m": 20,
    "img": "Conversación de negociación con el porcentaje sobre la mesa",
    "s": [
      "Pregunta directo: \"¿cuál es la comisión más baja a la que puedo llegar y qué necesito para alcanzarla?\". La pregunta sola ya te baja puntos.",
      "Usa tres palancas: que vas a estar en exclusiva con ellos los primeros meses, tu volumen esperado de pedidos, y que te están cotizando las otras dos apps.",
      "Pregunta por planes de comisión reducida a cambio de que tú entregues (algunos planes bajan mucho si usas tu propio repartidor).",
      "Si no te bajan el porcentaje, pide otra cosa que valga dinero: semanas de visibilidad destacada, o que la app absorba una promoción de arranque.",
      "Cada punto de comisión que bajes son pesos cada mes para siempre. En $80,000 de venta mensual, un punto son $800 al mes."
    ],
    "e": "Aceptar el primer número que te dan. Es un precio de lista, no una regla.",
    "d": [
      "Preguntaste por la comisión mínima",
      "Preguntaste por planes con entrega propia",
      "Obtuviste algo: puntos o visibilidad"
    ],
    "x": {
      "t": "Lo que vale cada punto",
      "r": [
        [
          "Venta mensual en app",
          "$80,000"
        ],
        [
          "Bajar 1 punto",
          "+$800 al mes"
        ],
        [
          "Bajar 3 puntos",
          "+$2,400 al mes"
        ],
        [
          "En un año",
          "+$28,800"
        ],
        [
          "Costo de preguntar",
          "$0"
        ]
      ],
      "n": "Una llamada de diez minutos puede valer casi $29,000 al año. Es la hora mejor pagada de tu negocio."
    }
  },
  "Calcula tu precio de delivery": {
    "m": 25,
    "img": "Calculadora mostrando el precio de app calculado al revés",
    "s": [
      "El precio de app no se calcula sumando: se calcula al revés, desde lo que quieres que te quede.",
      "La fórmula es: precio de app = (costo del platillo + empaque + utilidad que quieres) ÷ (1 - comisión).",
      "Con un taco que cuesta $9.12, empaque de $3.50, utilidad deseada de $19 y comisión de 27%: (9.12 + 3.50 + 19) ÷ 0.73 = $43.32.",
      "Redondea hacia arriba a un precio que se vea bien: $45. Nunca redondees hacia abajo, ahí se va tu utilidad.",
      "Usa la calculadora del módulo para tus 5 platillos más vendidos y anota el precio de app de cada uno.",
      "Sube esos precios en la app. Es legal, es normal y lo hace todo el mundo: estás cobrando el servicio de que te lo lleven."
    ],
    "e": "Poner el mismo precio del local \"para no espantar al cliente\". El cliente de app compara con otras apps, no con tu mostrador.",
    "d": [
      "Sabes la fórmula del precio de app",
      "Tienes el precio de app de tus 5 más vendidos",
      "Los subiste a la plataforma"
    ],
    "x": {
      "t": "El mismo taco, los dos precios",
      "r": [
        [
          "Precio en mostrador",
          "$32"
        ],
        [
          "Costo + empaque",
          "$12.62"
        ],
        [
          "Utilidad que quieres",
          "$19.00"
        ],
        [
          "Comisión de la app",
          "27%"
        ],
        [
          "Precio de app calculado",
          "$43.32"
        ],
        [
          "Precio que pones",
          "$45"
        ],
        [
          "Te queda",
          "$20.23"
        ]
      ],
      "n": "Con $45 en la app ganas lo mismo que en tu mostrador. Ese es el objetivo: que el delivery no te salga a deber."
    }
  },
  "Decide qué platillos NO van en la app": {
    "m": 20,
    "img": "Carta con platillos marcados: entra, no entra",
    "s": [
      "Saca de la app tres tipos de platillo: los de food cost arriba de 35%, los que llegan mal (frituras, cosas crujientes, helado) y los que tardan más de 15 minutos en cocina.",
      "Los que tardan mucho te bajan la calificación de tiempo, y la app castiga eso con menos visibilidad.",
      "Deja en la app entre 8 y 14 platillos, no toda tu carta. Una carta corta se cocina más rápido y se ve mejor en pantalla.",
      "Agrega en cambio combos que solo existan en la app: te suben el ticket y el cliente no puede compararlos con tu mostrador.",
      "Revisa la lista cada mes con tus números de Mi Menú: lo que no se vende en app, sácalo."
    ],
    "e": "Subir la carta completa \"para que haya de todo\". Más opciones en app significa más tiempo de cocina y peor calificación.",
    "d": [
      "Sacaste los de food cost alto",
      "Sacaste los que no viajan bien",
      "Tienes entre 8 y 14 platillos en app"
    ],
    "x": {
      "t": "Qué entra y qué no",
      "r": [
        [
          "Food cost bajo y viaja bien",
          "entra"
        ],
        [
          "Food cost arriba de 35%",
          "no entra"
        ],
        [
          "Frituras y crujientes",
          "no entra"
        ],
        [
          "Más de 15 min de cocina",
          "no entra"
        ],
        [
          "Combos exclusivos de app",
          "entra y sube el ticket"
        ]
      ],
      "n": "Una carta corta y bien elegida vende más en app que una carta completa: el cliente decide en 40 segundos."
    }
  },
  "Costea tu empaque de verdad": {
    "m": 25,
    "img": "Empaque completo desglosado pieza por pieza con su costo",
    "s": [
      "Arma un pedido completo como se lo mandas al cliente y ponlo en la mesa: envase, tapa, bolsa, servilletas, cubiertos, salsas en vasito, sello de seguridad, volante.",
      "Cotiza cada pieza por millar, no por unidad. La diferencia entre comprar de a poco y por millar suele ser del 40%.",
      "Suma el total por pedido. En la mayoría de los negocios de comida son entre $8 y $22, y casi nadie lo tenía contado.",
      "Sube ese costo al Costeador como un ingrediente más de cada platillo de delivery. Ahí es donde debe vivir, no en tu cabeza.",
      "Busca dónde bajarlo sin que se vea barato: el sello de seguridad se puede sustituir por una engrapada bien puesta, las salsas pueden ir en menos vasitos."
    ],
    "e": "Dejar el empaque fuera del costo \"porque es poquito\". En 40 pedidos diarios, $12 de empaque son $14,400 al mes.",
    "d": [
      "Cotizaste tu empaque por millar",
      "Sabes el costo exacto por pedido",
      "Lo subiste al Costeador"
    ],
    "x": {
      "t": "Empaque de un pedido típico",
      "r": [
        [
          "Envase con tapa",
          "$4.20"
        ],
        [
          "Bolsa",
          "$1.60"
        ],
        [
          "Servilletas y cubiertos",
          "$2.10"
        ],
        [
          "Salsas en vasito",
          "$1.80"
        ],
        [
          "Sello y volante",
          "$0.90"
        ],
        [
          "Total por pedido",
          "$10.60"
        ],
        [
          "En 40 pedidos al día",
          "$12,720 al mes"
        ]
      ],
      "n": "Este es el costo que convierte un delivery \"rentable\" en uno que pierde. Ahora ya lo tienes contado."
    }
  },
  "Arma tu carta digital con fotos": {
    "m": 40,
    "img": "Carta de app con fotos limpias y descripciones de una línea",
    "s": [
      "En una app no hay mesero: la foto y el nombre venden solos. Un platillo sin foto vende la mitad que el mismo con foto.",
      "Toma las fotos con luz de día, fondo liso (una tabla de madera o un mantel claro), desde arriba o a 45 grados. Con el celular basta.",
      "Una foto por platillo, todas con el mismo fondo y la misma luz. La carta desigual se ve improvisada.",
      "Escribe descripciones de una línea que digan qué trae, no adjetivos: \"Tortilla de maíz, pastor marinado, piña, cebolla y cilantro\" vende más que \"delicioso taco tradicional\".",
      "Pon primero tus platillos de mayor utilidad, igual que en la carta impresa. El orden en app también lo decides tú.",
      "Nombra tus combos con nombre propio (\"Combo del mediodía\") para que no se comparen con nada."
    ],
    "e": "Usar fotos de internet o de banco de imágenes. El cliente recibe algo distinto, califica mal y la app te penaliza.",
    "d": [
      "Cada platillo tiene su foto real",
      "Todas con el mismo fondo y luz",
      "Las descripciones dicen ingredientes"
    ],
    "x": {
      "t": "Lo que cambia una foto",
      "r": [
        [
          "Platillo sin foto",
          "venta base"
        ],
        [
          "Con foto propia y buena luz",
          "hasta el doble"
        ],
        [
          "Con descripción de ingredientes",
          "menos cancelaciones"
        ],
        [
          "Orden por utilidad",
          "sube tu ticket"
        ],
        [
          "Costo de todo esto",
          "$0 y una tarde"
        ]
      ],
      "n": "Es la tarde mejor invertida del módulo: no cuesta nada y es lo que más mueve tus ventas en app."
    }
  },
  "Configura horario, zona y tiempos": {
    "m": 25,
    "img": "Panel de configuración con horarios y tiempo de preparación",
    "s": [
      "Pon tu tiempo de preparación real, medido con cronómetro en hora pico. Si tardas 18 minutos, pon 20, no 12.",
      "Configura tu horario de app un poco más corto que el del local: los últimos 30 minutos son los de más errores y peores calificaciones.",
      "Define tu zona de entrega. Más lejos significa comida fría y calificación baja: mejor un radio corto y bien atendido.",
      "Aprende a cerrar la tienda desde la app cuando se te satura la cocina o se te acabó un insumo. Cerrar 40 minutos cuesta menos que 10 pedidos cancelados.",
      "Nunca dejes la tienda abierta si no vas a poder surtir. Una cancelación tuya pesa mucho más que un pedido perdido."
    ],
    "e": "Prometer tiempos cortos para verse mejor. La app mide tu tiempo real y te castiga con menos visibilidad.",
    "d": [
      "Tu tiempo de preparación es el real medido",
      "Tu zona es un radio que puedes atender bien",
      "Sabes cerrar la tienda cuando te saturas"
    ],
    "x": {
      "t": "Lo que califica el cliente",
      "r": [
        [
          "Que llegue en el tiempo dicho",
          "lo que más pesa"
        ],
        [
          "Que llegue caliente",
          "zona corta"
        ],
        [
          "Que llegue completo",
          "checklist antes de sellar"
        ],
        [
          "Que no te cancelen",
          "cerrar a tiempo"
        ],
        [
          "Meta de calificación",
          "arriba de 4.7"
        ]
      ],
      "n": "Debajo de 4.5 la app te esconde. Estos cuatro puntos son todo lo que necesitas para quedarte arriba."
    }
  },
  "Entiende las promociones y quién las paga": {
    "m": 20,
    "img": "Cuenta de una promoción 2x1 mostrando quién absorbe el descuento",
    "s": [
      "Cuando la app te ofrece una promoción, pregunta una sola cosa: ¿quién absorbe el descuento? Casi siempre eres tú, además de la comisión.",
      "Antes de aceptar, corre el número: precio con descuento, menos comisión sobre el precio con descuento, menos costo, menos empaque.",
      "Hay promociones que sí valen: el envío gratis pagado por la app te sube pedidos sin costarte nada. Pide de esas.",
      "El 2x1 en tu platillo estrella casi nunca conviene. Si vas a hacer promoción, hazla en el platillo de food cost más bajo.",
      "Acepta promociones de arranque para ganar visibilidad las dos primeras semanas, y luego revisa si siguen dejando."
    ],
    "e": "Aceptar todas las promociones que te ofrece el ejecutivo. Su meta es volumen de la plataforma, no tu utilidad.",
    "d": [
      "Sabes quién paga cada promoción",
      "Corriste el número antes de aceptar",
      "Tus promociones son en platillos de food cost bajo"
    ],
    "x": {
      "t": "El 2x1 en un taco de $45",
      "r": [
        [
          "Cliente paga",
          "$45"
        ],
        [
          "Entregas 2 tacos",
          "costo $18.24"
        ],
        [
          "Empaque doble",
          "$5.30"
        ],
        [
          "Comisión 27% de $45",
          "-$12.15"
        ],
        [
          "Te queda",
          "$9.31"
        ],
        [
          "Sin promoción te quedaba",
          "$20.23"
        ]
      ],
      "n": "La promoción te cortó la utilidad a la mitad. Puede valer para ganar clientes nuevos, pero tienes que saber lo que estás pagando."
    }
  },
  "Lee tu estado de cuenta y reclama": {
    "m": 20,
    "img": "Estado de cuenta semanal con una diferencia marcada",
    "s": [
      "Cada semana, cuando llegue el depósito, ábrelo junto con tu reporte de pedidos y compara tres cosas: número de pedidos, monto vendido y comisión cobrada.",
      "Verifica que el porcentaje de comisión cobrado sea el de tu contrato. Es donde más aparecen diferencias.",
      "Revisa los cargos por cancelación: si el pedido se canceló por el repartidor o por el cliente, no te toca a ti.",
      "Si hay diferencia, reclama por el portal con captura y número de pedido. Tienes ventana de días, no de meses.",
      "Lleva una hoja simple con tu depósito esperado y el real. Cuando no cuadre, ya vas a tener el historial."
    ],
    "e": "Dar por bueno el depósito sin revisarlo. Nadie te devuelve un cobro mal aplicado si no lo reclamas.",
    "d": [
      "Comparas tu depósito con tus pedidos cada semana",
      "Verificaste el porcentaje cobrado",
      "Sabes cómo y dónde reclamar"
    ],
    "x": {
      "t": "Tu revisión semanal",
      "r": [
        [
          "Pedidos del reporte",
          "contra los tuyos"
        ],
        [
          "Monto vendido",
          "debe coincidir"
        ],
        [
          "Comisión cobrada",
          "tu % de contrato"
        ],
        [
          "Cargos por cancelación",
          "solo los tuyos"
        ],
        [
          "Tiempo para reclamar",
          "días, no meses"
        ]
      ],
      "n": "Diez minutos cada lunes. Es la revisión que más pesos recupera por minuto invertido."
    }
  },
  "Empuja el pedido directo por WhatsApp": {
    "m": 30,
    "img": "Volante con WhatsApp dentro de la bolsa del pedido",
    "s": [
      "El cliente que te pidió por app ya te conoce. Si la siguiente vez te pide directo, te ahorras la comisión completa.",
      "Mete en cada pedido un volante chico: tu WhatsApp, un descuento por pedir directo (menos de lo que te cobra la app) y una frase amable.",
      "Ofrece algo que la app no da: \"por WhatsApp te sale $6 más barato y te lo mandamos igual de rápido\".",
      "Guarda cada número que te escriba, con el nombre y lo que pidió. Esa lista es tu activo, no de la app.",
      "No hables mal de la app en el volante ni pidas que dejen de usarla. Solo ofrece la alternativa.",
      "Deja tu link de WhatsApp en tu perfil de Google Maps y en tus anuncios de Meta: los tres módulos trabajan juntos."
    ],
    "e": "Poner un descuento tan grande que pierdas más que con la comisión. El descuento debe ser menor a lo que te cobra la app.",
    "d": [
      "Tienes volante con tu WhatsApp en cada pedido",
      "Tu descuento directo es menor que la comisión",
      "Guardas los números de quien te escribe"
    ],
    "x": {
      "t": "El mismo taco por los dos caminos",
      "r": [
        [
          "Por la app a $45",
          "te queda $20.23"
        ],
        [
          "Directo a $39",
          "te queda $26.38"
        ],
        [
          "Diferencia por pedido",
          "+$6.15"
        ],
        [
          "En 10 pedidos diarios",
          "+$1,845 al mes"
        ],
        [
          "Costo del volante",
          "$0.35 por pedido"
        ]
      ],
      "n": "El cliente paga menos y tú ganas más. Los dos salen ganando: el que pierde es la comisión."
    }
  },
  "Revisa cada mes si sigue conviniendo": {
    "m": 20,
    "img": "Hoja de revisión mensual comparando app contra mostrador",
    "s": [
      "Cada fin de mes anota cuatro números de la app: pedidos, venta total, comisión pagada y utilidad que te quedó.",
      "Divide tu utilidad de app entre tus pedidos de app. Ese es lo que te deja cada pedido, y es el número que importa.",
      "Compáralo con lo que te deja un pedido de mostrador. Si la diferencia crece mes con mes, sube precios de app o recorta la carta de app.",
      "Revisa también cuánto de tu venta total viene de app. Arriba del 40% te vuelve dependiente: si mañana suben la comisión, no tienes cómo responder.",
      "Si un mes no dejó nada, no cierres de golpe: primero sube precios y saca los platillos de food cost alto. Casi siempre con eso se arregla."
    ],
    "e": "Nunca revisar y descubrir a fin de año que el delivery financió a la plataforma y no a tu negocio.",
    "d": [
      "Llevas tu utilidad por pedido de app",
      "La comparas con mostrador",
      "Sabes qué porcentaje de tu venta depende de app"
    ],
    "x": {
      "t": "Tu revisión de fin de mes",
      "r": [
        [
          "Pedidos de app",
          "cuéntalos"
        ],
        [
          "Comisión pagada",
          "el total del mes"
        ],
        [
          "Utilidad por pedido de app",
          "tu número clave"
        ],
        [
          "Contra mostrador",
          "la comparación"
        ],
        [
          "% de venta que viene de app",
          "no más de 40%"
        ]
      ],
      "n": "Cinco números, cinco minutos, una vez al mes. Es lo que separa a quien usa las apps de quien las apps usan."
    }
  },
  "Mide y sube de nivel": {
    "m": 25,
    "img": "Captura: tus estadísticas de la ficha con búsquedas, indicaciones y llamadas",
    "s": [
      "En tu ficha abre Rendimiento. Mira solo tres números: cuánta gente te buscó, cuántos pidieron indicaciones y cuántos llamaron.",
      "Anota los tres cada mes, el mismo día. La tendencia importa más que el número de un mes.",
      "Fija tu meta de reseñas: entre 8 y 12 nuevas al mes, siempre de clientes satisfechos, con promedio arriba de 4.8.",
      "Compara tus búsquedas directas (te buscaron por nombre) contra las de descubrimiento (te encontraron buscando \"tacos cerca\"). Cuando las de descubrimiento suben, estás ganando posiciones.",
      "Si un mes bajaron las indicaciones, revisa primero fotos y publicaciones: casi siempre es que la ficha se quedó quieta."
    ],
    "e": "Revisar las estadísticas todos los días. Se mueven poco y desespera; una vez al mes es la frecuencia útil.",
    "d": [
      "Llevas tus tres números mes con mes",
      "Tienes meta de reseñas mensual",
      "Sabes si tus búsquedas de descubrimiento suben"
    ],
    "x": {
      "t": "Tu meta de los próximos 90 días",
      "r": [
        [
          "Mes 1 · reseñas nuevas",
          "10 · promedio 4.8+"
        ],
        [
          "Mes 2 · reseñas nuevas",
          "10 · fotos al día"
        ],
        [
          "Mes 3 · reseñas nuevas",
          "10 · publicando semanal"
        ],
        [
          "A los 90 días",
          "30 reseñas y ficha activa"
        ],
        [
          "Resultado esperado",
          "primeras posiciones de tu zona"
        ]
      ],
      "n": "Nadie llega al primer lugar en una semana. Tres meses de constancia barata te ponen arriba de negocios que llevan años ahí."
    }
  }
};

/** Lección vacía para una tarea que el usuario agregó a mano. */
export const FALLBACK_LESSON: Lesson = {
  "m": 20,
  "s": [],
  "e": "",
  "d": []
};

export const getLesson = (title: string): Lesson => LESSONS[title] ?? FALLBACK_LESSON;
