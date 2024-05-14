import { Session } from '@supabase/supabase-js';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { useForm, Controller, set } from 'react-hook-form';
import { Dimensions, Alert } from 'react-native';
import { View, Input, XStack, YStack, Text, Button, H3, Label } from 'tamagui';
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

const stateCities = municipios.reduce((red: {}, mun) => {
  if (red[mun['UF-sigla']]) {
    red[mun['UF-sigla']].push(mun['municipio-nome']);
  } else {
    red[mun['UF-sigla']] = [mun['municipio-nome']];
  }
  return red;
}, {});

export default function Details() {
  const { id } = useLocalSearchParams();
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
  const onSubmit = async (data: any) => {
    // try {
    //   const status = await getNetworkStateAsync();
    //   console.log(status, 'status');
    // } catch (e) {
    //   console.log(e);
    // }

    const dataToSave = {
      ...getValues(),
      id: thisSpp?.Id,
      collectorsId: session?.user.id,
      collectorsName:
        session?.user.user_metadata.firstName + ' ' + session?.user.user_metadata.lastName,
    };

    // AsyncStorage.getItem('offlineData').then((data) => {
    //   const offlineData = data ? JSON.parse(data) : [];
    //   AsyncStorage.setItem('offlineData', JSON.stringify([...offlineData, dataToSave]));
    // });

    const _data = {
      ...data,
      id: thisSpp?.Id,
      collectorsId: session?.user.id,
      collectorsName:
        session?.user.user_metadata.firstName + ' ' + session?.user.user_metadata.lastName,
    };

    const mutation = createNameMutations.mutate(_data);
  };

  useEffect(() => {}, [createNameMutations.isError]);

  useEffect(() => {
    if (createNameMutations.data?.status === 409) {
      Alert.alert('Erro', 'Nome já cadastrado para este municipio');
    } else {
      createNameMutations.isSuccess && router.replace(`/spp/${id}?querySuccess=true`);
    }
  }, [createNameMutations.isSuccess]);

  return (
    <View backgroundColor={'#FFFBF7'} paddingTop={60} paddingHorizontal={12}>
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
          Cadastrar sinônimo
        </Text>
      </XStack>
      <KeyboardAwareScrollView scrollEnabled={false}>
        {session?.user.id || loading ? (
          <YStack
            height={ScreenHeight}
            gap="$4"
            paddingVertical="$4"
            maxWidth={700}
            marginHorizontal="$4">
            <LoadingDialog loading={loading} />
            <YStack>
              <Text fontWeight="bold" textTransform="uppercase">
                Nome Científico
              </Text>
              <Text fontStyle="italic">{thisSpp?.Name}</Text>
            </YStack>
            <YStack>
              <Text fontWeight="bold" textTransform="uppercase">
                CBRO
              </Text>
              <Text>{thisSpp?.NVP__c}</Text>
            </YStack>
            {/* Form Girdileri */}
            <YStack>
              <Controller
                control={control}
                defaultValue={''}
                render={({ field }) => (
                  <View position="relative">
                    <Input
                      borderColor={'#79747E'}
                      {...field}
                      placeholder="Escreva o termo que deseja cadastrar"
                      onChangeText={field.onChange}
                      paddingVertical={12}
                      paddingLeft={16}
                      backgroundColor={'transparent'}
                      placeholderTextColor={'#1D1B20'}
                    />
                    <Text
                      position="absolute"
                      top={-8}
                      left={12}
                      fontSize={12}
                      color={'#49454F'}
                      backgroundColor={'#FEF7FF'}>
                      Termo
                    </Text>
                  </View>
                )}
                name="name"
                rules={{ required: 'Obrigatório' }}
              />
              {errors.name && <ErrorText>{errors?.name?.message as string}</ErrorText>}
            </YStack>
            <YStack>
              <Controller
                control={control}
                defaultValue={''}
                render={({ field }) => (
                  <View position="relative">
                    <Input
                      borderColor={'#79747E'}
                      {...field}
                      placeholder="Qual a origem do nome?"
                      onChangeText={field.onChange}
                      paddingVertical={12}
                      paddingLeft={16}
                      backgroundColor={'transparent'}
                      placeholderTextColor={'#1D1B20'}
                    />
                    <Text
                      position="absolute"
                      top={-8}
                      left={12}
                      fontSize={12}
                      color={'#49454F'}
                      backgroundColor={'#FEF7FF'}>
                      Quem falou?
                    </Text>
                  </View>
                )}
                name="informer"
                rules={{ required: 'Obrigatório' }}
              />
              {errors.informer && <ErrorText>{errors?.informer?.message as string}</ErrorText>}
            </YStack>
            <YStack>
              <Controller
                control={control}
                defaultValue={''}
                render={({ field }) => (
                  <Select
                    {...field}
                    label={'Estado'}
                    items={states.sort()}
                    placeholder="Selecione o estado"
                    changeCallback={() => setValue('city', '')}
                    backgroundColor={'transparent'}
                    placeholderTextColor={'#1D1B20'}
                  />
                )}
                name="state"
                rules={{ required: 'Obrigatório' }}
              />
              {errors.state && <ErrorText>{errors?.state?.message as string}</ErrorText>}
            </YStack>
            <YStack>
              <Controller
                control={control}
                defaultValue={''}
                render={({ field }) => (
                  <Select
                    {...field}
                    label={'Cidade'}
                    disabled={!watch('state')}
                    placeholder="Selecione a cidade"
                    items={stateCities[watch('state')] || []}
                    changeCallback={() => {}}
                    backgroundColor={'transparent'}
                    placeholderTextColor={'#1D1B20'}
                  />
                )}
                name="city"
                rules={{ required: 'Obrigatório' }}
              />
              {errors.city && <ErrorText>{errors?.city?.message as string}</ErrorText>}
            </YStack>
            <YStack>
              <YStack>
                <Controller
                  control={control}
                  defaultValue={''}
                  render={({ field }) => (
                    <View position="relative">
                      <Input
                        borderColor={'#79747E'}
                        {...field}
                        placeholder="Onde você ouviu o nome?"
                        onChangeText={field.onChange}
                        paddingVertical={12}
                        paddingLeft={16}
                        backgroundColor={'transparent'}
                        placeholderTextColor={'#1D1B20'}
                      />
                      <Text
                        position="absolute"
                        top={-8}
                        left={12}
                        fontSize={12}
                        color={'#49454F'}
                        backgroundColor={'#FEF7FF'}>
                        Localidade
                      </Text>
                    </View>
                  )}
                  name="location"
                  rules={{ required: 'Obrigatório' }}
                />
                <Text marginLeft={12} fontSize={12} color={'#49454F'}>
                  Exemplo: Fazenda São João
                </Text>
              </YStack>
              {errors.location && <ErrorText>{errors?.location?.message as string}</ErrorText>}
            </YStack>
            {/* Submit Butonu */}
            <XStack gap={8}>
              <Button
                borderRadius="$12"
                color={'#FFF'}
                paddingHorizontal={24}
                paddingVertical={10}
                fontSize={14}
                fontWeight={'bold'}
                backgroundColor="#6750A4"
                onPress={handleSubmit(onSubmit)}>
                Enviar
              </Button>
              <Button
                borderRadius="$12"
                color={'#6750A4'}
                paddingHorizontal={24}
                paddingVertical={10}
                fontSize={14}
                fontWeight={'bold'}
                backgroundColor="transparent"
                borderColor={'#6750A4'}
                onPress={() => {
                  router.back();
                }}>
                Cancelar
              </Button>
            </XStack>
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
