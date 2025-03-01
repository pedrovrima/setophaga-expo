import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Pressable, Alert } from 'react-native';
import { Button, Input, Text, View, YStack } from 'tamagui';
import { supabase } from '~/app/db';
import LoadingDialog from './LoadingDialog';

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
        <Text textAlign="center" color="#49454F">
          Um email com instruções para redefinir sua senha foi enviado.
        </Text>
        <Button
          borderRadius="$12"
          color={'#FFF'}
          paddingHorizontal={24}
          paddingVertical={10}
          fontSize={14}
          fontWeight={'bold'}
          width={'$20'}
          backgroundColor="#6750A4"
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
        <Text textAlign="center" color="#49454F">
          Digite seu email para receber instruções de redefinição de senha
        </Text>
        <YStack justifyContent="flex-start">
          <Controller
            control={control}
            defaultValue={''}
            render={({ field }) => (
              <View position="relative">
                <Input
                  {...field}
                  placeholder="helmutsick@gmail.com"
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
                  Email
                </Text>
              </View>
            )}
            name="email"
            rules={{
              required: 'Obrigatório',
              pattern: { value: /^\S+@\S+$/, message: 'Email Inválido' },
            }}
          />
          {errors.email && <ErrorText>{errors?.email?.message as string}</ErrorText>}
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
            const { error, data: datum } = await supabase.auth.resetPasswordForEmail(data.email, {
              redirectTo: 'http://localhost:8081/reset-password',
            });
            setLoading(false);

            console.log(datum);
            if (error) {
              Alert.alert('Erro', error.message);
            } else {
              setEmailSent(true);
            }
          })}>
          Enviar email
        </Button>
        <YStack gap={'$2'} alignItems="center">
          <Pressable onPress={() => setType('signin')}>
            <Text textDecorationLine="underline" color="#6750A4">
              Voltar para login
            </Text>
          </Pressable>
        </YStack>
      </YStack>
    </>
  );
}

const ErrorText = ({ children }: { children: React.ReactNode }) => {
  return <Text color={'red'}>{children}</Text>;
};
