import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import { Stack, router } from 'expo-router';
import { Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, H3, Image, ScrollView, Spinner, Text, View, XStack, YStack } from 'tamagui';

import { supabase } from '~/app/db';
import Authentication from '~/components/screens/Authentication';
import LoadingDialog from '~/components/LoadingDialog';
import ScreenHeader from '~/components/ScreenHeader';
import useAdminProfile from '~/hooks/useAdminProfile';
import useCreateName from '~/hooks/useCreateName';
import useSessionAuth from '~/hooks/useSessionAuth';
import { getSpeciesById } from '~/services/api';
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

type SubmittedSynonym = {
  id: string;
  synonymName: string;
  synonymStatus: 'approved' | 'rejected' | null;
  birdId: number;
  birdScientificName: string;
  birdPtbrName: string | null;
  state: string;
  city: string;
  location: string;
  informant: string;
  observation: string;
  collectionDate: string | null;
  createdAt: string;
};

type SubmissionListItem = {
  id: string;
  source: 'remote' | 'local';
  synonymName: string;
  birdId: number;
  birdLabel: string;
  scientificName: string;
  state: string;
  city: string;
  location: string;
  informant: string;
  observation?: string;
  status: 'approved' | 'rejected' | 'pending' | 'local';
  submittedAt?: string | null;
};

export default function Profile() {
  const insets = useSafeAreaInsets();
  const auth = supabase.auth;
  const { session, loading } = useSessionAuth();
  const { isAdmin, isSuperAdmin } = useAdminProfile();
  const createNameMutations = useCreateName();

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

  const submittedSynonyms = useQuery<SubmittedSynonym[]>({
    queryKey: ['submitted-synonyms', session?.user.id],
    enabled: Boolean(session?.user.id),
    queryFn: async () => {
      const res = await fetch(`/profile/submissions?collectorId=${session?.user.id}`);
      if (!res.ok) throw new Error('Erro ao buscar sinônimos submetidos');
      return res.json();
    },
  });

  const submittedItems: SubmissionListItem[] = [
    ...(submittedSynonyms.data || []).map((item) => ({
      id: `remote-${item.id}`,
      source: 'remote' as const,
      synonymName: item.synonymName,
      birdId: item.birdId,
      birdLabel: item.birdPtbrName || `Espécie ${item.birdId}`,
      scientificName: item.birdScientificName,
      state: item.state,
      city: item.city,
      location: item.location,
      informant: item.informant,
      observation: item.observation,
      status: (item.synonymStatus ?? 'pending') as SubmissionListItem['status'],
      submittedAt: item.collectionDate || item.createdAt,
    })),
    ...(offlineData.data || []).map((item) => ({
      id: `local-${item.id}-${item.name}-${item.city}`,
      source: 'local' as const,
      synonymName: item.name,
      birdId: item.id,
      birdLabel: offlineSpeciesNames.data?.[Number(item.id)] || `ID ${item.id}`,
      scientificName: '',
      state: item.state,
      city: item.city,
      location: item.location,
      informant: item.informer,
      observation: item.observation,
      status: 'local' as const,
      submittedAt: null,
    })),
  ];

  const statusMeta: Record<
    SubmissionListItem['status'],
    { label: string; backgroundColor: string; textColor: string }
  > = {
    approved: { label: 'Aprovado', backgroundColor: '#E8F5E9', textColor: '#2E7D32' },
    rejected: { label: 'Rejeitado', backgroundColor: '#FDECEA', textColor: t.colors.error },
    pending: {
      label: 'Em análise',
      backgroundColor: t.colors.surfaceTint,
      textColor: t.colors.textSecondary,
    },
    local: { label: 'Pendente de envio', backgroundColor: '#FFF4E5', textColor: '#B26A00' },
  };

  const removeLocalSubmission = async (submissionId: string) => {
    const filtered = (offlineData.data || []).filter(
      (item) => `local-${item.id}-${item.name}-${item.city}` !== submissionId
    );
    await AsyncStorage.setItem('offlineData', JSON.stringify(filtered));
    offlineData.refetch();
  };

  const submitOfflineRecord = async (item: SubmissionListItem) => {
    if (!session?.user.id || item.source !== 'local') return;

    const payload = {
      id: item.birdId,
      name: item.synonymName,
      state: item.state,
      city: item.city,
      location: item.location,
      informer: item.informant,
      observation: item.observation || '',
      collectorsId: session.user.id,
      collectorsName: `${session.user.user_metadata.firstName} ${session.user.user_metadata.lastName}`,
    };

    createNameMutations.mutate(payload, {
      onSuccess: async (response) => {
        if (response.status === 409) {
          Alert.alert('Erro', 'Nome já cadastrado para este município');
          return;
        }

        Alert.alert('Sucesso', 'Nome cadastrado com sucesso');
        await removeLocalSubmission(item.id);
        submittedSynonyms.refetch();
      },
      onError: (error) => {
        console.log(error);
      },
    });
  };

  return (
    <ScrollView
      backgroundColor={t.colors.bg}
      paddingTop={t.spacing.screenTop}
      paddingHorizontal={t.spacing.screenX}
      contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 24, 40) }}>
      <LoadingDialog loading={createNameMutations.isPending} />
      <Stack.Screen options={{ headerShown: false }} />

      <ScreenHeader title="Perfil" />

      {session?.user.id || loading ? (
        <YStack flex={1} paddingTop="$4">
          <LoadingDialog loading={loading} />

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
                auth?.signOut();
                AsyncStorage.removeItem('session');
              }}>
              Sair
            </Button>
          </View>

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

          <YStack marginTop="$8" marginBottom="$8">
            <H3 color={t.colors.text}>Sinônimos submetidos</H3>
            {offlineData.isPending || offlineSpeciesNames.isPending || submittedSynonyms.isPending ? (
              <Spinner />
            ) : submittedItems.length > 0 ? (
              <YStack gap="$3" marginTop="$3">
                {submittedItems.map((item) => {
                  const badge = statusMeta[item.status];

                  return (
                    <View
                      key={item.id}
                      backgroundColor={t.colors.surface}
                      borderColor={t.colors.borderSoft}
                      borderWidth={1}
                      padding={t.spacing.cardPad}
                      borderRadius={t.radii.card}>
                      <Text fontSize={16} fontWeight="600" color={t.colors.text}>
                        {item.birdLabel}
                      </Text>
                      {!!item.scientificName && (
                        <Text fontSize={13} color={t.colors.textMuted} fontStyle="italic" marginTop={2}>
                          {item.scientificName}
                        </Text>
                      )}
                      <Text fontSize={15} color={t.colors.primary} marginTop={4}>
                        {item.synonymName}
                      </Text>

                      <XStack gap="$2" marginTop={8} flexWrap="wrap">
                        <View
                          backgroundColor={badge.backgroundColor}
                          paddingHorizontal={10}
                          paddingVertical={3}
                          borderRadius={t.radii.pill}>
                          <Text fontSize={12} color={badge.textColor}>
                            {badge.label}
                          </Text>
                        </View>
                        <View
                          backgroundColor={t.colors.surfaceTint}
                          paddingHorizontal={10}
                          paddingVertical={3}
                          borderRadius={t.radii.pill}>
                          <Text fontSize={12} color={t.colors.textSecondary}>
                            {item.state}
                          </Text>
                        </View>
                        <View
                          backgroundColor={t.colors.surfaceTint}
                          paddingHorizontal={10}
                          paddingVertical={3}
                          borderRadius={t.radii.pill}>
                          <Text fontSize={12} color={t.colors.textSecondary}>
                            {item.city}
                          </Text>
                        </View>
                      </XStack>

                      {item.location ? (
                        <Text fontSize={13} color={t.colors.textMuted} marginTop={8}>
                          {item.location}
                        </Text>
                      ) : null}
                      <Text fontSize={13} color={t.colors.textMuted} marginTop={4}>
                        Informante: {item.informant}
                      </Text>
                      {item.submittedAt ? (
                        <Text fontSize={13} color={t.colors.textMuted} marginTop={4}>
                          Submetido em: {new Date(item.submittedAt).toLocaleDateString('pt-BR')}
                        </Text>
                      ) : null}
                      {item.observation ? (
                        <Text fontSize={13} color={t.colors.textMuted} marginTop={4}>
                          Observação: {item.observation}
                        </Text>
                      ) : null}

                      {item.source === 'local' && (
                        <XStack alignItems="center" marginTop="$3" gap="$3">
                          <Button
                            borderRadius={t.radii.pill}
                            backgroundColor={t.colors.primary}
                            color={t.colors.textOnPrimary}
                            size="$3"
                            onPress={() => submitOfflineRecord(item)}>
                            Enviar
                          </Button>
                          <Button
                            borderRadius={t.radii.pill}
                            borderColor={t.colors.primary}
                            color={t.colors.primary}
                            backgroundColor="transparent"
                            borderWidth={1}
                            size="$3"
                            onPress={() => removeLocalSubmission(item.id)}>
                            Apagar
                          </Button>
                        </XStack>
                      )}
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
                  Nenhum sinônimo submetido ainda.
                </Text>
                <Text color={t.colors.textMuted} fontSize={13} textAlign="center" marginTop={4}>
                  Seus envios e pendências locais aparecerão aqui.
                </Text>
              </View>
            )}
          </YStack>

          <YStack marginBottom="$8">
            <H3 color={t.colors.text}>Ficha Técnica</H3>

            <YStack
              paddingHorizontal={t.spacing.screenX}
              gap="$1"
              alignItems="flex-start"
              marginTop="$2">
              <Text marginBottom={0} color={t.colors.textSecondary}>
                Realização
              </Text>
              <XStack alignItems="center" justifyContent="space-around" gap="$2" marginBottom="$4">
                <Image
                  source={require('../assets/avistar.png')}
                  height={50}
                  width={100}
                  resizeMode="contain"
                />
                <Image
                  source={require('../assets/oama.png')}
                  height={50}
                  width={90}
                  resizeMode="contain"
                />
                <Image
                  source={require('../assets/evaldo.png')}
                  height={60}
                  width={60}
                  resizeMode="contain"
                />
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
