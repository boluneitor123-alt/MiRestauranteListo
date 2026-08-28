# MiRestauranteListo — cómo trabajamos

Guía permanente para Claude Code. Léela al inicio de cada sesión.

## Qué es esto

Producto digital mexicano que ayuda a alguien a abrir su negocio de comida.
Se vende por **un pago único** con **acceso de por vida**. No hay suscripción.

- Prueba: **7 días**, sin tarjeta
- Garantía de reembolso: **14 días** desde el pago
- Son dos cosas distintas. Nunca las mezcles.

## Quién lo va a usar

Una persona con poco dinero y mucho miedo, que quiere poner una taquería o un
puesto. Muchas veces desde el celular, con datos, en la calle.

- **El celular manda.** Prueba a 360×800 táctil, no achicando la ventana.
- Nada bajo 44px de alto tocable.
- Nada que se salga del ancho, salvo tiras que se deslizan a propósito.
- Español de México, claro y directo. Sin jerga técnica.

## Reglas que no se rompen

**Ningún número inventado.** Nada de "150 emprendedores", "4.8 estrellas",
contadores de lugares ni cuentas regresivas de escasez. Si el dato no sale del
código o de la base, no va.

**Ningún número escrito a mano.** Si el dato existe en el código, léelo de ahí.
Los conteos de lecciones, tareas, documentos y precios se calculan, no se
teclean. Ya nos mordió tres veces.

**El precio sale del panel de admin,** nunca del navegador ni de una constante
en el front.

**Los datos de tarjeta nunca tocan nuestro servidor.** Stripe Elements dentro
de nuestro diseño. Si algo obliga a cambiar eso, pregunta antes.

## Identidad visual

- Naranja de marca `#F5A623`. El azul fue una vuelta que abandonamos.
- Crema `#FBF8F3` de fondo, carbón `#1A1815` de texto.
- Pasteles para clasificar categorías. El naranja dirige la atención.
- Arnold es el personaje. No lo reinterpretes ni le cambies el estilo.
- Los archivos `.dc.html` de `entrega-v2/app/` son la referencia de diseño para
  **escritorio**: paleta, tipografía, estructura, jerarquía y textos.
- Para **teléfono** manda el bloque `LA ESCALA` de `src/app/landing.css`. Los
  prototipos no traen escala de móvil propia, y encogerlos es justo el defecto
  que se corrigió. Si un prototipo nuevo contradice la escala de teléfono, gana
  la escala; avísame y decido.

## Cómo decidir sin preguntarme

**Arregla sin preguntar** cuando sea claramente un defecto: algo que se sale de
la pantalla, se encima, no se puede tocar, o contradice un dato del código.

**Pregúntame** cuando implique una decisión de diseño, cambie lo que dice un
texto de cara al cliente, o toque el modelo de negocio.

**Avísame, no lo escondas,** si algo que te pedí parece un error. Prefiero que
me lo digas a que lo implementes mal por obedecer.

## Antes de dar por terminado

- Corre las pruebas y el build.
- Mide en 360, 390, 430 y 768px: nada fuera del ancho, nada bajo 44px.
- Si tocaste dinero, prueba el cobro de punta a punta.
- Dime en una línea qué quedó y qué no.

## Al abrir y al fusionar un PR

Tres veces seguidas la fusión se llevó el primer commit y dejó el segundo en la
rama (#6, #9, #10). El botón de GitHub dice "fusionado" aunque falte trabajo.

- Antes de decir "listo, fusiona": espera a que GitHub refresque la rama y
  confirma que el PR trae todos los commits que hiciste, no solo el primero.
- Después de cada fusión, verifica el árbol de `main` sin que te lo pidan. No
  la respuesta del merge: el árbol.
  `git fetch origin main`, `git merge-base --is-ancestor <sha> origin/main`,
  contar `git log origin/main..origin/<rama>`, y confirmar archivo por archivo
  con `git show origin/main:<archivo>`.
- Si quedó algo fuera, ábrelo en un PR nuevo y dilo. Un PR ya fusionado no se
  reusa.

## Lo que sigue pendiente

- Videos del mini curso de Meta Ads (los graba el dueño)
- Que un abogado revise Términos y Aviso de privacidad
- Rotar la llave `sk_live_` de Stripe antes de abrir al público
- Crear el webhook en modo Live con su propio `whsec_`
