-- ¿A cuántas cuentas les falta la siembra del diagnóstico?
--
-- Síntoma: Inicio abre diciendo «Captura tus gastos fijos y te digo cuántos
-- clientes necesitas al día» en vez de la cifra. Pasa cuando el `PUT
-- /api/project` que llevaba la respuesta número 12 nunca llegó al servidor
-- —red caída, pestaña cerrada a medio guardar, un 500—: la siembra la corre
-- esa petición, así que sin ella el proyecto se queda con los gastos fijos en
-- cero y `selloEstimado` vacío.
--
-- Se cura sola en cuanto un guardado suyo llegue completo: el endpoint vuelve
-- a intentar la siembra en cada PUT. Con abrir la app basta. Por eso lo que
-- este archivo hace es CONTAR, no tocar: no hay nada que arreglar a mano.
--
-- Cómo correrlo:
--   psql "$DATABASE_URL" -f scripts/cuentas-sin-estimacion-sembrada.sql

-- 1. Cuántas son, y de cuántas en total.
SELECT
  count(*) FILTER (
    WHERE p."selloEstimado" IS NULL
      AND jsonb_typeof(p.answers::jsonb) = 'object'
      AND (SELECT count(*) FROM jsonb_object_keys(p.answers::jsonb)) >= 12
  ) AS sin_sembrar,
  count(*) FILTER (
    WHERE jsonb_typeof(p.answers::jsonb) = 'object'
      AND (SELECT count(*) FROM jsonb_object_keys(p.answers::jsonb)) >= 12
  ) AS con_diagnostico_completo,
  count(*) AS proyectos
FROM projects p;

-- 2. Cuáles, por si quieres escribirles. Las que además no tienen ningún gasto
--    fijo capturado son las que de verdad están viendo el mensaje: quien ya
--    capturó los suyos ve su cifra aunque nunca hubiera siembra.
SELECT
  u.email,
  p."createdAt"::date AS creada,
  p."updatedAt"::date AS ultimo_uso,
  (SELECT count(*) FROM jsonb_object_keys(p.answers::jsonb)) AS respuestas,
  coalesce((SELECT sum(f.amount) FROM fixed_items f WHERE f."projectId" = p.id), 0) AS gastos_fijos,
  (SELECT count(*) FROM dishes d WHERE d."projectId" = p.id) AS platillos
FROM projects p
JOIN users u ON u.id = p."userId"
WHERE p."selloEstimado" IS NULL
  AND jsonb_typeof(p.answers::jsonb) = 'object'
  AND (SELECT count(*) FROM jsonb_object_keys(p.answers::jsonb)) >= 12
ORDER BY p."updatedAt" DESC;
