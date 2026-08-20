-- Lo último capturado en la calculadora de delivery y en el analizador de
-- anuncios. Antes vivía en memoria y se perdía al salir de la pantalla.
ALTER TABLE "projects" ADD COLUMN "delivery" JSONB NOT NULL DEFAULT '{}';
ALTER TABLE "projects" ADD COLUMN "ads"      JSONB NOT NULL DEFAULT '{}';
