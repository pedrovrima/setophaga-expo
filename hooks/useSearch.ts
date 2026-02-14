import { useEffect, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { searchSpecies } from '~/services/api';

const SEARCH_DEBOUNCE_MS = 250;

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

export default function useSearch(term: string) {
  const normalizedTerm = term.trim();
  const debouncedTerm = useDebouncedValue(normalizedTerm, SEARCH_DEBOUNCE_MS);

  return useQuery({
    queryKey: ['species-search', debouncedTerm],
    queryFn: ({ signal }) => searchSpecies(debouncedTerm, signal),
    enabled: debouncedTerm.length >= 3,
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });
}
