/**
 * Una sola respuesta a "¿hay base de datos de verdad?".
 *
 * La comprobación estaba copiada en tres archivos y cada uno decidía solo qué
 * hacer sin ella: los tres caían a un almacén en memoria con un `console.warn`
 * y seguían como si nada. En producción eso es peor que un error — en
 * serverless cada arranque en frío empieza con la base vacía, así que las
 * cuentas y las licencias aparecen y desaparecen sin que nadie se entere.
 */

const PLACEHOLDER = 'user:password@localhost';

export function hasDatabase(): boolean {
  const url = process.env.DATABASE_URL;
  return !!url && !url.includes(PLACEHOLDER);
}

/** El despliegue de Vercel corre con `NODE_ENV=production`. */
const enProduccion = (): boolean => process.env.NODE_ENV === 'production';

export class SinBaseDeDatos extends Error {
  constructor(area: string) {
    super(
      `[${area}] DATABASE_URL no está configurada o apunta al ejemplo. ` +
        'En producción no se arranca con almacén en memoria: se perderían cuentas y licencias ' +
        'en cada arranque en frío. Captura DATABASE_URL en Vercel y vuelve a desplegar.',
    );
    this.name = 'SinBaseDeDatos';
  }
}

/**
 * Deja pasar sólo si hay base, o si esto es una máquina de desarrollo.
 *
 * En local sin Postgres se sigue pudiendo trabajar con el almacén en memoria,
 * que es para lo que se hizo. En producción revienta con el motivo escrito.
 */
export function permiteAlmacenEnMemoria(area: string): boolean {
  if (hasDatabase()) return false;
  if (enProduccion()) throw new SinBaseDeDatos(area);
  console.warn(`[${area}] Sin DATABASE_URL real: usando almacén en memoria. Sólo para desarrollo local.`);
  return true;
}
