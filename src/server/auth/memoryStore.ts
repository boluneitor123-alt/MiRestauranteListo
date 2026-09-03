/**
 * Almacén de cuentas en memoria: pruebas y desarrollo sin base de datos.
 */

import type { AuthSession, AuthStore, AuthUser, UserRole } from './store';

export class MemoryAuthStore implements AuthStore {
  private users = new Map<string, AuthUser>();
  private sessions = new Map<string, AuthSession>();
  private sequence = 0;

  async findUserByEmail(email: string): Promise<AuthUser | undefined> {
    return [...this.users.values()].find((u) => u.email === email);
  }

  async findUserById(id: string): Promise<AuthUser | undefined> {
    return this.users.get(id);
  }

  async createUser(data: {
    email: string;
    name: string;
    passwordHash: string;
    role?: UserRole;
  }): Promise<AuthUser> {
    const user: AuthUser = { id: `u${++this.sequence}`, createdAt: Date.now(), role: 'owner', ...data };
    this.users.set(user.id, user);
    return user;
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    const user = this.users.get(userId);
    if (user) this.users.set(userId, { ...user, passwordHash });
  }

  async touchLogin(userId: string, at: number): Promise<void> {
    const user = this.users.get(userId);
    if (user) this.users.set(userId, { ...user, lastLoginAt: at });
  }

  async updateRole(userId: string, role: UserRole): Promise<void> {
    const user = this.users.get(userId);
    if (user) this.users.set(userId, { ...user, role });
  }

  async createSession(session: AuthSession): Promise<AuthSession> {
    this.sessions.set(session.token, session);
    return session;
  }

  async findSession(token: string): Promise<AuthSession | undefined> {
    return this.sessions.get(token);
  }

  async deleteSession(token: string): Promise<void> {
    this.sessions.delete(token);
  }

  async deleteUserSessions(userId: string): Promise<void> {
    for (const [token, session] of this.sessions) {
      if (session.userId === userId) this.sessions.delete(token);
    }
  }
}
