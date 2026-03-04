import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Pressable, Alert } from 'react-native';
import { Button, Text, YStack } from 'tamagui';
import { supabase } from '~/app/db';
import LoadingDialog from './LoadingDialog';
import FloatingLabelInput from './FloatingLabelInput';
import { tokens as t } from '~/src/theme/tokens';

export default function SignIn({ setType }: { setType: (type: string) => void }) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);
  return (
    <>
      <LoadingDialog loading={loading} />
      <YStack gap="$6" width={200} alignItems="center">
        <YStack justifyContent="flex-start">
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
        </YStack>
        <YStack justifyContent="flex-start">
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
            const { email, password } = data;
            setLoading(true);
            const { error } = await supabase.auth.signInWithPassword({
              email,
              password,
            });

            if (error) {
              setLoading(false);
              Alert.alert(error.message);
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
