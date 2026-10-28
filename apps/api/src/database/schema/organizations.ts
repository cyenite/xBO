import { pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { auditTimestamps } from './columns';

export const organizations = pgTable('organizations', {
  id: uuid().primaryKey().defaultRandom(),
  code: text().notNull().unique('organizations_code_unique'),
  name: text().notNull(),
  ...auditTimestamps(),
});

export type Organization = typeof organizations.$inferSelect;
