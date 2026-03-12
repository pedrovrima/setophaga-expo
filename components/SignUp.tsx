import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Pressable } from 'react-native';
import { Button, Text, YStack } from 'tamagui';
import { supabase } from '~/app/db';
import LoadingDialog from './LoadingDialog';
import FloatingLabelInput from './FloatingLabelInput';
import { tokens as t } from '~/src/theme/tokens';

const webOrigin = (process.env.EXPO_PUBLIC_WEB_ORIGIN || 'https://xara-roan.vercel.app').replace(
  /\/$/,
  ''
);
const emailRedirectTo = `${webOrigin}/auth-callback`;

export default function SignUp({ setType }: { setType: (type: string) => void }) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpError, setSignUpError] = useState('');

  if (signUpEmail) {
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
            Verifique seu email
          </Text>
          <Text textAlign="center" color={t.colors.textSecondary} fontSize={14}>
            Enviamos um link de confirmação para:
          </Text>
          <Text
            fontWeight="bold"
            color={t.colors.primary}
            fontSize={14}
            textAlign="center">
            {signUpEmail}
          </Text>
          <Text
            textAlign="center"
            color={t.colors.textMuted}
            fontSize={13}
            marginTop="$2">
            Clique no link do email para ativar sua conta. Verifique também a pasta de spam.
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
          Ir para login
        </Button>
      </YStack>
    );
  }

  return (
    <>
      <LoadingDialog loading={loading} />
      <YStack gap="$6" width={200} alignItems="center">
        {signUpError ? (
          <YStack
            backgroundColor="#FDECEA"
            borderRadius={t.radii.input}
            paddingHorizontal="$3"
            paddingVertical="$2"
            width="$20">
            <Text color={t.colors.error} fontSize={13} textAlign="center">
              {signUpError}
            </Text>
          </YStack>
        ) : null}
        <Controller
          control={control}
          defaultValue=""
          render={({ field }) => (
            <FloatingLabelInput
              label="Nome"
              placeholder="Helmut"
              value={field.value}
              onChangeText={field.onChange}
              error={errors.name?.message as string}
              width="$20"
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
              label="Sobrenome"
              placeholder="Sick"
              value={field.value}
              onChangeText={field.onChange}
              error={errors.lastName?.message as string}
              width="$20"
            />
          )}
          name="lastName"
          rules={{ required: 'Obrigatório' }}
        />
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
        <Controller
          control={control}
          defaultValue=""
          render={({ field }) => (
            <FloatingLabelInput
              label="Senha"
              placeholder="Senha"
              value={field.value}
              onChangeText={field.onChange}
              secureTextEntry
              error={errors.password?.message as string}
              width="$20"
            />
          )}
          name="password"
          rules={{
            required: 'Obrigatório',
            minLength: { value: 6, message: 'Mínimo de 6 caracteres' },
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
            const { email, password, name, lastName } = data;
            setSignUpError('');
            setLoading(true);
            const { error } = await supabase.auth.signUp({
              email,
              password,
              options: {
                emailRedirectTo,
                data: {
                  firstName: name,
                  lastName,
                },
              },
            });
            setLoading(false);

            if (error) {
              setSignUpError(translateAuthError(error.message));
              console.error('error', error);
            } else {
              setSignUpEmail(email);
            }
          })}>
          Cadastrar
        </Button>
        <YStack gap="$2" alignItems="center">
          <Text color={t.colors.text}>Já possui cadastro?</Text>
          <Pressable onPress={() => setType('signin')}>
            <Text textDecorationLine="underline" color={t.colors.primary}>
              Faça login
            </Text>
          </Pressable>
        </YStack>
      </YStack>
    </>
  );
}

function translateAuthError(message: string): string {
  const map: Record<string, string> = {
    'User already registered': 'Este email já está cadastrado.',
    'Password should be at least 6 characters':
      'A senha deve ter pelo menos 6 caracteres.',
    'Unable to validate email address: invalid format':
      'Formato de email inválido.',
    'Signup requires a valid password': 'Informe uma senha válida.',
  };
  return map[message] || 'Erro ao criar conta. Tente novamente.';
}
