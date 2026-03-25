import { db } from '~/db';
import { synonyms, synonymRecords, vernacularNames } from '~/db/schema';
import { eq, isNull } from 'drizzle-orm';

// GET /admin/synonyms — list all synonyms with bird info and record count
export const GET = async (request: Request): Promise<Response> => {
  try {
    const allSynonyms = await db.query.synonyms.findMany({
      with: {
        bird: true,
        records: {
          with: {
            country: true,
            state: true,
            city: true,
            collector: true,
          },
          where: isNull(synonymRecords.deletedAt),
        },
      },
      orderBy: (syn, { desc }) => [desc(syn.createdAt)],
    });

    // Get pt-BR vernacular names for each bird
    const birdIds = [...new Set(allSynonyms.map((s) => s.birdId))];
    const ptbrNames = birdIds.length
      ? await db
          .select()
          .from(vernacularNames)
          .where(eq(vernacularNames.language, 'pt-BR'))
      : [];

    const ptbrNameMap = new Map<string, string>();
    for (const vn of ptbrNames) {
      if (vn.isPrimary) {
        ptbrNameMap.set(vn.speciesCode, vn.name);
      }
    }

    const result = allSynonyms.map((syn) => ({
      ...syn,
      birdPtbrName: ptbrNameMap.get(syn.bird.speciesCode) || null,
    }));

    return Response.json(result);
  } catch (error: any) {
    console.error('Error fetching synonyms:', error);
    return Response.json(
      { error: error?.message || 'Erro ao buscar sinônimos' },
      { status: 500 }
    );
  }
};

// PATCH /admin/synonyms — update synonym status (approve/reject/clear)
export const PATCH = async (request: Request): Promise<Response> => {
  try {
    const { synonymId, status } = (await request.json()) as {
      synonymId: string;
      status: 'approved' | 'rejected' | null;
    };

    if (!synonymId) {
      return Response.json({ error: 'ID do sinônimo é obrigatório' }, { status: 400 });
    }

    if (status !== null && status !== 'approved' && status !== 'rejected') {
      return Response.json({ error: 'Status inválido' }, { status: 400 });
    }

    const [updated] = await db
      .update(synonyms)
      .set({ status, updatedAt: new Date() })
      .where(eq(synonyms.id, synonymId))
      .returning();

    if (!updated) {
      return Response.json({ error: 'Sinônimo não encontrado' }, { status: 404 });
    }

    return Response.json(updated);
  } catch (error: any) {
    console.error('Error updating synonym status:', error);
    return Response.json(
      { error: error?.message || 'Erro ao atualizar sinônimo' },
      { status: 500 }
    );
  }
};
