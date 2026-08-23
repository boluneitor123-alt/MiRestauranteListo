-- Capacidad del negocio, para la revisión de realidad de Números.
-- Los tres son lo que el dueño mide en su prueba de cocina y en su acomodo
-- de mesas; los valores por defecto son los del prototipo.
ALTER TABLE "projects" ADD COLUMN "ordersPerHour" INTEGER NOT NULL DEFAULT 20;
ALTER TABLE "projects" ADD COLUMN "peakHours" INTEGER NOT NULL DEFAULT 3;
ALTER TABLE "projects" ADD COLUMN "seats" INTEGER NOT NULL DEFAULT 20;
