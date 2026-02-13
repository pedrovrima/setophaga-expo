import 'dotenv/config';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { db } from '../index';
import { birds, vernacularNames } from '../schema';

// Language mapping: CSV column → ISO language code
const LANGUAGE_MAP: Record<string, string> = {
  name_ptbr: 'pt-BR',
  name_english: 'en',
  name_spanish: 'es',
  name_german: 'de',
  name_italian: 'it',
  name_french: 'fr',
  name_czech: 'cs',
  name_danish: 'da',
  name_dutch: 'nl',
  name_estonian: 'et',
  name_finnish: 'fi',
  name_hungarian: 'hu',
  name_chinese: 'zh',
  name_japanese: 'ja',
  name_norwegian: 'no',
  name_polish: 'pl',
  name_russian: 'ru',
  name_slovak: 'sk',
  name_swedish: 'sv',
};

// Source mapping for primary names
const SOURCE_MAP: Record<string, string> = {
  name_ptbr: 'CBRO',
  name_english: 'eBird',
};

function parseCSV(content: string): Record<string, string>[] {
  const lines = content.split('\n').filter((l) => l.trim());
  const headers = lines[0].split(',');
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j].trim()] = (values[j] || '').trim();
    }
    rows.push(row);
  }

  return rows;
}

async function seedBirds() {
  console.log('Starting birds seed...');

  const csvPath = resolve(__dirname, '../../assets/data/spp_data_02_2025.csv');
  const content = readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(content);

  console.log(`Found ${rows.length} species in CSV`);

  // Insert birds in batches
  const batchSize = 200;
  let totalBirds = 0;
  const speciesCodeToId = new Map<string, number>();

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);

    const birdValues = batch
      .filter((row) => row.species_code) // Skip rows without species_code
      .map((row) => ({
        speciesCode: row.species_code,
        cbroCode: row.cbro_code || null,
        nameSciCbro: row.nvt || null,
        nameSciEbird: row.name_sci || null,
        taxonOrder: row.order || null,
        family: row.family || null,
        genera: row.genera || null,
        species: row.species || null,
        status: row.status || null,
      }));

    if (birdValues.length > 0) {
      const inserted = await db
        .insert(birds)
        .values(birdValues)
        .onConflictDoNothing()
        .returning({ id: birds.id, speciesCode: birds.speciesCode });

      for (const bird of inserted) {
        speciesCodeToId.set(bird.speciesCode, bird.id);
      }

      totalBirds += inserted.length;
      console.log(
        `Birds batch ${Math.floor(i / batchSize) + 1}: ${inserted.length} inserted (total: ${totalBirds})`
      );
    }
  }

  console.log(`\nInserted ${totalBirds} birds. Now inserting vernacular names...`);

  // Insert vernacular names in batches
  let totalNames = 0;

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const nameValues: {
      speciesCode: string;
      language: string;
      name: string;
      isPrimary: boolean;
      source: string | null;
    }[] = [];

    for (const row of batch) {
      if (!row.species_code) continue;

      for (const [csvCol, langCode] of Object.entries(LANGUAGE_MAP)) {
        const name = row[csvCol];
        if (name && name.trim()) {
          nameValues.push({
            speciesCode: row.species_code,
            language: langCode,
            name: name.trim(),
            isPrimary: csvCol === 'name_ptbr' || csvCol === 'name_english',
            source: SOURCE_MAP[csvCol] || null,
          });
        }
      }
    }

    if (nameValues.length > 0) {
      await db.insert(vernacularNames).values(nameValues).onConflictDoNothing();
      totalNames += nameValues.length;
      console.log(
        `Names batch ${Math.floor(i / batchSize) + 1}: ${nameValues.length} inserted (total: ${totalNames})`
      );
    }
  }

  console.log('\n✅ Birds seed completed!');
  console.log(`   - ${totalBirds} birds`);
  console.log(`   - ${totalNames} vernacular names`);

  process.exit(0);
}

seedBirds().catch((e) => {
  console.error('❌ Birds seed failed:', e);
  process.exit(1);
});
