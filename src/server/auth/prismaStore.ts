/**
 * Cuentas y sesiones sobre Prisma/Postgres.
 */

import type { PrismaClient } from '@prisma/client';
import { getPrisma } from '../licensing/prismaStore';
import type { AuthSession, AuthStore, AuthUser, UserRole } from './store';

type DbUser = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: string;
  createdAt: Date;
  lastLoginAt: Date | null;
};

const toUser = (row: DbUser): AuthUser => ({
  id: row.id,
  email: row.email,
  name: row.name,
  passwordHash: row.passwordHash,
  role: row.role === 'admin' ? 'admin' : 'owner',
  createdAt: row.createdAt.getTime(),
  lastLoginAt: row.lastLoginAt ? row.lastLoginAt.getTime() : undefined,
});

export class PrismaAuthStore implements AuthStore {
  constructor(private db: PrismaClient = getPrisma()) {}

  async findUserByEmail(email: string): Promise<AuthUser | undefined> {
    const row = await this.db.user.findUnique({ where: { email } });
    return row ? toUser(row) : undefined;
  }

  async findUserById(id: string): Promise<AuthUser | undefined> {
    const row = await this.db.user.findUnique({ where: { id } });
    return row ? toUser(row) : undefined;
  }

  async createUser(data: {
    email: string;
    name: string;
    passwordHash: string;
    role?: UserRole;
  }): Promise<AuthUser> {
    return toUser(await this.db.user.create({ data: { ...data, role: data.role ?? 'owner' } }));
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await this.db.user.update({ where: { id: userId }, data: { passwordHash } });
  }

  async updateRole(userId: string, role: UserRole): Promise<void> {
    await this.db.user.update({ where: { id: userId }, data: { role } });
  }

  async touchLogin(userId: string, at: number): Promise<void> {
    await this.db.user.update({ where: { id: userId }, data: { lastLoginAt: new Date(at) } });
  }

  async createSession(session: AuthSession): Promise<AuthSession> {
    await this.db.session.create({
      data: {
        token: session.token,
        userId: session.userId,
        expiresAt: new Date(session.expiresAt),
        deviceId: session.deviceId,
      },
    });
    return session;
  }

  async findSession(token: string): Promise<AuthSession | undefined> {
    const row = await this.db.session.findUnique({ where: { token } });
    if (!row) return undefined;
    return {
      token: row.token,
      userId: row.userId,
      expiresAt: row.expiresAt.getTime(),
      deviceId: row.deviceId ?? undefined,
    };
  }

  async deleteSession(token: string): Promise<void> {
    await this.db.session.deleteMany({ where: { token } });
  }

  async deleteUserSessions(userId: string): Promise<void> {
    await this.db.session.deleteMany({ where: { userId } });
  }
}
