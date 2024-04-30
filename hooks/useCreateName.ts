import { useMutation } from '@tanstack/react-query';

import { createName } from '~/services/api';

export default function useCreateName() {
  const query = useMutation({
    mutationFn: createName,
  });

  return query;
}
