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

`DATABASE_URL`, `STRIPE_SECRET_KEY` / `MP_ACCESS_TOKEN`, `STRIPE_WEBHOOK_SECRET`,
`RESEND_API_KEY`, `APP_URL`, `LICENSE_SIGNING_SECRET`, `META_PIXEL_ID`,
`META_CAPI_TOKEN`.
