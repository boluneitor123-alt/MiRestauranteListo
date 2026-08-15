/**
 * Contrato de persistencia de cuentas y sesiones.
 */

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
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
  createUser(data: { email: string; name: string; passwordHash: string }): Promise<AuthUser>;
  updatePassword(userId: string, passwordHash: string): Promise<void>;

  createSession(session: AuthSession): Promise<AuthSession>;
  findSession(token: string): Promise<AuthSession | undefined>;
  deleteSession(token: string): Promise<void>;
  deleteUserSessions(userId: string): Promise<void>;
}
