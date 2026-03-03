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
const emailRedirectTo = `${webOrigin}/auth-callback`;

export default function SignUp({ setType }: { setType: (type: string) => void }) {
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
            setLoading(true);
            await supabase.auth
              .signUp({
                email,
                password,
                options: {
                  emailRedirectTo,
                  data: {
                    firstName: name,
                    lastName,
                  },
                },
              })
              .then(() => {
                setLoading(false);
                Alert.alert('Sucesso', 'Cheque seu email para confirmar sua conta', [
                  { text: 'OK', onPress: () => setType('signin') },
                ]);
              })
              .catch((error) => {
                setLoading(false);
                if (error) Alert.alert(error.message);
                console.error('error', error);
              });
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
