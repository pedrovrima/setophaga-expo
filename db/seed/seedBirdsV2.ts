import 'dotenv/config';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { db } from '../index';
import { birds, vernacularNames } from '../schema';
import { sql } from 'drizzle-orm';

// ----- CSV Parsing -----

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCSV(content: string): Record<string, string>[] {
  const lines = content.split('\n').filter((l) => l.trim());
  const headers = parseCSVLine(lines[0]);
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j] || '';
    }
    rows.push(row);
  }
  return rows;
}

// ----- Interfaces -----

interface EbirdSpecies {
  speciesCode: string;
  sciName: string;
  primaryComName: string; // English name
  taxonOrder: number;
}

interface CbroSpecies {
  cbroCode: string;
  speciesCode: string; // eBird code
  nameSciCbro: string;
  namePtbr: string;
  nameEnglish: string;
  order: string;
  family: string;
  genera: string;
  species: string;
  status: string;
}

interface VernacularEntry {
  speciesCode: string;
  language: string;
  name: string;
  isPrimary: boolean;
  source: string;
}

// ----- Main -----

async function seedBirdsV2() {
  console.log('=== Birds Seed V2 ===\n');

  // Step 0: Clear existing data
  console.log('Clearing existing data...');
  await db.delete(vernacularNames);
  await db.delete(birds);
  console.log('✅ Cleared birds and vernacular_names\n');

  // Step 1: Parse CBRO 2025 CSV
  console.log('Parsing CBRO 2025...');
  const cbroPath = resolve(
    __dirname,
    '../../assets/data/spp_data_02_2025.csv'
  );
  const cbroContent = readFileSync(cbroPath, 'utf-8');
  const cbroRows = parseCSV(cbroContent);

  const cbroSpecies = new Map<string, CbroSpecies>();
  const cbroByScientific = new Map<string, CbroSpecies>();

  for (const row of cbroRows) {
    if (!row.species_code) continue;
    const sp: CbroSpecies = {
      cbroCode: row.cbro_code || '',
      speciesCode: row.species_code,
      nameSciCbro: row.nvt || '',
      namePtbr: row.name_ptbr || '',
      nameEnglish: row.name_english || '',
      order: row.order || '',
      family: row.family || '',
      genera: row.genera || '',
      species: row.species || '',
      status: row.status || '',
    };
    cbroSpecies.set(sp.speciesCode, sp);
    if (sp.nameSciCbro) {
      cbroByScientific.set(sp.nameSciCbro.toLowerCase(), sp);
    }
  }
  console.log(`  Found ${cbroSpecies.size} CBRO species\n`);

  // Step 2: Parse eBird taxonomy (alternate names file)
  console.log('Parsing eBird taxonomy (533k+ rows)...');
  const ebirdPath = resolve(
    __dirname,
    '../../birddata/eBird_Taxonomy_v2024_5-tab_5Sep2025a - Alternate Com_names.csv'
  );
  const ebirdContent = readFileSync(ebirdPath, 'utf-8');
  const ebirdLines = ebirdContent.split('\n').filter((l) => l.trim());
  const ebirdHeaders = parseCSVLine(ebirdLines[0]);

  // Collect unique species and their vernacular names
  const ebirdSpeciesMap = new Map<string, EbirdSpecies>();
  const ebirdVernaculars = new Map<string, VernacularEntry[]>(); // speciesCode -> entries

  // Set of CBRO species codes (we only want vernaculars for these)
  const cbroSpeciesCodes = new Set(cbroSpecies.keys());

  for (let i = 1; i < ebirdLines.length; i++) {
    const values = parseCSVLine(ebirdLines[i]);
    const row: Record<string, string> = {};
    for (let j = 0; j < ebirdHeaders.length; j++) {
      row[ebirdHeaders[j]] = values[j] || '';
    }

    if (row.category !== 'species') continue;

    const speciesCode = row.species_code;
    if (!speciesCode) continue;

    // Collect unique species
    if (!ebirdSpeciesMap.has(speciesCode)) {
      ebirdSpeciesMap.set(speciesCode, {
        speciesCode,
        sciName: row.sci_name,
        primaryComName: row.primary_com_name,
        taxonOrder: parseInt(row.taxon_order) || 0,
      });
    }

    // Collect vernacular names only for CBRO species
    if (cbroSpeciesCodes.has(speciesCode) && row.alternate_com_name) {
      if (!ebirdVernaculars.has(speciesCode)) {
        ebirdVernaculars.set(speciesCode, []);
      }
      ebirdVernaculars.get(speciesCode)!.push({
        speciesCode,
        language: row.locale_code,
        name: row.alternate_com_name,
        isPrimary: false,
        source: 'eBird',
      });
    }

    if (i % 100000 === 0) {
      console.log(`  Processed ${i}/${ebirdLines.length} lines...`);
    }
  }
  console.log(`  Found ${ebirdSpeciesMap.size} eBird species`);
  console.log(
    `  Found vernacular names for ${ebirdVernaculars.size} CBRO species\n`
  );

  // Step 3: Build birds list (all eBird + CBRO-only)
  console.log('Building birds list...');

  const allBirds: {
    speciesCode: string;
    cbroCode: string | null;
    nameSciCbro: string | null;
    nameSciEbird: string | null;
    taxonOrder: string | null;
    family: string | null;
    genera: string | null;
    species: string | null;
    status: string | null;
  }[] = [];

  // All eBird species
  for (const [code, ebird] of ebirdSpeciesMap) {
    const cbro = cbroSpecies.get(code);
    const parts = ebird.sciName.split(' ');
    allBirds.push({
      speciesCode: code,
      cbroCode: cbro?.cbroCode || null,
      nameSciCbro: cbro?.nameSciCbro || null,
      nameSciEbird: ebird.sciName,
      taxonOrder: cbro?.order || null,
      family: cbro?.family || null,
      genera: cbro?.genera || parts[0] || null,
      species: cbro?.species || parts[1] || null,
      status: cbro?.status || null,
    });
  }

  // CBRO species not in eBird
  let cbroOnly = 0;
  for (const [code, cbro] of cbroSpecies) {
    if (!ebirdSpeciesMap.has(code)) {
      cbroOnly++;
      allBirds.push({
        speciesCode: code,
        cbroCode: cbro.cbroCode,
        nameSciCbro: cbro.nameSciCbro,
        nameSciEbird: null,
        taxonOrder: cbro.order,
        family: cbro.family,
        genera: cbro.genera,
        species: cbro.species,
        status: cbro.status,
      });
    }
  }
  console.log(`  Total: ${allBirds.length} birds (${cbroOnly} CBRO-only)\n`);

  // Step 4: Insert birds in batches
  console.log('Inserting birds...');
  const batchSize = 500;
  let totalBirds = 0;

  for (let i = 0; i < allBirds.length; i += batchSize) {
    const batch = allBirds.slice(i, i + batchSize);
    await db.insert(birds).values(batch).onConflictDoNothing();
    totalBirds += batch.length;
    if ((i / batchSize) % 5 === 0) {
      console.log(`  Batch ${Math.floor(i / batchSize) + 1}: total ${totalBirds}`);
    }
  }
  console.log(`✅ Inserted ${totalBirds} birds\n`);

  // Step 5: Build vernacular names for CBRO species
  console.log('Building vernacular names for CBRO species...');
  const allNames: VernacularEntry[] = [];

  for (const [code, cbro] of cbroSpecies) {
    // Add English primary name from eBird
    const ebird = ebirdSpeciesMap.get(code);
    if (ebird) {
      allNames.push({
        speciesCode: code,
        language: 'en',
        name: ebird.primaryComName,
        isPrimary: true,
        source: 'eBird',
      });
    }

    // Add Portuguese name from CBRO
    if (cbro.namePtbr) {
      allNames.push({
        speciesCode: code,
        language: 'pt-BR',
        name: cbro.namePtbr,
        isPrimary: true,
        source: 'CBRO',
      });
    }

    // Add English name from CBRO (if different from eBird)
    if (cbro.nameEnglish && (!ebird || cbro.nameEnglish !== ebird.primaryComName)) {
      allNames.push({
        speciesCode: code,
        language: 'en',
        name: cbro.nameEnglish,
        isPrimary: false,
        source: 'CBRO',
      });
    }

    // Add all eBird vernacular names
    const ebirdNames = ebirdVernaculars.get(code) || [];
    allNames.push(...ebirdNames);
  }

  console.log(`  Total: ${allNames.length} vernacular names\n`);

  // Step 6: Insert vernacular names in batches
  console.log('Inserting vernacular names...');
  let totalNames = 0;

  for (let i = 0; i < allNames.length; i += batchSize) {
    const batch = allNames.slice(i, i + batchSize);
    await db.insert(vernacularNames).values(batch).onConflictDoNothing();
    totalNames += batch.length;
    if ((i / batchSize) % 20 === 0) {
      console.log(`  Batch ${Math.floor(i / batchSize) + 1}: total ${totalNames}`);
    }
  }
  console.log(`✅ Inserted ${totalNames} vernacular names\n`);

  // Summary
  console.log('=== SEED COMPLETE ===');
  console.log(`  Birds: ${totalBirds}`);
  console.log(`    - eBird species: ${ebirdSpeciesMap.size}`);
  console.log(`    - CBRO-only: ${cbroOnly}`);
  console.log(`  Vernacular names: ${totalNames}`);
  console.log(`    - For ${cbroSpecies.size} CBRO species`);
  console.log(`    - Languages: ${new Set(allNames.map((n) => n.language)).size}`);

  process.exit(0);
}

seedBirdsV2().catch((e) => {
  console.error('❌ Seed failed:', e);
  process.exit(1);
});
