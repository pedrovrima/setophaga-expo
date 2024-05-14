import { Session } from '@supabase/supabase-js';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useForm, Controller, set } from 'react-hook-form';
import { Dimensions, Alert } from 'react-native';
import { View, Input, XStack, YStack, Text, Button, H3, Label, Spinner } from 'tamagui';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import Select from '~/components/Select';
import Authentication from '~/components/screens/Authentication';
import useCreateName from '~/hooks/useCreateName';
import useSpeciesData from '~/hooks/useSpeciesData';
import { municipios } from '~/municipios.json';
import { supabase } from '~/services/supabase';
import { ScreenHeight } from 'react-native-elements/dist/helpers';
import { Icon } from 'react-native-elements';
import LoadingDialog from '~/components/LoadingDialog';
import { useQuery } from '@tanstack/react-query';

export default function Profile() {
  const speciesData = useSpeciesData();
  const { id } = useLocalSearchParams();
  const offlineData = useQuery({
    queryKey: ['offlineData'],
    queryFn: async () => {
      const data = await AsyncStorage.getItem('offlineData');
      if (!data) return [];

      return await JSON.parse(data);
    },
  });

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    AsyncStorage.getItem('session')
      .then((data) => {
        if (data) {
          setSession(JSON.parse(data || ''));
          setLoading(false);
        }
      })
      .catch((err) => {
        console.log(err);
      });

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        AsyncStorage.setItem('session', JSON.stringify(session));
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });
  }, []);

  const species = useSpeciesData();
  const thisSpp = species?.data?.find((spp) => '' + spp.Evaldo__c === id);
  const createNameMutations = useCreateName();
  const states = municipios.reduce((red: string[], mun) => {
    if (red.find((m) => m === mun['UF-sigla'])) {
      return red;
    }
    const uf = mun['UF-sigla'];
    return [...red, uf];
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    watch,
  } = useForm();

  // const cities = (state) =>
  //   states &&
  //   municipios.filter((mun) => mun['UF-sigla'] === state).map((mun) => mun['municipio-nome']);

  const onSubmit = async (data: any) => {
    if (navigator.onLine === false) {
      const dataToSave = {
        ...getValues(),
        id: thisSpp?.Id,
        collectorsId: session?.user.id,
        collectorsName:
          session?.user.user_metadata.firstName + ' ' + session?.user.user_metadata.lastName,
      };
      AsyncStorage.setItem(id, JSON.stringify(dataToSave)).then(() => {
        Alert.alert('Atenção', 'Dados salvos para envio posterior');
      });
    }

    const _data = {
      ...data,
      id: thisSpp?.Id,
      collectorsId: session?.user.id,
      collectorsName:
        session?.user.user_metadata.firstName + ' ' + session?.user.user_metadata.lastName,
    };

    const mutation = createNameMutations.mutate(_data);
  };

  useEffect(() => {
    async function getOfflineData() {
      const dadosSalvos = await AsyncStorage.getItem('offlineData');
      console.log(dadosSalvos);
    }
    getOfflineData();
  }, []);

  return (
    <View marginBottom={80} backgroundColor={'#FFFBF7'} paddingTop={60} paddingHorizontal={12}>
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
          Perfil{' '}
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
            <YStack marginTop={'$8'}>
              <H3>Dados Salvos</H3>
              {offlineData.isLoading || speciesData.isLoading ? (
                <Spinner />
              ) : offlineData?.data?.length > 0 ? (
                <>
                  {offlineData?.data?.map((value) => {
                    return (
                      <YStack key={value.name} marginTop={'$4'}>
                        <Text>
                          Espécie: {speciesData.data.find((spp) => spp.Id === value.id)?.NVP__c}
                        </Text>
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
                              const data = {
                                ...value,
                                collectorsId: session?.user.id,
                                collectorsName:
                                  session?.user.user_metadata.firstName +
                                  ' ' +
                                  session?.user.user_metadata.lastName,
                              };
                              createNameMutations.mutate(data, {
                                onSuccess: async (response, vara, t) => {
                                  if (response.status === 409) {
                                    Alert.alert('Erro', 'Nome já cadastrado para este municipio');
                                    return;
                                  }
                                  const fitlered = offlineData.data.filter(
                                    (v) => v.name !== value.name
                                  );

                                  Alert.alert('Sucesso', 'Nome cadasrtado com sucesso');

                                  AsyncStorage.setItem('offlineData', JSON.stringify(fitlered));
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
                            onPress={() => {
                              const fitlered = offlineData.data.filter(
                                (v) => v.name !== value.name
                              );
                              AsyncStorage.setItem('offlineData', JSON.stringify(fitlered));
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
            <YStack marginTop={'$8'}>
              <H3>Ficha Técnia</H3>
              <Text>Idealizado por: Guto Carvalho</Text>
              <Text>Desenvolvimento: Evaldo Césari e Pedro Martins</Text>
              <Text>Design: Julia Morena e Pedro Martins</Text>
            </YStack>
          </YStack>
        ) : (
          <Authentication />
        )}
      </KeyboardAwareScrollView>
    </View>
  );
}

const ErrorText = ({ children }: { children: React.ReactNode }) => {
  return <Text color={'red'}>{children}</Text>;
};
