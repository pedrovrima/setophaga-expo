import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '~/queryClient';
import '../global.css';

import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Stack />
    </QueryClientProvider>
  );
}
