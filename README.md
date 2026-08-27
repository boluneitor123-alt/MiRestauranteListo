# MiRestauranteListo

Producto de pago único (MXN $2,450) para quien quiere abrir un negocio de comida
en México: en qué etapa estás, qué te falta, cuánto invertir, cuánto cobrar por
platillo y cuánto vender para no perder dinero.

Tres superficies y dos documentos imprimibles, descritos en
[`docs/design-handoff/HANDOFF.md`](docs/design-handoff/HANDOFF.md):

| Superficie | Ruta | Plataforma |
| --- | --- | --- |
| App del emprendedor | `/app` | PWA mobile-first |
| Panel del dueño | `/admin` | Desktop 1440×900 |
| Landing de venta | `/` | Mobile-first |
| Ficha técnica de costeo | `/print/ficha-tecnica` | Impresión |
| Resumen financiero | `/print/resumen-financiero` | Impresión |

## Stack

Next.js (App Router) + TypeScript + Tailwind, Prisma sobre Postgres, Vitest para
el dominio de cálculo. **No hay service worker**: el producto exige conexión para
validar el pago (decisión de producto, README del handoff § 1.12).

## Estructura

```
src/domain/     Dominio de cálculo puro (README del handoff § 4) + pruebas
src/content/    Contenido de seed: 10 módulos / 43 tareas, 12 preguntas, FAQ, giros
src/app/        Rutas de Next.js
docs/design-handoff/   Referencias visuales .dc.html y el handoff original
```

Los `.dc.html` de `docs/design-handoff/` son **referencia visual**: su runtime de
prototipado no se porta.

## Comandos

```bash
npm run dev        # servidor de desarrollo
npm test           # pruebas del dominio de cálculo
npm run typecheck  # tsc --noEmit
npm run build      # build de producción
```

## Variables de entorno

`DATABASE_URL`, `APP_URL`, `OWNER_EMAIL`, `ADMIN_TOKEN`, `STRIPE_SECRET_KEY`,
`STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`,
`META_PIXEL_ID`, `META_CAPI_TOKEN`.

Ninguna llave vive en el código: todas se leen de variables de entorno. El
archivo `.env` está en `.gitignore` y nunca se sube; `.env.example` sólo lleva
los nombres, con los valores vacíos. Ver [`DESPLIEGUE.md`](DESPLIEGUE.md).

### La URL del webhook de Stripe

Va en el dominio **canónico** —el que responde sin redirigir— y con la ruta
exacta `/api/webhooks/stripe`. Stripe no sigue redirecciones: si el dominio
manda del apex al `www`, la entrega falla con `308 ERR`, el cobro entra y la
licencia nunca se emite. No se ve desde la aplicación, porque el redirect pasa
en el borde antes de que corra nuestro código.

Para comprobar cuál es la canónica, abre la URL en el navegador: la correcta
responde un JSON con `"ok": true` y no cambia la dirección.
