import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';

// Profiles table - Extends Supabase auth.users
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(), // Same as auth.users.id
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  role: varchar('role', { length: 20 }).default('user').notNull(), // 'user', 'admin', or 'super_admin'
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
