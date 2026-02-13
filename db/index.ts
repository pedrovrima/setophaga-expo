import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Connection string from environment
const connectionString = process.env.DATABASE_URL!;

// Create postgres client
// prepare: false is required for Supabase connection pooling
// @ts-ignore - postgres default export works at runtime
const client = postgres(connectionString, {
  prepare: false,
});

// Create drizzle instance with schema
export const db = drizzle(client, { schema });

// Re-export schema for convenience
export * from './schema';

// Type helpers - infer types from schema
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import type {
  countries,
  states,
  cities,
  birds,
  vernacularNames,
  profiles,
  synonyms,
  synonymRecords,
} from './schema';

// Select types (for reading)
export type Country = InferSelectModel<typeof countries>;
export type State = InferSelectModel<typeof states>;
export type City = InferSelectModel<typeof cities>;
export type Bird = InferSelectModel<typeof birds>;
export type VernacularName = InferSelectModel<typeof vernacularNames>;
export type Profile = InferSelectModel<typeof profiles>;
export type Synonym = InferSelectModel<typeof synonyms>;
export type SynonymRecord = InferSelectModel<typeof synonymRecords>;

// Insert types (for creating)
export type NewCountry = InferInsertModel<typeof countries>;
export type NewState = InferInsertModel<typeof states>;
export type NewCity = InferInsertModel<typeof cities>;
export type NewBird = InferInsertModel<typeof birds>;
export type NewVernacularName = InferInsertModel<typeof vernacularNames>;
export type NewProfile = InferInsertModel<typeof profiles>;
export type NewSynonym = InferInsertModel<typeof synonyms>;
export type NewSynonymRecord = InferInsertModel<typeof synonymRecords>;

// Extended types with relations
export type BirdWithRelations = Bird & {
  vernacularNames: VernacularName[];
  synonyms: (Synonym & {
    records: (SynonymRecord & {
      country?: Country;
      state?: State;
      city?: City;
    })[];
  })[];
};
