import { index, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { timestampTz } from './columns';
import { organizations } from './organizations';

export const machineClients = pgTable(
  'machine_clients',
  {
    id: uuid().primaryKey().defaultRandom(),
    organizationId: uuid()
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    name: text().notNull(),
    clientId: text().notNull().unique('machine_clients_client_id_unique'),
    secretHash: text().notNull(),
    createdAt: timestampTz().notNull().defaultNow(),
    revokedAt: timestampTz(),
    lastUsedAt: timestampTz(),
  },
  (table) => [index().on(table.organizationId)],
);

export const machineClientTokens = pgTable(
  'machine_client_tokens',
  {
    id: uuid().primaryKey().defaultRandom(),
    organizationId: uuid()
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    machineClientId: uuid()
      .notNull()
      .references(() => machineClients.id, { onDelete: 'cascade' }),
    name: text().notNull(),
    tokenHash: text().notNull().unique('machine_client_tokens_token_hash_unique'),
    createdAt: timestampTz().notNull().defaultNow(),
    revokedAt: timestampTz(),
    lastUsedAt: timestampTz(),
  },
  (table) => [index().on(table.machineClientId)],
);

export type MachineClient = typeof machineClients.$inferSelect;
export type MachineClientToken = typeof machineClientTokens.$inferSelect;
