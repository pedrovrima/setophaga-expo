import { and, asc, ilike, inArray, isNotNull, or, sql } from 'drizzle-orm';

import { db } from '~/db';
import { birds as birdsTable, synonyms, vernacularNames } from '~/db/schema';
import {
  languageDictionary,
  searchCriteriaOrder,
  type SearchCriteria,
  type SearchResponse,
  type SearchResultItem,
  type SearchResults,
} from '~/services/searchMetadata';
import { getVernacularName, type VernacularName } from '~/services/transformBird';

const MIN_QUERY_LENGTH = 3;
const DEFAULT_LIMIT = 120;
const MAX_LIMIT = 200;
const CANDIDATE_LIMIT = 160;

const criteriaLanguageMap: Record<
  Exclude<SearchCriteria, 'name_ptbr' | 'synonyms'>,
  [string, string?]
> = {
  name_english: ['en', 'eBird'],
  name_spanish: ['es'],
  name_danish: ['da'],
  name_dutch: ['nl'],
  name_estonian: ['et'],
  name_finnish: ['fi'],
  name_french: ['fr'],
  name_german: ['de'],
  name_hungarian: ['hu'],
  name_japanese: ['ja'],
  name_norwegian: ['no'],
  name_polish: ['pl'],
  name_russian: ['ru'],
  name_slovak: ['sk'],
  name_swedish: ['sv'],
};

const normalizeForSearch = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[-]/g, ' ')
    .replace(/[^a-z0-9]/gi, '')
    .toLowerCase();

const parseLimit = (value: string | null) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return DEFAULT_LIMIT;
  return Math.min(Math.max(Math.floor(numeric), 1), MAX_LIMIT);
};

const isUnaccentError = (error: unknown) => {
  const message = String((error as any)?.message || '').toLowerCase();
  return message.includes('function unaccent') || message.includes('unaccent(');
};

const buildCandidatesQueryWithUnaccent = (pattern: string) => {
  const vernacularSubquery = db
    .selectDistinct({ speciesCode: vernacularNames.speciesCode })
    .from(vernacularNames)
    .where(sql`unaccent(lower(${vernacularNames.name})) like unaccent(lower(${pattern}))`);

  const synonymsSubquery = db
    .selectDistinct({ birdId: synonyms.birdId })
    .from(synonyms)
    .where(sql`unaccent(lower(${synonyms.name})) like unaccent(lower(${pattern}))`);

  return db.query.birds.findMany({
    where: and(
      isNotNull(birdsTable.cbroCode),
      or(
        sql`unaccent(lower(coalesce(${birdsTable.nameSciCbro}, ''))) like unaccent(lower(${pattern}))`,
        sql`unaccent(lower(coalesce(${birdsTable.nameSciEbird}, ''))) like unaccent(lower(${pattern}))`,
        inArray(birdsTable.speciesCode, vernacularSubquery),
        inArray(birdsTable.id, synonymsSubquery)
      )
    ),
    columns: {
      id: true,
      nameSciCbro: true,
      nameSciEbird: true,
    },
    with: {
      vernacularNames: {
        columns: {
          id: true,
          speciesCode: true,
          language: true,
          name: true,
          isPrimary: true,
          source: true,
        },
      },
      synonyms: {
        columns: {
          id: true,
          name: true,
          birdId: true,
        },
      },
    },
    limit: CANDIDATE_LIMIT,
    orderBy: [asc(birdsTable.nameSciCbro), asc(birdsTable.id)],
  });
};

const buildCandidatesQueryFallback = (pattern: string) => {
  const vernacularSubquery = db
    .selectDistinct({ speciesCode: vernacularNames.speciesCode })
    .from(vernacularNames)
    .where(ilike(vernacularNames.name, pattern));

  const synonymsSubquery = db
    .selectDistinct({ birdId: synonyms.birdId })
    .from(synonyms)
    .where(ilike(synonyms.name, pattern));

  return db.query.birds.findMany({
    where: and(
      isNotNull(birdsTable.cbroCode),
      or(
        ilike(birdsTable.nameSciCbro, pattern),
        ilike(birdsTable.nameSciEbird, pattern),
        inArray(birdsTable.speciesCode, vernacularSubquery),
        inArray(birdsTable.id, synonymsSubquery)
      )
    ),
    columns: {
      id: true,
      nameSciCbro: true,
      nameSciEbird: true,
    },
    with: {
      vernacularNames: {
        columns: {
          id: true,
          speciesCode: true,
          language: true,
          name: true,
          isPrimary: true,
          source: true,
        },
      },
      synonyms: {
        columns: {
          id: true,
          name: true,
          birdId: true,
        },
      },
    },
    limit: CANDIDATE_LIMIT,
    orderBy: [asc(birdsTable.nameSciCbro), asc(birdsTable.id)],
  });
};

type CandidateBird = {
  id: number;
  scientificName: string;
  vernacularNames: VernacularName[];
  synonyms: Array<{ id: string; name: string; birdId: number }>;
};

const getCriterionMatch = (
  candidate: CandidateBird,
  criterion: SearchCriteria,
  normalizedQuery: string
): SearchResultItem | undefined => {
  if (criterion === 'synonyms') {
    const synonym = candidate.synonyms.find((item) =>
      normalizeForSearch(item.name).includes(normalizedQuery)
    );

    if (!synonym) return undefined;

    return {
      id: candidate.id,
      scientificName: candidate.scientificName,
      stringFound: synonym.name,
    };
  }

  if (criterion === 'name_ptbr') {
    const ptbr = getVernacularName(candidate.vernacularNames, 'pt-BR', 'CBRO');
    const scientific = candidate.scientificName;

    const ptbrMatch = normalizeForSearch(ptbr).includes(normalizedQuery);
    const scientificMatch = normalizeForSearch(scientific).includes(normalizedQuery);

    if (!ptbrMatch && !scientificMatch) return undefined;

    return {
      id: candidate.id,
      scientificName: candidate.scientificName,
      stringFound: ptbrMatch ? ptbr : scientific,
    };
  }

  const [language, source] = criteriaLanguageMap[criterion];
  const localizedName = getVernacularName(candidate.vernacularNames, language, source);

  if (!localizedName || !normalizeForSearch(localizedName).includes(normalizedQuery)) {
    return undefined;
  }

  return {
    id: candidate.id,
    scientificName: candidate.scientificName,
    stringFound: localizedName,
  };
};

const toSearchResponse = (
  query: string,
  candidates: CandidateBird[],
  resultLimit: number
): SearchResponse => {
  const normalizedQuery = normalizeForSearch(query);

  const results: SearchResults = [];
  let total = 0;

  for (const criterion of searchCriteriaOrder) {
    if (total >= resultLimit) break;

    const seenBirds = new Set<number>();
    const sectionMatches: SearchResultItem[] = [];

    for (const candidate of candidates) {
      const match = getCriterionMatch(candidate, criterion, normalizedQuery);
      if (!match || seenBirds.has(match.id) || !match.stringFound) continue;

      seenBirds.add(match.id);
      sectionMatches.push(match);

      if (total + sectionMatches.length >= resultLimit) break;
    }

    if (sectionMatches.length === 0) continue;

    results.push(languageDictionary[criterion]);
    for (const sectionMatch of sectionMatches) {
      if (total >= resultLimit) break;
      results.push(sectionMatch);
      total += 1;
    }
  }

  return {
    query,
    total,
    results,
  };
};

export const GET = async (request: Request): Promise<Response> => {
  const url = new URL(request.url);
  const query = (url.searchParams.get('q') || '').trim();
  const resultLimit = parseLimit(url.searchParams.get('limit'));

  if (query.length < MIN_QUERY_LENGTH) {
    return Response.json({
      query,
      total: 0,
      results: [] as SearchResults,
    } satisfies SearchResponse);
  }

  const pattern = `%${query}%`;

  try {
    let rows;

    try {
      rows = await buildCandidatesQueryWithUnaccent(pattern);
    } catch (error) {
      if (!isUnaccentError(error)) {
        throw error;
      }

      console.warn('unaccent extension is not available; using ilike fallback for search');
      rows = await buildCandidatesQueryFallback(pattern);
    }

    const candidates: CandidateBird[] = rows.map((row) => ({
      id: row.id,
      scientificName: row.nameSciCbro || row.nameSciEbird || '',
      vernacularNames: row.vernacularNames,
      synonyms: row.synonyms,
    }));

    const response = toSearchResponse(query, candidates, resultLimit);
    return Response.json(response);
  } catch (error: any) {
    console.error('Error searching species:', error);
    return Response.json({ error: error?.message }, { status: 500 });
  }
};
