import React, { useEffect, useState } from 'react';
import { TamaguiProvider } from '@tamagui/core';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { RootSiblingParent } from 'react-native-root-siblings';
import { Keyboard, Linking } from 'react-native';
import { Stack, SplashScreen, router } from 'expo-router';

import { queryClient } from '~/queryClient';

import { tamaguiConfig } from '../tamagui.config';
import { Icon, ThemeProvider } from 'react-native-elements';
import { PortalProvider } from 'tamagui';
import Menu from '~/components/Menu';

export function useLoadFonts() {
  const [interLoaded, interError] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  });

  return [interLoaded, interError];
}

export default function RootLayout() {
  const [interLoaded, interError] = useLoadFonts();

  useEffect(() => {
    if (interLoaded || interError) {
      // Hide the splash screen after the fonts have loaded (or an error was returned) and the UI is ready.
      SplashScreen.hideAsync();
    }
  }, [interLoaded, interError]);

  if (!interLoaded && !interError) {
    return null;
  }

  return <Layout />;
}

function Layout() {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const keyboardShowListener = Keyboard.addListener('keyboardDidShow', () => {
    setKeyboardVisible(true);
  });
  const keyboardHideListener = Keyboard.addListener('keyboardDidHide', () => {
    setKeyboardVisible(false);
  });

  return (
    <ThemeProvider>
      <TamaguiProvider config={tamaguiConfig}>
        <PortalProvider>
          <RootSiblingParent>
            <QueryClientProvider client={queryClient}>
              <Stack />
              <Menu show={!isKeyboardVisible} />
            </QueryClientProvider>
          </RootSiblingParent>
        </PortalProvider>
      </TamaguiProvider>
    </ThemeProvider>
  );
}
