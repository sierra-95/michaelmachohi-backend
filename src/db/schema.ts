import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  created_at: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
  updated_at: text('updated_at').notNull().default('CURRENT_TIMESTAMP'),
});


export const userMedia = sqliteTable('user_media', {
  id: text('id').primaryKey(),
  user_id: text('user_id'),       
  anonymous_id: text('anonymous_id'),
  r2_key: text('r2_key').notNull(),
  url: text('url').notNull(),
  original_name: text('original_name').notNull(),
  mime_type: text('mime_type').notNull(),
  size_bytes: integer('size_bytes').notNull(),
  created_at: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
});