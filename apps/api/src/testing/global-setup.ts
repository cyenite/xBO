import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { fileURLToPath } from 'node:url';
import { Client } from 'pg';
import type { TestProject } from 'vitest/node';

declare module 'vitest' {
  export interface ProvidedContext {
    databaseUrl: string;
  }
}

const serverUrl = process.env.XBO_TEST_DATABASE_URL ?? 'postgres://xbo:xbo@localhost:5433/postgres';

async function connect(url: string): Promise<Client> {
  const client = new Client({ connectionString: url });

  try {
    await client.connect();
  } catch (error) {
    throw new Error(`Cannot reach PostgreSQL at ${url}. Start it with \`docker compose up -d\` or set XBO_TEST_DATABASE_URL.`, { cause: error });
  }

  return client;
}

// Each run gets its own throwaway database, so tests never touch the development data and parallel runs do not collide.
export default async function setup(project: TestProject): Promise<() => Promise<void>> {
  const name = `xbo_test_${Date.now()}_${process.pid}`;
  const admin = await connect(serverUrl);
  const databaseUrl = new URL(serverUrl);

  await admin.query(`create database "${name}"`);
  databaseUrl.pathname = `/${name}`;

  const client = await connect(databaseUrl.toString());

  try {
    await migrate(drizzle(client), { migrationsFolder: fileURLToPath(new URL('../../drizzle', import.meta.url)) });
  } finally {
    await client.end();
  }

  project.provide('databaseUrl', databaseUrl.toString());

  return async () => {
    await admin.query(`drop database if exists "${name}" with (force)`);
    await admin.end();
  };
}
