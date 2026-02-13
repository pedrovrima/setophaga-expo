import 'dotenv/config';
import { db } from '../index';
import { countries, states, cities } from '../schema';
import municipiosData from '../../municipios.json';

interface Municipio {
  'municipio-id': number;
  'municipio-nome': string;
  'microrregiao-nome': string;
  'mesorregiao-nome': string;
  'UF-sigla': string;
  'UF-nome': string;
  'regiao-nome': string;
  'regiao-sigla': string;
}

async function seedBrazilLocations() {
  console.log('Starting Brazil location seed...');

  try {
    // 1. Insert Brazil
    console.log('Inserting Brazil...');
    const [brazil] = await db
      .insert(countries)
      .values({
        code: 'BRA',
        code2: 'BR',
        name: 'Brazil',
        nameLocal: 'Brasil',
      })
      .onConflictDoNothing()
      .returning();

    const brazilId = brazil?.id;
    if (!brazilId) {
      // Brazil already exists, fetch its ID
      const existingBrazil = await db.query.countries.findFirst({
        where: (c, { eq }) => eq(c.code, 'BRA'),
      });
      if (!existingBrazil) {
        throw new Error('Could not find or create Brazil');
      }
      console.log('Brazil already exists with ID:', existingBrazil.id);
    } else {
      console.log('Brazil created with ID:', brazilId);
    }

    const countryId =
      brazilId ||
      (await db.query.countries.findFirst({
        where: (c, { eq }) => eq(c.code, 'BRA'),
      }))!.id;

    // 2. Extract unique states
    console.log('Extracting unique states...');
    const uniqueStates = new Map<
      string,
      { code: string; name: string; regionName: string; regionCode: string }
    >();

    for (const m of municipiosData.municipios as Municipio[]) {
      if (!uniqueStates.has(m['UF-sigla'])) {
        uniqueStates.set(m['UF-sigla'], {
          code: m['UF-sigla'],
          name: m['UF-nome'],
          regionName: m['regiao-nome'],
          regionCode: m['regiao-sigla'],
        });
      }
    }

    console.log(`Found ${uniqueStates.size} unique states`);

    // 3. Insert states
    console.log('Inserting states...');
    const stateMap = new Map<string, number>();

    for (const [code, state] of uniqueStates) {
      const [inserted] = await db
        .insert(states)
        .values({
          countryId,
          code: state.code,
          name: state.name,
          regionName: state.regionName,
          regionCode: state.regionCode,
        })
        .onConflictDoNothing()
        .returning();

      if (inserted) {
        stateMap.set(code, inserted.id);
      } else {
        // State already exists, fetch its ID
        const existing = await db.query.states.findFirst({
          where: (s, { eq, and }) =>
            and(eq(s.countryId, countryId), eq(s.code, code)),
        });
        if (existing) {
          stateMap.set(code, existing.id);
        }
      }
    }

    console.log(`Inserted/found ${stateMap.size} states`);

    // 4. Insert cities in batches
    console.log('Inserting cities...');
    const municipios = municipiosData.municipios as Municipio[];
    const batchSize = 500;
    let totalInserted = 0;

    for (let i = 0; i < municipios.length; i += batchSize) {
      const batch = municipios.slice(i, i + batchSize);

      const cityValues = batch
        .map((m) => {
          const stateId = stateMap.get(m['UF-sigla']);
          if (!stateId) {
            console.warn(`State not found for: ${m['UF-sigla']}`);
            return null;
          }
          return {
            stateId,
            ibgeCode: String(m['municipio-id']),
            name: m['municipio-nome'],
            microregionName: m['microrregiao-nome'],
            mesoregionName: m['mesorregiao-nome'],
          };
        })
        .filter((v): v is NonNullable<typeof v> => v !== null);

      if (cityValues.length > 0) {
        await db.insert(cities).values(cityValues).onConflictDoNothing();
        totalInserted += cityValues.length;
        console.log(
          `Inserted batch ${Math.floor(i / batchSize) + 1}: ${cityValues.length} cities (total: ${totalInserted})`
        );
      }
    }

    console.log('\n✅ Seed completed successfully!');
    console.log(`   - 1 country (Brazil)`);
    console.log(`   - ${uniqueStates.size} states`);
    console.log(`   - ${totalInserted} cities`);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }

  process.exit(0);
}

// Run the seed
seedBrazilLocations();
