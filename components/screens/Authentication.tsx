import React, { useState } from 'react';
import { Alert, StyleSheet, View, AppState, Dimensions } from 'react-native';
import { Button, Input, Image, Label } from 'tamagui';

import { supabase } from '../../services/supabase';
import { YStack } from 'tamagui';
import SignIn from '../SignIn';
import SignUp from '../SignUp';

// Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. When this is added, you will continue to receive
// `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
// if the user's session is terminated. This should only be registered once.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export default function Authentication() {
  let ScreenHeight = Dimensions.get('window').height;

  const [type, setType] = useState('');

  if (type === '') {
    return (
      <YStack
        height={ScreenHeight}
        marginTop={60}
        alignItems="center"
        justifyContent="flex-start"
        backgroundColor={'#FFFBF7'}
        gap={'$8'}>
        <Image source={require('../../assets/logo.png')} height={48 * 2} width={140 * 2} />
        <YStack gap={'$4'}>
          <Button
            borderRadius="$12"
            color={'#FFF'}
            paddingHorizontal={24}
            paddingVertical={10}
            fontSize={14}
            fontWeight={'bold'}
            width={'$20'}
            backgroundColor="#6750A4"
            onPress={() => setType('signin')}>
            {' '}
            Entrar{' '}
          </Button>
          <Button
            borderRadius="$12"
            color={'#FFF'}
            paddingHorizontal={24}
            paddingVertical={10}
            fontSize={14}
            fontWeight={'bold'}
            width={'$20'}
            backgroundColor="#6750A4"
            onPress={() => setType('signup')}>
            {' '}
            Cadastrar{' '}
          </Button>
        </YStack>
      </YStack>
    );
  }

  if (type === 'signin') {
    return (
      <YStack
        height={ScreenHeight}
        marginTop={60}
        alignItems="center"
        justifyContent="flex-start"
        backgroundColor={'#FFFBF7'}
        gap={'$8'}>
        <Image source={require('../../assets/logo.png')} height={48 * 2} width={140 * 2} />
        <SignIn setType={setType} />
      </YStack>
    );
  }

  if (type === 'signup') {
    return (
      <YStack
        height={ScreenHeight}
        marginTop={60}
        alignItems="center"
        justifyContent="flex-start"
        backgroundColor={'#FFFBF7'}
        gap={'$8'}>
        <Image source={require('../../assets/logo.png')} height={48 * 2} width={140 * 2} />
        <SignUp setType={setType} />
      </YStack>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
});
