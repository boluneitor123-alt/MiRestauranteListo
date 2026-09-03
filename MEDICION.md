# Encargo: medición de Meta Pixel + API de Conversiones

> **Revisión 2.** Corregidas tres rutas de archivo que no existían en el
> proyecto, el punto donde termina el diagnóstico, los nombres de las variables
> de entorno y el conteo de eventos que escucha el webhook. Todo lo de esta
> revisión está comprobado contra el código, no supuesto.

## Contexto

- Sitio: `www.mirestaurantelisto.com`, app de **Next.js** (App Router, código en `src/`)
- Píxel de Meta: **`1291572841589508`** (nombre "MiRestauranteListo Web")
- Cobro: **Stripe Elements** en una pantalla de pago propia, con **PaymentIntents**. No hay Stripe Checkout hospedado.
- Webhook que escuchamos: **`payment_intent.succeeded`** (y `charge.refunded`, ver §5)
- Producto: acceso de por vida, precio actual **$2,450 MXN**, pago único
- Objetivo: medir el embudo completo y mandar la compra por servidor con atribución correcta a las campañas de Meta

---

## Rutas reales del proyecto

La revisión 1 nombraba tres archivos que no existen. Estas son las buenas:

| Para qué | Ruta real |
|---|---|
| Webhook de Stripe | `src/app/api/webhooks/stripe/route.ts` → **`/api/webhooks/stripe`** |
| Crear el PaymentIntent | `src/app/api/pago/intent/route.ts` → **`POST /api/pago/intent`** |
| Fin del diagnóstico | `src/components/app/App.tsx:315-317` (la rama, en la 316) |

**Ojo con el webhook.** Existe una segunda ruta parecida, `src/app/api/webhooks/payment/route.ts`, que **no es la buena**: es un endpoint genérico viejo pensado para "Stripe o Mercado Pago" y valida con un HMAC propio, comparando `sha256=<hex>` contra el cuerpo. La cabecera real de Stripe llega como `t=…,v1=…`, así que esa ruta **rechazaría con 401 cualquier entrega auténtica de Stripe**. La que recibe de verdad es `/api/webhooks/stripe`, y se reconoce porque usa `getStripe().webhooks.constructEvent()`, la verificación propia de Stripe. Es también la que está registrada en el panel de Stripe.

---

## Variables de entorno

```
NEXT_PUBLIC_FB_PIXEL_ID=1291572841589508     # queda escrito en el código
FB_CAPI_ACCESS_TOKEN=<se configura en Vercel>
```

`FB_CAPI_ACCESS_TOKEN` **no lleva** el prefijo `NEXT_PUBLIC_`. Si lo lleva, el token queda expuesto en el bundle del navegador y cualquiera puede mandar eventos falsos al píxel. Solo se usa en código de servidor.

**El pixel ID va escrito en el código,** con la variable de entorno como anulación opcional. No es un secreto —viaja en cada carga de la página— y dejarlo con valor por omisión evita que el píxel se apague por una variable que se olvidó de poner:

```ts
// src/content/medicion.ts
export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID || '1291572841589508';
```

**El token no.** Ese sí es un secreto y va en Vercel, marcado en Production. Sin él, la API de Conversiones queda apagada y el sitio sigue funcionando igual: los eventos de navegador se mandan y `Purchase` no. El código tiene que aguantar su ausencia sin romper el cobro — un pago no puede fallar porque Meta no contestó.

### Lo que hay que quitar de `DESPLIEGUE.md`

El proyecto ya documenta `META_PIXEL_ID` y `META_CAPI_TOKEN`. **Ningún código las lee**, y no son estas: `META_PIXEL_ID` sin el prefijo `NEXT_PUBLIC_` nunca llegaría al navegador. Se retiran para que nadie las configure creyendo que sirven.

---

## Los seis eventos

| # | Paso del embudo | Evento | Tipo | Se manda desde | Cuándo dispara |
|---|---|---|---|---|---|
| 1 | Llega a la landing | `PageView` | Estándar | Navegador | Al cargar **y en cada cambio de ruta** |
| 2 | Empieza a crear cuenta | `RegistroIniciado` | Personalizado | Navegador | Al abrir el formulario de registro |
| 3 | Termina el registro | `CompleteRegistration` | Estándar | Navegador **+ servidor** | En el callback de éxito de la creación de cuenta |
| 4 | Termina el diagnóstico | `DiagnosticoCompletado` | Personalizado | Navegador | En `App.tsx:316`, **una sola vez por cuenta** |
| 5 | Llega al pago | `InitiateCheckout` | Estándar | Navegador | **Al montar la pantalla de pago propia** |
| 6 | Compra | `Purchase` | Estándar | **Solo servidor** | En el webhook `payment_intent.succeeded` |

Los nombres de eventos estándar respetan mayúsculas exactamente como aparecen. Los personalizados (`RegistroIniciado`, `DiagnosticoCompletado`) son libres, pero una vez que empiezan a acumular datos no se pueden renombrar sin romper el historial.

---

## 1. Código base del píxel

Va en `src/app/layout.tsx` con `next/script` y `strategy="afterInteractive"`. No usar `dangerouslySetInnerHTML` suelto.

```tsx
import Script from 'next/script';
import { FB_PIXEL_ID } from '@/content/medicion';

<Script id="fb-pixel" strategy="afterInteractive">{`
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window,document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '${FB_PIXEL_ID}');
  fbq('track', 'PageView');
`}</Script>
```

Más el `<noscript>` con el pixel de imagen correspondiente.

**Peso en datos móviles.** `fbevents.js` son unos 70 KB. El producto se vende a gente que abre la landing con datos en la calle, y el peso de la landing es algo que ya se cuidó una vez. `afterInteractive` lo deja fuera de la ruta crítica, pero vale medirlo después de instalarlo y no darlo por gratis.

---

## 2. PageView en cambios de ruta

El código base dispara `PageView` una sola vez al cargar. Next.js navega sin recargar, así que sin esto todo el tráfico se ve como una sola vista y se pierde el embudo.

```tsx
'use client';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export function PixelPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  useEffect(() => {
    window.fbq?.('track', 'PageView');
  }, [pathname, searchParams]);
  return null;
}
```

Montarlo en el layout **envuelto en `<Suspense>`**: `useSearchParams` fuerza renderizado dinámico y sin el Suspense se rompe el build estático.

---

## 3. Eventos de navegador simples

```ts
// Al abrir el formulario de registro
fbq('trackCustom', 'RegistroIniciado');

// Al montar la pantalla de pago propia
fbq('track', 'InitiateCheckout', {
  value: 2450.00,
  currency: 'MXN',
  content_name: 'MiRestauranteListo · Acceso de por vida',
  content_ids: ['mrl-lifetime'],
  content_type: 'product',
});
```

Los personalizados usan `trackCustom`, los estándar usan `track`.

**Cuidado con React StrictMode:** en desarrollo los `useEffect` se ejecutan dos veces, así que `InitiateCheckout` se va a disparar doble en local. Es normal y no afecta producción, pero no lo confundas con un bug de deduplicación. Si molesta, guárdalo con un `useRef`.

`InitiateCheckout` sí puede dispararse varias veces por usuario si recarga la pantalla de pago. Es el comportamiento esperado para este evento y no hay que evitarlo.

---

## 3b. DiagnosticoCompletado: el punto exacto y la bandera

El diagnóstico **no es una página propia**: corre dentro de la app, en la pantalla `'onboarding'`. Son 12 preguntas de verdad — `ONBOARDING_QUESTIONS` en `src/content/onboarding.ts` tiene 12: `giro, etapa, nombre, localq, presupuesto, menuq, costeo, ventas, permisos, personal, cuando, miedo`.

Cada respuesta se guarda al tocar la opción, en el `onAnswer` del componente. Pero el momento en que el diagnóstico **termina** es otro: el botón que confirma la última pregunta. Está en **`src/components/app/App.tsx:317`**:

```tsx
// src/components/app/App.tsx:315-317, el <Onboarding>
onNext={() => {
  if (obStep === ONBOARDING_QUESTIONS.length - 1) setScreen('result');  // ← 316
  else setObStep((n) => n + 1);
}}
```

Esa rama —la que va a `'result'`, en la línea **316**— es el único lugar que ocurre exactamente una vez al terminar, y se apoya en `ONBOARDING_QUESTIONS.length`, no en un 12 escrito a mano. Si mañana son 14 preguntas, el evento sigue disparando en la última sin tocar nada.

**Hay dos `onNext` en `App.tsx`.** El del diagnóstico está en la línea 315; el otro, en la 733, es el del tour de bienvenida. Son parecidos de leer y el segundo también guarda una bandera (`tourDone`). Colgar el evento del equivocado mediría el tour, no el diagnóstico.

### La bandera: una sola vez por cuenta

El diagnóstico **se puede rehacer**. Hay un `onRestartDiagnosis` en `App.tsx:622` que devuelve a alguien al paso 0. Sin bandera, quien lo rehaga tres veces manda tres eventos y la tasa de conversión se infla sola.

La bandera vive en `settings` del proyecto, junto a `tourDone`, que ya resuelve exactamente este problema para el tour. Es el lugar correcto porque `settings` es una columna del proyecto y el proyecto es de la cuenta: la marca viaja con la persona entre el celular y la laptop, y sobrevive a borrar el navegador. Una bandera en `localStorage` no serviría — la misma persona en dos aparatos contaría dos veces.

```tsx
onNext={() => {
  if (obStep === ONBOARDING_QUESTIONS.length - 1) {
    if (!state.settings.diagnosticoMedido) {
      window.fbq?.('trackCustom', 'DiagnosticoCompletado');
      patch({ settings: { ...state.settings, diagnosticoMedido: true } });
    }
    setScreen('result');
  } else setObStep((n) => n + 1);
}}
```

**Trampa al agregar el campo.** `settings` se lee con un analizador que sólo deja pasar los campos que conoce (`src/domain/projectState.ts:503`). Un campo nuevo que no se agregue ahí **se descarta al cargar**, y la bandera se perdería en cada recarga: el evento volvería a dispararse y el problema seguiría, pero escondido. Hay que tocarlo en tres lugares:

1. La interfaz `AppSettings` (`projectState.ts:80`)
2. `DEFAULT_SETTINGS` (`projectState.ts:207`), con `diagnosticoMedido: false`
3. El analizador (`projectState.ts:503`), con `asBoolean(settings.diagnosticoMedido, false)`

Vale una prueba que verifique que la bandera sobrevive a un ida y vuelta por el analizador. Es el tipo de defecto que no falla nada y sólo se nota en los números de Meta, semanas después.

---

## 4. Captura de datos de atribución antes del pago

**Este es el punto que más se rompe.** El webhook lo llaman los servidores de Stripe, no el navegador: ahí no hay cookies, ni IP del cliente, ni user agent. Sin las cookies `_fbp` y `_fbc`, el evento `Purchase` llega a Meta pero **no se atribuye a la campaña** — se verían ventas en Stripe y cero en Meta.

La solución es capturar esos datos en el cliente, mandarlos al endpoint que crea el PaymentIntent, y guardarlos en su `metadata`. Lo que se guarde ahí regresa intacto en el webhook, sin tocar la base de datos.

### En el cliente, antes de crear el PaymentIntent

La llamada real es a **`POST /api/pago/intent`**, desde `src/components/pago/Pago.tsx:96`. Hoy manda `deviceId`; hay que agregarle estos tres campos.

```ts
function getCookie(name: string) {
  return document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop();
}

// _fbc puede no existir todavía aunque el usuario venga de un anuncio.
// Si la URL trae ?fbclid=XYZ, se construye a mano.
function resolveFbc() {
  const cookie = getCookie('_fbc');
  if (cookie) return cookie;
  const fbclid = new URLSearchParams(window.location.search).get('fbclid');
  return fbclid ? `fb.1.${Date.now()}.${fbclid}` : undefined;
}

await fetch('/api/pago/intent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    deviceId,                      // ya lo manda hoy, no quitarlo
    fbp: getCookie('_fbp'),
    fbc: resolveFbc(),
    event_source_url: window.location.href,
  }),
});
```

> Nota: el `fbclid` puede llegar en la landing y perderse al navegar. Conviene persistirlo en `sessionStorage` en la primera carga y leerlo de ahí en el checkout.

### En el servidor, al crear el PaymentIntent

El intent se arma en `src/server/payments/stripe.ts`, en `createPaymentIntent()`. **Ya tiene `metadata` con `deviceId`, `producto` y `userId`** — hay que sumar los campos nuevos, no reemplazar el objeto:

```ts
metadata: {
  deviceId: input.deviceId,
  producto: productName(),
  ...(input.userId ? { userId: input.userId } : {}),
  // nuevos
  fbp:              input.fbp ?? '',
  fbc:              input.fbc ?? '',
  client_ip:        input.clientIp ?? '',
  client_ua:        (input.clientUa ?? '').slice(0, 500),
  event_source_url: input.eventSourceUrl ?? '',
},
```

**No cambiar el nombre de `userId` ni el de `deviceId`.** El webhook los lee tal cual (`src/server/payments/stripe.ts:144-145`) y de ellos dependen la emisión de la licencia y la activación automática. Renombrarlos rompe el cobro, no la medición.

**El monto no se toca.** El precio sale de los ajustes del panel y el navegador no manda montos: sólo confirma el cobro que quedó fijado en el servidor. Eso se queda igual.

**No metas el correo ni el nombre en `metadata`.** Guarda solo `userId` y busca los datos personales en tu propia base dentro del webhook. Así no se replica información personal en Stripe.

Límites de Stripe: 50 llaves y 500 caracteres por valor. El user agent puede acercarse — de ahí el `.slice(0, 500)`.

---

## 5. Purchase desde el webhook

`src/app/api/webhooks/stripe/route.ts`. Ya tiene `export const runtime = 'nodejs'` y `dynamic = 'force-dynamic'`.

**Verificación de firma: ya está resuelta.** La ruta lee el cuerpo crudo con `await request.text()` antes de cualquier cosa y verifica con `constructEvent`. No hay que cambiar nada ahí — sólo no romperlo. Si alguien mete un `await request.json()` antes, la verificación falla siempre.

### El webhook escucha dos eventos, y así se queda

`interpretEvent()` (`src/server/payments/stripe.ts:133`) atiende:

- **`payment_intent.succeeded`** → emite la licencia. **Aquí y sólo aquí va `Purchase`.**
- **`charge.refunded`** (y `refund.created`) → marca el reembolso de la licencia.

Los dos hacen falta y no se estorban: la rama de reembolso sale antes de llegar a la emisión, así que nunca dispara `Purchase`. Quien venga después a "limpiar" el webhook dejando un solo evento **rompe los reembolsos**. La regla real no es "un solo evento de Stripe", es **"un solo evento de Stripe que dispare `Purchase`"**.

### Orden de operaciones

1. Verificar la firma del webhook *(ya lo hace)*
2. Confirmar que `event.type === 'payment_intent.succeeded'`; la rama de reembolso sigue su camino y no manda nada a Meta
3. **Revisar la tabla de idempotencia** por `event.id` de Stripe. Si ya está, responder 200 y salir sin mandar nada
4. Insertar `event.id` en la tabla
5. Leer `paymentIntent.metadata` y buscar al usuario por `userId`
6. Armar y mandar el evento a Meta
7. Responder 200

**El paso 6 no puede tumbar el paso 7.** Si Meta contesta con error o se tarda, la licencia ya se emitió y el webhook tiene que responder 200 de todas formas; si no, Stripe reintenta y se vuelve a emitir. Envolver la llamada a Meta en su propio `try/catch` y dejar rastro en el registro del panel.

### Payload

```
POST https://graph.facebook.com/v21.0/1291572841589508/events
     ?access_token=${process.env.FB_CAPI_ACCESS_TOKEN}
```

```jsonc
{
  "data": [{
    "event_name":       "Purchase",
    "event_time":       1756900000,           // paymentIntent.created (unix segundos)
    "event_id":         "pi_3Qa1b2C3d4E5f6",  // paymentIntent.id — clave de deduplicación
    "action_source":    "website",
    "event_source_url": "https://www.mirestaurantelisto.com/pago",

    "user_data": {
      // HASHEADOS con SHA-256 hex, sobre el texto en minúsculas y recortado
      "em":          ["<sha256 del correo>"],
      "ph":          ["<sha256 del teléfono en E.164 sin el +>"],
      "fn":          ["<sha256 del nombre>"],
      "ln":          ["<sha256 del apellido>"],
      "external_id": ["<sha256 del userId>"],

      // SIN hashear — si se hashean, Meta no puede emparejar
      "fbp":               "fb.1.1756890000.1234567890",
      "fbc":               "fb.1.1756890000.IwAR0abc...",
      "client_ip_address": "189.203.11.42",
      "client_user_agent": "Mozilla/5.0 (iPhone; ..."
    },

    "custom_data": {
      "value":        2450.00,
      "currency":     "MXN",
      "order_id":     "pi_3Qa1b2C3d4E5f6",
      "content_name": "MiRestauranteListo · Acceso de por vida",
      "content_type": "product",
      "content_ids":  ["mrl-lifetime"]
    }
  }]
}
```

### Tres detalles que cambian el resultado

**El valor sale de Stripe, no del código.** Usa `paymentIntent.amount / 100`, nunca un `2450` escrito a mano. El día que se aplique un cupón o cambie el precio, Meta y el banco dirían cosas distintas. El proyecto ya hace esto en `interpretEvent()`: `(intent.amount_received || intent.amount) / 100`.

**La moneda hay que pasarla a mayúsculas.** Stripe devuelve `"mxn"` y Meta espera `"MXN"`: `paymentIntent.currency.toUpperCase()`. Además tiene que coincidir con la moneda de la cuenta publicitaria o el ROAS no significa nada.

**Hasheo:** SHA-256 en hexadecimal, sobre el valor en minúsculas y con `.trim()`. El correo `" Ana@Correo.com "` se hashea como `ana@correo.com`. Omitir por completo los campos que no se tengan, en lugar de mandarlos vacíos.

---

## 6. Deduplicación

### Purchase

1. **`event_id` = `paymentIntent.id`.** Es único por pago y estable entre reintentos. Meta descarta eventos repetidos con el mismo `event_name` + `event_id` dentro de una ventana de 48 horas. **No generar un UUID nuevo en cada llamada** — eso es exactamente lo que rompe la deduplicación.

2. **Tabla de idempotencia propia, indexada por el `event.id` de Stripe.** Stripe garantiza entrega *al menos una vez*, no exactamente una vez. El mismo webhook puede llegar dos veces, y si el reintento cae después de 48 horas la ventana de Meta ya no cubre. Esta tabla no es opcional.

   Ojo: la emisión de la licencia ya es idempotente por su lado —`issue()` busca por `paymentRef` antes de crear— pero eso protege la licencia, no el evento de Meta. Son dos cosas distintas y hacen falta las dos.

3. **Un solo evento de Stripe que dispare `Purchase`:** `payment_intent.succeeded`. El webhook escucha además `charge.refunded` para los reembolsos, y esa rama no manda nada a Meta. No agregar `charge.succeeded`.

4. **Nunca disparar `Purchase` en el navegador.** Tampoco en el callback de éxito de `stripe.confirmPayment()`, ni en la pantalla de gracias — es recargable y cada recarga sería otra compra.

### CompleteRegistration

Este sí va por los dos lados, con un `event_id` compartido idéntico:

```ts
const eventId = crypto.randomUUID();

fbq('track', 'CompleteRegistration', {}, { eventID: eventId });

await fetch('/api/capi/registration', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ eventId }),
});
```

El endpoint manda el mismo evento a la API de Conversiones con `event_id: eventId`, más el `user_data` del usuario recién creado y las cookies `_fbp`/`_fbc` leídas del request. `action_source: "website"`.

El registro pasa por `src/app/api/auth/register/route.ts`, y su respuesta ya trae el `user`. El evento va después de que la respuesta llegue bien, nunca antes.

---

## 7. Cómo verificar antes de dar por terminado

- **Meta Pixel Helper** en Chrome: los cinco eventos de navegador aparecen, cada uno una sola vez (fuera de StrictMode en desarrollo).
- **Pestaña "Probar eventos"** del Administrador de eventos: usar el `test_event_code` que da Meta durante el desarrollo para que las pruebas no ensucien los datos reales. **Quitarlo antes de producción.**
- **Recorrido completo real:** registro → diagnóstico → pantalla de pago → compra. En el Administrador de eventos debe aparecer exactamente **una** compra, con valor `2450` y moneda `MXN`.
- **La bandera del diagnóstico:** terminarlo, rehacerlo desde la app y comprobar que `DiagnosticoCompletado` aparece **una sola vez**. Después recargar y volver a rehacerlo, para descartar que la bandera se esté perdiendo en el analizador de `settings`.
- **Prueba de doble entrega — la que de verdad importa:** reenviar el mismo `payment_intent.succeeded` desde el panel de Stripe. Si en Meta sigue apareciendo una sola compra, la idempotencia funciona.
- **Que el cobro no dependa de Meta:** con `FB_CAPI_ACCESS_TOKEN` vacío, una compra completa tiene que seguir emitiendo la licencia y desbloqueando el acceso. Si el pago se rompe sin token, la medición está metida donde no debe.
- **El reembolso sigue vivo:** reembolsar un cobro de prueba y comprobar que la licencia queda marcada. Es lo que se rompe si alguien "limpia" el webhook a un solo evento.
- **Calidad de coincidencia de eventos:** revisar esa puntuación en el píxel unos días después. Por debajo de 5 significa que faltan datos de usuario y la atribución va a ser pobre.
