-- ─────────────────────────────────────────────────────────────────────────────
-- Desatascar en bloque las licencias que se quedaron sin lugares.
--
--   psql "$DATABASE_URL" -f scripts/desatascar-licencias-en-el-tope.sql
--
--
-- ANTES DE CORRERLO: PROBABLEMENTE NO HAGA FALTA
--
-- Con el reciclaje ya desplegado, estas cuentas se desatascan solas: la
-- próxima vez que la persona abra la app, su equipo nuevo entra y sale el más
-- olvidado. No hay que tocar nada y nadie pierde acceso.
--
-- Esto sirve para dos cosas que el reciclaje no cubre:
--
--   · Limpiar de una vez el rastro que dejó el defecto, en vez de esperar a
--     que cada quien vuelva.
--   · Desatascar a alguien que llamó enojado y quieres arreglarlo ya, sin
--     esperar a que abra la app otra vez.
--
-- Qué hace: de cada licencia en el tope deja **el equipo que se usó más
-- recientemente** y suelta los demás. No borra licencias, no cambia estados,
-- no toca proyectos ni datos de nadie. Un equipo soltado se vuelve a
-- registrar solo la próxima vez que esa persona abra la app.
--
-- Corre primero el SELECT de arriba, mira el número, y sólo entonces
-- descomenta el DELETE. Está comentado a propósito.
-- ─────────────────────────────────────────────────────────────────────────────

\echo '== Qué se va a soltar (esto sólo mira, no cambia nada) =='

WITH tope AS (
  SELECT COALESCE((SELECT "maxDevices" FROM admin_settings LIMIT 1), 3) AS n
),
llenas AS (
  SELECT l.code
  FROM licenses l, tope
  WHERE l.status = 'activada'
    AND (SELECT COUNT(*) FROM license_devices d WHERE d."licenseCode" = l.code) >= tope.n
),
ordenados AS (
  SELECT
    ld."licenseCode",
    ld."deviceId",
    dv."lastSeenAt",
    ROW_NUMBER() OVER (
      PARTITION BY ld."licenseCode"
      -- El más recientemente usado primero: ése es el que se queda.
      ORDER BY dv."lastSeenAt" DESC NULLS LAST, ld."deviceId"
    ) AS puesto
  FROM license_devices ld
  JOIN llenas       ON llenas.code = ld."licenseCode"
  LEFT JOIN devices dv ON dv."deviceId" = ld."deviceId"
)
SELECT
  COUNT(DISTINCT "licenseCode") AS licencias_a_desatascar,
  COUNT(*)                      AS equipos_que_se_sueltan
FROM ordenados
WHERE puesto > 1;

\echo ''
\echo '== El detalle, licencia por licencia =='

WITH tope AS (
  SELECT COALESCE((SELECT "maxDevices" FROM admin_settings LIMIT 1), 3) AS n
),
llenas AS (
  SELECT l.code, l.email
  FROM licenses l, tope
  WHERE l.status = 'activada'
    AND (SELECT COUNT(*) FROM license_devices d WHERE d."licenseCode" = l.code) >= tope.n
)
SELECT
  llenas.code,
  llenas.email,
  COUNT(*)                                         AS equipos_hoy,
  MAX(dv."lastSeenAt")::date                       AS ultimo_uso,
  COUNT(*) - 1                                     AS se_sueltan
FROM llenas
JOIN license_devices ld ON ld."licenseCode" = llenas.code
LEFT JOIN devices dv    ON dv."deviceId"    = ld."deviceId"
GROUP BY llenas.code, llenas.email
ORDER BY MAX(dv."lastSeenAt") DESC NULLS LAST;

-- ─────────────────────────────────────────────────────────────────────────────
-- DESCOMENTA DE AQUÍ PARA ABAJO CUANDO YA VISTE LOS NÚMEROS DE ARRIBA.
--
-- Va dentro de una transacción: si algo sale mal, no queda a medias.
-- ─────────────────────────────────────────────────────────────────────────────

-- BEGIN;
--
-- WITH tope AS (
--   SELECT COALESCE((SELECT "maxDevices" FROM admin_settings LIMIT 1), 3) AS n
-- ),
-- llenas AS (
--   SELECT l.code
--   FROM licenses l, tope
--   WHERE l.status = 'activada'
--     AND (SELECT COUNT(*) FROM license_devices d WHERE d."licenseCode" = l.code) >= tope.n
-- ),
-- ordenados AS (
--   SELECT
--     ld.id,
--     ROW_NUMBER() OVER (
--       PARTITION BY ld."licenseCode"
--       ORDER BY dv."lastSeenAt" DESC NULLS LAST, ld."deviceId"
--     ) AS puesto
--   FROM license_devices ld
--   JOIN llenas       ON llenas.code = ld."licenseCode"
--   LEFT JOIN devices dv ON dv."deviceId" = ld."deviceId"
-- )
-- DELETE FROM license_devices
-- WHERE id IN (SELECT id FROM ordenados WHERE puesto > 1);
--
-- -- Revisa el número que imprime y, si cuadra con el SELECT de arriba:
-- COMMIT;
-- -- Si no cuadra:  ROLLBACK;
