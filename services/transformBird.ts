export interface Bird {
  id: number;
  speciesCode: string;
  cbroCode: string | null;
  nameSciCbro: string | null;
  nameSciEbird: string | null;
  taxonOrder: string | null;
  family: string | null;
  genera: string | null;
  species: string | null;
  status: string | null;
  vernacularNames: VernacularName[];
  synonyms: SynonymWithRecords[];
}

export interface VernacularName {
  id: number;
  speciesCode: string;
  language: string;
  name: string;
  isPrimary: boolean | null;
  source: string | null;
}

export interface Synonym {
  id: string;
  name: string;
  birdId: number;
}

export interface SynonymRecord {
  id: string;
  synonymId: string;
  countryId: number | null;
  stateId: number | null;
  cityId: number | null;
  locationDescription: string | null;
  region: string | null;
  collectorId: string | null;
  collectorName: string | null;
  informant: string | null;
  observation: string | null;
  collectionDate: string | null;
  state?: { code: string; name: string } | null;
  city?: { name: string } | null;
}

export interface SynonymWithRecords extends Synonym {
  records: SynonymRecord[];
}

export interface BirdLegacy {
  id: number;
  cbro_code: string;
  nvt: string;
  name_ptbr: string;
  name_english: string;
  name_sci: string;
  status: string;
  list_type: string;
  category: string;
  order: string;
  family: string;
  genera: string;
  species: string;
  name_spanish: string;
  name_german: string;
  name_french: string;
  name_danish: string;
  name_dutch: string;
  name_estonian: string;
  name_finnish: string;
  name_hungarian: string;
  name_japanese: string;
  name_norwegian: string;
  name_polish: string;
  name_russian: string;
  name_slovak: string;
  name_swedish: string;
  synonyms: SynonymLegacy[];
}

export interface SynonymLegacy {
  id: string;
  name: string;
  bird_id: number;
  state: string;
  city: string;
  region: string;
  observation: string;
  informant: string;
  collector_id: string;
  collection_date: string;
}

export interface BirdWithSynonyms extends BirdLegacy {
  normalizedFields?: BirdWithSynonyms;
}

export enum Criteria {
  name_ptbr = 'name_ptbr',
  name_english = 'name_english',
  name_danish = 'name_danish',
  name_dutch = 'name_dutch',
  name_estonian = 'name_estonian',
  name_finnish = 'name_finnish',
  name_french = 'name_french',
  name_german = 'name_german',
  name_hungarian = 'name_hungarian',
  name_japanese = 'name_japanese',
  name_norwegian = 'name_norwegian',
  name_polish = 'name_polish',
  name_russian = 'name_russian',
  name_slovak = 'name_slovak',
  name_spanish = 'name_spanish',
  name_swedish = 'name_swedish',
}

export function getVernacularName(
  names: VernacularName[],
  language: string,
  source?: string
): string {
  const filtered = names.filter((name) => name.language === language);
  if (source) {
    const withSource = filtered.find((name) => name.source === source);
    if (withSource) return withSource.name;
  }

  const primary = filtered.find((name) => name.isPrimary);
  return primary?.name || filtered[0]?.name || '';
}

export function transformToLegacy(bird: Bird): BirdLegacy {
  const names = bird.vernacularNames || [];

  const legacySynonyms: SynonymLegacy[] = [];
  for (const synonym of bird.synonyms || []) {
    for (const record of synonym.records || []) {
      legacySynonyms.push({
        id: record.id,
        name: synonym.name,
        bird_id: bird.id,
        state: record.state?.code || '',
        city: record.city?.name || '',
        region: record.region || '',
        observation: record.observation || '',
        informant: record.informant || '',
        collector_id: record.collectorId || '',
        collection_date: record.collectionDate || '',
      });
    }
  }

  return {
    id: bird.id,
    cbro_code: bird.cbroCode || '',
    nvt: bird.speciesCode,
    name_sci: bird.nameSciCbro || bird.nameSciEbird || '',
    name_ptbr: getVernacularName(names, 'pt-BR', 'CBRO'),
    name_english: getVernacularName(names, 'en', 'eBird'),
    name_spanish: getVernacularName(names, 'es'),
    name_german: getVernacularName(names, 'de'),
    name_french: getVernacularName(names, 'fr'),
    name_danish: getVernacularName(names, 'da'),
    name_dutch: getVernacularName(names, 'nl'),
    name_estonian: getVernacularName(names, 'et'),
    name_finnish: getVernacularName(names, 'fi'),
    name_hungarian: getVernacularName(names, 'hu'),
    name_japanese: getVernacularName(names, 'ja'),
    name_norwegian: getVernacularName(names, 'no'),
    name_polish: getVernacularName(names, 'pl'),
    name_russian: getVernacularName(names, 'ru'),
    name_slovak: getVernacularName(names, 'sk'),
    name_swedish: getVernacularName(names, 'sv'),
    status: bird.status || '',
    list_type: '',
    category: '',
    order: bird.taxonOrder || '',
    family: bird.family || '',
    genera: bird.genera || '',
    species: bird.species || '',
    synonyms: legacySynonyms,
  };
}
