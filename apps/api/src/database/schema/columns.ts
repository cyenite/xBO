import { timestamp } from 'drizzle-orm/pg-core';

export function timestampTz() {
  return timestamp({ withTimezone: true });
}

export function auditTimestamps() {
  return {
    createdAt: timestampTz().notNull().defaultNow(),
    updatedAt: timestampTz()
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  };
}
