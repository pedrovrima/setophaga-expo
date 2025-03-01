import React, { useState } from 'react';
import { useForm, Controller, set } from 'react-hook-form';
import { Pressable, Alert } from 'react-native';
import { Button, Dialog, H3, Input, Spinner, Text, View, YStack, ScrollView } from 'tamagui';
import { supabase } from '~/app/db';
import LoadingDialog from './LoadingDialog';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

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
        <YStack justifyContent="flex-start">
          <Controller
            control={control}
            defaultValue={''}
            render={({ field }) => (
              <View position="relative">
                <Input
                  {...field}
                  placeholder="Helmut"
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
                  Nome
                </Text>
              </View>
            )}
            name="name"
            rules={{
              required: 'Obrigatório',
            }}
          />
          {errors.name && <ErrorText>{errors?.name?.message as string}</ErrorText>}
        </YStack>
        <YStack justifyContent="flex-start">
          <Controller
            control={control}
            defaultValue={''}
            render={({ field }) => (
              <View position="relative">
                <Input
                  {...field}
                  placeholder="Helmut"
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
                  Sobrenome
                </Text>
              </View>
            )}
            name="lastName"
            rules={{
              required: 'Obrigatório',
            }}
          />
          {errors.lastName && <ErrorText>{errors?.lastName?.message as string}</ErrorText>}
        </YStack>
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
            rules={{
              required: 'Obrigatório',
              minLength: { value: 6, message: 'Mínimo de 6 caracteres' },
            }}
          />
          {errors.password && <ErrorText>{errors?.password?.message as string}</ErrorText>}
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
            const { email, password, name, lastName } = data;
            setLoading(true);
            await supabase.auth
              .signUp({
                email: email,
                password: password,
                options: {
                  data: {
                    firstName: name,
                    lastName,
                  },
                },
              })
              .then(({}) => {
                setLoading(false);
                Alert.alert('Success', 'Cheque seu email para confirmar sua conta', [
                  { text: 'OK', onPress: () => setType('signin') },
                ]);
              })
              .catch((error) => {
                if (error) {
                  if (error) Alert.alert(error.message);

                  console.error('error', error);
                }
              });
          })}>
          Cadastrar
        </Button>
        <YStack gap={'$2'} alignItems="center">
          <Text>Já possui cadastrado?</Text>
          <Pressable onPress={() => setType('signin')}>
            <Text textDecorationLine="underline" color="#6750A4">
              Faça login
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
