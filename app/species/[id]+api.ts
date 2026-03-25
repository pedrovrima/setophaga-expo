import { and, eq, isNotNull, isNull, or, ne } from 'drizzle-orm';

import { db } from '~/db';
import { birds as birdsTable, synonymRecords, synonyms } from '~/db/schema';
import { transformToLegacy } from '~/services/transformBird';

const extractSpeciesId = (request: Request) => {
  const pathname = new URL(request.url).pathname;
  const match = pathname.match(/\/species\/([^/?#]+)/);
  if (!match) return undefined;

  const id = Number(match[1]);
  if (!Number.isInteger(id) || id < 1) return undefined;

  return id;
};

export const GET = async (request: Request): Promise<Response> => {
  const speciesId = extractSpeciesId(request);

  if (!speciesId) {
    return Response.json({ error: 'ID de espécie inválido' }, { status: 400 });
  }

  try {
    const bird = await db.query.birds.findFirst({
      where: and(eq(birdsTable.id, speciesId), isNotNull(birdsTable.cbroCode)),
      with: {
        vernacularNames: true,
        synonyms: {
          where: or(isNull(synonyms.status), ne(synonyms.status, 'rejected')),
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

    if (!bird) {
      return Response.json({ error: 'Espécie não encontrada' }, { status: 404 });
    }

    return Response.json(transformToLegacy(bird));
  } catch (error: any) {
    console.error('Error fetching species by id:', error);
    return Response.json({ error: error?.message }, { status: 500 });
  }
};
