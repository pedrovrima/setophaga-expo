import { db } from '~/db';
import { isNull, isNotNull } from 'drizzle-orm';
import { birds as birdsTable, synonymRecords } from '~/db/schema';
import { transformToLegacy } from '~/services/transformBird';

export type {
  Bird,
  BirdLegacy,
  BirdWithSynonyms,
  Criteria,
  Synonym,
  SynonymLegacy,
  SynonymRecord,
  SynonymWithRecords,
  VernacularName,
} from '~/services/transformBird';

export const GET = async (): Promise<Response> => {
  try {
    const data = await db.query.birds.findMany({
      where: isNotNull(birdsTable.cbroCode),
      with: {
        vernacularNames: true,
        synonyms: {
          with: {
            records: {
              where: isNull(synonymRecords.deletedAt),
              with: {
                state: true,
                city: true,
              },
            },
          },
        },
      },
    });

    const legacyData = data.map(transformToLegacy);

    return Response.json(legacyData);
  } catch (error: any) {
    console.error('Error fetching species:', error);
    return Response.json({ error: error?.message }, { status: 500 });
  }
};
