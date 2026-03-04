import { useLocalSearchParams, Stack, router } from 'expo-router';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { Alert } from 'react-native';
import { View, YStack, Text, Button, XStack } from 'tamagui';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { getNetworkStateAsync } from 'expo-network';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Select from '~/components/Select';
import SearchableSelect from '~/components/SearchableSelect';
import Authentication from '~/components/screens/Authentication';
import FloatingLabelInput from '~/components/FloatingLabelInput';
import ScreenHeader from '~/components/ScreenHeader';
import useCreateName from '~/hooks/useCreateName';
import useSpeciesDetail from '~/hooks/useSpeciesDetail';
import useSessionAuth from '~/hooks/useSessionAuth';
import { municipios } from '~/municipios.json';
import LoadingDialog from '~/components/LoadingDialog';
import { tokens as t } from '~/src/theme/tokens';

const stateCities = municipios.reduce<Record<string, string[]>>((red, mun) => {
  if (red[mun['UF-sigla']]) {
    red[mun['UF-sigla']].push(mun['municipio-nome']);
  } else {
    red[mun['UF-sigla']] = [mun['municipio-nome']];
  }
  return red;
}, {});

const states = Array.from(new Set(municipios.map((mun) => mun['UF-sigla']))).sort();

function StateCitySelector({
  control,
  setValue,
  errors,
}: {
  control: any;
  setValue: any;
  errors: any;
}) {
  const selectedState = useWatch({ control, name: 'state' });

  return (
    <>
      <YStack>
        <Controller
          control={control}
          defaultValue=""
          render={({ field }) => (
            <Select
              {...field}
              label="Estado"
              items={states}
              disabled={false}
              placeholder="Selecione o estado"
              changeCallback={() => setValue('city', '')}
              backgroundColor="transparent"
              placeholderTextColor={t.colors.placeholder}
            />
          )}
          name="state"
          rules={{ required: 'Obrigatório' }}
        />
        {errors.state && (
          <Text marginLeft={12} fontSize={12} color={t.colors.error}>
            {errors.state.message as string}
          </Text>
        )}
      </YStack>
      <YStack>
        <Controller
          control={control}
          defaultValue=""
          render={({ field }) => (
            <SearchableSelect
              value={field.value}
              onChange={field.onChange}
              label="Cidade"
              disabled={!selectedState}
              placeholder="Digite para buscar a cidade"
              items={stateCities[selectedState] || []}
              error={errors.city?.message as string}
            />
          )}
          name="city"
          rules={{ required: 'Obrigatório' }}
        />
      </YStack>
    </>
  );
}

export default function Details() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { session, loading } = useSessionAuth();
  const { data: thisSpp } = useSpeciesDetail(id);
  const createNameMutations = useCreateName();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
  } = useForm();

  const onSubmit = async (data: any) => {
    if (!thisSpp) {
      Alert.alert('Erro', 'Espécie não encontrada');
      return;
    }

    const networkStatus = await getNetworkStateAsync();

    if (!networkStatus.isConnected) {
      const dataToSave = {
        ...getValues(),
        id: thisSpp.id,
        collectorsId: session?.user.id,
        collectorsName:
          session?.user.user_metadata.firstName + ' ' + session?.user.user_metadata.lastName,
      };

      AsyncStorage.getItem('offlineData').then((data) => {
        const offlineData = data ? JSON.parse(data) : [];
        AsyncStorage.setItem('offlineData', JSON.stringify([...offlineData, dataToSave]));
      });

      Alert.alert('Offline', 'Seu registro foi salvo para ser enviado posteriormente', [
        { text: 'OK', onPress: () => router.replace(`/spp/${id}`) },
      ]);

      return;
    }

    const _data = {
      ...data,
      id: thisSpp.id,
      collectorsId: session?.user.id,
      collectorsName:
        session?.user.user_metadata.firstName + ' ' + session?.user.user_metadata.lastName,
    };

    createNameMutations.mutate(_data);
  };

  // Handle mutation results
  if (createNameMutations.isError) {
    Alert.alert('Erro', 'Erro ao cadastrar sinônimo, tente novamente mais tarde');
  }

  if (createNameMutations.isSuccess) {
    if (createNameMutations.data?.status === 409) {
      Alert.alert('Erro', 'Nome já cadastrado para este municipio');
    } else {
      router.replace(`/spp/${id}?querySuccess=true`);
    }
  }

  return (
    <View backgroundColor={t.colors.bg} paddingTop={t.spacing.screenTop} paddingHorizontal={t.spacing.screenX} flex={1}>
      <LoadingDialog loading={createNameMutations.isPending} />
      <Stack.Screen options={{ headerShown: false }} />

      <ScreenHeader title="Cadastrar sinônimo" />

      <KeyboardAwareScrollView>
        {session?.user.id || loading ? (
          <YStack
            gap="$4"
            paddingVertical="$4"
            maxWidth={700}
            marginHorizontal="$4">
            <LoadingDialog loading={loading} />

            <YStack>
              <Text fontWeight="bold" textTransform="uppercase" color={t.colors.textSecondary}>
                Nome Científico
              </Text>
              <Text fontStyle="italic" color={t.colors.text}>
                {thisSpp?.name_sci || 'Carregando...'}
              </Text>
            </YStack>

            <YStack>
              <Text fontWeight="bold" textTransform="uppercase" color={t.colors.textSecondary}>
                CBRO
              </Text>
              <Text color={t.colors.text}>{thisSpp?.name_ptbr || 'Carregando...'}</Text>
            </YStack>

            {/* Form Fields */}
            <Controller
              control={control}
              defaultValue=""
              render={({ field }) => (
                <FloatingLabelInput
                  label="Termo"
                  placeholder="Escreva o sinônimo que deseja cadastrar"
                  value={field.value}
                  onChangeText={field.onChange}
                  error={errors.name?.message as string}
                />
              )}
              name="name"
              rules={{ required: 'Obrigatório' }}
            />

            <Controller
              control={control}
              defaultValue=""
              render={({ field }) => (
                <FloatingLabelInput
                  label="Quem falou?"
                  placeholder="Qual a origem do nome?"
                  value={field.value}
                  onChangeText={field.onChange}
                  error={errors.informer?.message as string}
                />
              )}
              name="informer"
              rules={{ required: 'Obrigatório' }}
            />

            <StateCitySelector control={control} setValue={setValue} errors={errors} />

            <Controller
              control={control}
              defaultValue=""
              render={({ field }) => (
                <FloatingLabelInput
                  label="Localidade"
                  placeholder="Onde você ouviu o nome?"
                  value={field.value}
                  onChangeText={field.onChange}
                  error={errors.location?.message as string}
                  hint="Exemplo: Fazenda São João"
                />
              )}
              name="location"
              rules={{ required: 'Obrigatório' }}
            />

            <Controller
              control={control}
              defaultValue=""
              render={({ field }) => (
                <FloatingLabelInput
                  label="Comentário"
                  placeholder="Algo mais que deseja adicionar? Motivo do nome, algum dado curioso ou importante?"
                  value={field.value}
                  onChangeText={field.onChange}
                  multiline
                />
              )}
              name="observation"
            />

            {/* Submit Buttons */}
            <XStack gap={8}>
              <Button
                borderRadius={t.radii.button}
                color={t.colors.textOnPrimary}
                paddingHorizontal={24}
                paddingVertical={10}
                fontSize={14}
                fontWeight="bold"
                backgroundColor={t.colors.primary}
                onPress={handleSubmit(onSubmit)}>
                Enviar
              </Button>
              <Button
                borderRadius={t.radii.button}
                color={t.colors.primary}
                paddingHorizontal={24}
                paddingVertical={10}
                fontSize={14}
                fontWeight="bold"
                backgroundColor="transparent"
                borderColor={t.colors.primary}
                borderWidth={1}
                onPress={() => router.back()}>
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
