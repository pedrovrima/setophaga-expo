import {
  pgTable,
  uuid,
  varchar,
  integer,
  timestamp,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { birds } from './birds';

// Synonyms table - Unique name per species
export const synonyms = pgTable(
  'synonyms',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    birdId: integer('bird_id')
      .references(() => birds.id)
      .notNull(),
    status: varchar('status', { length: 20 }), // null = pending, 'approved', 'rejected'
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('synonyms_name_idx').on(table.name),
    index('synonyms_bird_id_idx').on(table.birdId),
    // Same name can only appear once per species
    uniqueIndex('synonyms_name_bird_idx').on(table.name, table.birdId),
  ]
);

// Relations defined in schema/index.ts to avoid circular imports
