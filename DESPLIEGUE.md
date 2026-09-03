# Cómo poner MiRestauranteListo en línea

Guía en orden. Cada paso dice qué haces tú y qué hace solo el sistema.

---

## 1 · Base de datos

La migración ya está escrita en `prisma/migrations/` y probada contra Postgres 16.
Sólo hay que aplicarla a tu base de Neon. Desde tu computadora, en la carpeta del
proyecto:

```bash
npm install
DATABASE_URL="tu-cadena-de-neon" npx prisma migrate deploy
```

Eso crea las 21 tablas de una sola vez. Es seguro repetirlo: si ya están creadas,
no hace nada.

**No hace falta que lo corras si vas a desplegar en Vercel**: el comando de build
(`npm run build`) ya aplica las migraciones solo en cada despliegue.

Para revisar que quedó:

```bash
DATABASE_URL="tu-cadena-de-neon" npx prisma studio
```

---

## 2 · Stripe

En el panel de Stripe (modo **Live**, no Test):

1. **Developers → Webhooks → Add endpoint.**
2. URL: `https://TU-DOMINIO/api/webhooks/stripe` — y tiene que ser el dominio
   **canónico**, el que responde sin redirigir. Si tu dominio manda del apex al
   `www` (o al revés), registra el de destino. **Stripe no sigue
   redirecciones:** la entrega muere con `308 ERR`, el cobro entra y la licencia
   nunca se emite. Para comprobarlo, abre esa misma URL en el navegador: si ves
   un JSON con `"ok": true`, es la buena; si el navegador cambia la dirección,
   no lo es.
3. Eventos a escuchar: `payment_intent.succeeded` y `charge.refunded`. Son los
   dos únicos que el servidor atiende; cualquier otro se ignora.
4. Copia el **Signing secret** que te da (empieza con `whsec_`): ese es
   `STRIPE_WEBHOOK_SECRET`.
5. **Developers → API keys**: copia la llave pública (`pk_live_…`) a
   `STRIPE_PUBLISHABLE_KEY` y la secreta (`sk_live_…`) a `STRIPE_SECRET_KEY`.

No necesitas crear productos ni precios en Stripe: el monto se arma en cada cobro
con el precio que tengas guardado en el panel del dueño (`/admin` → Ajustes), y
los 3 meses sin intereses se ofrecen solos a las tarjetas mexicanas que califican.

**Importante:** sin `STRIPE_WEBHOOK_SECRET` no se emite ninguna licencia. Es a
propósito: nadie puede fabricarse un acceso llamando al webhook.

---

## 3 · Vercel

1. Conecta el repositorio en Vercel (framework: Next.js; todo lo demás por
   defecto).
2. Captura las variables de entorno de la tabla de abajo en
   **Settings → Environment Variables**, para *Production* y *Preview*.
3. Despliega. El build corre `prisma migrate deploy && next build`, así que la
   base queda migrada sola.
4. Cuando tengas el dominio final, actualiza `APP_URL` y la URL del webhook de
   Stripe.

### Variables de entorno que debes capturar en Vercel

| Variable | Para qué sirve | ¿Obligatoria? |
| --- | --- | --- |
| `DATABASE_URL` | Tu base de Neon. | Sí |
| `APP_URL` | URL pública del sitio (`https://…`). Stripe regresa aquí. | Sí |
| `OWNER_EMAIL` | Tu correo. La cuenta con ese correo entra al panel. | Sí |
| `ADMIN_TOKEN` | Respaldo para operar la API sin sesión. Invéntalo largo. | Sí |
| `STRIPE_SECRET_KEY` | Llave secreta de Stripe (`sk_live_…`). | Sí, para cobrar |
| `STRIPE_WEBHOOK_SECRET` | Firma del webhook (`whsec_…`). | Sí, para cobrar |
| `RESEND_API_KEY` | Correos de compra y de acceso. Sin ella, no se manda correo pero todo lo demás funciona. | No |
| `FB_CAPI_ACCESS_TOKEN` | Token de la API de Conversiones de Meta. Sin él no se manda la compra a Meta; el cobro y el acceso funcionan igual. | No |
| `FB_CAPI_TEST_CODE` | Sólo para probar: manda los eventos a la pestaña «Probar eventos» de Meta en vez de a los datos reales. **Quítala antes de abrir al público.** | No |

**Sobre la medición de Meta.** Aquí va sólo el token, que es secreto. El id del
píxel no: viaja en cada carga de la página, así que queda escrito en el código
y no hay que capturarlo. Si algún día quieres cambiarlo sin tocar el código,
`NEXT_PUBLIC_FB_PIXEL_ID` lo sustituye — el prefijo `NEXT_PUBLIC_` es
obligatorio para que llegue al navegador.

El token **nunca** lleva ese prefijo. Si lo llevara, quedaría dentro del código
que descarga cualquiera y con él se pueden mandar eventos falsos a tu píxel.

> Antes aquí decían `META_PIXEL_ID` y `META_CAPI_TOKEN`. Nunca las leyó ningún
> código y además el id sin `NEXT_PUBLIC_` no habría llegado al navegador. Si
> las tienes capturadas en Vercel, bórralas: no hacen nada.

**Cómo se entra al panel.** Captura tu correo en `OWNER_EMAIL` y entra a la app
con ese mismo correo. Al iniciar sesión, el servidor compara tu correo contra
la variable, guarda el permiso en tu cuenta y te lleva a `/admin` en vez de al
tablero. No hay una lista de correos dentro del código del navegador: quién es
administrador se guarda en la base de datos y sólo lo lee el servidor.

El permiso se revisa **en cada entrada**, no sólo al crear la cuenta. Así que
si tu cuenta ya existía desde antes de capturar la variable, no hay que hacer
nada especial: entras otra vez y el permiso queda. Si cambias `OWNER_EMAIL` a
otro correo, el anterior pierde el panel la próxima vez que entre.

Con `OWNER_EMAIL` **sin capturar**, nadie gana ni pierde el permiso: se queda
como estaba. Es a propósito — un despliegue al que se le olvidó la variable no
debe dejarte fuera de tu propio panel, porque no hay pantalla para devolverte
el acceso.

`ADMIN_TOKEN` lo inventas tú. Para generarlo:

```bash
openssl rand -base64 32
```

La llave **pública** de Stripe (`pk_live_…`) sí se necesita, en
`STRIPE_PUBLISHABLE_KEY`: es la que monta el formulario de tarjeta dentro de
`/pago`. Es pública por diseño y se puede leer en el navegador; la secreta no.

Los campos de tarjeta son el Payment Element de Stripe y viven dentro de un
iframe suyo, así que **ningún número de tarjeta pasa por este sitio ni por su
servidor**. Lo que sí cambia respecto de un Checkout hospedado es el papeleo de
cumplimiento: al servir tú la página que contiene el formulario, el
cuestionario PCI que te toca es el SAQ A-EP en vez del SAQ A.

---

## 4 · Prueba de que quedó bien

1. Entra a `https://TU-DOMINIO/app`, crea una cuenta y contesta el diagnóstico.
2. Cierra sesión y vuelve a entrar: debe llevarte directo a tu tablero con tu
   avance. Si eso pasa, la base está bien conectada.
3. Entra con el correo de `OWNER_EMAIL`: debe llevarte a
   `https://TU-DOMINIO/admin`. Revisa Ajustes. Si tu cuenta ya existía, basta
   con volver a iniciar sesión.
4. Haz una compra real de prueba desde el paywall de la app. Al volver, la app
   debe desbloquearse sola, sin que escribas ningún código. En `/admin` →
   Licencias debe aparecer el código con estado "Activada".
5. Reembolsa esa compra desde Stripe: en el siguiente arranque, esa cuenta vuelve
   a prueba.

---

## Seguridad

- Rota cualquier llave que hayas pegado en un chat, correo o mensaje. En Stripe:
  **Developers → API keys → Roll key**. En Neon: **Settings → Reset password**.
- Quién entra al panel se decide en el servidor, con el campo `role` de la
  cuenta. El navegador nunca lo decide, y editar cualquier cosa en el cliente no
  abre el panel.
- `ADMIN_TOKEN` es el respaldo para operar la API sin sesión. Sin esa variable y
  sin una cuenta administradora, ninguna operación de administración funciona.
- La validación del pago siempre ocurre en el servidor. El navegador nunca decide
  si alguien tiene licencia.
