# LÉEME PRIMERO — Entrega v2 · MiRestauranteListo

Esta carpeta es la **fuente de verdad visual**. El código de `entrega-v2/app/`
manda sobre cualquier instrucción escrita cuando haya conflicto.

## Qué hay en la carpeta

```
entrega-v2/
  LEEME-PRIMERO.md
  app/
    MiRestauranteListo.dc.html     la app
    LandingMRL v2.dc.html          la landing
    CuentaMRL.dc.html              crear cuenta / iniciar sesión / recuperar
    PagoMRL.dc.html                el checkout
    AdminMiRestauranteListo.dc.html
    PlanDeApertura / CartaMenu / FichaTecnica / ResumenFinanciero .dc.html
    support.js                     runtime, ya incluido
    _ds/organic-.../               styles.css y _ds_bundle.js — NO LO BORRES:
                                   7 de los 9 archivos lo cargan y sin él la app
                                   se abre sin tipografía ni estilos de botón
    art/                           las 64 ilustraciones de las lecciones
    assets/                        Arnold (4 poses), el video demo, fotos
    manifest.webmanifest, icon-192.png, icon-512.png, doc-page.js, image-slot.js
```

## Reglas para Claude Code

1. **Lee y ejecuta los archivos antes de escribir código.** Levanta un servidor
   estático dentro de `entrega-v2/app/` (`python3 -m http.server`) y abre
   `MiRestauranteListo.dc.html`. Son HTML normal, sin build.
2. **No "arregles" lo que te parezca un error.** Si algo se ve raro, avísame y
   espera respuesta. Varias decisiones son deliberadas.
3. **No cambies el backend que ya funciona:** Stripe, base de datos, usuarios,
   sesiones, rutas, permisos. Esto es un rediseño visual + de flujo.
4. **Los textos, números y fórmulas del prototipo son los correctos.** No los
   redondees, no los "mejores", no inventes cifras nuevas.

## Qué cambió en esta sesión

### 1. Sistema de color nuevo (afecta TODAS las pantallas)

Se abandonó el índigo. La paleta es crema + carbón + naranja MRL:

```
--color-bg:        #FBF8F3   fondo general
--color-surface:   #FFFFFF   tarjetas
--color-text:      #1A1815   texto principal
--color-text-2:    #7C746A   texto secundario
--color-border:    #EDE7DD   bordes
--color-accent:    #F5A623   naranja de marca (500)
--on-accent:       #1A1815   texto sobre naranja
--color-accent-2:  #22A65B   verde de éxito
--color-warn:      #F5A623   advertencia
--color-danger:    #D93A2B   error
```

Las rampas 100–900 completas están en el `:root` de `MiRestauranteListo.dc.html`.
Cópialas tal cual.

**Pasteles de categoría** (clasifican, nunca compiten con el naranja):

```
números    #FDF0CE / #8A5206      menú       #FBE0DD / #A33F30
permisos   #DCEAF7 / #2F5E8C      marketing  #E4F0DA / #4A6B2E
operación  #EBE2F7 / #5B4291      recursos   #FBF3E0 / #8A6A2A
```

Reglas visuales: tarjetas **con borde de 1px**, no con sombra. Botones de
radio 14px, no píldora. El color vive en círculos de icono pequeños, no en
bloques grandes de fondo.

### 2. Pantallas rediseñadas de raíz

- **Inicio** — encabezado MRL + campana + avatar; saludo con selector de
  restaurante; tarjeta "Tu siguiente paso" con Arnold, minutos y etapa;
  "Tareas de tu ruta" (4 tareas con círculo de estado, icono pastel e
  insignia); "Resultados clave" (4 tarjetas, la primera en carbón).
- **Mi Ruta** — los 10 módulos agrupados en **3 etapas**: Define (concepto,
  local), Construye (equipamiento, proveedores, menú, costeo, permisos),
  Abre (personal, marketing, apertura). Debajo, los 4 mini cursos en 2×2.
  `ETAPAS` está a nivel de módulo: es la única fuente de verdad de la
  agrupación, no la dupliques.
- **Costeador** — capturas arriba, rótulo "Lo que resulta", indicadores en
  cuadrícula 2×2. Cada platillo genera su hoja de reporte.
- **Números** — índice de 3 módulos financieros + resumen para imprimir.
- **Más** — bloque de Herramientas al inicio con las 5 herramientas juntas.

### 3. Flujo de autenticación (cambio de arquitectura)

La pantalla de acceso **interna** de la app fue eliminada. Ahora:

```
LandingMRL v2  →  CuentaMRL  →  MiRestauranteListo (onboarding)  →  app
```

Tres claves de almacenamiento, **separadas a propósito**:

- `mrl.session` = `'1'` → hay sesión abierta. Es **lo único** que borra
  "Cerrar sesión".
- `mrl.state.v2` → el proyecto del usuario. **Nunca** se borra al salir.
- `obDone` (dentro del estado) → el onboarding terminó.

Arranque automático: con sesión y onboarding hecho → app; con sesión sin
onboarding → onboarding; sin sesión pero con onboarding hecho → CuentaMRL.

**Esto es importante:** antes una sola clave hacía las tres cosas, y cerrar
sesión destruía el proyecto. No lo vuelvas a unificar.

### 4. Páginas nuevas

- `LandingMRL v2.dc.html` — landing completa con Arnold (4 poses), calculadora
  viva, video demo (`assets/demo-mrl.mp4`), temario, precio y FAQ.
- `CuentaMRL.dc.html` — crear cuenta / iniciar sesión / recuperar contraseña.
- `PagoMRL.dc.html` — checkout propio con Stripe adentro.

### 5. Lo que sigue simulado y te toca conectar

- **Autenticación real** en `CuentaMRL.dc.html`. El método `entrar()` abre la
  sesión y navega; sustitúyelo por el backend real. Los botones de Google y
  Apple necesitan OAuth de verdad — dime qué credenciales configurar.
- **El cobro** en `PagoMRL.dc.html`. Los campos de tarjeta son de mentira, solo
  para el diseño. Cámbialos por Stripe Elements; los datos de tarjeta **nunca**
  deben tocar tu servidor.

## Reglas que no se deben romper

- **Ningún número escrito a mano en un texto** si el dato existe en el código.
  Ya hubo tres casos ("43 tareas", "Cinco documentos", "los 90 pasos"): usa
  `DOCS.length`, `allTasks.length`, etc.
- **90 pasos** es la promesa del producto: 43 tareas de ruta + 47 lecciones de
  mini cursos. No cambies el conteo.
- **Ninguna cifra de prueba social inventada.** Nada de "más de 150
  emprendedores", testimonios ni estrellas hasta tener clientes reales.
- El naranja `#F5A623` es color de marca. El ámbar de advertencia usa el mismo
  valor pero solo en contexto de alerta.

## Pendientes de contenido (no son código)

- Las 26 ilustraciones de los cursos Delivery y Contratar (`illo()` devuelve
  `null`, está bien así).
- Los textos `[EDITAR]` de advertencias.
- Los videos del curso de Meta Ads.
- Testimonios reales para la landing.

## Configuración externa que sigue pendiente

En Stripe, el producto todavía dice **"TuNegocioListo"** y **"43 pasos"**.
Corrígelo a MiRestauranteListo y 90 pasos.
