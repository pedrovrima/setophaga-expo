import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '~/queryClient';
import '../global.css';

import { Stack } from 'expo-router';
import { ThemeProvider } from 'react-native-elements';

export default function Layout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Stack />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
