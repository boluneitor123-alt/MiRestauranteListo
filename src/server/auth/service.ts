/**
 * Registro, inicio de sesión y sesiones (paso 2 de la continuación del plan).
 *
 * La sesión vive en una fila de base de datos y viaja en una cookie httpOnly:
 * cerrar sesión la invalida de verdad, no sólo en ese navegador.
 */

import {
  hashPassword,
  isValidEmail,
  MIN_PASSWORD_LENGTH,
  newSessionToken,
  normalizeEmail,
  verifyPassword,
} from './passwords';
import type { AuthStore, AuthUser, UserRole } from './store';

export { SESSION_COOKIE } from './names';
export const SESSION_DAYS = 30;
const DAY_MS = 86_400_000;

export type AuthError =
  | 'correo-invalido'
  | 'contrasena-corta'
  | 'nombre-requerido'
  | 'correo-ocupado'
  | 'credenciales-invalidas';

export const AUTH_MESSAGES: Record<AuthError, string> = {
  'correo-invalido': 'Ese correo no se ve bien. Revísalo y vuelve a intentar.',
  'contrasena-corta': `Tu contraseña necesita al menos ${MIN_PASSWORD_LENGTH} caracteres.`,
  'nombre-requerido': 'Escribe tu nombre para saber cómo llamarte.',
  'correo-ocupado': 'Ya hay una cuenta con ese correo. Inicia sesión o recupera tu acceso.',
  // Mismo mensaje para correo inexistente y contraseña equivocada: no se
  // confirma si un correo está registrado.
  'credenciales-invalidas': 'Correo o contraseña incorrectos.',
};

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export type AuthResult =
  | { ok: true; user: PublicUser; token: string; expiresAt: number }
  | { ok: false; error: AuthError; message: string };

const publicUser = (user: AuthUser): PublicUser => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
});

/**
 * El correo del dueño va por variable de entorno, nunca en una lista dentro
 * del código del cliente: esa cuenta entra al panel de control.
 */
export function roleForEmail(email: string): UserRole {
  const owner = normalizeEmail(process.env.OWNER_EMAIL ?? '');
  return owner && normalizeEmail(email) === owner ? 'admin' : 'owner';
}

/**
 * Qué rol debe quedar guardado al entrar, o `undefined` si no hay que tocarlo.
 *
 * El rol se decidía sólo al crear la cuenta, así que una cuenta registrada
 * antes de configurar `OWNER_EMAIL` se quedaba de emprendedor para siempre y
 * el panel era inalcanzable. Ahora la variable de entorno manda en cada
 * entrada: promueve al correo del dueño y degrada al que dejó de serlo.
 *
 * Con `OWNER_EMAIL` sin configurar no se toca nada. Si no, un despliegue al
 * que se le olvidó la variable degradaría al dueño sin querer, y no hay
 * pantalla para devolverle el acceso.
 */
export function roleSync(email: string, stored: UserRole): UserRole | undefined {
  if (!normalizeEmail(process.env.OWNER_EMAIL ?? '')) return undefined;
  const esperado = roleForEmail(email);
  return esperado === stored ? undefined : esperado;
}

export class AuthService {
  constructor(
    private store: AuthStore,
    private now: () => number = () => Date.now(),
  ) {}

  async register(input: { name: string; email: string; password: string; deviceId?: string }): Promise<AuthResult> {
    const email = normalizeEmail(input.email);
    const name = (input.name || '').trim();

    if (!name) return this.fail('nombre-requerido');
    if (!isValidEmail(email)) return this.fail('correo-invalido');
    if ((input.password || '').length < MIN_PASSWORD_LENGTH) return this.fail('contrasena-corta');
    if (await this.store.findUserByEmail(email)) return this.fail('correo-ocupado');

    const user = await this.store.createUser({
      email,
      name,
      passwordHash: await hashPassword(input.password),
      role: roleForEmail(email),
    });
    return this.startSession(user, input.deviceId);
  }

  async login(input: { email: string; password: string; deviceId?: string }): Promise<AuthResult> {
    const email = normalizeEmail(input.email);
    const user = await this.store.findUserByEmail(email);

    // Se verifica siempre contra un hash, exista o no el usuario, para que el
    // tiempo de respuesta no revele qué correos están registrados.
    const stored = user?.passwordHash ?? '';
    const valid = await verifyPassword(input.password || '', stored);
    if (!user || !valid) return this.fail('credenciales-invalidas');

    // El rol se revisa contra OWNER_EMAIL en cada entrada, no sólo al crear la
    // cuenta: si no, cambiar la variable no sirve de nada.
    const role = roleSync(email, user.role);
    if (role) {
      await this.store.updateRole(user.id, role);
      return this.startSession({ ...user, role }, input.deviceId);
    }

    return this.startSession(user, input.deviceId);
  }

  async logout(token: string): Promise<void> {
    if (token) await this.store.deleteSession(token);
  }

  /** Usuario de una sesión vigente. Una sesión vencida no vale y se limpia. */
  async userFromToken(token: string | undefined): Promise<PublicUser | undefined> {
    if (!token) return undefined;
    const session = await this.store.findSession(token);
    if (!session) return undefined;
    if (session.expiresAt <= this.now()) {
      await this.store.deleteSession(token);
      return undefined;
    }
    const user = await this.store.findUserById(session.userId);
    return user ? publicUser(user) : undefined;
  }

  async sessionFromToken(token: string | undefined) {
    if (!token) return undefined;
    const session = await this.store.findSession(token);
    if (!session || session.expiresAt <= this.now()) return undefined;
    return session;
  }

  private async startSession(user: AuthUser, deviceId?: string): Promise<AuthResult> {
    const token = newSessionToken();
    const expiresAt = this.now() + SESSION_DAYS * DAY_MS;
    await this.store.createSession({ token, userId: user.id, expiresAt, deviceId });
    return { ok: true, user: publicUser(user), token, expiresAt };
  }

  private fail(error: AuthError): AuthResult {
    return { ok: false, error, message: AUTH_MESSAGES[error] };
  }
}
