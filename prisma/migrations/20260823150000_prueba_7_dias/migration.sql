-- Cura los ajustes que quedaron con los números viejos.
--
-- La prueba es de 7 días y la garantía de 14. Una fila de ajustes guardada
-- antes de esa decisión pudo quedarse con 3 y con 7, y como los ajustes mandan
-- sobre el código, la app terminaba diciendo "Te quedan 3 días de prueba".
-- Sólo se tocan las filas que todavía traen el valor viejo: si el dueño puso
-- otro número a propósito desde el panel, se respeta.

UPDATE "admin_settings" SET "trialDays" = 7 WHERE "trialDays" = 3;
UPDATE "admin_settings" SET "warrantyDays" = 14 WHERE "warrantyDays" = 7;
