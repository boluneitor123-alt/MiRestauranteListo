-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "LicenseStatus" AS ENUM ('nueva', 'activada', 'revocada', 'reembolsada');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deviceId" TEXT,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devices" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "userId" TEXT,
    "platform" TEXT,
    "kind" TEXT,
    "browser" TEXT,
    "installed" BOOLEAN NOT NULL DEFAULT false,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Mi negocio',
    "giro" TEXT NOT NULL DEFAULT 'Otro',
    "budgetCap" INTEGER NOT NULL DEFAULT 250000,
    "targetDate" TEXT,
    "headcount" TEXT,
    "answers" JSONB NOT NULL DEFAULT '{}',
    "settings" JSONB NOT NULL DEFAULT '{}',
    "ticket" INTEGER NOT NULL DEFAULT 120,
    "margin" INTEGER NOT NULL DEFAULT 68,
    "ownerGoal" INTEGER NOT NULL DEFAULT 25000,
    "hours" INTEGER NOT NULL DEFAULT 8,
    "closedOneDay" BOOLEAN NOT NULL DEFAULT false,
    "fcTarget" INTEGER NOT NULL DEFAULT 30,
    "layout" TEXT NOT NULL DEFAULT 'p2',
    "trialStartedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "completed_tasks" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "taskKey" TEXT NOT NULL,
    "doneAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "completed_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skipped_modules" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "skippedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "skipped_modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "extra_tasks" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "hint" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "extra_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dishes" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "portions" INTEGER NOT NULL DEFAULT 1,
    "extrasPct" DOUBLE PRECISION NOT NULL DEFAULT 3,
    "packaging" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "labor" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "priceIncludesTax" BOOLEAN NOT NULL DEFAULT true,
    "deliveryCommission" DOUBLE PRECISION NOT NULL DEFAULT 28,
    "section" TEXT NOT NULL DEFAULT 'Fuertes',
    "popularity" TEXT NOT NULL DEFAULT 'media',
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dishes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subrecipes" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "yieldQty" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "unit" TEXT NOT NULL DEFAULT 'ml',
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subrecipes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ingredients" (
    "id" TEXT NOT NULL,
    "dishId" TEXT,
    "subrecipeId" TEXT,
    "name" TEXT NOT NULL,
    "qty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL DEFAULT 'g',
    "buyPrice" DOUBLE PRECISION,
    "buyQty" DOUBLE PRECISION,
    "buyUnit" TEXT,
    "unitPrice" DOUBLE PRECISION,
    "waste" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "position" INTEGER NOT NULL DEFAULT 0,
    "sourceSubrecipeId" TEXT,

    CONSTRAINT "ingredients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_items" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "custom" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "budget_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subconcepts" (
    "id" TEXT NOT NULL,
    "budgetItemId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "subconcepts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fixed_items" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "custom" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "fixed_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notes" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "item" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "terms" TEXT NOT NULL,
    "delivery" TEXT NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "licenses" (
    "code" TEXT NOT NULL,
    "status" "LicenseStatus" NOT NULL DEFAULT 'nueva',
    "email" TEXT NOT NULL,
    "name" TEXT,
    "source" TEXT NOT NULL DEFAULT 'checkout',
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "userId" TEXT,
    "paymentRef" TEXT,
    "originDeviceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activatedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "refundedAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "licenses_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "license_devices" (
    "id" TEXT NOT NULL,
    "licenseCode" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "activatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "license_devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trials" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiredAt" TIMESTAMP(3),
    "converted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "trials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "price" DOUBLE PRECISION NOT NULL DEFAULT 2450,
    "trialDays" INTEGER NOT NULL DEFAULT 7,
    "maxDevices" INTEGER NOT NULL DEFAULT 3,
    "referralDiscountPct" INTEGER NOT NULL DEFAULT 20,
    "warrantyDays" INTEGER NOT NULL DEFAULT 14,
    "autoActivation" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_events" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "code" TEXT,
    "meta" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "devices_deviceId_key" ON "devices"("deviceId");

-- CreateIndex
CREATE UNIQUE INDEX "projects_userId_key" ON "projects"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "completed_tasks_projectId_taskKey_key" ON "completed_tasks"("projectId", "taskKey");

-- CreateIndex
CREATE UNIQUE INDEX "skipped_modules_projectId_moduleId_key" ON "skipped_modules"("projectId", "moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "budget_items_projectId_key_key" ON "budget_items"("projectId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "fixed_items_projectId_key_key" ON "fixed_items"("projectId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "licenses_paymentRef_key" ON "licenses"("paymentRef");

-- CreateIndex
CREATE INDEX "licenses_email_idx" ON "licenses"("email");

-- CreateIndex
CREATE INDEX "licenses_status_idx" ON "licenses"("status");

-- CreateIndex
CREATE UNIQUE INDEX "license_devices_licenseCode_deviceId_key" ON "license_devices"("licenseCode", "deviceId");

-- CreateIndex
CREATE UNIQUE INDEX "trials_deviceId_key" ON "trials"("deviceId");

-- CreateIndex
CREATE INDEX "admin_events_createdAt_idx" ON "admin_events"("createdAt");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "completed_tasks" ADD CONSTRAINT "completed_tasks_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skipped_modules" ADD CONSTRAINT "skipped_modules_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extra_tasks" ADD CONSTRAINT "extra_tasks_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dishes" ADD CONSTRAINT "dishes_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subrecipes" ADD CONSTRAINT "subrecipes_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_dishId_fkey" FOREIGN KEY ("dishId") REFERENCES "dishes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_subrecipeId_fkey" FOREIGN KEY ("subrecipeId") REFERENCES "subrecipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_sourceSubrecipeId_fkey" FOREIGN KEY ("sourceSubrecipeId") REFERENCES "subrecipes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_items" ADD CONSTRAINT "budget_items_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subconcepts" ADD CONSTRAINT "subconcepts_budgetItemId_fkey" FOREIGN KEY ("budgetItemId") REFERENCES "budget_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fixed_items" ADD CONSTRAINT "fixed_items_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "licenses" ADD CONSTRAINT "licenses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "license_devices" ADD CONSTRAINT "license_devices_licenseCode_fkey" FOREIGN KEY ("licenseCode") REFERENCES "licenses"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "license_devices" ADD CONSTRAINT "license_devices_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "devices"("deviceId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trials" ADD CONSTRAINT "trials_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "devices"("deviceId") ON DELETE CASCADE ON UPDATE CASCADE;

