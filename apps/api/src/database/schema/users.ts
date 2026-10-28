import { boolean, index, pgTable, text, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { auditTimestamps, timestampTz } from './columns';
import { organizations } from './organizations';

export const users = pgTable('users', {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  // Stored lower-cased by the application so the unique constraint is case-insensitive in practice.
  email: text().notNull().unique('users_email_unique'),
  passwordHash: text().notNull(),
  isActive: boolean().notNull().default(true),
  ...auditTimestamps(),
  lastLoginAt: timestampTz(),
});

export const memberships = pgTable(
  'memberships',
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    organizationId: uuid()
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    createdAt: timestampTz().notNull().defaultNow(),
  },
  (table) => [uniqueIndex().on(table.organizationId, table.userId), index().on(table.userId)],
);

export type User = typeof users.$inferSelect;
export type Membership = typeof memberships.$inferSelect;
