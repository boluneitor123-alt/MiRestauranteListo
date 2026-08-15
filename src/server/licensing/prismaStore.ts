/**
 * Almacén de licencias sobre Prisma/Postgres.
 */

import { PrismaClient, type License as DbLicense, type Prisma } from '@prisma/client';
import type { License } from '@/domain/license';
import { LICENSE_DEFAULTS } from '@/domain/license';
import type {
  AdminEvent,
  AdminEventKind,
  AdminSettings,
  LicenseFilter,
  LicenseStore,
  NewLicense,
  TrialRecord,
} from './store';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export function getPrisma(): PrismaClient {
  const client = globalForPrisma.prisma ?? new PrismaClient();
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = client;
  return client;
}

type DbLicenseWithDevices = DbLicense & { devices: Array<{ deviceId: string }> };

function toDomain(row: DbLicenseWithDevices): License {
  return {
    code: row.code,
    status: row.status,
    devices: row.devices.map((d) => d.deviceId),
    email: row.email,
    name: row.name ?? undefined,
    source: row.source,
    amount: row.amount,
    paymentRef: row.paymentRef ?? undefined,
    refundedAmount: row.refundedAmount,
    createdAt: row.createdAt.getTime(),
    activatedAt: row.activatedAt?.getTime(),
    revokedAt: row.revokedAt?.getTime(),
    refundedAt: row.refundedAt?.getTime(),
  };
}

export class PrismaLicenseStore implements LicenseStore {
  constructor(private db: PrismaClient = getPrisma()) {}

  async getSettings(): Promise<AdminSettings> {
    const row = await this.db.adminSetting.upsert({
      where: { id: 'default' },
      update: {},
      create: {
        id: 'default',
        price: LICENSE_DEFAULTS.price,
        trialDays: LICENSE_DEFAULTS.trialDays,
        maxDevices: LICENSE_DEFAULTS.maxDevices,
        referralDiscountPct: LICENSE_DEFAULTS.referralDiscountPct,
        warrantyDays: LICENSE_DEFAULTS.warrantyDays,
        autoActivation: LICENSE_DEFAULTS.autoActivation,
      },
    });
    return {
      price: row.price,
      trialDays: row.trialDays,
      maxDevices: row.maxDevices,
      referralDiscountPct: row.referralDiscountPct,
      warrantyDays: row.warrantyDays,
      autoActivation: row.autoActivation,
    };
  }

  async updateSettings(patch: Partial<AdminSettings>): Promise<AdminSettings> {
    await this.getSettings();
    const row = await this.db.adminSetting.update({ where: { id: 'default' }, data: patch });
    return {
      price: row.price,
      trialDays: row.trialDays,
      maxDevices: row.maxDevices,
      referralDiscountPct: row.referralDiscountPct,
      warrantyDays: row.warrantyDays,
      autoActivation: row.autoActivation,
    };
  }

  async findLicense(code: string): Promise<License | undefined> {
    const row = await this.db.license.findUnique({ where: { code }, include: { devices: true } });
    return row ? toDomain(row) : undefined;
  }

  async findLicenseByPaymentRef(ref: string): Promise<License | undefined> {
    const row = await this.db.license.findUnique({ where: { paymentRef: ref }, include: { devices: true } });
    return row ? toDomain(row) : undefined;
  }

  async findLicenseByDevice(deviceId: string): Promise<License | undefined> {
    const row = await this.db.license.findFirst({
      where: { devices: { some: { deviceId } } },
      include: { devices: true },
    });
    return row ? toDomain(row) : undefined;
  }

  async findClaimableLicense(email?: string): Promise<License | undefined> {
    const row = await this.db.license.findFirst({
      where: { status: 'nueva', devices: { none: {} }, ...(email ? { email } : {}) },
      orderBy: { createdAt: 'desc' },
      include: { devices: true },
    });
    return row ? toDomain(row) : undefined;
  }

  async listLicenses(filter: LicenseFilter = {}): Promise<License[]> {
    const query = filter.query?.trim();
    const where: Prisma.LicenseWhereInput = {
      ...(filter.status && filter.status !== 'todas' ? { status: filter.status } : {}),
      ...(query
        ? {
            OR: [
              { code: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } },
              { name: { contains: query, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const rows = await this.db.license.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filter.limit,
      include: { devices: true },
    });
    return rows.map(toDomain);
  }

  async createLicense(data: NewLicense): Promise<License> {
    const row = await this.db.license.create({
      data: {
        code: data.code,
        email: data.email,
        name: data.name,
        source: data.source,
        amount: data.amount,
        paymentRef: data.paymentRef,
        createdAt: new Date(data.createdAt),
      },
      include: { devices: true },
    });
    return toDomain(row);
  }

  async saveLicense(license: License): Promise<License> {
    const row = await this.db.$transaction(async (tx) => {
      await tx.license.update({
        where: { code: license.code },
        data: {
          status: license.status,
          email: license.email,
          name: license.name,
          source: license.source,
          amount: license.amount,
          refundedAmount: license.refundedAmount ?? 0,
          activatedAt: license.activatedAt ? new Date(license.activatedAt) : null,
          revokedAt: license.revokedAt ? new Date(license.revokedAt) : null,
          refundedAt: license.refundedAt ? new Date(license.refundedAt) : null,
        },
      });

      // Los equipos son la lista completa: lo que no venga, se libera.
      await tx.licenseDevice.deleteMany({
        where: { licenseCode: license.code, deviceId: { notIn: license.devices } },
      });
      for (const deviceId of license.devices) {
        await tx.device.upsert({
          where: { deviceId },
          update: { lastSeenAt: new Date() },
          create: { deviceId },
        });
        await tx.licenseDevice.upsert({
          where: { licenseCode_deviceId: { licenseCode: license.code, deviceId } },
          update: {},
          create: { licenseCode: license.code, deviceId },
        });
      }

      return tx.license.findUniqueOrThrow({ where: { code: license.code }, include: { devices: true } });
    });
    return toDomain(row);
  }

  async deleteAllLicenses(): Promise<void> {
    await this.db.license.deleteMany({});
  }

  async getTrial(deviceId: string): Promise<TrialRecord | undefined> {
    const row = await this.db.trial.findUnique({ where: { deviceId } });
    if (!row) return undefined;
    return {
      deviceId: row.deviceId,
      startedAt: row.startedAt.getTime(),
      expiredAt: row.expiredAt?.getTime(),
      converted: row.converted,
    };
  }

  async startTrial(deviceId: string, startedAt: number): Promise<TrialRecord> {
    await this.db.device.upsert({
      where: { deviceId },
      update: { lastSeenAt: new Date(startedAt) },
      create: { deviceId },
    });
    const row = await this.db.trial.upsert({
      where: { deviceId },
      update: {},
      create: { deviceId, startedAt: new Date(startedAt) },
    });
    return {
      deviceId: row.deviceId,
      startedAt: row.startedAt.getTime(),
      expiredAt: row.expiredAt?.getTime(),
      converted: row.converted,
    };
  }

  async saveTrial(trial: TrialRecord): Promise<TrialRecord> {
    await this.db.trial.update({
      where: { deviceId: trial.deviceId },
      data: {
        expiredAt: trial.expiredAt ? new Date(trial.expiredAt) : null,
        converted: trial.converted,
      },
    });
    return trial;
  }

  async listTrials(): Promise<TrialRecord[]> {
    const rows = await this.db.trial.findMany();
    return rows.map((row) => ({
      deviceId: row.deviceId,
      startedAt: row.startedAt.getTime(),
      expiredAt: row.expiredAt?.getTime(),
      converted: row.converted,
    }));
  }

  async appendEvent(event: Omit<AdminEvent, 'id' | 'createdAt'> & { createdAt?: number }): Promise<AdminEvent> {
    const row = await this.db.adminEvent.create({
      data: {
        kind: event.kind,
        message: event.message,
        code: event.code,
        meta: (event.meta ?? {}) as Prisma.InputJsonValue,
        ...(event.createdAt ? { createdAt: new Date(event.createdAt) } : {}),
      },
    });
    return {
      id: row.id,
      kind: row.kind as AdminEventKind,
      message: row.message,
      code: row.code ?? undefined,
      meta: row.meta as Record<string, unknown>,
      createdAt: row.createdAt.getTime(),
    };
  }

  async listEvents(limit = 100): Promise<AdminEvent[]> {
    const rows = await this.db.adminEvent.findMany({ orderBy: { createdAt: 'desc' }, take: limit });
    return rows.map((row) => ({
      id: row.id,
      kind: row.kind as AdminEventKind,
      message: row.message,
      code: row.code ?? undefined,
      meta: row.meta as Record<string, unknown>,
      createdAt: row.createdAt.getTime(),
    }));
  }

  async deleteAllEvents(): Promise<void> {
    await this.db.adminEvent.deleteMany({});
  }
}
