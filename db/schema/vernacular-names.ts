import {
  pgTable,
  serial,
  varchar,
  boolean,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { birds } from './birds';

// Vernacular names table - Names in various languages
export const vernacularNames = pgTable(
  'vernacular_names',
  {
    id: serial('id').primaryKey(),
    speciesCode: varchar('species_code', { length: 50 }).notNull(), // FK to birds.species_code
    language: varchar('language', { length: 20 }).notNull(), // ISO code (pt-BR, en, es-CO, etc.)
    name: varchar('name', { length: 255 }).notNull(),
    isPrimary: boolean('is_primary').default(false), // Primary name for this language/source
    source: varchar('source', { length: 100 }), // CBRO, eBird, IOC, Avibase, etc.
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('vernacular_names_species_code_idx').on(table.speciesCode),
    index('vernacular_names_language_idx').on(table.language),
    index('vernacular_names_name_idx').on(table.name),
    index('vernacular_names_source_idx').on(table.source),
    index('vernacular_names_species_language_idx').on(
      table.speciesCode,
      table.language
    ),
  ]
);

// Relations
export const vernacularNamesRelations = relations(vernacularNames, ({ one }) => ({
  bird: one(birds, {
    fields: [vernacularNames.speciesCode],
    references: [birds.speciesCode],
  }),
}));
