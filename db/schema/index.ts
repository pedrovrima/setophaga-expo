import { relations } from 'drizzle-orm';

// Export all tables
export * from './locations';
export * from './birds';
export * from './vernacular-names';
export * from './profiles';
export * from './synonyms';
export * from './synonym-records';

// Re-import for proper relations setup
import { birds } from './birds';
import { vernacularNames } from './vernacular-names';
import { synonyms } from './synonyms';
import { synonymRecords } from './synonym-records';

// Override birds relations with proper references
export const birdsRelationsComplete = relations(birds, ({ many }) => ({
  vernacularNames: many(vernacularNames),
  synonyms: many(synonyms),
}));

// Override synonyms relations with proper references
export const synonymsRelationsComplete = relations(synonyms, ({ one, many }) => ({
  bird: one(birds, {
    fields: [synonyms.birdId],
    references: [birds.id],
  }),
  records: many(synonymRecords),
}));
