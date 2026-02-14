import { useQuery } from '@tanstack/react-query';

import { getSpeciesById } from '~/services/api';

export default function useSpeciesDetail(id: string | number | undefined) {
  const numericId = Number(id);
  const hasValidId = Number.isInteger(numericId) && numericId > 0;

  return useQuery({
    queryKey: ['species-detail', numericId],
    queryFn: ({ signal }) => getSpeciesById(numericId, signal),
    enabled: hasValidId,
    staleTime: 60_000,
  });
}
