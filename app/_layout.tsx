import { config } from '@tamagui/config/v3';
import { TamaguiProvider, createTamagui } from '@tamagui/core';
import { QueryClientProvider } from '@tanstack/react-query';

import { ThemeProvider } from 'react-native-elements';
import { Stack } from 'expo-router';

import { queryClient } from '~/queryClient';

// you usually export this from a tamagui.config.ts file
const tamaguiConfig = createTamagui(config);

// make TypeScript type everything based on your config
type Conf = typeof tamaguiConfig;
declare module '@tamagui/core' {
  interface TamaguiCustomConfig extends Conf {}
}

export default function Layout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TamaguiProvider config={tamaguiConfig}>
          <Stack />
        </TamaguiProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
