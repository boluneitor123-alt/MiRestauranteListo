-- Última entrada a la cuenta.
-- Se queda en NULL para las cuentas que ya existían: no hay forma de saber
-- cuándo entraron por última vez y una fecha inventada sería peor que un hueco.
ALTER TABLE "users" ADD COLUMN "lastLoginAt" TIMESTAMP(3);
