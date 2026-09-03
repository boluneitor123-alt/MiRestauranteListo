-- Cuándo la persona fijó su presupuesto.
-- Se queda en NULL para los proyectos que ya existían: no hay registro de si
-- alguien tocó el campo o si sigue con los $250,000 de fábrica, y suponerlo
-- sería inventar. La columna se llena en cuanto alguien lo cambie.
ALTER TABLE "projects" ADD COLUMN "budgetCapSetAt" TIMESTAMP(3);
