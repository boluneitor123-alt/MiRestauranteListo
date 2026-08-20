-- El acceso al panel deja de decidirse en el cliente y pasa a una columna.
-- 'owner' es el emprendedor que compró la app; 'admin' entra al panel.
CREATE TYPE "UserRole" AS ENUM ('owner', 'admin');

ALTER TABLE "users" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'owner';
