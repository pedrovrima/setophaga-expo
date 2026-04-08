import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Pressable, Alert } from 'react-native';
import { Button, Text, YStack } from 'tamagui';
import { supabase } from '~/app/db';
import LoadingDialog from './LoadingDialog';
import FloatingLabelInput from './FloatingLabelInput';
import { tokens as t } from '~/src/theme/tokens';

const webOrigin = (process.env.EXPO_PUBLIC_WEB_ORIGIN || 'https://xara-roan.vercel.app').replace(
  /\/$/,
  ''
);
const resetPasswordRedirectTo = `${webOrigin}/reset-password`;

export default function ForgotPassword({ setType }: { setType: (type: string) => void }) {
  const auth = supabase.auth;
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);
  const [sentToEmail, setSentToEmail] = useState('');

  if (sentToEmail) {
    return (
      <YStack gap="$6" width={280} alignItems="center">
        <YStack
          backgroundColor={t.colors.surfaceTint}
          borderRadius={t.radii.card}
          padding="$4"
          alignItems="center"
          gap="$3"
          width="100%">
          <Text fontSize={32}>✉️</Text>
          <Text
            fontSize={16}
            fontWeight="bold"
            color={t.colors.text}
            textAlign="center">
            Email enviado
          </Text>
          <Text textAlign="center" color={t.colors.textSecondary} fontSize={14}>
            Enviamos as instruções de redefinição de senha para:
          </Text>
          <Text
            fontWeight="bold"
            color={t.colors.primary}
            fontSize={14}
            textAlign="center">
            {sentToEmail}
          </Text>
          <Text
            textAlign="center"
            color={t.colors.textMuted}
            fontSize={13}
            marginTop="$2">
            Verifique também a pasta de spam.
          </Text>
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
          onPress={() => setType('signin')}>
          Voltar para login
        </Button>
      </YStack>
    );
  }

  return (
    <>
      <LoadingDialog loading={loading} />
      <YStack gap="$6" width={400} alignItems="center">
        <Text textAlign="center" color={t.colors.textSecondary}>
          Digite seu email para receber instruções de redefinição de senha
        </Text>
        <Controller
          control={control}
          defaultValue=""
          render={({ field }) => (
            <FloatingLabelInput
              label="Email"
              placeholder="seuemail@exemplo.com"
              value={field.value}
              onChangeText={field.onChange}
              error={errors.email?.message as string}
              width="$20"
              showLabel={false}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
            />
          )}
          name="email"
          rules={{
            required: 'Obrigatório',
            pattern: { value: /^\S+@\S+$/, message: 'Email Inválido' },
          }}
        />
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
              Alert.alert('Erro', 'Recuperação de senha indisponível no momento.');
              return;
            }

            setLoading(true);
            const { error } = await auth.resetPasswordForEmail(data.email, {
              redirectTo: resetPasswordRedirectTo,
            });
            setLoading(false);

            if (error) {
              Alert.alert('Erro', error.message);
            } else {
              setSentToEmail(data.email);
            }
          })}>
          Enviar email
        </Button>
        <YStack gap="$2" alignItems="center">
          <Pressable onPress={() => setType('signin')}>
            <Text textDecorationLine="underline" color={t.colors.primary}>
              Voltar para login
            </Text>
          </Pressable>
        </YStack>
      </YStack>
    </>
  );
}
