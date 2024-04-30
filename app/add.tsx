import { Session } from '@supabase/supabase-js';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { View, Text, TextInput, Button, SafeAreaView } from 'react-native';
import { setEnabled } from 'react-native/Libraries/Performance/Systrace';

import Select from '~/components/Select';
import Authentication from '~/components/screens/Authentication';
import useCreateName from '~/hooks/useCreateName';
import useSpeciesData from '~/hooks/useSpeciesData';
import { municipios } from '~/municipios.json';
import { supabase } from '~/services/supabase';

export default function Details() {
  const { id } = useLocalSearchParams();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  const species = useSpeciesData();
  const thisSpp = species?.data?.find((spp) => '' + spp.Evaldo__c === id);
  const createNameMutations = useCreateName();
  const states = municipios.reduce((red: string[], mun) => {
    if (red.find((m) => m === mun['UF-sigla'])) {
      return red;
    }
    const uf = mun['UF-sigla'];
    return [...red, uf];
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    watch,
  } = useForm();

  const cities = () =>
    states &&
    municipios
      .filter((mun) => mun['UF-sigla'] === watch('state'))
      .map((mun) => mun['municipio-nome']);
  const onSubmit = (data) => {
    // Simulate form submission
    const _data = {
      ...data,
      id: thisSpp?.Id,
      collectorsId: session?.user.id,
      collectorsName:
        session?.user.user_metadata.firstName + ' ' + session?.user.user_metadata.lastName,
    };
    console.log(_data);
    createNameMutations.mutate(_data);
  };

  return (
    <SafeAreaView>
      {session?.user.id ? (
        <View>
          {/* Form Girdileri */}
          <Controller
            control={control}
            defaultValue={''}
            render={({ field }) => (
              <TextInput {...field} placeholder="Nome ouvido" onChangeText={field.onChange} />
            )}
            name="name"
            rules={{ required: 'You must enter your name' }}
          />
          {errors.name && <ErrorText>{errors?.name?.message as string}</ErrorText>}

          <Controller
            control={control}
            defaultValue={''}
            render={({ field }) => (
              <TextInput {...field} placeholder="Informante" onChangeText={field.onChange} />
            )}
            name="informer"
            rules={{ required: 'You must enter your informer' }}
          />
          {errors.informer && <ErrorText>{errors?.informer?.message as string}</ErrorText>}

          <Controller
            control={control}
            defaultValue={''}
            render={({ field }) => (
              <Select
                {...field}
                options={states}
                placeholder="Selecione o estado"
                changeCallback={() => setValue('city', '')}
              />
            )}
            name="state"
            rules={{ required: 'You must enter a state  ' }}
          />
          {errors.state && <ErrorText>{errors?.state?.message as string}</ErrorText>}

          <Controller
            control={control}
            defaultValue={''}
            render={({ field }) => (
              <Select
                {...field}
                disabled={!watch('state')}
                placeholder="Selecione a cidade"
                options={cities()}
              />
            )}
            name="city"
            rules={{ required: 'You must enter your city' }}
          />
          {errors.city && <ErrorText>{errors?.city?.message as string}</ErrorText>}

          <Controller
            control={control}
            defaultValue={''}
            render={({ field }) => (
              <TextInput {...field} placeholder="Localidade" onChangeText={field.onChange} />
            )}
            name="location"
            rules={{ required: 'Descreva a localidade' }}
          />
          {errors.location && <ErrorText>{errors?.location?.message as string}</ErrorText>}
          {/* Submit Butonu */}
          <Button title="Submit" onPress={handleSubmit(onSubmit)} />
        </View>
      ) : (
        <Authentication />
      )}
    </SafeAreaView>
  );
}

const ErrorText = ({ children }: { children: React.ReactNode }) => {
  return <Text className="text-red-500">{children}</Text>;
};
