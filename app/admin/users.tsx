import { useState } from 'react';
import { Stack } from 'expo-router';
import { ScrollView, YStack, XStack, Text, Button, View, Spinner } from 'tamagui';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert, Platform } from 'react-native';

import ScreenHeader from '~/components/ScreenHeader';
import useAdminProfile from '~/hooks/useAdminProfile';
import Authentication from '~/components/screens/Authentication';
import { tokens as t } from '~/src/theme/tokens';
import type { Profile } from '~/db';

type Role = 'user' | 'admin' | 'super_admin';

const ROLE_LABELS: Record<Role, string> = {
  user: 'Usuário',
  admin: 'Admin',
  super_admin: 'Super Admin',
};

const ROLE_COLORS: Record<Role, { bg: string; text: string }> = {
  user: { bg: '#FEF7FF', text: '#49454F' },
  admin: { bg: '#6750A4', text: '#FFFFFF' },
  super_admin: { bg: '#1A1A1A', text: '#FFFFFF' },
};

export default function AdminUsers() {
  const { session, isSuperAdmin, loading: authLoading } = useAdminProfile();
  const queryClient = useQueryClient();

  const usersQuery = useQuery<Profile[]>({
    queryKey: ['admin-users'],
    enabled: isSuperAdmin,
    queryFn: async () => {
      const res = await fetch('/admin/users');
      if (!res.ok) throw new Error('Erro ao buscar usuários');
      return res.json();
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: Role }) => {
      const res = await fetch('/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role }),
      });
      if (!res.ok) throw new Error('Erro ao atualizar');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: () => {
      const msg = 'Erro ao atualizar papel do usuário';
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert('Erro', msg);
      }
    },
  });

  const handleSetRole = (user: Profile, newRole: Role) => {
    const msg = `Alterar ${user.firstName || user.id} para ${ROLE_LABELS[newRole]}?`;

    const doUpdate = () =>
      updateRoleMutation.mutate({ userId: user.id, role: newRole });

    if (Platform.OS === 'web') {
      if (window.confirm(msg)) doUpdate();
    } else {
      Alert.alert('Confirmar', msg, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar', onPress: doUpdate },
      ]);
    }
  };

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
        <ScreenHeader title="Admin — Usuários" />
        <Authentication />
      </ScrollView>
    );
  }

  if (!isSuperAdmin) {
    return (
      <ScrollView backgroundColor={t.colors.bg} paddingTop={t.spacing.screenTop} paddingHorizontal={t.spacing.screenX}>
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenHeader title="Admin — Usuários" />
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
            Apenas super administradores podem gerenciar usuários.
          </Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView backgroundColor={t.colors.bg} paddingTop={t.spacing.screenTop} paddingHorizontal={t.spacing.screenX}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader title="Admin — Usuários" />

      <YStack gap="$3" marginTop="$4" marginBottom="$8">
        {usersQuery.isLoading && <Spinner size="large" color={t.colors.primary} />}

        {usersQuery.data?.map((user) => {
          const role = (user.role as Role) || 'user';
          const colors = ROLE_COLORS[role];

          return (
            <View
              key={user.id}
              backgroundColor={t.colors.surface}
              borderColor={t.colors.borderSoft}
              borderWidth={1}
              padding={t.spacing.cardPad}
              borderRadius={t.radii.card}>
              <XStack justifyContent="space-between" alignItems="flex-start">
                <YStack flex={1} gap={4}>
                  <Text fontSize={16} fontWeight="600" color={t.colors.text}>
                    {user.firstName} {user.lastName}
                  </Text>
                  <Text fontSize={13} color={t.colors.textMuted}>
                    {user.id}
                  </Text>
                </YStack>

                <View
                  backgroundColor={colors.bg}
                  paddingHorizontal={10}
                  paddingVertical={4}
                  borderRadius={t.radii.pill}>
                  <Text fontSize={12} fontWeight="700" color={colors.text}>
                    {ROLE_LABELS[role]}
                  </Text>
                </View>
              </XStack>

              {/* Role action buttons */}
              <XStack gap="$2" marginTop="$3" flexWrap="wrap">
                {role !== 'user' && (
                  <Button
                    size="$3"
                    borderRadius={t.radii.pill}
                    backgroundColor="transparent"
                    borderColor={t.colors.inputBorder}
                    borderWidth={1}
                    color={t.colors.textSecondary}
                    disabled={updateRoleMutation.isPending}
                    onPress={() => handleSetRole(user, 'user')}>
                    Tornar Usuário
                  </Button>
                )}
                {role !== 'admin' && (
                  <Button
                    size="$3"
                    borderRadius={t.radii.pill}
                    backgroundColor={role === 'user' ? t.colors.primary : 'transparent'}
                    borderColor={t.colors.primary}
                    borderWidth={role === 'user' ? 0 : 1}
                    color={role === 'user' ? t.colors.textOnPrimary : t.colors.primary}
                    disabled={updateRoleMutation.isPending}
                    onPress={() => handleSetRole(user, 'admin')}>
                    Tornar Admin
                  </Button>
                )}
                {role !== 'super_admin' && (
                  <Button
                    size="$3"
                    borderRadius={t.radii.pill}
                    backgroundColor="#1A1A1A"
                    color="#FFFFFF"
                    disabled={updateRoleMutation.isPending}
                    onPress={() => handleSetRole(user, 'super_admin')}>
                    Tornar Super Admin
                  </Button>
                )}
              </XStack>
            </View>
          );
        })}

        {usersQuery.data?.length === 0 && (
          <Text color={t.colors.textMuted} textAlign="center" marginTop="$4">
            Nenhum usuário cadastrado.
          </Text>
        )}
      </YStack>
    </ScrollView>
  );
}
