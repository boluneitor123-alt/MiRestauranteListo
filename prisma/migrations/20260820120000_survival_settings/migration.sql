-- Parámetros de "Lo que este negocio te va a dar": las horas que trabaja el
-- dueño, los minutos del platillo promedio, la mezcla diaria y los tres
-- supuestos de la prueba de estrés.
ALTER TABLE "projects" ADD COLUMN "weeklyHours"    INTEGER NOT NULL DEFAULT 70;
ALTER TABLE "projects" ADD COLUMN "prepMinutes"    INTEGER NOT NULL DEFAULT 6;
ALTER TABLE "projects" ADD COLUMN "dailyMix"       INTEGER NOT NULL DEFAULT 100;
ALTER TABLE "projects" ADD COLUMN "stressSupplies" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "projects" ADD COLUMN "stressRent"     INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "projects" ADD COLUMN "stressSales"    INTEGER NOT NULL DEFAULT 0;
