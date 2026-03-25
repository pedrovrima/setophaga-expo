import { useState } from 'react';
import { Stack } from 'expo-router';
import { ScrollView, YStack, XStack, Text, Button, View, Spinner, Input } from 'tamagui';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert, Platform } from 'react-native';

import ScreenHeader from '~/components/ScreenHeader';
import useAdminProfile from '~/hooks/useAdminProfile';
import Authentication from '~/components/screens/Authentication';
import { tokens as t } from '~/src/theme/tokens';

type SynonymStatus = 'approved' | 'rejected' | null;
type StatusFilter = 'pending' | 'approved' | 'rejected' | 'all';

type SynonymRecord = {
  id: string;
  collectorName: string | null;
  informant: string | null;
  observation: string | null;
  collectionDate: string | null;
  locationDescription: string | null;
  country: { name: string } | null;
  state: { name: string; code: string } | null;
  city: { name: string } | null;
  collector: { firstName: string | null; lastName: string | null } | null;
};

type SynonymWithRelations = {
  id: string;
  name: string;
  birdId: number;
  status: SynonymStatus;
  createdAt: string;
  bird: {
    id: number;
    speciesCode: string;
    nameSciCbro: string | null;
    nameSciEbird: string | null;
  };
  records: SynonymRecord[];
  birdPtbrName: string | null;
};

const STATUS_LABELS: Record<StatusFilter, string> = {
  pending: 'Pendentes',
  approved: 'Aprovados',
  rejected: 'Rejeitados',
  all: 'Todos',
};

const STATUS_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  approved: { label: 'Aprovado', bg: '#2E7D32', text: '#FFFFFF' },
  rejected: { label: 'Rejeitado', bg: '#B3261E', text: '#FFFFFF' },
  pending: { label: 'Pendente', bg: '#F5F0FF', text: '#49454F' },
};

export default function AdminSynonyms() {
  const { session, isAdmin, loading: authLoading } = useAdminProfile();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const synonymsQuery = useQuery<SynonymWithRelations[]>({
    queryKey: ['admin-synonyms'],
    enabled: isAdmin,
    queryFn: async () => {
      const res = await fetch('/admin/api/synonyms');
      if (!res.ok) throw new Error('Erro ao buscar sinônimos');
      return res.json();
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ synonymId, status }: { synonymId: string; status: SynonymStatus }) => {
      const res = await fetch('/admin/api/synonyms', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ synonymId, status }),
      });
      if (!res.ok) throw new Error('Erro ao atualizar');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-synonyms'] });
    },
    onError: () => {
      const msg = 'Erro ao atualizar status do sinônimo';
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert('Erro', msg);
      }
    },
  });

  const handleStatusChange = (synonym: SynonymWithRelations, newStatus: SynonymStatus) => {
    const label = newStatus === 'approved' ? 'aprovar' : newStatus === 'rejected' ? 'rejeitar' : 'remover status de';
    const msg = `Deseja ${label} "${synonym.name}"?`;

    const doUpdate = () =>
      updateStatusMutation.mutate({ synonymId: synonym.id, status: newStatus });

    if (Platform.OS === 'web') {
      if (window.confirm(msg)) doUpdate();
    } else {
      Alert.alert('Confirmar', msg, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar', onPress: doUpdate },
      ]);
    }
  };

  const filtered = (synonymsQuery.data || []).filter((syn) => {
    // Status filter
    if (statusFilter === 'pending' && syn.status !== null) return false;
    if (statusFilter === 'approved' && syn.status !== 'approved') return false;
    if (statusFilter === 'rejected' && syn.status !== 'rejected') return false;

    // Text search
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      syn.name.toLowerCase().includes(q) ||
      syn.birdPtbrName?.toLowerCase().includes(q) ||
      syn.bird.nameSciCbro?.toLowerCase().includes(q) ||
      syn.bird.nameSciEbird?.toLowerCase().includes(q)
    );
  });

  // Counts for filter tabs
  const counts = (synonymsQuery.data || []).reduce(
    (acc, syn) => {
      acc.all++;
      if (syn.status === null) acc.pending++;
      else if (syn.status === 'approved') acc.approved++;
      else if (syn.status === 'rejected') acc.rejected++;
      return acc;
    },
    { all: 0, pending: 0, approved: 0, rejected: 0 } as Record<StatusFilter, number>
  );

  if (authLoading) {
    return (
      <View flex={1} backgroundColor={t.colors.bg} justifyContent="center" alignItems="center">
        <Spinner size="large" color={t.colors.primary} />
      </View>
    );
  }

  if (!session) {
    return (
      <ScrollView backgroundColor={t.colors.bg} paddingTop={t.spacing.screenTop} paddingHorizontal={t.spacing.screenX}>
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenHeader title="Admin — Sinônimos" />
        <Authentication />
      </ScrollView>
    );
  }

  if (!isAdmin) {
    return (
      <ScrollView backgroundColor={t.colors.bg} paddingTop={t.spacing.screenTop} paddingHorizontal={t.spacing.screenX}>
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenHeader title="Admin — Sinônimos" />
        <View
          backgroundColor={t.colors.surfaceTint}
          padding={t.spacing.cardPad}
          borderRadius={t.radii.card}
          marginTop="$4"
          alignItems="center">
          <Text color={t.colors.error} fontWeight="700">
            Acesso negado
          </Text>
          <Text color={t.colors.textMuted} marginTop={4}>
            Você não tem permissão para acessar esta página.
          </Text>
        </View>
      </ScrollView>
    );
  }

  const statusBadgeKey = (status: SynonymStatus) => status || 'pending';

  return (
    <ScrollView backgroundColor={t.colors.bg} paddingTop={t.spacing.screenTop} paddingHorizontal={t.spacing.screenX}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader title="Admin — Sinônimos" />

      {/* Status filter tabs */}
      <XStack gap="$2" marginTop="$4" flexWrap="wrap">
        {(['pending', 'approved', 'rejected', 'all'] as StatusFilter[]).map((filter) => {
          const isActive = statusFilter === filter;
          return (
            <Button
              key={filter}
              size="$3"
              borderRadius={t.radii.pill}
              backgroundColor={isActive ? t.colors.primary : 'transparent'}
              borderColor={isActive ? t.colors.primary : t.colors.inputBorder}
              borderWidth={1}
              color={isActive ? t.colors.textOnPrimary : t.colors.textSecondary}
              onPress={() => setStatusFilter(filter)}>
              {STATUS_LABELS[filter]} ({counts[filter]})
            </Button>
          );
        })}
      </XStack>

      {/* Search */}
      <Input
        placeholder="Buscar sinônimo ou espécie..."
        value={search}
        onChangeText={setSearch}
        marginTop="$3"
        borderRadius={t.radii.input}
        borderColor={t.colors.inputBorder}
        backgroundColor={t.colors.surface}
        placeholderTextColor={t.colors.textMuted}
      />

      <Text color={t.colors.textMuted} fontSize={13} marginTop="$2">
        {filtered.length} sinônimo(s)
      </Text>

      <YStack gap="$3" marginTop="$3" marginBottom="$8">
        {synonymsQuery.isLoading && <Spinner size="large" color={t.colors.primary} />}

        {filtered.map((syn) => {
          const isExpanded = expandedId === syn.id;
          const badge = STATUS_BADGE[statusBadgeKey(syn.status)];

          return (
            <View
              key={syn.id}
              backgroundColor={t.colors.surface}
              borderColor={t.colors.borderSoft}
              borderWidth={1}
              padding={t.spacing.cardPad}
              borderRadius={t.radii.card}>
              {/* Header row */}
              <XStack justifyContent="space-between" alignItems="flex-start">
                <YStack flex={1} gap={4}>
                  <Text fontSize={17} fontWeight="700" color={t.colors.primary}>
                    {syn.name}
                  </Text>
                  <Text fontSize={14} color={t.colors.text}>
                    {syn.birdPtbrName || syn.bird.nameSciCbro || syn.bird.speciesCode}
                  </Text>
                  <Text fontSize={13} fontStyle="italic" color={t.colors.textMuted}>
                    {syn.bird.nameSciCbro || syn.bird.nameSciEbird}
                  </Text>
                </YStack>

                <YStack alignItems="flex-end" gap={6}>
                  <View
                    backgroundColor={badge.bg}
                    paddingHorizontal={10}
                    paddingVertical={4}
                    borderRadius={t.radii.pill}>
                    <Text fontSize={12} fontWeight="700" color={badge.text}>
                      {badge.label}
                    </Text>
                  </View>
                  <View
                    backgroundColor={t.colors.surfaceTint}
                    paddingHorizontal={10}
                    paddingVertical={4}
                    borderRadius={t.radii.pill}>
                    <Text fontSize={12} color={t.colors.textSecondary}>
                      {syn.records.length} registro(s)
                    </Text>
                  </View>
                </YStack>
              </XStack>

              {/* Actions */}
              <XStack gap="$2" marginTop="$3" flexWrap="wrap">
                <Button
                  size="$3"
                  borderRadius={t.radii.pill}
                  backgroundColor="transparent"
                  borderColor={t.colors.primary}
                  borderWidth={1}
                  color={t.colors.primary}
                  onPress={() => setExpandedId(isExpanded ? null : syn.id)}>
                  {isExpanded ? 'Fechar' : 'Ver detalhes'}
                </Button>

                {syn.status !== 'approved' && (
                  <Button
                    size="$3"
                    borderRadius={t.radii.pill}
                    backgroundColor="#2E7D32"
                    color="#FFFFFF"
                    disabled={updateStatusMutation.isPending}
                    onPress={() => handleStatusChange(syn, 'approved')}>
                    Aprovar
                  </Button>
                )}

                {syn.status !== 'rejected' && (
                  <Button
                    size="$3"
                    borderRadius={t.radii.pill}
                    backgroundColor={t.colors.error}
                    color={t.colors.textOnPrimary}
                    disabled={updateStatusMutation.isPending}
                    onPress={() => handleStatusChange(syn, 'rejected')}>
                    Rejeitar
                  </Button>
                )}

                {syn.status !== null && (
                  <Button
                    size="$3"
                    borderRadius={t.radii.pill}
                    backgroundColor="transparent"
                    borderColor={t.colors.inputBorder}
                    borderWidth={1}
                    color={t.colors.textSecondary}
                    disabled={updateStatusMutation.isPending}
                    onPress={() => handleStatusChange(syn, null)}>
                    Limpar status
                  </Button>
                )}
              </XStack>

              {/* Expanded records */}
              {isExpanded && (
                <YStack gap="$2" marginTop="$3" paddingTop="$3" borderTopWidth={1} borderTopColor={t.colors.borderSoft}>
                  {syn.records.length === 0 ? (
                    <Text color={t.colors.textMuted} fontSize={13}>
                      Nenhum registro associado.
                    </Text>
                  ) : (
                    syn.records.map((rec) => (
                      <View
                        key={rec.id}
                        backgroundColor={t.colors.surfaceTint}
                        padding={12}
                        borderRadius={t.radii.card}>
                        <XStack gap="$2" flexWrap="wrap">
                          {rec.state && (
                            <View
                              backgroundColor={t.colors.surface}
                              paddingHorizontal={8}
                              paddingVertical={2}
                              borderRadius={t.radii.pill}>
                              <Text fontSize={12} color={t.colors.textSecondary}>
                                {rec.state.code}
                              </Text>
                            </View>
                          )}
                          {rec.city && (
                            <View
                              backgroundColor={t.colors.surface}
                              paddingHorizontal={8}
                              paddingVertical={2}
                              borderRadius={t.radii.pill}>
                              <Text fontSize={12} color={t.colors.textSecondary}>
                                {rec.city.name}
                              </Text>
                            </View>
                          )}
                        </XStack>

                        {rec.locationDescription && (
                          <Text fontSize={13} color={t.colors.textMuted} marginTop={6}>
                            Local: {rec.locationDescription}
                          </Text>
                        )}

                        <Text fontSize={13} color={t.colors.textMuted} marginTop={4}>
                          Coletor: {rec.collectorName || rec.collector?.firstName || '—'}
                        </Text>

                        {rec.informant && (
                          <Text fontSize={13} color={t.colors.textMuted} marginTop={2}>
                            Informante: {rec.informant}
                          </Text>
                        )}

                        {rec.observation && (
                          <Text fontSize={13} color={t.colors.textMuted} marginTop={2}>
                            Obs: {rec.observation}
                          </Text>
                        )}

                        {rec.collectionDate && (
                          <Text fontSize={12} color={t.colors.textMuted} marginTop={4}>
                            Data: {rec.collectionDate}
                          </Text>
                        )}
                      </View>
                    ))
                  )}
                </YStack>
              )}
            </View>
          );
        })}

        {!synonymsQuery.isLoading && filtered.length === 0 && (
          <Text color={t.colors.textMuted} textAlign="center" marginTop="$4">
            {search
              ? 'Nenhum sinônimo encontrado para esta busca.'
              : `Nenhum sinônimo ${STATUS_LABELS[statusFilter].toLowerCase()}.`}
          </Text>
        )}
      </YStack>
    </ScrollView>
  );
}
