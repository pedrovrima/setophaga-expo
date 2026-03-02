import { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';
import { YStack, Image, Text, Spinner } from 'tamagui';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '~/app/db';

export default function AuthCallbackPage() {
  const router = useRouter();
  const ScreenHeight = Dimensions.get('window').height;
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleCallback() {
      try {
        const hash = window.location.hash;
        const params = new URLSearchParams(hash.substring(1));
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');

        if (!access_token || !refresh_token) {
          setError('Link inválido ou expirado.');
          setTimeout(() => router.replace('/'), 2000);
          return;
        }

        const { error: sessionError } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });

        if (sessionError) {
          setError('Erro ao confirmar conta. Tente fazer login manualmente.');
          setTimeout(() => router.replace('/'), 2000);
          return;
        }

        const returnPath = await AsyncStorage.getItem('authReturnPath');
        if (returnPath) {
          await AsyncStorage.removeItem('authReturnPath');
          router.replace(returnPath as any);
        } else {
          router.replace('/');
        }
      } catch {
        setError('Erro inesperado. Redirecionando...');
        setTimeout(() => router.replace('/'), 2000);
      }
    }

    handleCallback();
  }, []);

  return (
    <YStack
      height={ScreenHeight}
      marginTop={60}
      alignItems="center"
      justifyContent="flex-start"
      backgroundColor={'#FFFBF7'}
      gap={'$8'}>
      <Image source={require('../assets/logo.png')} height={48 * 2} width={140 * 2} />
      {error ? (
        <Text color="red" textAlign="center">
          {error}
        </Text>
      ) : (
        <YStack alignItems="center" gap={'$4'}>
          <Spinner size="large" color="#6750A4" />
          <Text color="#49454F">Confirmando sua conta...</Text>
        </YStack>
      )}
    </YStack>
  );
}
