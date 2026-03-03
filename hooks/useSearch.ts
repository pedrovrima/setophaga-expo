import { useEffect, useMemo, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { searchSpecies } from '~/services/api';
import type { SearchResponse, SearchResultItem, SearchResults } from '~/services/searchMetadata';

const SEARCH_DEBOUNCE_MS = 250;
const MIN_QUERY_LENGTH = 3;

const useDebouncedValue = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timeout);
  }, [value, delay]);

  return debouncedValue;
};

const mergeResults = (
  tier1?: SearchResponse,
  tier2?: SearchResponse,
  tier3?: SearchResponse
): SearchResults => {
  const seenIds = new Set<string>();
  const merged: SearchResults = [];

  for (const tierData of [tier1, tier2, tier3]) {
    if (!tierData) continue;

    for (const item of tierData.results) {
      if (!seenIds.has(item.id)) {
        seenIds.add(item.id);
        merged.push(item);
      }
    }
  }

  return merged;
};

export default function useSearch(term: string) {
  const normalizedTerm = term.trim();
  const debouncedTerm = useDebouncedValue(normalizedTerm, SEARCH_DEBOUNCE_MS);
  const enabled = debouncedTerm.length >= MIN_QUERY_LENGTH;

  const tier1 = useQuery({
    queryKey: ['species-search', debouncedTerm, 1],
    queryFn: ({ signal }) => searchSpecies(debouncedTerm, 1, signal),
    enabled,
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });

  const tier2 = useQuery({
    queryKey: ['species-search', debouncedTerm, 2],
    queryFn: ({ signal }) => searchSpecies(debouncedTerm, 2, signal),
    enabled: enabled && tier1.isSuccess,
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });

  const tier3 = useQuery({
    queryKey: ['species-search', debouncedTerm, 3],
    queryFn: ({ signal }) => searchSpecies(debouncedTerm, 3, signal),
    enabled: enabled && tier2.isSuccess,
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });

  const results = useMemo(
    () => mergeResults(tier1.data, tier2.data, tier3.data),
    [tier1.data, tier2.data, tier3.data]
  );

  const total = results.length;

  const isDebouncing = normalizedTerm !== debouncedTerm;

  return {
    data: {
      query: debouncedTerm,
      total,
      results,
    } satisfies SearchResponse,
    isLoading: tier1.isLoading,
    isFetching: tier1.isFetching || tier2.isFetching || tier3.isFetching,
    isPending: isDebouncing || tier1.isFetching,
    isSuccess: tier1.isSuccess,
    isError: tier1.isError || tier2.isError || tier3.isError,
    error: tier1.error || tier2.error || tier3.error,
  };
}
