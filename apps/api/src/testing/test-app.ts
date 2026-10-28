import 'reflect-metadata';
import { randomUUID } from 'node:crypto';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { createApp } from '../bootstrap';
import { DATABASE, type Database } from '../database/database';
import { memberships, organizations, users } from '../database/schema';
import { hashPassword } from '../modules/auth/credentials';

export interface TestUser {
  readonly id: string;
  readonly email: string;
  readonly password: string;
}

export interface TestOrganization {
  readonly id: string;
  readonly code: string;
}

export async function createTestApp(): Promise<NestFastifyApplication> {
  const app = await createApp();

  await app.init();
  await app.getHttpAdapter().getInstance().ready();

  return app;
}

export function uniqueCode(prefix: string): string {
  return `${prefix}-${randomUUID().slice(0, 8)}`;
}

export async function createUser(app: NestFastifyApplication, isActive = true): Promise<TestUser> {
  const password = `pw-${randomUUID()}`;
  const email = `${uniqueCode('user')}@example.test`;
  const [user] = await app
    .get<Database>(DATABASE)
    .insert(users)
    .values({ name: 'Test User', email, passwordHash: await hashPassword(password), isActive })
    .returning({ id: users.id });

  return { id: user!.id, email, password };
}

export async function createOrganization(app: NestFastifyApplication, ...members: TestUser[]): Promise<TestOrganization> {
  const database = app.get<Database>(DATABASE);
  const code = uniqueCode('ORG');
  const [organization] = await database.insert(organizations).values({ code, name: `Organisation ${code}` }).returning({ id: organizations.id });

  for (const member of members) await database.insert(memberships).values({ userId: member.id, organizationId: organization!.id });

  return { id: organization!.id, code };
}

export async function login(app: NestFastifyApplication, user: TestUser): Promise<string> {
  const response = await app.inject({ method: 'POST', url: '/api/v1/auth/login', payload: { email: user.email, password: user.password } });
  const cookie = response.cookies.find((candidate) => candidate.name === 'xbo_session');

  if (response.statusCode !== 200 || !cookie) throw new Error(`Login failed with ${response.statusCode}: ${response.body}`);

  return `xbo_session=${cookie.value}`;
}
