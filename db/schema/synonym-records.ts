import {
  pgTable,
  uuid,
  integer,
  varchar,
  text,
  numeric,
  date,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { synonyms } from './synonyms';
import { countries, states, cities } from './locations';
import { profiles } from './profiles';

// Synonym records table - Each occurrence/registration
export const synonymRecords = pgTable(
  'synonym_records',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    synonymId: uuid('synonym_id')
      .references(() => synonyms.id)
      .notNull(),

    // Location references
    countryId: integer('country_id').references(() => countries.id),
    stateId: integer('state_id').references(() => states.id),
    cityId: integer('city_id').references(() => cities.id),
    locationDescription: text('location_description'),
    region: varchar('region', { length: 100 }),

    // GPS coordinates (optional)
    latitude: numeric('latitude', { precision: 10, scale: 7 }),
    longitude: numeric('longitude', { precision: 10, scale: 7 }),

    // Collector information
    collectorId: uuid('collector_id').references(() => profiles.id),
    collectorName: varchar('collector_name', { length: 255 }),

    // Source information
    informant: varchar('informant', { length: 255 }),
    observation: text('observation'),
    collectionDate: date('collection_date'),

    // Timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),

    // Offline sync fields
    syncedAt: timestamp('synced_at'),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => [
    index('synonym_records_synonym_id_idx').on(table.synonymId),
    index('synonym_records_country_id_idx').on(table.countryId),
    index('synonym_records_state_id_idx').on(table.stateId),
    index('synonym_records_city_id_idx').on(table.cityId),
    index('synonym_records_collector_id_idx').on(table.collectorId),
    index('synonym_records_synced_at_idx').on(table.syncedAt),
    index('synonym_records_deleted_at_idx').on(table.deletedAt),
  ]
);

// Relations
export const synonymRecordsRelations = relations(synonymRecords, ({ one }) => ({
  synonym: one(synonyms, {
    fields: [synonymRecords.synonymId],
    references: [synonyms.id],
  }),
  country: one(countries, {
    fields: [synonymRecords.countryId],
    references: [countries.id],
  }),
  state: one(states, {
    fields: [synonymRecords.stateId],
    references: [states.id],
  }),
  city: one(cities, {
    fields: [synonymRecords.cityId],
    references: [cities.id],
  }),
  collector: one(profiles, {
    fields: [synonymRecords.collectorId],
    references: [profiles.id],
  }),
}));
