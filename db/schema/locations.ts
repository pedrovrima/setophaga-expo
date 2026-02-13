import {
  pgTable,
  serial,
  varchar,
  integer,
  timestamp,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Countries table - Top level of location hierarchy
export const countries = pgTable(
  'countries',
  {
    id: serial('id').primaryKey(),
    code: varchar('code', { length: 3 }).notNull().unique(), // ISO alpha-3 (BRA, ARG)
    code2: varchar('code2', { length: 2 }).notNull().unique(), // ISO alpha-2 (BR, AR)
    name: varchar('name', { length: 100 }).notNull(),
    nameLocal: varchar('name_local', { length: 100 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('countries_code_idx').on(table.code),
    uniqueIndex('countries_code2_idx').on(table.code2),
    index('countries_name_idx').on(table.name),
  ]
);

// States/Provinces table - Second level of location hierarchy
export const states = pgTable(
  'states',
  {
    id: serial('id').primaryKey(),
    countryId: integer('country_id')
      .references(() => countries.id)
      .notNull(),
    code: varchar('code', { length: 10 }).notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    regionName: varchar('region_name', { length: 100 }),
    regionCode: varchar('region_code', { length: 10 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('states_country_id_idx').on(table.countryId),
    index('states_code_idx').on(table.code),
    index('states_name_idx').on(table.name),
    uniqueIndex('states_country_code_idx').on(table.countryId, table.code),
  ]
);

// Cities/Municipalities table - Third level of location hierarchy
export const cities = pgTable(
  'cities',
  {
    id: serial('id').primaryKey(),
    stateId: integer('state_id')
      .references(() => states.id)
      .notNull(),
    ibgeCode: varchar('ibge_code', { length: 20 }),
    name: varchar('name', { length: 150 }).notNull(),
    microregionName: varchar('microregion_name', { length: 100 }),
    mesoregionName: varchar('mesoregion_name', { length: 100 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('cities_state_id_idx').on(table.stateId),
    index('cities_name_idx').on(table.name),
    index('cities_ibge_code_idx').on(table.ibgeCode),
    index('cities_state_name_idx').on(table.stateId, table.name),
  ]
);

// Relations
export const countriesRelations = relations(countries, ({ many }) => ({
  states: many(states),
}));

export const statesRelations = relations(states, ({ one, many }) => ({
  country: one(countries, {
    fields: [states.countryId],
    references: [countries.id],
  }),
  cities: many(cities),
}));

export const citiesRelations = relations(cities, ({ one }) => ({
  state: one(states, {
    fields: [cities.stateId],
    references: [states.id],
  }),
}));
