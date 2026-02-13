import { pgTable, serial, varchar, timestamp, index } from 'drizzle-orm/pg-core';

// Birds table - Taxonomic data only (no vernacular names)
export const birds = pgTable(
  'birds',
  {
    id: serial('id').primaryKey(),
    speciesCode: varchar('species_code', { length: 50 }).notNull().unique(), // eBird code
    cbroCode: varchar('cbro_code', { length: 50 }), // CBRO code (may differ)
    nameSciCbro: varchar('name_sci_cbro', { length: 255 }), // Scientific name (CBRO)
    nameSciEbird: varchar('name_sci_ebird', { length: 255 }), // Scientific name (eBird/Clements)
    taxonOrder: varchar('taxon_order', { length: 100 }),
    family: varchar('family', { length: 100 }),
    genera: varchar('genera', { length: 100 }),
    species: varchar('species', { length: 100 }),
    status: varchar('status', { length: 50 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('birds_species_code_idx').on(table.speciesCode),
    index('birds_cbro_code_idx').on(table.cbroCode),
    index('birds_name_sci_cbro_idx').on(table.nameSciCbro),
    index('birds_name_sci_ebird_idx').on(table.nameSciEbird),
    index('birds_family_idx').on(table.family),
    index('birds_taxon_order_idx').on(table.taxonOrder),
  ]
);

// Relations defined in schema/index.ts to avoid circular imports
