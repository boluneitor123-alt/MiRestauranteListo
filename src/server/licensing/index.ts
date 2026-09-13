/**
 * Punto de entrada del servicio de licencias.
 *
 * Con `DATABASE_URL` apuntando a una base real usa Prisma. Sin ella, en una
 * máquina de desarrollo cae a un almacén en memoria; en producción **falla**,
 * con el motivo escrito. Antes también caía a memoria en producción, callando:
 * cada arranque en frío empezaba con cero licencias y el precio salía de las
 * constantes del código en vez del panel.
 */

import { LicenseService } from './service';
import { MemoryLicenseStore } from './memoryStore';
import type { LicenseStore } from './store';
import { ResendMailer } from '../email';
import { permiteAlmacenEnMemoria } from '../db';

const globalForLicensing = globalThis as unknown as {
  mrlLicenseStore?: LicenseStore;
  mrlLicenseService?: LicenseService;
};

export async function getLicenseStore(): Promise<LicenseStore> {
  if (globalForLicensing.mrlLicenseStore) return globalForLicensing.mrlLicenseStore;

  // Revienta aquí si falta la base en producción, antes de servir nada.
  const enMemoria = permiteAlmacenEnMemoria('licencias');

  let store: LicenseStore;
  if (enMemoria) {
    store = new MemoryLicenseStore();
  } else {
    // Import diferido: sin base de datos no hace falta cargar el cliente.
    const { PrismaLicenseStore } = await import('./prismaStore');
    store = new PrismaLicenseStore();
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
