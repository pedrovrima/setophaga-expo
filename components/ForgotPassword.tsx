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
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  if (emailSent) {
    return (
      <YStack gap="$6" width={200} alignItems="center">
        <Text textAlign="center" color={t.colors.textSecondary}>
          Um email com instruções para redefinir sua senha foi enviado.
        </Text>
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
              placeholder="helmutsick@gmail.com"
              value={field.value}
              onChangeText={field.onChange}
              error={errors.email?.message as string}
              width="$20"
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
            setLoading(true);
            const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
              redirectTo: resetPasswordRedirectTo,
            });
            setLoading(false);

            if (error) {
              Alert.alert('Erro', error.message);
            } else {
              setEmailSent(true);
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
