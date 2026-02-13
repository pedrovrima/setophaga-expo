import { db } from '~/db';
import { synonyms, synonymRecords, states, cities } from '~/db/schema';
import { eq, and } from 'drizzle-orm';
import municipalitys from '~/municipios.json';

export interface RequestBody {
  date: Date;
  id: number; // bird_id
  state: string; // state code (e.g., "SP")
  location: string; // location description
  city: string; // city name
  collectorsId: string; // Supabase auth user UUID
  collectorsName: string;
  informer: string;
  name: string; // the synonym
  observation: string;
}

export const POST = async (request: Request): Promise<Response> => {
  try {
    const body = (await request.json()) as RequestBody;

    // 1. Look up state ID
    const state = await db.query.states.findFirst({
      where: eq(states.code, body.state),
    });

    if (!state) {
      return Response.json({ error: 'Estado não encontrado' }, { status: 400 });
    }

    // 2. Look up city ID
    const city = await db.query.cities.findFirst({
      where: and(eq(cities.stateId, state.id), eq(cities.name, body.city)),
    });

    if (!city) {
      return Response.json({ error: 'Cidade não encontrada' }, { status: 400 });
    }

    // 3. Get country ID (Brazil = 1, assuming it's the first country seeded)
    const country = await db.query.countries.findFirst({
      where: (c, { eq }) => eq(c.code, 'BRA'),
    });

    const countryId = country?.id || 1;

    // 4. Check if synonym already exists for this bird
    let synonym = await db.query.synonyms.findFirst({
      where: and(eq(synonyms.name, body.name), eq(synonyms.birdId, body.id)),
    });

    // 5. Check if this exact record already exists (same synonym + city)
    if (synonym) {
      const existingRecord = await db.query.synonymRecords.findFirst({
        where: and(
          eq(synonymRecords.synonymId, synonym.id),
          eq(synonymRecords.cityId, city.id)
        ),
      });

      if (existingRecord) {
        console.log('Registro já existe');
        return Response.json({ error: 'Registro já existe' }, { status: 409 });
      }
    }

    // 6. Create synonym if it doesn't exist
    if (!synonym) {
      const [newSynonym] = await db
        .insert(synonyms)
        .values({
          name: body.name,
          birdId: body.id,
        })
        .returning();
      synonym = newSynonym;
    }

    // 7. Get region from municipality data
    const region = municipalitys.municipios.find(
      (mun) => mun['UF-sigla'] === body.state
    )?.['regiao-nome'];

    // 8. Create the synonym record
    const [newRecord] = await db
      .insert(synonymRecords)
      .values({
        synonymId: synonym.id,
        countryId,
        stateId: state.id,
        cityId: city.id,
        locationDescription: body.location,
        region: region || null,
        collectorId: body.collectorsId || null,
        collectorName: body.collectorsName,
        informant: body.informer,
        observation: body.observation,
        collectionDate: new Date().toISOString().split('T')[0],
        syncedAt: new Date(), // Mark as synced since it's being created online
      })
      .returning();

    return Response.json(
      {
        success: true,
        synonymId: synonym.id,
        recordId: newRecord.id,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating synonym:', error);
    return Response.json(
      { error: error?.message || 'Erro ao cadastrar' },
      { status: 500 }
    );
  }
};
