# Entrega de diseño · MiRestauranteListo

Esta carpeta es la **fuente de verdad visual y de contenido**. No es
documentación que describe el diseño: es el diseño, funcionando.

Cada archivo `.dc.html` abre en el navegador y se puede usar. Ábrelos
antes de escribir una línea de código.

## Regla única

**No inventes nada.** Cada color, cada texto, cada número de ejemplo,
cada fórmula y cada ilustración ya está decidido aquí. Si algo no está
en estos archivos, pregúntame antes de resolverlo por tu cuenta.

Cuando dudes entre lo que dice mi prompt en el chat y lo que dice el
código de esta carpeta, **gana el código de esta carpeta**.

## Qué hay en cada archivo

| Archivo | Qué contiene |
| --- | --- |
| `diseno/MiRestauranteListo.dc.html` | La app completa. Es el archivo más importante. |
| `diseno/LandingMiRestauranteListo.dc.html` | La landing de venta, con login y crear cuenta. |
| `diseno/AdminMiRestauranteListo.dc.html` | El panel del dueño. |
| `diseno/CartaMenu.dc.html` | Entregable: previsualizador de la carta impresa. |
| `diseno/PlanDeApertura.dc.html` | Entregable: plan de apertura en PDF. |
| `diseno/FichaTecnica.dc.html` | Entregable: ficha técnica de un platillo. |
| `diseno/ResumenFinanciero.dc.html` | Entregable: presupuesto y punto de equilibrio. |
| `diseno/art/illustrations.js` | Las ilustraciones SVG, una por lección. |
| `diseno/tokens/styles.css` | Los tokens del sistema visual: colores, tipos, radios, sombras. |

## Cómo leer un archivo `.dc.html`

Cada uno tiene dos zonas:

1. **La plantilla** — el HTML entre `<x-dc>` y `</x-dc>`. De aquí sacas
   la estructura, los estilos en línea y los textos visibles.
2. **La lógica** — la clase JavaScript dentro del `<script>` al final.
   De aquí sacas los datos, las fórmulas y los estados.

Traduce esto a los componentes de React/Next que ya tiene el repo.
Conserva los nombres de las constantes donde puedas: hace más fácil
comparar después.

## Dónde está cada cosa dentro de la app

Todo en `diseno/MiRestauranteListo.dc.html`:

- **`const CATS`** — los 14 módulos con sus 90 tareas. El orden importa.
  Los que llevan `course: true` son los cuatro mini cursos con estrella.
  Cada módulo trae su `col` (color) y su `desc`.
- **`const LESSONS`** — el contenido de cada lección, indexado por el
  título exacto de la tarea. Cada entrada trae:
  - `m` minutos que toma
  - `img` descripción de la ilustración
  - `s` los pasos, en orden
  - `e` el error típico
  - `d` el checklist de "ya quedó cuando"
  - `x` la tabla de ejemplo con números (`t` título, `r` renglones,
    `n` la nota que explica qué significan)
  **Copia estos textos tal cual, sin reescribirlos ni resumirlos.**
  Los números están calculados a propósito.
- **`const GIROS`** — las plantillas por tipo de negocio: ticket, margen,
  presupuesto, gastos fijos y platillos de ejemplo con sus ingredientes.
- **`deliveryCalc()`** — la calculadora de delivery completa.
- **`adDoctor()`** — el analizador de anuncios de Meta.
- **`renderVals()`** — todo lo demás: bloqueos de la prueba, menús,
  animaciones, Números, Mi Menú, entregables.

## Los tokens visuales

Están en `diseno/tokens/styles.css` y repetidos en el `:root` de cada
archivo. Los principales:

```
--color-accent:      #e07a2b   naranja terracota (el color de la marca)
--color-accent-2:    #22a05f   sage — en la app significa "vas bien"
--color-bg:          #faf7f5
--color-text:        #1d1b1a
--font-heading:      Caprasimo
--font-body:         Figtree
```

Cada acento tiene rampa 100–900. **Úsalas; no generes tonos nuevos.**

### Dos advertencias de color

1. **Texto sobre naranja.** El `#e07a2b` tiene luminancia media: ningún
   texto claro alcanza 4.5:1 encima de él. Existe un token
   `--on-accent: #33190a` para eso. Úsalo en todo lo que se pinte sobre
   relleno de acento. Este error reapareció varias veces en el diseño.
2. **El sage no es decoración.** En la app significa éxito: semáforo de
   food cost, tarea completada, punto de equilibrio cubierto. No lo
   cambies por naranja o el semáforo deja de leerse. En la **landing**
   sí está prohibido el verde: ahí el segundo acento es terracota
   `#a8442f`.

## Las ilustraciones

`diseno/art/illustrations.js` expone `window.MRL_ART`, indexado por el
título de la lección en minúsculas, sin acentos y con guiones.

Usan **dos voces de color**: la primera es `currentColor`, la segunda
viaja como token `var(--illo-2, #7a8a5e)`. Así la app conserva el sage y
la landing recolorea la misma ilustración a terracota sin duplicar el
archivo. **No claves colores dentro del SVG.**

## Lo único que NO debes copiar

El login de administrador. En el prototipo la lista de correos vive del
lado del cliente (`ADMIN_EMAILS` en la landing) y **eso no sirve en
producción**: cualquiera podría editarla y entrar al panel.

Impleméntalo bien:

- campo `role` en la tabla de usuarios (`'owner' | 'admin'`), con
  `'owner'` por defecto
- al iniciar sesión, el **servidor** decide el destino según el `role`
- un middleware protege la ruta del panel y rechaza a quien no sea admin
- conserva el detalle de interfaz: cuando el correo escrito corresponde a
  un admin, la hoja avisa antes de enviar y el botón cambia a
  "Entrar al panel de control"

## Cómo quiero que trabajes

1. Abre los siete archivos en el navegador y úsalos. Especialmente la
   app: crea una cuenta, contesta las 12 preguntas, entra a una lección,
   costea un platillo, abre la calculadora de delivery.
2. Dime qué encontraste y qué piensas hacer, antes de escribir código.
3. Implementa por tandas y repórtame cada una.
4. Al final: commit directo a `main` y súbelo para que Vercel publique.

Si algo del diseño te parece un error, **dímelo en lugar de corregirlo
solo**. Varias cosas que parecen raras están decididas a propósito.


---

## Cómo abrir los archivos (agregado)

Esta carpeta ya viene completa y se abre sola, sin servidor de build:

```
entrega-claude-code/
  LEEME-PRIMERO.md
  diseno/
    MiRestauranteListo.dc.html        <- la app
    LandingMiRestauranteListo.dc.html <- la landing
    AdminMiRestauranteListo.dc.html   <- el panel
    PlanDeApertura / CartaMenu / FichaTecnica / ResumenFinanciero .dc.html
    support.js            <- runtime, ya incluido
    _ds/organic-.../      <- styles.css y _ds_bundle.js, ya incluidos
    art/illustrations.js  <- las 90 ilustraciones
    tokens/styles.css     <- los tokens de color
    manifest.webmanifest, icon-192.png, icon-512.png, doc-page.js, image-slot.js
```

Levanta un servidor estático en `diseno/` (`python3 -m http.server`) y abre
`MiRestauranteListo.dc.html`. Los `.dc.html` son HTML normal: si preferís leer el
contenido sin ejecutarlo, los textos de `LESSONS`, `CATS`, `deliveryCalc()` y
`adDoctor()` están en texto plano dentro del bloque de logica de cada archivo.

## Respuestas a las tres confirmaciones

1. **Color de marca:** sí, cambialo a `#e07a2b` con `--on-accent: #33190a`. Es la marca nueva.
2. **Las 12 preguntas:** sí, reemplazá las actuales por las del diseño (incluyen experiencia, competencia, horario y socios).
3. **Panel de admin:** hacé la migración a campo `role` en la tabla de usuarios con middleware. Dejá el correo del dueño configurable por variable de entorno, no hardcodeado.
