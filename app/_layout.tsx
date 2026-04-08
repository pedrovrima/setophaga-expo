import React, { useEffect, useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Keyboard, useWindowDimensions } from 'react-native';
import { Stack, SplashScreen, router } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, Button, TamaguiProvider } from 'tamagui';

import { queryClient } from '~/queryClient';

import { tamaguiConfig } from '../tamagui.config';
import { ThemeProvider } from 'react-native-elements';
import Menu from '~/components/Menu';
import TopMenu from '~/components/TopMenu';
import { tokens as t } from '~/src/theme/tokens';

export function useLoadFonts() {
  const [interLoaded, interError] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  });

  return [interLoaded, interError];
}

// Error Boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('App Error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View flex={1} backgroundColor={t.colors.bg} justifyContent="center" alignItems="center" padding={t.spacing.screenX}>
          <Text fontSize={18} fontWeight="bold" color={t.colors.text} marginBottom={8}>
            Algo deu errado
          </Text>
          <Text color={t.colors.textMuted} textAlign="center" marginBottom={16}>
            Ocorreu um erro inesperado. Tente novamente.
          </Text>
          <Button
            borderRadius={t.radii.pill}
            backgroundColor={t.colors.primary}
            color={t.colors.textOnPrimary}
            onPress={() => {
              this.setState({ hasError: false });
              router.replace('/');
            }}>
            Voltar ao início
          </Button>
        </View>
      );
    }

    return this.props.children;
  }
}

export default function RootLayout() {
  const [interLoaded, interError] = useLoadFonts();

  useEffect(() => {
    if (interLoaded || interError) {
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
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const showBottomMenu = false;

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <TamaguiProvider config={tamaguiConfig}>
          <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
              <TopMenu />
              <Stack />
              <Menu show={showBottomMenu} />
            </QueryClientProvider>
          </ErrorBoundary>
        </TamaguiProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
