/**
 * Almacén en memoria. Sirve para las pruebas del servicio de licencias y para
 * levantar la app sin base de datos durante el desarrollo.
 */

import { LICENSE_DEFAULTS, type License } from '@/domain/license';
import type {
  AdminEvent,
  AdminSettings,
  LicenseFilter,
  LicenseStore,
  NewLicense,
  TrialRecord,
} from './store';

const DEFAULT_SETTINGS: AdminSettings = {
  price: LICENSE_DEFAULTS.price,
  trialDays: LICENSE_DEFAULTS.trialDays,
  maxDevices: LICENSE_DEFAULTS.maxDevices,
  referralDiscountPct: LICENSE_DEFAULTS.referralDiscountPct,
  warrantyDays: LICENSE_DEFAULTS.warrantyDays,
  autoActivation: LICENSE_DEFAULTS.autoActivation,
};

export class MemoryLicenseStore implements LicenseStore {
  private settings: AdminSettings = { ...DEFAULT_SETTINGS };
  private licenses = new Map<string, License>();
  private trials = new Map<string, TrialRecord>();
  private events: AdminEvent[] = [];
  private sequence = 0;

  async getSettings(): Promise<AdminSettings> {
    return { ...this.settings };
  }

  async updateSettings(patch: Partial<AdminSettings>): Promise<AdminSettings> {
    this.settings = { ...this.settings, ...patch };
    return { ...this.settings };
  }

  async findLicense(code: string): Promise<License | undefined> {
    const found = this.licenses.get(code);
    return found ? { ...found, devices: [...found.devices] } : undefined;
  }

  async findLicenseByPaymentRef(ref: string): Promise<License | undefined> {
    return [...this.licenses.values()].find((l) => l.paymentRef === ref);
  }

  async findLicenseByDevice(deviceId: string): Promise<License | undefined> {
    return [...this.licenses.values()].find((l) => l.devices.includes(deviceId));
  }

  async findClaimableLicense(email?: string): Promise<License | undefined> {
    return [...this.licenses.values()]
      .filter((l) => l.status === 'nueva' && l.devices.length === 0)
      .filter((l) => (email ? l.email === email : true))
      // La más reciente: es la del pago que acaba de ocurrir.
      .sort((a, b) => b.createdAt - a.createdAt)[0];
  }

  async listLicenses(filter: LicenseFilter = {}): Promise<License[]> {
    const query = (filter.query || '').trim().toLowerCase();
    let list = [...this.licenses.values()].sort((a, b) => b.createdAt - a.createdAt);
    if (filter.status && filter.status !== 'todas') list = list.filter((l) => l.status === filter.status);
    if (query) {
      list = list.filter((l) =>
        [l.code, l.email ?? '', l.name ?? ''].some((field) => field.toLowerCase().includes(query)),
      );
    }
    return filter.limit ? list.slice(0, filter.limit) : list;
  }

  async createLicense(data: NewLicense): Promise<License> {
    const license: License = { ...data, status: 'nueva', devices: [] };
    this.licenses.set(license.code, license);
    return { ...license };
  }

  async saveLicense(license: License): Promise<License> {
    this.licenses.set(license.code, { ...license, devices: [...license.devices] });
    return { ...license };
  }

  async deleteAllLicenses(): Promise<void> {
    this.licenses.clear();
  }

  async getTrial(deviceId: string): Promise<TrialRecord | undefined> {
    const found = this.trials.get(deviceId);
    return found ? { ...found } : undefined;
  }

  async startTrial(deviceId: string, startedAt: number): Promise<TrialRecord> {
    const existing = this.trials.get(deviceId);
    if (existing) return { ...existing };
    const trial: TrialRecord = { deviceId, startedAt, converted: false };
    this.trials.set(deviceId, trial);
    return { ...trial };
  }

  async saveTrial(trial: TrialRecord): Promise<TrialRecord> {
    this.trials.set(trial.deviceId, { ...trial });
    return { ...trial };
  }

  async listTrials(): Promise<TrialRecord[]> {
    return [...this.trials.values()];
  }

  async appendEvent(event: Omit<AdminEvent, 'id' | 'createdAt'> & { createdAt?: number }): Promise<AdminEvent> {
    const stored: AdminEvent = {
      ...event,
      id: `ev${++this.sequence}`,
      createdAt: event.createdAt ?? Date.now(),
    };
    this.events.unshift(stored);
    return stored;
  }

  async listEvents(limit = 100): Promise<AdminEvent[]> {
    return this.events.slice(0, limit);
  }

  async deleteAllEvents(): Promise<void> {
    this.events = [];
  }
}
