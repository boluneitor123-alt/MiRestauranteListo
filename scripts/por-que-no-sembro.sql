-- ¿Por qué no sembró la estimación? Una razón por cuenta.
--
-- `sembrarEstimacion` sólo tiene dos puertas, y las dos están en el dominio:
--
--   1. `traeDatosCapturados(state)` → si la persona YA capturó algo, no se
--      toca nada. Es true si hay platillos, sub-recetas, algún concepto de
--      presupuesto con monto, algún gasto fijo con monto, o si ya hubo una
--      siembra anterior (`selloEstimado`).
--   2. Las 12 respuestas del diagnóstico completas.
--
-- Nada más. Ni el nivel de acceso, ni la prueba vencida: se verificó
-- reproduciendo las tres formas de cuenta contra una base local.
--
-- Y sólo corre dentro de un `PUT /api/project`. Una cuenta que no ha vuelto a
-- guardar nada desde que se desplegó la siembra no ha tenido su oportunidad.
-- Por eso la última columna compara con la fecha en que corrió la migración,
-- que es el momento exacto en que el código nuevo quedó vivo.
--
--   psql "$DATABASE_URL" -f scripts/por-que-no-sembro.sql

\set QUIET on
SELECT finished_at AS despliegue_de_la_siembra
FROM _prisma_migrations
WHERE migration_name = '20260914120000_estimaciones';
\set QUIET off

WITH despliegue AS (
  SELECT coalesce(
    (SELECT finished_at FROM _prisma_migrations WHERE migration_name = '20260914120000_estimaciones'),
    'epoch'::timestamptz
  ) AS en
),
cuentas AS (
  SELECT
    u.email,
    p.id,
    p."createdAt",
    p."updatedAt",
    p."selloEstimado",
    (SELECT count(*) FROM jsonb_object_keys(p.answers::jsonb)) AS respuestas,
    (SELECT count(*) FROM dishes d WHERE d."projectId" = p.id) AS platillos,
    (SELECT count(*) FROM subrecipes s WHERE s."projectId" = p.id) AS subrecetas,
    (SELECT coalesce(sum(b.amount), 0) FROM budget_items b WHERE b."projectId" = p.id) AS presupuesto,
    (SELECT coalesce(sum(f.amount), 0) FROM fixed_items f WHERE f."projectId" = p.id) AS fijos
  FROM projects p
  JOIN users u ON u.id = p."userId"
  WHERE jsonb_typeof(p.answers::jsonb) = 'object'
)
SELECT
  c.email,
  c."createdAt"::date AS creada,
  c."updatedAt"::date AS ultimo_guardado,
  c.respuestas,
  c.platillos,
  c.subrecetas,
  c.presupuesto,
  c.fijos,
  CASE
    WHEN c."selloEstimado" IS NOT NULL             THEN 'sembrada'
    WHEN c.respuestas < 12                          THEN 'diagnostico incompleto'
    WHEN c.platillos > 0                            THEN 'ya tenia platillos'
    WHEN c.subrecetas > 0                           THEN 'ya tenia sub-recetas'
    WHEN c.presupuesto > 0                          THEN 'ya tenia presupuesto'
    WHEN c.fijos > 0                                THEN 'ya tenia gastos fijos'
    WHEN c."updatedAt" < d.en                       THEN 'no ha vuelto a guardar desde el despliegue'
    ELSE                                                 'SIN EXPLICACION — avisame'
  END AS por_que
FROM cuentas c, despliegue d
ORDER BY por_que, c."updatedAt" DESC;

-- Y el resumen, que es lo que quieres ver de un golpe.
WITH despliegue AS (
  SELECT coalesce(
    (SELECT finished_at FROM _prisma_migrations WHERE migration_name = '20260914120000_estimaciones'),
    'epoch'::timestamptz
  ) AS en
),
cuentas AS (
  SELECT
    p.id,
    p."updatedAt",
    p."selloEstimado",
    (SELECT count(*) FROM jsonb_object_keys(p.answers::jsonb)) AS respuestas,
    (SELECT count(*) FROM dishes d WHERE d."projectId" = p.id) AS platillos,
    (SELECT count(*) FROM subrecipes s WHERE s."projectId" = p.id) AS subrecetas,
    (SELECT coalesce(sum(b.amount), 0) FROM budget_items b WHERE b."projectId" = p.id) AS presupuesto,
    (SELECT coalesce(sum(f.amount), 0) FROM fixed_items f WHERE f."projectId" = p.id) AS fijos
  FROM projects p
  WHERE jsonb_typeof(p.answers::jsonb) = 'object'
)
SELECT
  CASE
    WHEN c."selloEstimado" IS NOT NULL THEN 'sembrada'
    WHEN c.respuestas < 12             THEN 'diagnostico incompleto'
    WHEN c.platillos > 0               THEN 'ya tenia platillos'
    WHEN c.subrecetas > 0              THEN 'ya tenia sub-recetas'
    WHEN c.presupuesto > 0             THEN 'ya tenia presupuesto'
    WHEN c.fijos > 0                   THEN 'ya tenia gastos fijos'
    WHEN c."updatedAt" < d.en          THEN 'no ha vuelto a guardar desde el despliegue'
    ELSE                                    'SIN EXPLICACION — avisame'
  END AS por_que,
  count(*) AS cuentas
FROM cuentas c, despliegue d
GROUP BY 1
ORDER BY 2 DESC;
