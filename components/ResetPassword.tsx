import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Alert, Platform } from 'react-native';
import { Button, Input, Text, View, YStack } from 'tamagui';
import { supabase } from '~/app/db';
import LoadingDialog from './LoadingDialog';
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
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Set the session when component mounts
    const setSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.setSession({
        access_token: token,
        refresh_token: refreshToken,
      });

      console.log(session, error);

      if (error) {
        Alert.alert('Erro', 'Link de redefinição inválido ou expirado');
        setType('signin');
      }
    };

    setSession();
  }, [token]);

  return (
    <>
      <LoadingDialog loading={loading} />
      <YStack gap="$6" width={200} alignItems="center">
        <Text textAlign="center" color="#49454F">
          Digite sua nova senha
        </Text>
        <YStack justifyContent="flex-start" gap="$4">
          <Controller
            control={control}
            defaultValue={''}
            render={({ field }) => (
              <View position="relative">
                <Input
                  {...field}
                  secureTextEntry={true}
                  placeholder="Nova senha"
                  onChangeText={field.onChange}
                  paddingVertical={12}
                  paddingLeft={16}
                  width={'$20'}
                />
                <Text
                  position="absolute"
                  top={-8}
                  left={12}
                  fontSize={12}
                  color={'#49454F'}
                  backgroundColor={'#FEF7FF'}>
                  Nova senha
                </Text>
              </View>
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
          {errors.password && <ErrorText>{errors?.password?.message as string}</ErrorText>}

          <Controller
            control={control}
            defaultValue={''}
            render={({ field }) => (
              <View position="relative">
                <Input
                  {...field}
                  secureTextEntry={true}
                  placeholder="Confirme a nova senha"
                  onChangeText={field.onChange}
                  paddingVertical={12}
                  paddingLeft={16}
                  width={'$20'}
                />
                <Text
                  position="absolute"
                  top={-8}
                  left={12}
                  fontSize={12}
                  color={'#49454F'}
                  backgroundColor={'#FEF7FF'}>
                  Confirme a nova senha
                </Text>
              </View>
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
          {errors.confirmPassword && (
            <ErrorText>{errors?.confirmPassword?.message as string}</ErrorText>
          )}
        </YStack>

        <Button
          borderRadius="$12"
          color={'#FFF'}
          paddingHorizontal={24}
          paddingVertical={10}
          fontSize={14}
          fontWeight={'bold'}
          width={'$20'}
          backgroundColor="#6750A4"
          onPress={handleSubmit(async (data) => {
            setLoading(true);
            await supabase.auth
              .updateUser({
                password: data.password,
              })
              .then((res) => {
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

const ErrorText = ({ children }: { children: React.ReactNode }) => {
  return <Text color={'red'}>{children}</Text>;
};

const alertPolyfill = (
  title: string,
  description: string,
  options: Array<{
    text: string;
    onPress: () => void;
    style?: string;
  }>
) => {
  const result = window.confirm([title, description].filter(Boolean).join('\n'));

  if (result) {
    const confirmOption = options.find(({ style }) => style !== 'cancel');
    confirmOption && confirmOption.onPress();
  } else {
    const cancelOption = options.find(({ style }) => style === 'cancel');
    cancelOption && cancelOption.onPress();
  }
};

const alert = Platform.OS === 'web' ? alertPolyfill : Alert.alert;
