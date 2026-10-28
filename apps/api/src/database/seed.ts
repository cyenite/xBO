import { randomBytes } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { appConfig } from '../config';
import { hashPassword } from '../modules/auth/credentials';
import { memberships, organizations, users } from './schema';

async function seed(): Promise<void> {
  const name = process.env.XBO_SEED_NAME ?? 'Administrator';
  const pool = new Pool({ connectionString: appConfig.databaseUrl });
  const email = (process.env.XBO_SEED_EMAIL ?? 'admin@xbo.local').toLowerCase();
  const password = process.env.XBO_SEED_PASSWORD ?? randomBytes(12).toString('base64url');
  const database = drizzle(pool, { casing: 'snake_case' });
  const organizationCode = process.env.XBO_SEED_ORGANIZATION_CODE ?? 'DEMO';
  const organizationName = process.env.XBO_SEED_ORGANIZATION_NAME ?? 'Demo Distributors';

  try {
    await database.insert(organizations).values({ code: organizationCode, name: organizationName }).onConflictDoNothing({ target: organizations.code });

    const [organization] = await database.select().from(organizations).where(eq(organizations.code, organizationCode));
    const [created] = await database
      .insert(users)
      .values({ name, email, passwordHash: await hashPassword(password) })
      .onConflictDoNothing({ target: users.email })
      .returning({ id: users.id });
    const [user] = await database.select().from(users).where(eq(users.email, email));

    await database.insert(memberships).values({ userId: user!.id, organizationId: organization!.id }).onConflictDoNothing();

    console.log(`Organisation ${organizationCode}: ${organization!.name}`);
    console.log(created ? `User ${email} created with password: ${password}` : `User ${email} already exists; password unchanged.`);
  } finally {
    await pool.end();
  }
}

void seed();
