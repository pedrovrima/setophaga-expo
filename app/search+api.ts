import { and, asc, ilike, inArray, isNotNull, isNull, ne, or, sql } from 'drizzle-orm';

import { db } from '~/db';
import { birds as birdsTable, synonyms, vernacularNames } from '~/db/schema';
import {
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

type Tier = 1 | 2 | 3;

const tierCriteria: Record<Tier, SearchCriteria[]> = {
  1: ['name_ptbr'],
  2: ['synonyms', 'name_english', 'name_spanish'],
  3: [
    'name_danish',
    'name_dutch',
    'name_estonian',
    'name_finnish',
    'name_french',
    'name_german',
    'name_hungarian',
    'name_japanese',
    'name_norwegian',
    'name_polish',
    'name_russian',
    'name_slovak',
    'name_swedish',
  ],
};

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

const tierLanguages: Record<Tier, string[]> = {
  1: ['pt-BR'],
  2: ['en', 'es'],
  3: ['da', 'nl', 'et', 'fi', 'fr', 'de', 'hu', 'ja', 'no', 'pl', 'ru', 'sk', 'sv'],
};

const normalizeForSearch = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[-]/g, ' ')
    .replace(/[^a-z0-9]/gi, '')
    .toLowerCase();

const getTextMatchType = (
  value: string,
  normalizedQuery: string
): SearchResultItem['matchType'] => {
  const normalizedValue = normalizeForSearch(value);
  return normalizedValue === normalizedQuery ? 'exact' : 'partial';
};

const getMatchPosition = (value: string, normalizedQuery: string) =>
  normalizeForSearch(value).indexOf(normalizedQuery);

const parseLimit = (value: string | null) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return DEFAULT_LIMIT;
  return Math.min(Math.max(Math.floor(numeric), 1), MAX_LIMIT);
};

const parseTier = (value: string | null): Tier => {
  const numeric = Number(value);
  if (numeric === 1 || numeric === 2 || numeric === 3) return numeric;
  return 1;
};

const isUnaccentError = (error: unknown) => {
  const message = String((error as any)?.message || '').toLowerCase();
  return (
    message.includes('function unaccent') ||
    message.includes('unaccent(') ||
    message.includes('immutable_unaccent')
  );
};

const buildCandidatesQueryWithUnaccent = (pattern: string, tier: Tier) => {
  const conditions = [];

  // Scientific name search only in tier 1
  if (tier === 1) {
    conditions.push(
      sql`immutable_unaccent(lower(coalesce(${birdsTable.nameSciCbro}, ''))) like immutable_unaccent(lower(${pattern}))`,
      sql`immutable_unaccent(lower(coalesce(${birdsTable.nameSciEbird}, ''))) like immutable_unaccent(lower(${pattern}))`
    );
  }

  // Vernacular names filtered by tier languages
  const languages = tierLanguages[tier];
  if (languages.length > 0) {
    const vernacularSubquery = db
      .selectDistinct({ speciesCode: vernacularNames.speciesCode })
      .from(vernacularNames)
      .where(
        and(
          inArray(vernacularNames.language, languages),
          sql`immutable_unaccent(lower(${vernacularNames.name})) like immutable_unaccent(lower(${pattern}))`
        )
      );
    conditions.push(inArray(birdsTable.speciesCode, vernacularSubquery));
  }

  // Synonyms only in tier 2
  if (tier === 2) {
    const synonymsSubquery = db
      .selectDistinct({ birdId: synonyms.birdId })
      .from(synonyms)
      .where(
        and(
          sql`immutable_unaccent(lower(${synonyms.name})) like immutable_unaccent(lower(${pattern}))`,
          or(isNull(synonyms.status), ne(synonyms.status, 'rejected'))
        )
      );
    conditions.push(inArray(birdsTable.id, synonymsSubquery));
  }

  return db.query.birds.findMany({
    where: and(isNotNull(birdsTable.cbroCode), or(...conditions)),
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
        where: or(isNull(synonyms.status), ne(synonyms.status, 'rejected')),
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

const buildCandidatesQueryFallback = (pattern: string, tier: Tier) => {
  const conditions = [];

  if (tier === 1) {
    conditions.push(
      ilike(birdsTable.nameSciCbro, pattern),
      ilike(birdsTable.nameSciEbird, pattern)
    );
  }

  const languages = tierLanguages[tier];
  if (languages.length > 0) {
    const vernacularSubquery = db
      .selectDistinct({ speciesCode: vernacularNames.speciesCode })
      .from(vernacularNames)
      .where(and(inArray(vernacularNames.language, languages), ilike(vernacularNames.name, pattern)));
    conditions.push(inArray(birdsTable.speciesCode, vernacularSubquery));
  }

  if (tier === 2) {
    const synonymsSubquery = db
      .selectDistinct({ birdId: synonyms.birdId })
      .from(synonyms)
      .where(
        and(
          ilike(synonyms.name, pattern),
          or(isNull(synonyms.status), ne(synonyms.status, 'rejected'))
        )
      );
    conditions.push(inArray(birdsTable.id, synonymsSubquery));
  }

  return db.query.birds.findMany({
    where: and(isNotNull(birdsTable.cbroCode), or(...conditions)),
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
        where: or(isNull(synonyms.status), ne(synonyms.status, 'rejected')),
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

type RankedSearchMatch = {
  candidateId: number;
  item: SearchResultItem;
  matchPosition: number;
};

const getCriterionMatch = (
  candidate: CandidateBird,
  criterion: SearchCriteria,
  normalizedQuery: string
): RankedSearchMatch | undefined => {
  const ptbrName = getVernacularName(candidate.vernacularNames, 'pt-BR', 'CBRO') || undefined;
  if (criterion === 'synonyms') {
    const synonym = candidate.synonyms.find((item) =>
      normalizeForSearch(item.name).includes(normalizedQuery)
    );

    if (!synonym) return undefined;

    return {
      candidateId: candidate.id,
      matchPosition: getMatchPosition(synonym.name, normalizedQuery),
      item: {
        id: String(candidate.id),
        primaryName: synonym.name,
        scientificName: candidate.scientificName,
        ptbrName,
        language: 'pt',
        isCBRO: false,
        matchType: getTextMatchType(synonym.name, normalizedQuery),
      },
    };
  }

  if (criterion === 'name_ptbr') {
    const scientific = candidate.scientificName;
    const ptbr = ptbrName || '';

    const ptbrMatch = normalizeForSearch(ptbr).includes(normalizedQuery);
    const scientificMatch = normalizeForSearch(scientific).includes(normalizedQuery);

    if (!ptbrMatch && !scientificMatch) return undefined;

    if (ptbrMatch) {
      return {
        candidateId: candidate.id,
        matchPosition: getMatchPosition(ptbr, normalizedQuery),
        item: {
          id: String(candidate.id),
          primaryName: ptbr,
          scientificName: candidate.scientificName,
          ptbrName,
          language: 'pt',
          isCBRO: true,
          matchType: getTextMatchType(ptbr, normalizedQuery),
        },
      };
    }

    return {
      candidateId: candidate.id,
      matchPosition: getMatchPosition(scientific, normalizedQuery),
      item: {
        id: String(candidate.id),
        primaryName: scientific,
        scientificName: candidate.scientificName,
        ptbrName,
        isCBRO: true,
        matchType: 'scientific',
      },
    };
  }

  const [language, source] = criteriaLanguageMap[criterion];
  const localizedName = getVernacularName(candidate.vernacularNames, language, source);

  if (!localizedName || !normalizeForSearch(localizedName).includes(normalizedQuery)) {
    return undefined;
  }

  return {
    candidateId: candidate.id,
    matchPosition: getMatchPosition(localizedName, normalizedQuery),
    item: {
      id: String(candidate.id),
      primaryName: localizedName,
      scientificName: candidate.scientificName,
      ptbrName,
      language,
      isCBRO: false,
      matchType: getTextMatchType(localizedName, normalizedQuery),
    },
  };
};

const compareRankedMatches = (left: RankedSearchMatch, right: RankedSearchMatch) => {
  if (left.matchPosition !== right.matchPosition) {
    return left.matchPosition - right.matchPosition;
  }

  if (left.item.matchType === 'exact' && right.item.matchType !== 'exact') {
    return -1;
  }

  if (left.item.matchType !== 'exact' && right.item.matchType === 'exact') {
    return 1;
  }

  if (left.item.primaryName.length !== right.item.primaryName.length) {
    return left.item.primaryName.length - right.item.primaryName.length;
  }

  const primaryNameComparison = left.item.primaryName.localeCompare(right.item.primaryName, 'pt-BR');
  if (primaryNameComparison !== 0) {
    return primaryNameComparison;
  }

  const scientificNameComparison = left.item.scientificName.localeCompare(
    right.item.scientificName,
    'pt-BR'
  );
  if (scientificNameComparison !== 0) {
    return scientificNameComparison;
  }

  return left.candidateId - right.candidateId;
};

const toSearchResponse = (
  query: string,
  candidates: CandidateBird[],
  resultLimit: number,
  criteria: SearchCriteria[]
): SearchResponse => {
  const normalizedQuery = normalizeForSearch(query);

  const results: SearchResults = [];
  const seenBirds = new Set<number>();

  outer:
  for (const criterion of criteria) {
    const rankedMatches = candidates
      .filter((candidate) => !seenBirds.has(candidate.id))
      .map((candidate) => getCriterionMatch(candidate, criterion, normalizedQuery))
      .filter((match): match is RankedSearchMatch => Boolean(match))
      .sort(compareRankedMatches);

    for (const match of rankedMatches) {
      if (results.length >= resultLimit) break outer;
      if (!match.item.primaryName || seenBirds.has(match.candidateId)) continue;

      seenBirds.add(match.candidateId);
      results.push(match.item);
    }
  }

  return {
    query,
    total: results.length,
    results,
  };
};

export const GET = async (request: Request): Promise<Response> => {
  const url = new URL(request.url);
  const query = (url.searchParams.get('q') || '').trim();
  const resultLimit = parseLimit(url.searchParams.get('limit'));
  const tier = parseTier(url.searchParams.get('tier'));

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
      rows = await buildCandidatesQueryWithUnaccent(pattern, tier);
    } catch (error) {
      if (!isUnaccentError(error)) {
        throw error;
      }

      console.warn('immutable_unaccent not available; using ilike fallback for search');
      rows = await buildCandidatesQueryFallback(pattern, tier);
    }

    const candidates: CandidateBird[] = rows.map((row) => ({
      id: row.id,
      scientificName: row.nameSciCbro || row.nameSciEbird || '',
      vernacularNames: row.vernacularNames,
      synonyms: row.synonyms,
    }));

    const criteria = tierCriteria[tier];
    const response = toSearchResponse(query, candidates, resultLimit, criteria);
    return Response.json(response);
  } catch (error: any) {
    console.error('Error searching species:', error);
    return Response.json({ error: error?.message }, { status: 500 });
  }
};
