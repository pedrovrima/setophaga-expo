import React, { useEffect, useState } from 'react';
import { AppState, Dimensions } from 'react-native';
import { Button, Image } from 'tamagui';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePathname, useLocalSearchParams } from 'expo-router';

import { supabase } from '../../app/db';
import { YStack } from 'tamagui';
import SignIn from '../SignIn';
import SignUp from '../SignUp';
import ForgotPassword from '../ForgotPassword';
import { tokens as t } from '~/src/theme/tokens';

AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

function AuthLayout({ children }: { children: React.ReactNode }) {
  const ScreenHeight = Dimensions.get('window').height;
  return (
    <YStack
      height={ScreenHeight}
      marginTop={t.spacing.screenTop}
      alignItems="center"
      justifyContent="flex-start"
      backgroundColor={t.colors.bg}
      gap="$8">
      <Image source={require('../../assets/logo.png')} height={48 * 2} width={140 * 2} />
      {children}
    </YStack>
  );
}

export default function Authentication() {
  const pathname = usePathname();
  const searchParams = useLocalSearchParams();
  const [type, setType] = useState('');

  useEffect(() => {
    const query = Object.entries(searchParams)
      .map(([k, v]) => `${k}=${v}`)
      .join('&');
    const fullPath = query ? `${pathname}?${query}` : pathname;
    AsyncStorage.setItem('authReturnPath', fullPath);
  }, [pathname, searchParams]);

  if (type === '') {
    return (
      <AuthLayout>
        <YStack gap="$4">
          <Button
            borderRadius={t.radii.button}
            color={t.colors.textOnPrimary}
            paddingHorizontal={24}
            paddingVertical={10}
            fontSize={14}
            fontWeight="bold"
            width="$20"
            backgroundColor={t.colors.primary}
            onPress={() => setType('signin')}>
            Entrar
          </Button>
          <Button
            borderRadius={t.radii.button}
            color={t.colors.textOnPrimary}
            paddingHorizontal={24}
            paddingVertical={10}
            fontSize={14}
            fontWeight="bold"
            width="$20"
            backgroundColor={t.colors.primary}
            onPress={() => setType('signup')}>
            Cadastrar
          </Button>
        </YStack>
      </AuthLayout>
    );
  }

  if (type === 'signin') {
    return (
      <AuthLayout>
        <SignIn setType={setType} />
      </AuthLayout>
    );
  }

  if (type === 'signup') {
    return (
      <AuthLayout>
        <SignUp setType={setType} />
      </AuthLayout>
    );
  }

  if (type === 'forgot-password') {
    return (
      <AuthLayout>
        <ForgotPassword setType={setType} />
      </AuthLayout>
    );
  }
}
