import { and, desc, eq, inArray, isNull } from 'drizzle-orm';

import { db } from '~/db';
import { synonymRecords, vernacularNames } from '~/db/schema';

export const GET = async (request: Request): Promise<Response> => {
  try {
    const { searchParams } = new URL(request.url);
    const collectorId = searchParams.get('collectorId');

    if (!collectorId) {
      return Response.json({ error: 'collectorId é obrigatório' }, { status: 400 });
    }

    const records = await db.query.synonymRecords.findMany({
      where: and(
        eq(synonymRecords.collectorId, collectorId),
        isNull(synonymRecords.deletedAt)
      ),
      with: {
        synonym: {
          with: {
            bird: true,
          },
        },
        state: true,
        city: true,
      },
      orderBy: [desc(synonymRecords.createdAt)],
    });

    const speciesCodes = [
      ...new Set(records.map((record) => record.synonym.bird.speciesCode).filter(Boolean)),
    ];

    const ptbrNames = speciesCodes.length
      ? await db
          .select()
          .from(vernacularNames)
          .where(inArray(vernacularNames.speciesCode, speciesCodes))
      : [];

    const ptbrNameMap = new Map<string, string>();
    for (const vn of ptbrNames) {
      if (vn.language === 'pt-BR' && vn.isPrimary) {
        ptbrNameMap.set(vn.speciesCode, vn.name);
      }
    }

    return Response.json(
      records.map((record) => ({
        id: record.id,
        synonymName: record.synonym.name,
        synonymStatus: record.synonym.status,
        birdId: record.synonym.birdId,
        birdScientificName:
          record.synonym.bird.nameSciCbro || record.synonym.bird.nameSciEbird || '',
        birdPtbrName: ptbrNameMap.get(record.synonym.bird.speciesCode) || null,
        state: record.state?.code || '',
        city: record.city?.name || '',
        location: record.locationDescription || '',
        informant: record.informant || '',
        observation: record.observation || '',
        collectionDate: record.collectionDate || null,
        createdAt: record.createdAt,
      }))
    );
  } catch (error: any) {
    console.error('Error fetching profile submissions:', error);
    return Response.json(
      { error: error?.message || 'Erro ao buscar sinônimos submetidos' },
      { status: 500 }
    );
  }
};
