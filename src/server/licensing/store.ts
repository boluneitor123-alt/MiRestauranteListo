/**
 * Contrato de persistencia de licencias, demos y bitácora.
 *
 * El servicio de licencias trabaja contra esta interfaz, no contra Prisma: así
 * las reglas se prueban sin base de datos y el almacenamiento se puede cambiar
 * sin tocar las reglas.
 */

import type { License, LicenseStatus } from '@/domain/license';

export interface AdminSettings {
  price: number;
  trialDays: number;
  maxDevices: number;
  referralDiscountPct: number;
  warrantyDays: number;
  autoActivation: boolean;
}

export interface TrialRecord {
  deviceId: string;
  startedAt: number;
  expiredAt?: number;
  converted: boolean;
}

export type AdminEventKind =
  | 'pago-recibido'
  | 'licencia-emitida'
  | 'licencia-activada'
  | 'licencia-revocada'
  | 'licencia-reactivada'
  | 'licencia-reembolsada'
  | 'equipos-liberados'
  | 'codigo-reenviado'
  | 'ajustes-actualizados';

export interface AdminEvent {
  id: string;
  kind: AdminEventKind;
  message: string;
  code?: string;
  meta?: Record<string, unknown>;
  createdAt: number;
}

export interface NewLicense {
  code: string;
  email: string;
  name?: string;
  source: string;
  amount: number;
  paymentRef?: string;
  createdAt: number;
}

export interface LicenseFilter {
  query?: string;
  status?: LicenseStatus | 'todas';
  limit?: number;
}

export interface LicenseStore {
  getSettings(): Promise<AdminSettings>;
  updateSettings(patch: Partial<AdminSettings>): Promise<AdminSettings>;

  findLicense(code: string): Promise<License | undefined>;
  findLicenseByPaymentRef(ref: string): Promise<License | undefined>;
  findLicenseByDevice(deviceId: string): Promise<License | undefined>;
  /** Licencia pagada, sin equipos y sin revocar: la que reclama la activación automática. */
  findClaimableLicense(email?: string): Promise<License | undefined>;
  listLicenses(filter?: LicenseFilter): Promise<License[]>;
  createLicense(data: NewLicense): Promise<License>;
  saveLicense(license: License): Promise<License>;
  deleteAllLicenses(): Promise<void>;

  getTrial(deviceId: string): Promise<TrialRecord | undefined>;
  startTrial(deviceId: string, startedAt: number): Promise<TrialRecord>;
  saveTrial(trial: TrialRecord): Promise<TrialRecord>;
  listTrials(): Promise<TrialRecord[]>;

  appendEvent(event: Omit<AdminEvent, 'id' | 'createdAt'> & { createdAt?: number }): Promise<AdminEvent>;
  listEvents(limit?: number): Promise<AdminEvent[]>;
  deleteAllEvents(): Promise<void>;
}
