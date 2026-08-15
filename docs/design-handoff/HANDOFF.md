# Handoff: MiRestauranteListo — app del emprendedor, panel del dueño y landing de venta

## Overview

MiRestauranteListo es un producto de **pago único** (MXN $2,450) para personas que quieren abrir un negocio de comida en México y todavía no abren. El producto responde: en qué etapa estoy, qué me falta, cuánto invertir, cuánto cobrar por platillo y cuánto vender para no perder dinero.

Este paquete contiene tres superficies y dos documentos imprimibles:

| Superficie | Archivo | Plataforma |
| --- | --- | --- |
| App del emprendedor (PWA mobile-first) | `MiRestauranteListo.dc.html` | Móvil (430×900 de referencia) |
| Panel de administración del dueño | `AdminMiRestauranteListo.dc.html` | Desktop (1440×900) |
| Landing de venta con calculadora en vivo | `LandingMiRestauranteListo.dc.html` | Mobile-first (380px+) |
| Ficha técnica de costeo (PDF) | `FichaTecnica.dc.html` | Impresión, 1 hoja por platillo |
| Resumen financiero (PDF) | `ResumenFinanciero.dc.html` | Impresión, documento fluido |

## About the Design Files

Los archivos `.dc.html` de este paquete son **referencias de diseño creadas en HTML**: prototipos funcionales que muestran la apariencia y el comportamiento buscados, **no código de producción para copiar tal cual**. Corren sobre un runtime propio de prototipado (`support.js`, plantillas con `{{ }}`, `<sc-if>`, `<sc-for>` y una clase de lógica) que **no debe portarse**.

El trabajo es **recrear estos diseños en el entorno del codebase destino** (React/Next.js, Vue, React Native, SwiftUI, etc.) usando sus patrones y librerías establecidos. Si aún no existe codebase, elige el stack más apropiado — para este producto la recomendación es **Next.js (App Router) + TypeScript + Tailwind**, con Postgres/Prisma o Supabase para licencias, por el requisito de validación en línea.

De cada archivo hay que extraer: estructura de pantallas, jerarquía visual, tokens, reglas de cálculo, copy exacto y máquinas de estado. Los cálculos de costeo y punto de equilibrio están documentados abajo con fórmulas: **impleméntalos desde la especificación, no por lectura del prototipo.**

## Fidelity

**Alta fidelidad (hifi).** Colores, tipografía, espaciado, radios, sombras, copy y estados son definitivos. La UI debe recrearse pixel-perfect con las librerías del codebase. Dos matices:

- La app del emprendedor se dibuja dentro de un marco de teléfono (bisel, barra de estado 9:41) que es **andamiaje de presentación**: no se implementa. El contenido dentro del marco sí es la app real.
- Los `<image-slot>` y bloques marcados `[EDITAR]` en la landing son huecos para material real del cliente (capturas, MP4, caras de los videos de objeción).

---

# 1 · App del emprendedor (`MiRestauranteListo.dc.html`)

Mobile-first, ancho de diseño 430px, alto 900px. Todo el contenido scrollea dentro de un contenedor; la barra inferior y el FAB están fijos.

## Flujo de pantallas

```
welcome → auth → onboarding (12 preguntas) → resultado del diagnóstico
   → [recorrido guiado de 7 pasos] → app (5 pestañas)
app: inicio | ruta | costeador | numeros | mas
      ├── dish        (detalle/editor de platillo, pantalla completa)
      ├── subedit     (editor de sub-receta por lote, pantalla completa)
      ├── sub-*       (13 sub-pantallas de "Más", overlay z-45)
      └── paywall     (pantalla completa)
overlays: hoja del FAB (z-50), hoja de información (i) (z-55), recorrido (z-65),
          toast (z-70), bloqueo sin conexión (z-80)
```

### 1.1 Bienvenida (`welcome`)

- Fondo `--color-bg`. Padding 80/28/34. Scrollea si no cabe.
- Círculo 96px `--color-accent`, icono de gorro de chef (Lucide `chef-hat`) 46px, sombra md.
- H1 40px/1.02, `letter-spacing:-.02em`, font-heading (Figtree 800): "Abre tu negocio<br>de comida<br>sin adivinar."
- Párrafo 16px/1.5, max-width 300px, color `color-mix(text 70%)`: "MiRestauranteListo te dice en qué etapa estás, qué te falta, cuánto invertir, cuánto cobrar y cuánto vender para no fracasar."
- Tres bullets con check en círculo 26px verde claro: "Ruta de apertura paso a paso", "Costeo de platillos y precios", "Inversión y punto de equilibrio".
- Botón primario 52px "Empezar mi proyecto"; secundario 48px "Ya tengo cuenta".
- Pie 12px centrado: "Pruébala 7 días gratis. Después, un solo pago: sin suscripción mensual."

### 1.2 Registro (`auth`)

Botón atrás circular 36px. H2 30px "Crea tu cuenta". Subtítulo 14px. Tres campos (`.field` + label 12px + input pill 48px): Tu nombre (placeholder = nombre del perfil), Correo, Contraseña. Botón primario 52px "Continuar" + nota legal 12px.

### 1.3 Onboarding (`ob`)

12 preguntas, una por pantalla. Encabezado: botón atrás + barra de progreso 8px pill (`--color-accent`, `transition:width .3s`) + contador "n/12".

Cada pantalla: kicker 11px uppercase `--color-accent-700`, pregunta 26px/1.15, ayuda 13px, y opciones como botones pill (padding 15/18, borde 1.5px, seleccionado = fondo `--color-accent-100`, borde acento, peso 700, check 20px a la derecha). Botón inferior 52px: "Continuar" / en la última "Ver mi diagnóstico"; deshabilitado si no hay respuesta.

Preguntas y opciones exactas:

1. **¿Qué tipo de negocio de comida quieres abrir?** — Taquería, Hamburguesería, Cafetería, Marisquería, Sushi, Alitas, Pizzería, Fonda, Dark kitchen, Otro. *(Escribe `project.giro` además de `answers.giro`.)*
2. **¿En qué etapa estás actualmente?** — Apenas tengo la idea / Ya estoy planeando / Ya tengo local en vista / Ya tengo local / Ya tengo menú / Ya casi abro / Ya abrí, pero sigo desordenado
3. **¿Ya tienes nombre para tu negocio?** — Sí / No
4. **¿Ya tienes local?** — No / Estoy buscando / Sí, rentado / Sí, propio
5. **¿Cuál es tu presupuesto aproximado para abrir?** — Menos de $50,000 / $50,000 a $100,000 / $100,000 a $250,000 / $250,000 a $500,000 / Más de $500,000
6. **¿Ya tienes menú definido?** — Sí / Más o menos / No
7. **¿Ya has costeado tus platillos?** — Sí / No
8. **¿Ya sabes cuánto necesitas vender al mes?** — Sí / No
9. **¿Ya revisaste permisos o trámites?** — Sí / No / Parcialmente
10. **¿Cuántas personas piensas contratar al inicio?** — Solo yo / 1 a 2 / 3 a 5 / 6 o más
11. **¿Cuándo planeas abrir?** — En menos de 3 meses / En 3 a 6 meses / En 6 a 12 meses / Todavía no lo sé *(se guarda en el proyecto; dato de segmentación)*
12. **¿Qué es lo que más te preocupa?** — No saber cuánto invertir / cuánto cobrar / si será rentable / qué me falta / por dónde empezar / cómo organizarme

### 1.4 Diagnóstico (`result`)

Kicker "Tu diagnóstico"; H2 "Tu proyecto está<br>{pct}% listo para abrir". Tarjeta blanca radio 28 con **anillo de avance** (78px, `conic-gradient(accent {pct*3.6}deg, neutral-300 0)`, disco interior inset 9px con el % en 22px) + nivel + "x de y tareas completadas".

Luego: "Lo que más te falta" (3 tarjetas numeradas), "Riesgos detectados" (tarjetas `--color-accent-100` con icono de alerta), y tarjeta acento con "Tu siguiente paso" (título + acción concreta) con botón "Entrar a mi tablero" (inicia el recorrido guiado) y, si hay plantilla del giro, "Cargar plantilla de {giro}".

### 1.5 Inicio (`tab inicio`)

Orden vertical: avatar (44px, inicial, abre Perfil) + saludo "¡Hola, {nombre}!" 20px + "{proyecto} · {giro}" + campana con punto rojo (abre Alertas) → banner de prueba (si aplica) → tarjeta de avance con anillo y "Ver mi progreso →" → **tarjeta acento "Tu siguiente paso"** (kicker 10px, título 21px, cuerpo 13px, botón claro "Continuar") → dos tarjetas 1:1 ("Inversión vs presupuesto" con barra y nota de excedente; "Punto de equilibrio" con venta diaria y tickets) → "Pendientes críticos" (3 recomendaciones tipo mentor con punto de severidad y CTA) → "Progreso por módulo" (10 filas: check en círculo, nombre 104px, barra 7px, % 48px alineado a la derecha; módulos omitidos muestran "omitido" en gris) → "Últimos platillos costeados" (carrusel horizontal 150px) → "Accesos rápidos" (4 botones 2×2).

### 1.6 Mi Ruta (`tab ruta`)

H3 "Mi Ruta" + % completado + botón de mapa (abre "Vista general de mi ruta"). Chips horizontales por módulo con contador "4/6" (u "omitido"). Tarjeta del módulo: icono foco 42px, nombre 19px, descripción, barra de progreso + %; botón "No usaré este módulo" (flujo de omisión abajo).

Lista de tareas: tarjeta blanca radio 24; check circular 28px (verde `--color-accent-2-600` cuando está hecha), título 14.5px (tachado y 55% opacidad si está hecha), pista 12.5px, chevrón que rota. Expandida: dos bloques ("Por qué importa", "Qué sigue") + botón "Marcar como completada"/"como pendiente" (+ "Eliminar esta tarea" si es propia). Botón "Agregar tarea a este módulo" con formulario de 2 campos.

**Los 10 módulos y sus 43 tareas** (cada tarea tiene: título, pista, `por qué importa`, `qué sigue`, y un flag de completada por defecto) están en el prototipo bajo la constante `CATS`; hay que portarlos como datos de seed.

Módulos: Concepto (6), Local (5), Equipamiento (4), Proveedores (4), Personal (4), Menú (4), Costeo (4), Permisos (4), Marketing de apertura (4), Apertura (4).

**Flujo de omisión de módulo (3 pasos, obligatorio en ese orden):**
1. Dentro del módulo, "No usaré este módulo".
2. Lista de motivos (radio pill): *Informalidad temporal de mi negocio · No tengo presupuesto por ahora · No aplica a mi tipo de negocio · Ya lo resolví fuera de la app · Lo haré después de abrir · Otro motivo*. Botones Cancelar / Continuar.
3. Confirmación en `--color-accent-100`: "¿Seguro que quieres quitar este módulo?" + "Sacaremos sus N tareas de tu avance. Motivo: X. Tu avance quedaría en Y%." Botones **No / Sí, quitarlo**.

Al confirmar: `skipped[catId] = motivo`; las tareas del módulo **salen del cálculo de avance**; el módulo muestra el motivo y un botón "Reactivar este módulo".

### 1.7 Costeador de Platillos (`tab costeador`)

Segmentado de 3 vistas: **Platillos · Mi Menú · Sub-recetas**.

**Vista Platillos:** tres KPIs (número de platillos, food cost promedio, precio promedio — los dos últimos excluyen platillos sin precio y muestran "—" si no hay ninguno); aviso de límite de prueba si aplica; botón "Nuevo platillo"; encabezado "Platillos guardados" con **lupa** (input de búsqueda + Limpiar); fila de filtros de tipo (**Todo / Platillos principales / Sub-recetas**); fila de filtros de semáforo (**Todos / Saludables / En riesgo / Peligrosos**); lista de tarjetas (inicial en círculo, nombre, "Costo $x · Precio $y · Utilidad $z", etiqueta de food cost con color de semáforo o "sin precio"). Empty states distintos para *búsqueda sin resultados* ("Nada se llama '…'" + Limpiar), *filtro vacío* y *sin platillos*.

**Detalle del platillo (`dish`)**: encabezado rojo (`--color-accent`, texto blanco) con atrás, "Costeador de Platillos / Calcula y define precios rentables" y botón (i). Cuerpo:
- Inicial 54px + nombre editable 19px + "Porción estándar · N ingredientes".
- **Lista de ingredientes** (dos líneas por fila, sin abreviaturas): nombre editable (input 44px, fondo `--color-neutral-200`) + costo 15px a la derecha + chevrón; segunda línea "Cantidad: 70 g · Precio unitario: $0.09 por g". Expandida: Cantidad que usas en la receta · Unidad de medida (select de 10 unidades) · Precio que pagas por la compra ($) · Cantidad que viene en esa compra · Unidad de medida de la compra · Merma: lo que se desperdicia (%) · "Te queda X% aprovechable después de limpiar" · "Precio unitario ya con la merma" · Eliminar ingrediente. Las sub-recetas muestran aviso "Sub-receta · costo tomado de tu receta base" en lugar de los campos de compra.
- Botones "Agregar ingrediente" y "+ Agregar sub-receta (salsa, marinada, base)" con selector de sub-recetas.
- **Rendimiento y extras**: Porciones que rinde · Condimentos y varios (%) · Empaque por porción ($) · Mano de obra por porción ($) · switch "El precio ya incluye IVA" con "Precio sin IVA: $X · el food cost se calcula sobre este" · resumen "Ingredientes $x / Varios $y".
- **Sección del menú** (Entradas/Fuertes/Bebidas/Postres) y **Qué tanto se vende** (Se vende mucho / normal / poco) como pills.
- **4 tarjetas de resultado** con botón (i) cada una: Costo por porción · Food cost (color de semáforo) · Precio de venta (editable, "$" separado del input) · Utilidad bruta (+ "Margen X%").
- **Precio sugerido** en `--color-accent-100`: valor + "Food cost objetivo 30% · cambiar" (cicla 25→30→35) + botón "Usar precio".
- **Semáforo de rentabilidad**: barra tripartita verde/ámbar/rojo, aguja triangular posicionada en `min(97, fc/50*100)%`, leyendas "Saludable hasta 30% / Revisar 30–38% / Peligroso más de 38%" y veredicto en prosa (o "Define tu precio de venta para ver tu food cost y tu margen." si el precio es 0).
- **Precio para apps de delivery** + campo "Comisión que cobra la app (%)".
- Enlace "Ficha técnica para imprimir o PDF", y botones Duplicar / Guardar platillo.

**Vista Mi Menú** (requiere licencia): 4 KPIs (platillos en la carta, ticket promedio de carta, food cost ponderado, utilidad bruta promedio — todos excluyen platillos sin precio); secciones Entradas/Fuertes/Bebidas/Postres con filas (nombre, "Food cost X% · deja $Y", etiqueta de clasificación, precio); **Sugerencia de distribución** (abajo); leyenda de ingeniería de menú.

**Vista Sub-recetas**: lista de lotes (inicial, nombre, "Lote de 3000 ml · 4 ingredientes", "Lote $142.30 · $0.05 por ml") y botón "Nueva sub-receta". **Editor (`subedit`)**: encabezado verde `--color-accent-2-600`, nombre, "Cantidad que rinde el lote" + "Unidad del lote", lista de ingredientes con el mismo patrón de dos líneas, y dos tarjetas: "Costo del lote" y "Costo por {unidad}".

### 1.8 Números (`tab numeros`)

Home con 3 módulos (Presupuesto de apertura / Gastos fijos mensuales / Punto de equilibrio) + enlace "Resumen financiero para imprimir o PDF".

**Presupuesto de apertura**: tarjeta de total (verde si cabe, roja `--color-accent-700` si se excede) con Total estimado, Presupuesto, barra y frase de diferencia. Lista de 13 conceptos; cada fila es expandible para **subconceptos** (ej. *Trastes y cubiertos → Platos $5,000, Cucharas $5,000, Sartenes $500*): cuando un concepto tiene subconceptos, su monto se **calcula sumándolos** y el input directo se oculta (se muestra el total en texto). Botones "Agregar subconcepto" y "Agregar otro concepto" (los propios se pueden eliminar). Consejo del 10% de fondo de emergencia.

Conceptos base: Renta y depósito, Adecuaciones y obra, Cocina y línea caliente, Refrigeración, Mobiliario, Utensilios y loza, Inventario inicial, Permisos y trámites, Marketing de apertura, Punto de venta, Nómina del primer mes, Fondo de emergencia, Otros.

**Gastos fijos**: tarjeta verde con total mensual y "≈ $X por día de operación"; 10 conceptos (Renta, Nómina, Luz, Gas, Internet, Agua, Software, Contabilidad, Marketing, Otros) + conceptos propios.

**Punto de equilibrio** (abierto en prueba): tarjeta acento que abre con la línea de contexto **"Gastos fijos: $X al mes. Se pagan abras o no, vendas o no."** y muestra **dos números con la misma jerarquía**: *Para no perder* (venta diaria + tickets) y *Para ganar {meta}* (venta diaria + tickets); debajo, la traducción a operación **"N tickets al día ≈ un cliente cada X minutos, en un turno de H horas"**, y el total mensual de ambos escenarios. Controles: campo **"¿Cuánto quieres ganar tú al mes?"** (default $25,000), campo **horas de operación** (default 8), **toggle "Cierro un día a la semana"** (recalcula sobre 26 días y muestra "Cerrar un día sube tu venta diaria de $A a $B"), y sliders de Ticket promedio (80–400, paso 5) y Margen bruto (40–85%) con nota "Tu costeador sugiere X%".

### 1.9 Más (`tab mas`) y sub-pantallas

Tarjeta de perfil + etiqueta "Acceso de por vida"; tarjeta "Instala la app" (dispara el prompt de instalación PWA); tres grupos de opciones:

- **Mi proyecto**: Mi perfil · Datos del proyecto · Tipo de negocio · Plantilla de mi giro · Mis notas · Mis proveedores · Repetir mi diagnóstico
- **Aprender**: Cómo usar MiRestauranteListo (5 pasos) · Repetir el recorrido guiado · Preguntas frecuentes (30) · Recursos descargables (6) · Novedades incluidas
- **Cuenta y ayuda**: Ajustes · Mi compra · Respaldo de mis datos · Invita y gana · Ayuda y soporte · Términos y privacidad

Cada sub-pantalla es un overlay con encabezado (atrás + título + subtítulo) y contenido propio:

| Sub-pantalla | Contenido |
| --- | --- |
| Perfil | 4 campos editables + 4 KPIs del proyecto |
| Datos del proyecto | Nombre, presupuesto tope, fecha objetivo, personas; explicación de cómo afecta los números |
| Tipo de negocio | 10 giros con benchmarks (inversión, food cost, ticket, equipo); seleccionar cambia el giro |
| Plantilla de mi giro | Explicación + advertencia de reemplazo + "Cargar plantilla" + "Descargar respaldo primero" |
| Mis notas | CRUD (título + cuerpo + fecha) |
| Mis proveedores | CRUD (nombre, insumo, contacto, condiciones, entrega) |
| Ajustes | Fila **"Equipo detectado"** (sistema · tipo de equipo · navegador o "instalada"), 3 switches (alertas, recordatorio semanal, guardar en el teléfono), **switch de modo noche**, **6 colores de interfaz**, moneda MXN/USD, restablecer datos |
| Ayuda y soporte | 3 canales (WhatsApp, correo, horario) + nota de FAQ |
| Preguntas frecuentes | 30 preguntas expandibles |
| Cómo usar la app | 5 pasos numerados + "Empezar por mi ruta" |
| Recuperar acceso | Botón "Buscar mi pago y desbloquear" + campo de código `MRL-XXXX-XXXX` + estado de licencia y equipos |
| Recursos | 6 descargables REALES, solo con licencia activa: 3 CSV con fórmulas (plantilla de costeo, comparador de proveedores, plan de apertura de 30 días) y 3 HTML imprimibles con casillas (checklist de permisos, formato de receta estándar, guía de precios de menú). En prueba se ven con etiqueta "Con el pago" y llevan al paywall |
| Novedades incluidas | Changelog (v1.0 + 3 próximas) |
| Términos y privacidad | 5 secciones |
| Respaldo | Exportar `.json` + restaurar desde archivo + qué incluye |
| Invita y gana | Código `AMIGO-XXXX`, compartir por WhatsApp, 20% para el invitado |
| Alertas | Lista de alertas calculadas con severidad y CTA |
| Vista general de mi ruta | 10 módulos con progreso y acceso directo |

### 1.10 FAB y captura rápida

Botón circular 62px `--color-accent`, borde 4px del color de fondo, **posición: `right:18px; bottom:96px`** (encima de la barra, lado derecho). Abre hoja inferior "Agregar algo nuevo" con 5 acciones que **crean de verdad**: Nuevo platillo (abre el editor con un platillo nuevo) · Nuevo gasto de apertura (Números → Presupuesto con formulario abierto) · Nueva tarea pendiente (Mi Ruta con formulario abierto) · Nuevo proveedor (Más → Proveedores con formulario) · Nueva nota (Más → Notas con formulario). Cada acción **cierra la hoja** en el mismo `setState`.

### 1.11 Navegación inferior

Barra 82px, `backdrop-filter:blur(12px)`, borde superior, grid de 5 columnas: Inicio, Mi Ruta, Costeador, Números, Más. Iconos Lucide 21px stroke 2.6, etiquetas 10.5px peso 700. Activo = `--color-accent`; inactivo = `color-mix(text 50%)`. Al cambiar de pestaña, el scroll vuelve a 0.

### 1.12 Modelo de negocio en la app: prueba, bloqueo y activación

- **Prueba de 7 días** (valor configurable desde el panel). El contador arranca en el primer arranque y se persiste.
- **Durante la prueba** (alcance definitivo): contenido abierto solo en los módulos **Concepto** y **Local** de Mi Ruta (los otros 8 se ven completos en el mapa, pero al tocar una tarea muestran "Se abre con el pago único"); máximo **3 platillos** en el Costeador; **punto de equilibrio y gastos fijos completamente abiertos** (es el momento en que el usuario ve el valor); **presupuesto de apertura y Mi Menú bloqueados**; los **recursos descargables** requieren licencia.
- **La cifra de inversión no se filtra en prueba**: la tarjeta de Inicio muestra "Con el pago único", la card de Números describe el módulo sin montos, y tanto el mentor como la pantalla de Alertas usan mensajes sin cifras.
- **Al expirar sin pago: se bloquea todo** menos la pestaña "Más" (para pagar, respaldar o pedir soporte). Pantalla de bloqueo: icono de reloj, "Desbloquea con un solo pago", "Recuperas Inicio, Mi Ruta, el Costeador de Platillos y Números tal como los dejaste…", botón al paywall, y accesos "Ir a Más" / "Descargar respaldo".
- **Paywall**: chip de estado de prueba, H2 "Desbloquea MiRestauranteListo con un solo pago.", precio **$2,450 MXN** (leído del panel) con **"o 3 pagos de $817 sin intereses"** debajo, 7 beneficios (incluye "Actualizaciones de las herramientas de apertura incluidas" — nunca prometer "mejoras futuras del MVP"), botón "Pagar una sola vez" (checkout externo), garantía de **14 días**, bloque "Se desbloquea al confirmarse el pago" con botón "Ya pagué, desbloquear ahora", estado de licencia y "Seguir en versión de prueba". **El campo de código NO va en el paywall**: vive en Más › Recuperar acceso.
- **Activación automática (camino principal)**: al volver del checkout la app consulta el servidor cada 2.5 s (hasta ~100 s) buscando una licencia nueva sin equipos y la reclama sola, sin que el usuario escriba nada ni revise su correo; botón "Ya pagué, desbloquear ahora" para forzar. El correo con el código se envía como comprobante, y el código solo se usa en **Más › Recuperar acceso** cuando el usuario cambia de dispositivo.
- **Revalidación**: en cada arranque; si la licencia fue revocada o reembolsada, el acceso vuelve a prueba con aviso.
- **Requiere internet**: sin conexión se muestra un bloqueo a pantalla completa (z-80) "Necesitas conexión para usar la app" con estado de licencia y "Volver a intentar"; se libera solo al recuperar red. **No hay service worker ni modo offline** (decisión de producto para forzar la validación del pago).

---

# 2 · Panel del dueño (`AdminMiRestauranteListo.dc.html`)

Desktop 1440×900. Sidebar oscura fija de 248px + main con padding 28/34.

- **Sidebar**: marca, 5 items de navegación (Resumen, Licencias, Clientes, Ajustes, Registro) con badge de conteo; activo = fondo `--color-accent`, texto blanco, peso 800; tarjeta inferior con precio, días de prueba y equipos por licencia.
- **Encabezado**: título + subtítulo por sección, botón secundario "Simular pago recibido" (imita el webhook) y primario "Emitir licencia" (formulario de 5 campos: nombre, correo, origen, monto, generar).

**Resumen**
- Selector de periodo: **Hoy · Ayer · Esta semana · Este mes · Mes pasado · Todo · Personalizado** (dos inputs `type=date`), con etiqueta "Mostrando {periodo} · {fecha} a {fecha}".
- 4 KPIs del periodo: **Ingresos netos** (con bruto y reembolsado), **Licencias del periodo**, **% de reembolsos** (monto reembolsado / bruto, más % de órdenes; rojo si >10%), **Demos terminadas sin pagar** (% de demos concluidas que no convirtieron).
- **Ingresos por origen**: barras por origen, filtradas al periodo, con "Neto $X" en el encabezado (las filas suman exactamente ese total). Debajo, embudo: Códigos emitidos / Activados / Sin activar.
- **Requiere tu atención**: códigos pagados sin activar, licencias con equipos al límite, ventana de garantía activa.
- **Cómo va la demo de prueba**: 4 métricas (demos iniciadas, concluidas, concluidas sin pago, conversión), barra de conversión y lectura accionable según el rango de conversión.
- **Últimas licencias**: tabla de 5 filas.

**Licencias** — buscador (código/nombre/correo), filtros de estado (Todas, Activadas, Sin activar, Revocadas, Reembolsadas), Exportar CSV, y tabla con acciones por fila: **Copiar · Reenviar · Liberar (equipos) · Revocar/Reactivar**. Estados con etiqueta de color: activada (verde), nueva (ámbar), revocada (rojo), reembolsada (gris).

**Clientes** — tarjetas por correo con licencias, monto pagado, estado y alta; botón "Escribirle por correo".

**Ajustes** — Precio del pago único, Días de prueba, Equipos permitidos por licencia, Descuento por referido (%), Días de garantía, **switch de activación automática**, y "Cómo conectar el cobro real" (5 pasos). Zona de riesgo: borrar licencias y eventos.

**Registro** — bitácora de eventos (pago recibido, licencia emitida/activada/revocada/reactivada, equipos liberados, ajustes actualizados) con punto de color y fecha-hora.

---

# 3 · Landing de venta (`LandingMiRestauranteListo.dc.html`)

Mobile-first (diseñar a 380px), max-width 1180px, secciones separadas 64px.

**Sistema visual propio** (deliberadamente distinto a la app): fondo papel blanco + `--bone #f4f1ec`; el bloque del resultado es **tinta #14110f** con estética de **comanda térmica** (borde superior perforado con `repeating-linear-gradient`, separadores `dashed`, números tabulares en Roboto Mono/Bricolage). Display: **Bricolage Grotesque 800** solo para números y titulares; cuerpo: **Figtree**; datos: **Roboto Mono**. Acento `--red #d63a26`, éxito `--green #1f8a5a`.

**Secciones, en orden:**
1. **Hero + calculadora en vivo.** Kicker "Calculadora gratuita · sin registro"; H1 clamp(32→58px) "Antes de firmar el local, calcula cuánto tienes que vender al día para no quebrar."; a la derecha (o debajo en móvil) el bloque del resultado. Tres campos obligatorios (Renta mensual del local, Nómina mensual estimada, Otros gastos fijos al mes) + Ticket promedio opcional (default 120). Reglas no negociables: **sin botón de calcular, sin pedir correo antes del resultado**, formato de moneda en vivo, `inputmode="numeric"`, el resultado no desplaza la calculadora, cifras absurdas muestran nota neutral (no error), y solo debajo del resultado aparece el enlace "Guardar mi cálculo y ver qué más me falta" que revela el campo de correo. Conteo animado de 650 ms con easing cúbico, respetando `prefers-reduced-motion`.
2. **El puente al producto** (primera aparición del nombre): 3 tarjetas — 43 tareas, Costo real, 3 equipos.
3. **Video demo** 16:10, autoplay silenciado, self-hosted MP4 con subtítulos quemados `[EDITAR]`; eventos de progreso 25/50/75%.
4. **Las tres herramientas** con capturas reales (`<image-slot>`: `shot-ruta`, `shot-costeador`, `shot-numeros`).
5. **Comparativa** en bloque tinta: curso $2,490–$3,960 · software desde $811/mes → $9,732 al año · asesor $15,000–$30,000 · **MiRestauranteListo $2,450 una vez** (fila destacada en rojo), y el remate "Vas a invertir alrededor de $263,500 en abrir. Esto es el 0.9% de eso."
6. **Cuatro videos de objeción** en acordeón con carátula de cara (`obj-0..3`) y resumen en texto: pago único vs mensualidad · no soy bueno con los números · reemplaza a un asesor · y si no me sirve.
7. **Precio y cierre**: $2,450 pago único, "o 3 pagos de $817 sin intereses", botón "Empezar mi prueba de 7 días" + "Pagar ahora y desbloquear todo", 6 incluidos con check verde; a un lado, garantía de 14 días, prueba de 7 días y "sin mensualidades".
8. **CTA final** único sobre `--red-soft`.
9. **CTA sticky móvil** (aparece tras 420px de scroll, no tapa la calculadora) y **botón flotante de WhatsApp**.

**Eventos de medición** (`fbq('trackCustom', …)` + `dataLayer.push`): `CalculadoraUsada`, `LeadIntent`, `Lead`, `InicioPrueba`, `InitiateCheckout`, `VideoDemo25/50/75`, `VideoObjecion`, `ContactoWhatsApp`. Falta añadir `Purchase` en el retorno del checkout y la API de Conversiones del lado servidor.

---

# 4 · Fórmulas y reglas de negocio (implementar desde aquí)

### Unidades y conversión

```
UNITS = { g:1, kg:1000, oz:28.35, lb:453.6 }        // familia masa
        { ml:1, l:1000, taza:240, cda:15 }           // familia volumen
        { pz:1, manojo:1 }                            // familia pieza
```

### Costo de un ingrediente

```
precioBase       = precioCompra / (cantidadComprada × factor(unidadCompra))   // por unidad base
precioPorUnidad  = mismaFamilia ? precioBase × factor(unidadUso)
                                : precioCompra / cantidadComprada
precioUnitario   = precioPorUnidad / (1 − merma/100)      // merma topada a 90%
costoIngrediente = cantidadUsada × precioUnitario
```

Si el ingrediente es una **sub-receta**: `precioUnitario = costoLote/rendimientoLote × factor(unidadUso)/factor(unidadLote)`; el costo del lote es la suma de sus ingredientes con la misma fórmula.

### Costo y rentabilidad del platillo

```
costoIngredientes = Σ costoIngrediente / porciones
costoPorPorcion   = costoIngredientes × (1 + varios/100) + empaque + manoDeObra
precioNeto        = incluyeIVA ? precio / 1.16 : precio
foodCost %        = costoPorPorcion / precioNeto × 100
utilidadBruta     = precioNeto − costoPorPorcion
margenBruto %     = utilidadBruta / precioNeto × 100
precioSugerido    = costoPorPorcion / (foodCostObjetivo/100) × (incluyeIVA ? 1.16 : 1)
precioDelivery    = precioSugerido / (1 − comisión/100)
```

**Semáforo** (misma frontera en todas las pantallas, sobre el food cost **redondeado**): ≤30% saludable (verde) · 31–38% revisar (ámbar) · >38% peligroso (rojo). Si el precio es 0: food cost, utilidad y margen se muestran "—", la aguja va al centro en gris y el veredicto pide definir precio.

**Agregados** (food cost promedio, ponderado, utilidad promedio, ticket promedio, margen sugerido): **excluir siempre los platillos con precio 0**; si no queda ninguno, mostrar "—".

### Inversión y punto de equilibrio

```
totalConcepto  = tieneSubconceptos ? Σ subconceptos : montoDirecto
inversión      = Σ totalConcepto (base + propios)
diferencia     = presupuestoTope − inversión        // negativa ⇒ estado de exceso
gastosFijos    = Σ conceptos fijos
ventaMensual   = gastosFijos / (margenBruto/100)
ventaDiaria    = ventaMensual / 30
ticketsPorDía  = ceil(ventaDiaria / ticketPromedio)
```

La landing usa la misma fórmula con **margen fijo de 68%**.

### Avance del proyecto

```
tareas   = módulos NO omitidos → tareas base + tareas propias del usuario
avance % = round(completadas / total × 100)
```

### Ingeniería de menú (Mi Menú)

Con el food cost redondeado y la popularidad declarada por el usuario:

| | food cost ≤30% | 31–38% | >38% |
| --- | --- | --- | --- |
| Se vende mucho | **Estrella** | Margen justo · revisar | **Vaca lechera** |
| Se vende normal | Buen margen · define su popularidad | Margen justo · revisar | Margen bajo · define su popularidad |
| Se vende poco | **Rompecabezas** | Margen justo · revisar | **Perro** |

Sin precio ⇒ "Sin precio". La etiqueta nunca debe contradecir el food cost mostrado.

### Sugerencia de distribución de carta

Formatos: 1 hoja 1 página (1 panel) · 1 hoja 2 páginas (2) · Tríptico (3) · 2 hojas tipo libro (4). Capacidad **8 platillos por panel**, mínimo sano 3.

Algoritmo: excluir "perro" y sin precio → ordenar secciones (Fuertes, Entradas, Bebidas, Postres) y dentro de cada una por utilidad descendente → asignar cada sección completa al primer panel donde quepa, partiéndola si no cabe (marcada "(continúa)") → **panel 1 = zona de oro** → el primer platillo de cada sección se marca "Destacar". Avisos: carta que no cabe (sugerir más páginas o quitar perros), espacio sobrante, perros excluidos, platillos sin precio.

### Licencias (contrato a implementar en backend)

```
POST /licenses            (webhook de pago)  → { code }            // MRL-XXXX-XXXX
POST /licenses/activate   { code, deviceId } → { ok, devices, max } // registra equipo
POST /licenses/validate   { code, deviceId } → { ok, status }        // en cada arranque
POST /licenses/claim      { deviceId }       → { ok, code }          // activación automática
POST /licenses/:code/revoke | /free-devices | /resend                // panel del dueño
```

Reglas: código con formato `MRL-XXXX-XXXX` (alfabeto sin caracteres ambiguos); estados `nueva → activada → revocada | reembolsada`; máximo **3 equipos** por licencia (configurable); revocada/reembolsada ⇒ el cliente vuelve a prueba; **prueba de 7 días** con inicio en el primer arranque; **activación automática** encendida por defecto (el cliente no escribe código). En el prototipo todo esto vive en `localStorage['mrl.licenses.v1']` compartido entre app y panel — **hay que sustituirlo por endpoints reales**.

### Telemetría de demos (alimenta el KPI del panel)

Cada instalación registra `{ deviceId, startedAt, expiredAt, converted }`: `expiredAt` se sella al cumplirse los días de prueba y `converted` al activar licencia. El panel calcula: demos iniciadas, concluidas, concluidas sin pago y % de conversión, filtradas por periodo.

---

# 5 · Estado a modelar

**App del emprendedor** (persistir en `mrl.state.v2` en el prototipo; en producción, servidor + caché local):

`screen`, `tab`, `sub`, `numModule`, `costView`, `obStep`, `openTask`, `openIng`, `srOpenIng`, `openFaq`, `form`, `fabOpen`, `info`, `toast`, `tour`, `checking`, `claiming`, `online` · `answers`, `profile`, `project`, `done`, `skipped`, `extraTasks`, `dishes`, `subrecipes`, `budget`, `budgetSub`, `budgetExtra`, `fixed`, `fixedExtra`, `ticket`, `margin`, `fcTarget`, `layout`, `notes`, `suppliers`, `settings` (incluye `accent`, `dark`, `currency`, `tourDone`), `license`, `trialStart`, `deviceId`.

**Panel**: `page`, `period`, `from`, `to`, `query`, `statusFilter`, `issueOpen`, formulario de emisión, y el store `{ settings, codes[], trials[], events[] }`.

**Landing**: `renta`, `nomina`, `otros`, `ticket`, `shown` (valor animado), `leadOpen`, `leadDone`, `email`, `openObj`, `sticky`, eventos disparados.

---

# 6 · Design tokens

### App del emprendedor (tema por defecto; 6 acentos + modo noche)

```
--color-bg        #faf7f5      --color-text      #1d1b1a
--color-surface   #ffffff      --color-divider   rgba(29,27,26,.10)
--color-accent    #d63a26      (100 #fdeeea · 200 #fbd8d0 · 300 #f5b0a2 · 400 #e97a63
                                500 #d63a26 · 600 #b92e1c · 700 #992414 · 800 #6f1a0f · 900 #4a120a)
--color-accent-2  #22a05f      (100 #e8f7ee · 200 #cdead9 · 300 #9fd6b8 · 400 #5cbe8b
                                500 #22a05f · 600 #17854d · 700 #10683c · 800 #0b4a2b · 900 #07301c)
--color-neutral   100 #ffffff · 200 #f4f1ee · 300 #e6e1dc · 400 #c9c3bc · 500 #a09a93
                  600 #7b756e · 700 #5a544e · 800 #3b3733 · 900 #211f1d
--color-warn      #e8a317      --color-warn-100  #fdf3e0
--shadow-sm 0 1px 3px rgba(29,27,26,.07)   --shadow-md 0 6px 18px rgba(29,27,26,.10)
--shadow-lg 0 18px 44px rgba(29,27,26,.16)
```

**Acentos seleccionables**: Rojo `#d63a26` · Terracota `#c67139` · Ámbar `#e0891c` · Verde `#1f8a5a` · Azul `#2f6fd0` · Ciruela `#8d3f6d`. Las rampas se derivan con `color-mix` contra blanco (o `#121110` en modo noche) en pasos 10/22/40/65% y contra negro en 85/72/56/42%.

**Modo noche**: bg `#121110`, surface `#1c1a19`, text `#f6f2ef`, divider `rgba(255,255,255,.13)`, neutrales invertidos (100 `#1e1c1b` → 900 `#f6f2ef`), sombras con negro al 50–60%. **Importante**: el contenedor raíz debe re-declarar `color: var(--color-text)` para que el texto heredado se re-resuelva.

**Tipografía**: Figtree (400/500/600/700/800). Títulos = Figtree 800, `letter-spacing:-.02em`. Escala usada: 40 / 30 / 26 / 25 / 21 / 20 / 19 / 18 / 17 / 16 / 15 / 14.5 / 13.5 / 12.5 / 11 / 10 px.

**Radios**: 44 (marco) · 34 (hojas) · 28 (tarjetas grandes) · 24 · 22 · 20 · 18 · 16 · 999 (pills e inputs).
**Espaciado**: 4 · 6 · 8 · 10 · 12 · 14 · 16 · 18 · 22 · 26 px.
**Alturas de control**: inputs y botones 44–52px (mínimo táctil 44); FAB 62px; nav 82px; iconos de nav 21px.
**Inputs**: `font-size:16px` obligatorio (evita el zoom de iOS), `inputmode="decimal"` en numéricos, y **nunca reformatear el valor mientras se escribe** (sin "$" ni comas dentro del input: el símbolo va fuera).

### Landing

```
--ink #14110f · --paper #ffffff · --bone #f4f1ec · --line rgba(20,17,15,.12)
--red #d63a26 · --red-soft #fdeeea · --red-deep #8f2213
--green #1f8a5a · --green-soft #e8f7ee · --pencil #87807a
Display: Bricolage Grotesque 600/800 · Cuerpo: Figtree 400/500/600/800 · Datos: Roboto Mono 500/700
Números: font-variant-numeric: tabular-nums
```

### Animaciones

`mrlUp` 200–250 ms `ease` (translateY 14px + opacidad) para acordeones y hojas · `mrlPop` para checks · `mrlToast` 200 ms · `lpPrint` 450 ms `cubic-bezier(.2,.7,.2,1)` para el ticket de la landing · conteo del número 650 ms con easing cúbico. Barras y anillos de progreso: `transition: width .3s ease`. Todo debe respetar `prefers-reduced-motion`.

---

# 7 · Accesibilidad y calidad

- Foco visible: `outline: 2–2.5px solid var(--color-accent); outline-offset: 2–3px`.
- Contraste AA en texto; el acento se usa en texto grande o sobre sus tonos 100/800.
- Labels reales en todos los campos (no solo placeholders).
- Objetivos táctiles ≥44px; nada de tipografía menor a 10px en UI ni menor a 12pt en documentos impresos.
- Landing: LCP <2.5 s en 4G, video comprimido self-hosted, sin iframes de terceros.

# 8 · Assets

- **Iconos**: Lucide (stroke 2.6–2.75). Se usan inline en el prototipo; en producción usar el paquete de iconos del codebase.
- **Iconos de app / PWA**: `icon-192.png`, `icon-512.png` (generados: cuadrado redondeado rojo con gorro de chef blanco), `manifest.webmanifest` (`display: standalone`, `theme_color #d63a26`, `background_color #faf7f5`). **No incluir service worker**: el producto exige conexión.
- **Capturas y videos**: pendientes del cliente; en la landing están como `<image-slot>` y bloques `[EDITAR]`.
- **Fuentes**: Figtree, Bricolage Grotesque, Roboto Mono (Google Fonts).

# 9 · Documentos imprimibles

- **Ficha técnica** (`FichaTecnica.dc.html`): una hoja por platillo — encabezado con proyecto y fecha, 4 métricas, tabla de receta estándar (ingrediente, cantidad, compra, merma, costo unitario limpio, costo), desglose del costo, precios y rentabilidad (incluye precio sugerido y de delivery), lectura del resultado y línea de firmas.
- **Resumen financiero** (`ResumenFinanciero.dc.html`): documento fluido con 4 KPIs, presupuesto de apertura con subconceptos y % del total, gastos fijos con %, punto de equilibrio con lectura simple, y 4 escenarios de venta (equilibrio, −15%, +15%, +35%) con utilidad estimada y clientes por día.

Ambos leen los datos capturados por el usuario y se exportan a PDF por impresión. En producción, generarlos del lado servidor o con la librería de PDF del codebase, manteniendo la estructura y los textos.

# 10 · Files

| Archivo | Qué contiene |
| --- | --- |
| `MiRestauranteListo.dc.html` | App completa del emprendedor (todas las pantallas, cálculos, licencia y prueba) |
| `AdminMiRestauranteListo.dc.html` | Panel del dueño |
| `LandingMiRestauranteListo.dc.html` | Landing de venta con calculadora |
| `FichaTecnica.dc.html` | Ficha técnica de costeo imprimible |
| `ResumenFinanciero.dc.html` | Resumen financiero imprimible |
| `manifest.webmanifest`, `icon-192.png`, `icon-512.png` | Assets PWA |
| `image-slot.js`, `doc-page.js`, `support.js` | Runtime y utilidades **del prototipo** (no portar) |

## Orden sugerido de implementación

1. Modelo de datos + fórmulas de costeo y punto de equilibrio (sección 4), con pruebas unitarias sobre los ejemplos de este documento.
2. App del emprendedor: onboarding → diagnóstico → Mi Ruta → Costeador → Números.
3. Backend de licencias con el contrato de la sección 4 + webhook de cobro.
4. Panel del dueño sobre esos endpoints.
5. Landing y medición.
6. Documentos PDF.


---

# 11 · Detección de plataforma y modos de presentación

La app se adapta sola: al montar (y en `resize` / `orientationchange` / cambio de `display-mode`) detecta **sistema** (iOS, iPadOS, Android, Windows, macOS, ChromeOS, Linux), **tipo de equipo** (phone / tablet / desktop, por UA + `maxTouchPoints` + ancho, incluyendo el caso iPadOS que se anuncia como Mac táctil), **navegador** y si corre **instalada** (`display-mode: standalone` o `navigator.standalone`). Ese resultado alimenta:

| Modo | Presentación |
| --- | --- |
| phone | Diseño base de 430px |
| tablet (≥760px) | Marco de 820px sin bisel, contenido centrado a 620px |
| desktop (≥900px) | Ventana de 1000px (1120px desde 1280px), sin bisel ni barra de estado simulada, contenido centrado a 780–840px, barra de navegación compacta al centro |
| standalone (PWA) | Pantalla completa (100dvh), sin marco, con `env(safe-area-inset-*)` aplicado a la navegación inferior y al FAB |

En producción esto se resuelve con media queries + un hook de plataforma (o el equivalente del framework), **no** con detección de UA para decidir layout: la UA solo se usa para el texto de instalación y para la etiqueta "Equipo detectado" en Ajustes. La tarjeta de instalación cambia su instrucción según lo detectado (iOS/iPadOS: "Compartir → Agregar a inicio"; Android: "menú → Instalar app"; escritorio: "icono de instalar en la barra de direcciones"; instalada: confirmación).

# 12 · Landing de venta — estado final

La landing cambió de estructura respecto a la primera versión. El orden definitivo es:

1. **Barra de urgencia** (solo si la fecha límite no pasó y queda cupo): "Precio de lanzamiento · últimos N días · quedan X de Y lugares" con barra de avance del cupo. Todo sale de una constante `LAUNCH = { deadline, spotsTotal, spotsLeft, listPrice, price }`; si la fecha venció o el cupo se agota, la urgencia **desaparece sola** en las cuatro superficies donde aparece (barra superior, bloque de precio, barra sticky, cierre).
2. **Hero de diagnóstico** (reemplazó a la calculadora): eyebrow "Diagnóstico gratuito · sin registro", H1 "¿Quieres abrir tu negocio de comida y no sabes ni por dónde empezar?", y **dos preguntas de un tap** — giro (Taquería, Cafetería, Food truck, Restaurante, Fonda / cocina económica, Otro) y punto de partida (Solo tengo la idea, Ya sé qué voy a vender, Estoy buscando local, Ya tengo el local). La segunda aparece al contestar la primera; **sin botón de calcular**.
3. **Panel de ruta** (mismo tratamiento de comanda en tinta): "Tu ruta para abrir una taquería", "43 pasos, 10 etapas. Estás en el paso N." con barra de progreso, pasos cubiertos palomeados y tachados, **bloque de pasos saltados** cuando ya busca o tiene local ("Hay 3 pasos que van antes de buscar local…"), el siguiente paso destacado con su instrucción y su por qué —textos idénticos a los de la app—, dos pasos siguientes y el corte "+N pasos más, en orden". Debajo, captura de correo "Mándame mi ruta completa".
   Mapeo: idea → paso 1 / Define el tipo de negocio · ya sé qué vender → paso 3 / Identifica a tu cliente ideal · buscando local → paso 4 / Crea tu propuesta de valor · ya tengo local → paso 6 / Define tu menú inicial.
4. **Franja de CTA** que lee del diagnóstico: "Vas en el paso N de 43. Los otros M ya están armados y en orden, esperándote."
5. El puente al producto · video demo · **las tres herramientas** (capturas verticales 9:17 con `fit=contain`) · **la calculadora completa**, ahora en su propia sección "Y cuando llegues a los números, ya están resueltos" (cuatro campos incluyendo la meta del dueño, dos resultados en paralelo, línea de gastos fijos, ritmo por cliente, toggle de día de descanso y "Guardar mi cálculo") · comparativa de costos con el remate del 0.9% · **"Un mes de renta mal elegida te cuesta $X"** con la renta que el usuario tecleó · cuatro videos de objeción · precio con ancla `$3,900` tachado y "Por qué sube el precio" · garantía · CTA final "Puedes calcular todo esto después de firmar el local. Sale mucho más caro." · barra sticky · WhatsApp.

**Jerarquía de CTA:** "Empezar mi prueba de 7 días" es el botón sólido dominante; "Pagar ahora y desbloquear todo" es un enlace de texto con la razón al lado ("Ya lo tengo claro, sáltate la prueba").

**Mobile-first:** el contenedor del hero usa `flex-flow: row wrap-reverse` con `align-items: flex-end`, de modo que en móvil el panel de resultado queda **arriba** de las preguntas (visible sin scroll al contestar) y en desktop se conserva preguntas-izquierda / panel-derecha. Paddings y márgenes fluidos con `clamp()`. En producción, resolverlo con media queries explícitas.

**Eventos:** `DiagnosticoCompletado`, `LeadIntent`, `Lead`, `CalculadoraUsada`, `InicioPrueba`, `InitiateCheckout`, `VideoDemo25/50/75`, `VideoObjecion`, `ContactoWhatsApp`. Falta `Purchase` en el retorno del checkout y la API de Conversiones del lado servidor.

**Huecos `[EDITAR]` del cliente:** MP4 del demo, cuatro clips de objeción con carátula de cara, capturas reales de la app, número de WhatsApp, y verificar el dato de inversión típica ($263,500) y el ticket promedio por defecto ($120).

# 13 · Plan de implementación para Claude Code

**Stack sugerido:** Next.js (App Router) + TypeScript + Tailwind; Postgres con Prisma (o Supabase); Resend para correo transaccional; Stripe o Mercado Pago para el cobro. La app requiere conexión por diseño — **no** agregar service worker con caché offline.

**Orden de trabajo**

1. **Dominio de cálculo primero.** Portar las fórmulas de la sección 4 a módulos puros con pruebas unitarias usando los ejemplos de este documento (merma y conversión de unidades, sub-recetas por lote, food cost sobre precio sin IVA, punto de equilibrio con días de venta y meta del dueño, ingeniería de menú, distribución de carta). Es el corazón del producto y lo único que no se puede improvisar.
2. **Modelo de datos y cuentas.** Un usuario → un proyecto (por ahora), con las entidades: perfil, proyecto, tareas completadas, módulos omitidos con motivo, tareas propias, platillos con ingredientes, sub-recetas, presupuesto con subconceptos, gastos fijos, notas, proveedores, ajustes, licencia y telemetría de prueba. Migrar el respaldo `.json` del prototipo como importador.
3. **Licencias y cobro.** Implementar los endpoints de la sección 4 (`/licenses`, `/activate`, `/validate`, `/claim`, `/revoke`, `/free-devices`, `/resend`) más el webhook del proveedor de pago. Reglas: código `MRL-XXXX-XXXX` con alfabeto sin caracteres ambiguos, estados `nueva → activada → revocada | reembolsada`, máximo 3 dispositivos configurable, prueba de 7 días desde el primer arranque, revalidación en cada arranque, activación automática encendida por defecto. **La validación nunca debe ocurrir en el cliente.**
4. **App del emprendedor** con las cinco pestañas y el gating exacto de la sección 1.12.
5. **Panel del dueño** sobre esos endpoints, incluyendo el selector de periodo (hoy, ayer, esta semana, este mes, mes pasado, todo, personalizado), % de reembolsos y el KPI de demos concluidas sin pago.
6. **Landing** y medición (Pixel + API de Conversiones), con `Purchase` en el retorno del checkout.
7. **PDFs** (ficha técnica y resumen financiero) del lado servidor o con la librería de PDF del stack, manteniendo estructura y textos.

**Variables de entorno mínimas:** `DATABASE_URL`, `STRIPE_SECRET_KEY` / `MP_ACCESS_TOKEN`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, `APP_URL`, `LICENSE_SIGNING_SECRET`, `META_PIXEL_ID`, `META_CAPI_TOKEN`.

**Correos transaccionales a crear:** compra confirmada con el código como comprobante, acceso activado, recuperar acceso, recordatorio del día 6 de prueba, y aviso de prueba terminada.

**Criterios de aceptación**

- Un pago real desbloquea la app **sin que el usuario escriba nada**, en la misma sesión.
- Revocar o marcar reembolso en el panel regresa a ese usuario a prueba en su siguiente arranque.
- Un código no funciona en un cuarto dispositivo hasta liberar equipos desde el panel.
- Sin conexión, la app muestra el bloqueo de red y no permite usarse.
- Con la licencia inactiva, ninguna superficie revela la inversión estimada ni el excedente de presupuesto.
- Los cálculos de la sección 4 coinciden con los ejemplos numéricos de este documento.
