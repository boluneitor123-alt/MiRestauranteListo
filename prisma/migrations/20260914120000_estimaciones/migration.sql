-- Marcas de "esto todavía es una estimación, no un dato que dio la persona".
-- Aditiva: los proyectos que ya existen quedan con la lista vacía, que es
-- justo lo correcto — a quien ya capturó sus números no se le estima nada.
ALTER TABLE "projects" ADD COLUMN "estimados" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "projects" ADD COLUMN "selloEstimado" TEXT;
