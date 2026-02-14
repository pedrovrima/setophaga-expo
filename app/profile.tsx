import { Session } from '@supabase/supabase-js';
import { Stack, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { XStack, YStack, Text, Button, H3, Spinner, Image, ScrollView } from 'tamagui';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import Authentication from '~/components/screens/Authentication';
import useCreateName from '~/hooks/useCreateName';
import { supabase } from '~/app/db';
import { ScreenHeight, ScreenWidth } from 'react-native-elements/dist/helpers';
import { Icon } from 'react-native-elements';
import LoadingDialog from '~/components/LoadingDialog';
import { useQuery } from '@tanstack/react-query';
import { getSpeciesById } from '~/services/api';

type OfflineRecord = {
  id: number;
  name: string;
  state: string;
  city: string;
  location: string;
  informer: string;
  observation?: string;
};

export default function Profile() {
  const offlineData = useQuery<OfflineRecord[]>({
    queryKey: ['offlineData'],
    queryFn: async () => {
      const data = await AsyncStorage.getItem('offlineData');
      if (!data) return [];

      return JSON.parse(data);
    },
  });

  const offlineSpeciesNames = useQuery<Record<number, string>>({
    queryKey: [
      'offline-species-names',
      (offlineData.data || [])
        .map((item) => Number(item.id))
        .filter((value) => Number.isInteger(value))
        .sort((left, right) => left - right)
        .join(','),
    ],
    enabled: !!offlineData.data?.length,
    queryFn: async () => {
      const ids = Array.from(
        new Set((offlineData.data || []).map((item) => Number(item.id)))
      ).filter((value) => Number.isInteger(value) && value > 0);

      const names = await Promise.all(
        ids.map(async (speciesId) => {
          try {
            const species = await getSpeciesById(speciesId);
            const label = species.name_ptbr || species.name_sci || `ID ${speciesId}`;
            return [speciesId, label] as const;
          } catch {
            return [speciesId, `ID ${speciesId}`] as const;
          }
        })
      );

      return Object.fromEntries(names);
    },
  });

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    AsyncStorage.getItem('session')
      .then((data) => {
        if (data) {
          setSession(JSON.parse(data));
          setLoading(false);
        }
      })
      .catch((error) => {
        console.log(error);
      });

    supabase.auth
      .getSession()
      .then(({ data: { session } }: { data: { session: Session | null } }) => {
        setSession(session);
        AsyncStorage.setItem('session', JSON.stringify(session));
        setLoading(false);
      })
      .catch((error: unknown) => {
        console.log(error);
        setLoading(false);
      });

    supabase.auth.onAuthStateChange((_event: string, currentSession: Session | null) => {
      setSession(currentSession);
      setLoading(false);
    });
  }, []);

  const createNameMutations = useCreateName();

  return (
    <ScrollView backgroundColor={'#FFFBF7'} paddingTop={60} paddingHorizontal={12}>
      <LoadingDialog loading={createNameMutations.isPending} />
      <Stack.Screen options={{ headerShown: false }} />

      <XStack gap={16}>
        <Icon
          style={{ flex: 1 }}
          name="arrow-back"
          type="material"
          color="#6750A4"
          onPress={() => router.back()}
        />
        <Text flex={2} wordWrap="normal" fontSize={22}>
          Perfil
        </Text>
      </XStack>

      <KeyboardAwareScrollView scrollEnabled={false}>
        {session?.user.id || loading ? (
          <YStack height={ScreenHeight}>
            <H3 marginTop={'$8'}>Usuário</H3>

            <Text>
              Nome:{' '}
              {`${session?.user.user_metadata.firstName} ${session?.user.user_metadata.lastName}`}
            </Text>
            <Text>Email: {session?.user.email}</Text>
            <Button
              marginTop={'$4'}
              borderRadius={'$12'}
              backgroundColor={'#6750A4'}
              color={'white'}
              onPress={() => {
                supabase.auth.signOut();
                AsyncStorage.removeItem('session');
              }}>
              Sair
            </Button>

            <YStack marginTop={'$8'} marginBottom={'$8'}>
              <H3>Dados Salvos</H3>
              {offlineData.isPending || offlineSpeciesNames.isPending ? (
                <Spinner />
              ) : offlineData.data && offlineData.data.length > 0 ? (
                <>
                  {offlineData.data.map((value) => {
                    const speciesLabel =
                      offlineSpeciesNames.data?.[Number(value.id)] || `ID ${value.id}`;

                    return (
                      <YStack key={`${value.id}-${value.name}-${value.city}`} marginTop={'$4'}>
                        <Text>Espécie: {speciesLabel}</Text>
                        <Text>Nome: {value.name}</Text>
                        <Text>Estado: {value.state}</Text>
                        <Text>Cidade: {value.city}</Text>
                        <Text>Local: {value.location}</Text>
                        <Text>Quem Informou: {value.informer}</Text>
                        <XStack alignItems="center" marginTop={'$4'} gap={'$4'}>
                          <Button
                            borderRadius={'$12'}
                            backgroundColor={'#6750A4'}
                            color={'white'}
                            width={'$10'}
                            onPress={async () => {
                              const payload = {
                                ...value,
                                collectorsId: session?.user.id,
                                collectorsName: `${session?.user.user_metadata.firstName} ${session?.user.user_metadata.lastName}`,
                              };

                              createNameMutations.mutate(payload, {
                                onSuccess: async (response) => {
                                  if (response.status === 409) {
                                    Alert.alert('Erro', 'Nome já cadastrado para este municipio');
                                    return;
                                  }

                                  const filtered = (offlineData.data || []).filter(
                                    (item) => item.name !== value.name
                                  );

                                  Alert.alert('Sucesso', 'Nome cadastrado com sucesso');
                                  await AsyncStorage.setItem(
                                    'offlineData',
                                    JSON.stringify(filtered)
                                  );
                                  offlineData.refetch();
                                },
                                onError: (error) => {
                                  console.log(error);
                                },
                              });
                            }}>
                            Enviar
                          </Button>

                          <Button
                            borderRadius={'$12'}
                            borderColor={'#6750A4'}
                            color={'#6750A4'}
                            backgroundColor={'transparent'}
                            width={'$10'}
                            onPress={async () => {
                              const filtered = (offlineData.data || []).filter(
                                (item) => item.name !== value.name
                              );
                              await AsyncStorage.setItem('offlineData', JSON.stringify(filtered));
                              offlineData.refetch();
                            }}>
                            Apagar
                          </Button>
                        </XStack>
                      </YStack>
                    );
                  })}
                </>
              ) : (
                <Text>Nenhum dado salvo</Text>
              )}
            </YStack>

            <YStack>
              <H3>Ficha Técnia</H3>

              <YStack paddingHorizontal={20} gap="$1" alignItems="flex-start" width={ScreenWidth}>
                <Text marginBottom="0">Realização</Text>
                <XStack
                  alignItems="center"
                  justifyContent="space-around"
                  gap={'$2'}
                  marginBottom={'$4'}>
                  <Image source={require('../assets/avistar.png')} height={50} width={100} />
                  <Image source={require('../assets/oama.png')} height={50} width={90} />
                  <Image source={require('../assets/evaldo.png')} height={60} width={60} />
                </XStack>
              </YStack>
              <Text>Idealizado por: Guto Carvalho</Text>
              <Text>Desenvolvimento: Evaldo Césari e Pedro Martins</Text>
              <Text>Design: Julia Morena e Pedro Martins</Text>
            </YStack>
          </YStack>
        ) : (
          <Authentication />
        )}
      </KeyboardAwareScrollView>
    </ScrollView>
  );
}
