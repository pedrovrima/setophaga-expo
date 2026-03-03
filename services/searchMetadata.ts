export const languageDictionary = {
  name_ptbr: 'CBRO',
  synonyms: 'Nomes Populares',
  name_english: 'English',
  name_spanish: 'Español',
  name_danish: 'Dansk',
  name_dutch: 'Nederlands',
  name_estonian: 'Eesti',
  name_finnish: 'Suomi',
  name_french: 'Français',
  name_german: 'Deutsch',
  name_hungarian: 'Magyar',
  name_japanese: '日本語',
  name_norwegian: 'Norsk',
  name_polish: 'Polski',
  name_russian: 'Русский',
  name_slovak: 'Slovenčina',
  name_swedish: 'Svenska',
} as const;

export type SearchCriteria = keyof typeof languageDictionary;

export const searchCriteriaOrder: SearchCriteria[] = [
  'name_ptbr',
  'synonyms',
  'name_english',
  'name_spanish',
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
];

export type SearchResultItem = {
  id: string;
  primaryName: string;
  scientificName: string;
  language?: string;
  isCBRO?: boolean;
  matchType: 'exact' | 'partial' | 'scientific' | 'fuzzy';
};

export type SearchResults = SearchResultItem[];

export interface SearchResponse {
  query: string;
  total: number;
  results: SearchResults;
}
