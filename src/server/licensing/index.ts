/**
 * Punto de entrada del servicio de licencias.
 *
 * Con `DATABASE_URL` apuntando a una base real usa Prisma; sin ella cae a un
 * almacén en memoria para poder desarrollar y demostrar la app sin Postgres.
 * El almacén en memoria se pierde al reiniciar: nunca es el de producción.
 */

import { LicenseService } from './service';
import { MemoryLicenseStore } from './memoryStore';
import type { LicenseStore } from './store';
import { ResendMailer } from '../email';

const globalForLicensing = globalThis as unknown as {
  mrlLicenseStore?: LicenseStore;
  mrlLicenseService?: LicenseService;
};

function hasDatabase(): boolean {
  const url = process.env.DATABASE_URL;
  return !!url && !url.includes('user:password@localhost');
}

export async function getLicenseStore(): Promise<LicenseStore> {
  if (globalForLicensing.mrlLicenseStore) return globalForLicensing.mrlLicenseStore;

  let store: LicenseStore;
  if (hasDatabase()) {
    // Import diferido: sin base de datos no hace falta cargar el cliente.
    const { PrismaLicenseStore } = await import('./prismaStore');
    store = new PrismaLicenseStore();
  } else {
    console.warn('[licencias] Sin DATABASE_URL real: usando almacén en memoria. No usar en producción.');
    store = new MemoryLicenseStore();
  }

  globalForLicensing.mrlLicenseStore = store;
  return store;
}

export async function getLicenseService(): Promise<LicenseService> {
  if (!globalForLicensing.mrlLicenseService) {
    globalForLicensing.mrlLicenseService = new LicenseService({
      store: await getLicenseStore(),
      mailer: new ResendMailer(),
    });
  }
  return globalForLicensing.mrlLicenseService;
}

export { LicenseService } from './service';
export { MemoryLicenseStore } from './memoryStore';
export type { LicenseStore } from './store';
