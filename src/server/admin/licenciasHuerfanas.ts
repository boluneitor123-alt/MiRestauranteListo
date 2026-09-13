/**
 * Licencias sin dueño registrado: las que la red de seguridad sigue abriendo
 * por equipo.
 *
 * Son las de alguien que pagó con un correo que nunca llegó a ser cuenta. El
 * acceso les sigue funcionando en el navegador donde se activaron, pero ese
 * navegador se lo presta a cualquiera que lo use después. Por eso el panel las
 * lista: no son un error, son una lista de pendientes.
 */

import type { License } from '@/domain/license';
import type { LicenseStore } from '@/server/licensing/store';

export interface LicenciaHuerfana {
  code: string;
  /** El correo con el que se pagó. No tiene cuenta: por eso está aquí. */
  email?: string;
  name?: string;
  status: License['status'];
  /** Equipos que la tienen activada. Vacío si nadie la ha usado todavía. */
  devices: string[];
  source?: string;
  amount?: number;
  createdAt: number;
  activatedAt?: number;
}

/** Sólo las que abren algo: una revocada o reembolsada ya no presta nada. */
const VIGENTE = (l: License): boolean => l.status === 'activada' || l.status === 'nueva';

export function esHuerfana(license: License, correosConCuenta: ReadonlySet<string>): boolean {
  if (!VIGENTE(license)) return false;
  if (license.userId) return false;
  const correo = license.email?.trim().toLowerCase();
  if (!correo) return true;
  return !correosConCuenta.has(correo);
}

export function aHuerfana(license: License): LicenciaHuerfana {
  return {
    code: license.code,
    ...(license.email ? { email: license.email } : {}),
    ...(license.name ? { name: license.name } : {}),
    status: license.status,
    devices: license.devices,
    ...(license.source ? { source: license.source } : {}),
    ...(typeof license.amount === 'number' ? { amount: license.amount } : {}),
    createdAt: license.createdAt,
    ...(license.activatedAt ? { activatedAt: license.activatedAt } : {}),
  };
}

/**
 * El recuento que contesta "¿a cuántas afecta esto?" sin tener que leer la
 * base a mano. Se calcula, no se teclea.
 */
export interface ResumenDeDuenos {
  total: number;
  conCuenta: number;
  soloCorreo: number;
  huerfanas: number;
}

export async function leerHuerfanas(
  store: LicenseStore,
): Promise<{ huerfanas: LicenciaHuerfana[]; resumen: ResumenDeDuenos }> {
  const todas = await store.listLicenses({});
  const correos = [...new Set(todas.map((l) => l.email?.trim().toLowerCase()).filter((c): c is string => !!c))];

  const conCuenta = new Set<string>();
  for (const correo of correos) {
    if (await store.findAccountByEmail(correo)) conCuenta.add(correo);
  }

  const vigentes = todas.filter(VIGENTE);
  const huerfanas = vigentes.filter((l) => esHuerfana(l, conCuenta));

  return {
    huerfanas: huerfanas.sort((a, b) => b.createdAt - a.createdAt).map(aHuerfana),
    resumen: {
      total: vigentes.length,
      conCuenta: vigentes.filter((l) => !!l.userId).length,
      soloCorreo: vigentes.filter(
        (l) => !l.userId && !!l.email && conCuenta.has(l.email.trim().toLowerCase()),
      ).length,
      huerfanas: huerfanas.length,
    },
  };
}
