-- Eventos ya enviados a Meta, por el id del evento de Stripe.
-- Stripe entrega "al menos una vez": sin esta tabla, un reintento contaría la
-- misma compra dos veces en Meta.
CREATE TABLE "meta_events" (
    "id" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ok" BOOLEAN NOT NULL DEFAULT true,
    "detail" TEXT,

    CONSTRAINT "meta_events_pkey" PRIMARY KEY ("id")
);
