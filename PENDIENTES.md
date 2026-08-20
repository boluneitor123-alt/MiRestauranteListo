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

- [x] `colchonDeArranque()` — rampa de venta real (40 %, 65 %, 85 %, 100 % en los
      primeros cuatro meses), suma del hueco de esos meses, y en qué mes el
      negocio se paga solo.
- [x] `sueldoRealDelDueno()` — venta × margen − gastos fijos − comisión de
      tarjeta (3.6 % sobre el 40 % de la venta) − impuestos estimados.
- [x] `valorDeTuHora()` — sueldo real ÷ horas trabajadas al mes, con control de
      horas por semana (rango 1–120, default 70).
- [x] `costoPorHoraAbierto()` — gastos fijos ÷ horas de operación al mes.
- [x] `mermaMensual()` — promedio de merma de las recetas capturadas aplicado a
      la compra mensual de insumos. Sin recetas, muestra "Sin datos".
- [x] `utilidadPorMinutoDeCocina()` — utilidad promedio del platillo ÷ minutos
      de preparación.
- [x] `compraDeInsumosAlMes()`.
- [x] `pruebaDeEstres()` — tres controles: sube insumos %, sube renta %, baja
      venta %. Recalcula punto de equilibrio, tickets al día y sueldo del dueño.
- [x] Sección "Lo que este negocio te va a dar" en `tabs/Numeros.tsx`, con las
      notas explicativas y el estado bueno/malo que cambia el color.
- [x] Pruebas unitarias en `src/domain/__tests__/survival.test.ts` para cada
      función nueva.

Copia los textos de las notas literales del prototipo. Están escritos para un
dueño de fonda; no los reescribas.

**Hecho.** Las ocho funciones viven en `src/domain/survival.ts`, no en
`finance.ts`: `finance.ts` es de las tres cuentas base y esto es otra cosa.
`survival()` las compone y redacta los textos. Pruebas en
`src/domain/__tests__/survival.test.ts` (29). La pantalla es
`src/components/app/numeros/Aguante.tsx`, y se entra desde una cuarta tarjeta
en Números. Los seis ajustes nuevos (horas por semana, minutos de preparación,
mezcla diaria y los tres de la prueba de estrés) se guardan en la base:
migración `20260820120000_survival_settings`.

---

## 2. Las herramientas que ya existen y no se alcanzan

`src/components/app/tools/AdDoctor.tsx` y
`src/components/app/tools/DeliveryCalculator.tsx` están construidos, con dominio
y pruebas (`domain/ads.ts`, `domain/delivery.ts`). No hay forma de llegar a
ellos desde la app.

- [x] Verifica si están montados en alguna ruta o pantalla. **Sí lo están:**
      `Mas.tsx` los importa y los monta en las sub-pantallas `delivery` y
      `anuncios`, y hay un grupo "Herramientas" en la lista de Más con las dos
      entradas. Verificado en el navegador.
- [x] Entrada desde Más. Existe para las dos.
- [x] Entrada a la calculadora desde el módulo de delivery de Mi Ruta.
- [x] Entrada al diagnóstico de anuncios desde el curso de anuncios.
- [x] Que el resultado de cada una se pueda guardar y volver a abrir. Lo
      capturado se guarda con el proyecto: migración
      `20260820170000_tool_captures`.

---

## 3. La lección por dentro

`src/components/app/ruta/Lesson.tsx` existe y `src/content/lessons.ts` tiene las
90 lecciones. En vivo, la tarjeta de tarea solo muestra título y una línea.

- [x] Averigua si `Lesson.tsx` se está montando al abrir una tarea. **Sí se
      monta:** `Ruta.tsx` lo renderiza dentro de `TaskCard` cuando la tarea
      está abierta. Verificado en el navegador.
- [x] Al abrir una tarea muestra todo lo pedido. Verificado.
- [x] La tabla de ejemplo es condicional y sale sólo cuando la lección la trae.
- [x] Las 26 lecciones sin ilustración se pintan sin ella.
- [x] Respeta la muestra gratis.
- [x] Probado en módulo libre, módulo de ruta y curso con estrella.
- [x] El hueco de imagen ya se pinta: cuando la lección no trae ilustración,
      se muestra el encargo de la foto (el campo `img`) en un recuadro de
      línea punteada con su icono de cámara, para que se lea como espacio
      intencional y no como imagen rota.

---

## 4. Mi Menú, entregables y landing

- [x] Plan de acción de Mi Menú. `menuMoney()` en `src/domain/menu.ts` y la
      pantalla en `src/components/app/costeador/PlanDeAccion.tsx`. Trae los
      tres tipos de cambio del prototipo — subir precio, empujar en la carta y
      sacar de la carta —, ordenados por cuánto dinero mueve cada uno, con el
      botón que lo aplica de verdad, "No, gracias" para archivarlo y la caja de
      archivadas con "Reactivar" y "Restaurar todas". El prototipo no tiene un
      cambio de "ajustar porción": no lo inventé.
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
