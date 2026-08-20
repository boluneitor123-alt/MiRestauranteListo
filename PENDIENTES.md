# Pendientes

Lista de trabajo para Claude Code. Tacha con `[x]` al terminar cada punto y deja
el commit en `main`. El orden importa: 1 primero, 4 al final.

Referencia de diseño: `entrega-claude-code/diseno/MiRestauranteListo.dc.html`.
Cuando este archivo y el prototipo se contradigan, manda el prototipo. Si algo
parece un error del prototipo, avisa antes de corregirlo por tu cuenta.

---

## 1. Números: los indicadores que faltan

`src/domain/finance.ts` hoy tiene inversión, gastos fijos, punto de equilibrio y
escenarios. No tiene nada de lo de abajo, ni en dominio ni en UI. Es el hueco
más grande del producto: es la diferencia entre una app de notas y una
herramienta que le dice al dueño si le va a alcanzar.

En el prototipo esto vive en el método que arma `svCards`, `svOps`, `svCushion`
y `svHours`. Busca el texto `Tu colchón para los meses de arranque`.

- [ ] `colchonDeArranque()` — rampa de venta real (40 %, 65 %, 85 %, 100 % en los
      primeros cuatro meses), suma del hueco de esos meses, y en qué mes el
      negocio se paga solo.
- [ ] `sueldoRealDelDueno()` — venta × margen − gastos fijos − comisión de
      tarjeta (3.6 % sobre el 40 % de la venta) − impuestos estimados.
- [ ] `valorDeTuHora()` — sueldo real ÷ horas trabajadas al mes, con control de
      horas por semana (rango 1–120, default 70).
- [ ] `costoPorHoraAbierto()` — gastos fijos ÷ horas de operación al mes.
- [ ] `mermaMensual()` — promedio de merma de las recetas capturadas aplicado a
      la compra mensual de insumos. Sin recetas, muestra "Sin datos".
- [ ] `utilidadPorMinutoDeCocina()` — utilidad promedio del platillo ÷ minutos
      de preparación.
- [ ] `compraDeInsumosAlMes()`.
- [ ] `pruebaDeEstres()` — tres controles: sube insumos %, sube renta %, baja
      venta %. Recalcula punto de equilibrio, tickets al día y sueldo del dueño.
- [ ] Sección "Lo que este negocio te va a dar" en `tabs/Numeros.tsx`, con las
      notas explicativas y el estado bueno/malo que cambia el color.
- [ ] Pruebas unitarias en `src/domain/__tests__/finance.test.ts` para cada
      función nueva.

Copia los textos de las notas literales del prototipo. Están escritos para un
dueño de fonda; no los reescribas.

---

## 2. Las herramientas que ya existen y no se alcanzan

`src/components/app/tools/AdDoctor.tsx` y
`src/components/app/tools/DeliveryCalculator.tsx` están construidos, con dominio
y pruebas (`domain/ads.ts`, `domain/delivery.ts`). No hay forma de llegar a
ellos desde la app.

- [ ] Verifica si están montados en alguna ruta o pantalla. Dime qué encontraste
      antes de cambiar nada.
- [ ] Entrada a la calculadora de delivery desde el módulo de delivery y desde Más.
- [ ] Entrada al diagnóstico de anuncios desde el curso de anuncios y desde Más.
- [ ] Que el resultado de cada una se pueda guardar y volver a abrir.

---

## 3. La lección por dentro

`src/components/app/ruta/Lesson.tsx` existe y `src/content/lessons.ts` tiene las
90 lecciones. En vivo, la tarjeta de tarea solo muestra título y una línea.

- [ ] Averigua si `Lesson.tsx` se está montando al abrir una tarea. Reporta qué
      pasa antes de reescribir.
- [ ] Al abrir una tarea debe mostrar, en este orden: número de lección y de
      cuántas es, minutos, espacio para la imagen de contexto con su instrucción
      visible mientras no haya imagen, pasos numerados, tabla de ejemplo cuando
      exista, error común, y la lista de validación con casillas.
- [ ] La tabla de ejemplo es condicional. Solo 44 de las 90 la traen. No
      inventes ninguna.
- [ ] Las 26 lecciones sin ilustración se quedan sin ilustración.
- [ ] Respeta la muestra gratis: en módulos bloqueados la lección 1 abre completa.
- [ ] Prueba abriendo una lección de cada módulo, incluidos los cuatro cursos
      con estrella.

---

## 4. Mi Menú, entregables y landing

- [ ] Plan de acción de Mi Menú: la lista de cambios ordenada por cuánto dinero
      mueve cada uno, con su explicación y un botón que lo aplica de verdad
      (subir precio, sacar de la carta, ajustar porción). En el prototipo busca
      "Tu plan de acción" y los objetos con `kind`, `imp`, `title`, `body`,
      `cta`, `run`. Dominio: `src/domain/menu.ts`.
- [ ] Los seis entregables generan su documento con los datos del usuario, listo
      para imprimir. Ya existen `print/FichaTecnica.tsx` y
      `print/ResumenFinanciero.tsx`; faltan Plan de apertura, Carta menú,
      Diagnóstico de anuncios y Cuenta real de delivery. Referencia:
      `PlanDeApertura.dc.html` y `CartaMenu.dc.html` en la carpeta de diseño.
- [ ] Landing: portar la del prototipo
      (`LandingMiRestauranteListo.dc.html`) — cuaderno de contabilidad,
      calculadora viva, antes y después, tres maquetas de la app, entrada de
      doce números. Hoy `src/app/page.tsx` tiene la estructura anterior.

---

## Reglas de siempre

- Nada tocable por debajo de 44 px.
- Sin scroll horizontal a 360 px de ancho.
- Colores solo de los tokens de `src/app/globals.css`.
- Pruebas en verde antes de cada commit, y prueba en navegador de verdad.
- No toques lo que ya funciona: las 90 tareas en los dos menús, el Costeador con
  sub-recetas y semáforo, Inicio, el panel de admin por rol, la hoja de
  instalación.
- Si algo de esta lista ya está hecho, no lo rehagas: táchalo y dime dónde está.

---

## Contenido pendiente del lado del dueño

No es trabajo de código. Anotado para que no se pierda.

- Las 26 ilustraciones de los cursos de Delivery y Contratar.
- Los textos marcados `[EDITAR]` en las advertencias.
- Los videos del curso de anuncios de Meta.
- El quinto mini curso: control de merma y robo interno.
