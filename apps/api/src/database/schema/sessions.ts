import { index, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { timestampTz } from './columns';
import { organizations } from './organizations';
import { users } from './users';

export const sessions = pgTable(
  'sessions',
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    organizationId: uuid().references(() => organizations.id, { onDelete: 'set null' }),
    tokenHash: text().notNull().unique('sessions_token_hash_unique'),
    userAgent: text(),
    ipAddress: text(),
    createdAt: timestampTz().notNull().defaultNow(),
    expiresAt: timestampTz().notNull(),
    lastSeenAt: timestampTz().notNull().defaultNow(),
  },
  (table) => [index().on(table.userId), index().on(table.expiresAt)],
);

export type Session = typeof sessions.$inferSelect;
