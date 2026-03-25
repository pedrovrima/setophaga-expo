import { Stack, router } from 'expo-router';
import { Alert } from 'react-native';
import { XStack, YStack, Text, Button, H3, Spinner, Image, ScrollView, View } from 'tamagui';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Authentication from '~/components/screens/Authentication';
import ScreenHeader from '~/components/ScreenHeader';
import useCreateName from '~/hooks/useCreateName';
import useSessionAuth from '~/hooks/useSessionAuth';
import useAdminProfile from '~/hooks/useAdminProfile';
import { supabase } from '~/app/db';
import { useQuery } from '@tanstack/react-query';
import { getSpeciesById } from '~/services/api';
import LoadingDialog from '~/components/LoadingDialog';
import { tokens as t } from '~/src/theme/tokens';

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

  const { session, loading } = useSessionAuth();
  const { isAdmin, isSuperAdmin } = useAdminProfile();
  const createNameMutations = useCreateName();

  return (
    <ScrollView backgroundColor={t.colors.bg} paddingTop={t.spacing.screenTop} paddingHorizontal={t.spacing.screenX}>
      <LoadingDialog loading={createNameMutations.isPending} />
      <Stack.Screen options={{ headerShown: false }} />

      <ScreenHeader title="Perfil" />

      {session?.user.id || loading ? (
        <YStack flex={1} paddingTop="$4">
          <LoadingDialog loading={loading} />

          {/* User Info Card */}
          <View
            backgroundColor={t.colors.surface}
            borderColor={t.colors.borderSoft}
            borderWidth={1}
            padding={t.spacing.cardPad}
            borderRadius={t.radii.card}
            marginTop="$4">
            <Text fontSize={18} fontWeight="700" color={t.colors.text}>
              {session?.user.user_metadata.firstName} {session?.user.user_metadata.lastName}
            </Text>
            <Text fontSize={14} color={t.colors.textMuted} marginTop={4}>
              {session?.user.email}
            </Text>
            <Button
              marginTop="$4"
              borderRadius={t.radii.pill}
              backgroundColor={t.colors.primary}
              color={t.colors.textOnPrimary}
              onPress={() => {
                supabase.auth.signOut();
                AsyncStorage.removeItem('session');
              }}>
              Sair
            </Button>
          </View>

          {/* Admin Section */}
          {isAdmin && (
            <YStack marginTop="$6" gap="$3">
              <H3 color={t.colors.text}>Administração</H3>
              <XStack gap="$3" flexWrap="wrap">
                {isSuperAdmin && (
                  <Button
                    borderRadius={t.radii.pill}
                    backgroundColor={t.colors.primary}
                    color={t.colors.textOnPrimary}
                    onPress={() => router.push('/admin/users')}>
                    Gerenciar Usuários
                  </Button>
                )}
                <Button
                  borderRadius={t.radii.pill}
                  backgroundColor={t.colors.primary}
                  color={t.colors.textOnPrimary}
                  onPress={() => router.push('/admin/synonyms')}>
                  Gerenciar Sinônimos
                </Button>
              </XStack>
            </YStack>
          )}

          {/* Offline Data Section */}
          <YStack marginTop="$8" marginBottom="$8">
            <H3 color={t.colors.text}>Dados Salvos</H3>
            {offlineData.isPending || offlineSpeciesNames.isPending ? (
              <Spinner />
            ) : offlineData.data && offlineData.data.length > 0 ? (
              <YStack gap="$3" marginTop="$3">
                {offlineData.data.map((value, index) => {
                  const speciesLabel =
                    offlineSpeciesNames.data?.[Number(value.id)] || `ID ${value.id}`;

                  return (
                    <View
                      key={`offline-${index}`}
                      backgroundColor={t.colors.surface}
                      borderColor={t.colors.borderSoft}
                      borderWidth={1}
                      padding={t.spacing.cardPad}
                      borderRadius={t.radii.card}>
                      <Text fontSize={16} fontWeight="600" color={t.colors.text}>
                        {speciesLabel}
                      </Text>
                      <Text fontSize={15} color={t.colors.primary} marginTop={4}>
                        {value.name}
                      </Text>

                      <XStack gap="$2" marginTop={8} flexWrap="wrap">
                        <View
                          backgroundColor={t.colors.surfaceTint}
                          paddingHorizontal={10}
                          paddingVertical={3}
                          borderRadius={t.radii.pill}>
                          <Text fontSize={12} color={t.colors.textSecondary}>
                            {value.state}
                          </Text>
                        </View>
                        <View
                          backgroundColor={t.colors.surfaceTint}
                          paddingHorizontal={10}
                          paddingVertical={3}
                          borderRadius={t.radii.pill}>
                          <Text fontSize={12} color={t.colors.textSecondary}>
                            {value.city}
                          </Text>
                        </View>
                      </XStack>

                      {value.location && (
                        <Text fontSize={13} color={t.colors.textMuted} marginTop={8}>
                          {value.location}
                        </Text>
                      )}
                      <Text fontSize={13} color={t.colors.textMuted} marginTop={4}>
                        Informante: {value.informer}
                      </Text>

                      <XStack alignItems="center" marginTop="$3" gap="$3">
                        <Button
                          borderRadius={t.radii.pill}
                          backgroundColor={t.colors.primary}
                          color={t.colors.textOnPrimary}
                          size="$3"
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
                                await AsyncStorage.setItem('offlineData', JSON.stringify(filtered));
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
                          borderRadius={t.radii.pill}
                          borderColor={t.colors.primary}
                          color={t.colors.primary}
                          backgroundColor="transparent"
                          borderWidth={1}
                          size="$3"
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
                    </View>
                  );
                })}
              </YStack>
            ) : (
              <View
                backgroundColor={t.colors.surfaceTint}
                padding={t.spacing.cardPad}
                borderRadius={t.radii.card}
                marginTop="$3"
                alignItems="center">
                <Text color={t.colors.textMuted} textAlign="center">
                  Nenhum dado salvo offline.
                </Text>
                <Text color={t.colors.textMuted} fontSize={13} textAlign="center" marginTop={4}>
                  Registros salvos sem conexão aparecerão aqui.
                </Text>
              </View>
            )}
          </YStack>

          {/* Credits */}
          <YStack marginBottom="$8">
            <H3 color={t.colors.text}>Ficha Técnica</H3>

            <YStack paddingHorizontal={t.spacing.screenX} gap="$1" alignItems="flex-start" marginTop="$2">
              <Text marginBottom={0} color={t.colors.textSecondary}>Realização</Text>
              <XStack
                alignItems="center"
                justifyContent="space-around"
                gap="$2"
                marginBottom="$4">
                <Image source={require('../assets/avistar.png')} height={50} width={100} resizeMode="contain" />
                <Image source={require('../assets/oama.png')} height={50} width={90} resizeMode="contain" />
                <Image source={require('../assets/evaldo.png')} height={60} width={60} resizeMode="contain" />
              </XStack>
            </YStack>
            <Text color={t.colors.text}>Idealizado por: Guto Carvalho</Text>
            <Text color={t.colors.text}>Desenvolvimento: Evaldo Césari e Pedro Martins</Text>
            <Text color={t.colors.text}>Design: Julia Morena e Pedro Martins</Text>
          </YStack>
        </YStack>
      ) : (
        <Authentication />
      )}
    </ScrollView>
  );
}
