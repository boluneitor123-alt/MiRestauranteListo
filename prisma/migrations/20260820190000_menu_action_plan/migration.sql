-- Plan de acción de Mi Menú.
-- `star` marca el platillo que el dueño decidió destacar en la carta.
ALTER TABLE "dishes" ADD COLUMN "star" BOOLEAN NOT NULL DEFAULT false;

-- Sugerencias archivadas con "No, gracias": { "Subir precio|d1": true }.
ALTER TABLE "projects" ADD COLUMN "ignoredActions" JSONB NOT NULL DEFAULT '{}';
