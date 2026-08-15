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
2. URL: `https://TU-DOMINIO/api/webhooks/stripe`
3. Eventos a escuchar: `checkout.session.completed` y `charge.refunded`.
4. Copia el **Signing secret** que te da (empieza con `whsec_`): ese es
   `STRIPE_WEBHOOK_SECRET`.

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
| `ADMIN_TOKEN` | Contraseña para entrar a `/admin`. Invéntala larga. | Sí |
| `STRIPE_SECRET_KEY` | Llave secreta de Stripe (`sk_live_…`). | Sí, para cobrar |
| `STRIPE_WEBHOOK_SECRET` | Firma del webhook (`whsec_…`). | Sí, para cobrar |
| `RESEND_API_KEY` | Correos de compra y de acceso. Sin ella, no se manda correo pero todo lo demás funciona. | No |
| `META_PIXEL_ID` | Medición de la landing. | No |
| `META_CAPI_TOKEN` | API de Conversiones de Meta. | No |

`ADMIN_TOKEN` lo inventas tú. Para generarlo:

```bash
openssl rand -base64 32
```

La llave **pública** de Stripe (`pk_live_…`) no se necesita: el cobro se abre
desde el servidor con Stripe Checkout, así que ningún dato de tarjeta pasa por
este sitio.

---

## 4 · Prueba de que quedó bien

1. Entra a `https://TU-DOMINIO/app`, crea una cuenta y contesta el diagnóstico.
2. Cierra sesión y vuelve a entrar: debe llevarte directo a tu tablero con tu
   avance. Si eso pasa, la base está bien conectada.
3. Entra a `https://TU-DOMINIO/admin` con tu `ADMIN_TOKEN` y revisa Ajustes.
4. Haz una compra real de prueba desde el paywall de la app. Al volver, la app
   debe desbloquearse sola, sin que escribas ningún código. En `/admin` →
   Licencias debe aparecer el código con estado "Activada".
5. Reembolsa esa compra desde Stripe: en el siguiente arranque, esa cuenta vuelve
   a prueba.

---

## Seguridad

- Rota cualquier llave que hayas pegado en un chat, correo o mensaje. En Stripe:
  **Developers → API keys → Roll key**. En Neon: **Settings → Reset password**.
- El panel `/admin` sólo responde si `ADMIN_TOKEN` está configurado. Sin esa
  variable, ninguna operación de administración funciona (a propósito).
- La validación del pago siempre ocurre en el servidor. El navegador nunca decide
  si alguien tiene licencia.
