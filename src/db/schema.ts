import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  created_at: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
  updated_at: text('updated_at').notNull().default('CURRENT_TIMESTAMP'),
});
