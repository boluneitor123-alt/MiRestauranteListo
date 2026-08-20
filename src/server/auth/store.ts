/**
 * Contrato de persistencia de cuentas y sesiones.
 */

/** 'owner' es el emprendedor; 'admin' entra al panel de control. */
export type UserRole = 'owner' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: UserRole;
  createdAt: number;
}

export interface AuthSession {
  token: string;
  userId: string;
  expiresAt: number;
  deviceId?: string;
}

export interface AuthStore {
  findUserByEmail(email: string): Promise<AuthUser | undefined>;
  findUserById(id: string): Promise<AuthUser | undefined>;
  createUser(data: { email: string; name: string; passwordHash: string; role?: UserRole }): Promise<AuthUser>;
  updatePassword(userId: string, passwordHash: string): Promise<void>;
  updateRole(userId: string, role: UserRole): Promise<void>;

  createSession(session: AuthSession): Promise<AuthSession>;
  findSession(token: string): Promise<AuthSession | undefined>;
  deleteSession(token: string): Promise<void>;
  deleteUserSessions(userId: string): Promise<void>;
}
