import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Alert, Platform } from 'react-native';
import { Button, Text, YStack } from 'tamagui';
import { supabase } from '~/app/db';
import LoadingDialog from './LoadingDialog';
import FloatingLabelInput from './FloatingLabelInput';
import { tokens as t } from '~/src/theme/tokens';
import { useRouter } from 'expo-router';

export default function ResetPassword({
  setType,
  token,
  refreshToken,
}: {
  setType: (type: string) => void;
  token: string;
  refreshToken: string;
}) {
  const auth = supabase.auth;
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const setSession = async () => {
      if (!auth) {
        Alert.alert('Erro', 'Redefinição de senha indisponível no momento');
        setType('signin');
        return;
      }

      const { error } = await auth.setSession({
        access_token: token,
        refresh_token: refreshToken,
      });

      if (error) {
        Alert.alert('Erro', 'Link de redefinição inválido ou expirado');
        setType('signin');
      }
    };

    setSession();
  }, [auth, setType, token, refreshToken]);

  return (
    <>
      <LoadingDialog loading={loading} />
      <YStack gap="$6" width={200} alignItems="center">
        <Text textAlign="center" color={t.colors.textSecondary}>
          Digite sua nova senha
        </Text>
        <YStack justifyContent="flex-start" gap="$4">
          <Controller
            control={control}
            defaultValue=""
            render={({ field }) => (
              <FloatingLabelInput
                label="Nova senha"
                placeholder="Digite a nova senha"
                value={field.value}
                onChangeText={field.onChange}
                secureTextEntry
                error={errors.password?.message as string}
                width="$20"
                showLabel={false}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="new-password"
              />
            )}
            name="password"
            rules={{
              required: 'Obrigatório',
              minLength: {
                value: 6,
                message: 'A senha deve ter no mínimo 6 caracteres',
              },
            }}
          />

          <Controller
            control={control}
            defaultValue=""
            render={({ field }) => (
              <FloatingLabelInput
                label="Confirme a nova senha"
                placeholder="Repita a nova senha"
                value={field.value}
                onChangeText={field.onChange}
                secureTextEntry
                error={errors.confirmPassword?.message as string}
                width="$20"
                showLabel={false}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="new-password"
              />
            )}
            name="confirmPassword"
            rules={{
              required: 'Obrigatório',
              validate: (val: string) => {
                if (watch('password') != val) {
                  return 'As senhas não coincidem';
                }
              },
            }}
          />
        </YStack>

        <Button
          borderRadius={t.radii.button}
          color={t.colors.textOnPrimary}
          paddingHorizontal={24}
          paddingVertical={10}
          fontSize={14}
          fontWeight="bold"
          width="$20"
          backgroundColor={t.colors.primary}
          onPress={handleSubmit(async (data) => {
            if (!auth) {
              alert('Erro', 'Redefinição de senha indisponível no momento');
              return;
            }

            setLoading(true);
            await auth
              .updateUser({
                password: data.password,
              })
              .then(() => {
                setLoading(false);
                alert('Sucesso', 'Senha alterada com sucesso', [
                  { text: 'OK', onPress: () => router.replace('/') },
                ]);
              })
              .catch((error) => {
                setLoading(false);
                alert('Erro', error.message);
              });
          })}>
          Alterar senha
        </Button>
      </YStack>
    </>
  );
}

const alertPolyfill = (
  title: string,
  description: string,
  options?: Array<{
    text: string;
    onPress: () => void;
    style?: string;
  }>
) => {
  const result = window.confirm([title, description].filter(Boolean).join('\n'));

  if (result) {
    const confirmOption = options?.find(({ style }) => style !== 'cancel');
    confirmOption && confirmOption.onPress();
  } else {
    const cancelOption = options?.find(({ style }) => style === 'cancel');
    cancelOption && cancelOption.onPress();
  }
};

const alert = Platform.OS === 'web' ? alertPolyfill : Alert.alert;
