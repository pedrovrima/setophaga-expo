import React, { useState } from 'react';
import { useForm, Controller, set } from 'react-hook-form';
import { Pressable, Alert } from 'react-native';
import { Button, Dialog, H3, Input, Spinner, Text, View, YStack } from 'tamagui';
import { supabase } from '~/app/db';
import LoadingDialog from './LoadingDialog';

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
              pattern: { value: /^\S+@\S+$/, message: 'Email Inváido' },
            }}
          />
          {errors.email && <ErrorText>{errors?.email?.message as string}</ErrorText>}
        </YStack>
        <YStack justifyContent="flex-start">
          <Controller
            control={control}
            defaultValue={''}
            render={({ field }) => (
              <View position="relative">
                <Input
                  width={'$20'}
                  secureTextEntry={true}
                  textContentType="password"
                  {...field}
                  placeholder="Senha"
                  onChangeText={field.onChange}
                  paddingVertical={12}
                  paddingLeft={16}
                />
                <Text
                  position="absolute"
                  top={-8}
                  left={12}
                  fontSize={12}
                  color={'#49454F'}
                  backgroundColor={'#FEF7FF'}>
                  Senha
                </Text>
              </View>
            )}
            name="password"
            rules={{ required: 'Obrigatório' }}
          />
          {errors.password && <ErrorText>{errors?.password?.message as string}</ErrorText>}
          <Pressable onPress={() => setType('forgot-password')}>
            <Text textDecorationLine="underline" color="#6750A4" fontSize={12}>
              Esqueceu sua senha?
            </Text>
          </Pressable>
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
            const { email, password } = data;
            console.log(email, password);
            setLoading(true);
            const { error, data: datum } = await supabase.auth.signInWithPassword({
              email,
              password,
            });

            console.log(datum, error);
            if (error) {
              setLoading(false);
              if (error) Alert.alert(error.message);

              console.error('error', error);
            }
          })}>
          Entrar
        </Button>
        <YStack gap={'$2'} alignItems="center">
          <Text>Não está cadastrado?</Text>
          <Pressable onPress={() => setType('signup')}>
            <Text textDecorationLine="underline" color="#6750A4">
              Cadastre-se
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
