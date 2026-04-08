import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Pressable } from 'react-native';
import { Button, Text, YStack } from 'tamagui';
import { supabase } from '~/app/db';
import LoadingDialog from './LoadingDialog';
import FloatingLabelInput from './FloatingLabelInput';
import { tokens as t } from '~/src/theme/tokens';

export default function SignIn({ setType }: { setType: (type: string) => void }) {
  const auth = supabase.auth;
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  return (
    <>
      <LoadingDialog loading={loading} />
      <YStack gap="$6" width={200} alignItems="center">
        {loginError ? (
          <YStack
            backgroundColor="#FDECEA"
            borderRadius={t.radii.input}
            paddingHorizontal="$3"
            paddingVertical="$2"
            width="$20">
            <Text color={t.colors.error} fontSize={13} textAlign="center">
              {loginError}
            </Text>
          </YStack>
        ) : null}
        <YStack justifyContent="flex-start">
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
        </YStack>
        <YStack justifyContent="flex-start">
          <Controller
            control={control}
            defaultValue=""
            render={({ field }) => (
            <FloatingLabelInput
              label="Senha"
              placeholder="Digite sua senha"
              value={field.value}
              onChangeText={field.onChange}
              secureTextEntry
              error={errors.password?.message as string}
              width="$20"
              showLabel={false}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="current-password"
            />
            )}
            name="password"
            rules={{ required: 'Obrigatório' }}
          />
          <Pressable onPress={() => setType('forgot-password')}>
            <Text textDecorationLine="underline" color={t.colors.primary} fontSize={12}>
              Esqueceu sua senha?
            </Text>
          </Pressable>
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
              setLoginError('Login indisponível no momento.');
              return;
            }

            const { email, password } = data;
            setLoginError('');
            setLoading(true);
            const { error } = await auth.signInWithPassword({
              email,
              password,
            });

            if (error) {
              setLoading(false);
              setLoginError(translateAuthError(error.message));
              console.error('error', error);
            }
          })}>
          Entrar
        </Button>
        <YStack gap="$2" alignItems="center">
          <Text color={t.colors.text}>Não está cadastrado?</Text>
          <Pressable onPress={() => setType('signup')}>
            <Text textDecorationLine="underline" color={t.colors.primary}>
              Cadastre-se
            </Text>
          </Pressable>
        </YStack>
      </YStack>
    </>
  );
}

function translateAuthError(message: string): string {
  const map: Record<string, string> = {
    'Invalid login credentials': 'Email ou senha incorretos.',
    'Email not confirmed': 'Email ainda não confirmado. Verifique sua caixa de entrada.',
    'Invalid Refresh Token: Refresh Token Not Found':
      'Sua sessão expirou. Faça login novamente.',
    'Too many requests': 'Muitas tentativas. Aguarde um momento e tente novamente.',
  };
  return map[message] || 'Erro ao fazer login. Tente novamente.';
}
