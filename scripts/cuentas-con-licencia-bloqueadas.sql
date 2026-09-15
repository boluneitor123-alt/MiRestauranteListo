-- ─────────────────────────────────────────────────────────────────────────────
-- ¿A cuántas cuentas que pagaron les está diciendo la app «Tu prueba terminó»?
--
-- Sólo lee. No escribe nada. Córrela contra la base de producción:
--
--   psql "$DATABASE_URL" -f scripts/cuentas-con-licencia-bloqueadas.sql
--
-- Hay dos cosas distintas y conviene no mezclarlas:
--
--   1. El LETRERO. Salía de la fecha de la prueba sin mirar el nivel de
--      acceso, así que aparecía aunque la cuenta resolviera a 'licencia'.
--      Eso ya está corregido en el código.
--
--   2. El NIVEL. Hay cuentas con licencia 'activada' en la base que no
--      resuelven a 'licencia' cuando abren la app. Ésas siguen viendo el
--      letrero después del arreglo, y con razón según su nivel — el nivel es
--      el que está mal. Eso NO está corregido: toca `claim()` y el tope de
--      equipos, y eso no se cambia sin decidirlo.
--
-- Las consultas de abajo cuentan el grupo 2, que es el que queda.
-- ─────────────────────────────────────────────────────────────────────────────

\echo '== A. Licencias activas con el tope de equipos gastado =='
\echo '   Abrir en un equipo más (o borrar los datos del navegador una vez más)'
\echo '   las deja fuera: la activación automática ya no encuentra lugar.'

SELECT
  (SELECT "maxDevices" FROM admin_settings LIMIT 1) AS tope_configurado,
  COUNT(*)                                          AS licencias_en_el_tope,
  COUNT(DISTINCT l."userId")                        AS cuentas_afectadas
FROM licenses l
WHERE l.status = 'activada'
  AND (SELECT COUNT(*) FROM license_devices d WHERE d."licenseCode" = l.code)
      >= COALESCE((SELECT "maxDevices" FROM admin_settings LIMIT 1), 3);

\echo ''
\echo '== B. Licencias activas cuyo correo no empata con ninguna cuenta =='
\echo '   Pagó con un correo y se registró con otro. Entran por la red de'
\echo '   seguridad sólo mientras la licencia siga sin dueño registrado.'

SELECT COUNT(*) AS licencias_sin_dueno
FROM licenses l
WHERE l.status = 'activada'
  AND l."userId" IS NULL
  AND NOT EXISTS (SELECT 1 FROM users u WHERE lower(u.email) = lower(l.email));

\echo ''
\echo '== C. Cuánta gente tiene además la prueba vencida =='
\echo '   Son las que de verdad leen «Tu prueba terminó»: sin prueba vencida el'
\echo '   letrero dice otra cosa. Combinada con A, es la cuenta que pediste.'

SELECT COUNT(DISTINCT l."userId") AS cuentas_que_pagaron_y_leen_el_aviso
FROM licenses l
JOIN license_devices ld ON ld."licenseCode" = l.code
JOIN trials t           ON t."deviceId"     = ld."deviceId"
WHERE l.status = 'activada'
  AND t."startedAt" < now() - make_interval(days => COALESCE((SELECT "trialDays" FROM admin_settings LIMIT 1), 7))
  AND (SELECT COUNT(*) FROM license_devices d WHERE d."licenseCode" = l.code)
      >= COALESCE((SELECT "maxDevices" FROM admin_settings LIMIT 1), 3);

\echo ''
\echo '== D. El detalle, para escribirles uno por uno =='

SELECT
  l.code,
  l.email,
  l."userId" IS NOT NULL                                              AS tiene_dueno,
  (SELECT COUNT(*) FROM license_devices d WHERE d."licenseCode" = l.code) AS equipos,
  l."activatedAt"::date                                               AS activada_el
FROM licenses l
WHERE l.status = 'activada'
  AND (SELECT COUNT(*) FROM license_devices d WHERE d."licenseCode" = l.code)
      >= COALESCE((SELECT "maxDevices" FROM admin_settings LIMIT 1), 3)
ORDER BY l."activatedAt" DESC;

\echo ''
\echo '== E. Control: cuántas licencias activas hay en total =='
\echo '   Para leer los números de arriba como proporción y no en el aire.'

SELECT
  COUNT(*)                                                     AS licencias_activas,
  COUNT(*) FILTER (WHERE l."userId" IS NOT NULL)               AS con_dueno_registrado,
  COUNT(*) FILTER (WHERE l.status = 'nueva')                   AS pagadas_sin_activar
FROM licenses l
WHERE l.status IN ('activada', 'nueva');
