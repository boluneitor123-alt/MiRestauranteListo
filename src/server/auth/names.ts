/**
 * Nombres de cookie, sin dependencias.
 *
 * Vive aparte de `service.ts` porque el middleware corre en el Edge y ahí no
 * se puede importar `node:crypto`, que sí usa el servicio de cuentas.
 */

export const SESSION_COOKIE = 'mrl_session';
