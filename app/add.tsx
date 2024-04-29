import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { View, Text, TextInput, Button, StyleSheet, SafeAreaView } from 'react-native';
import { SelectList } from 'react-native-dropdown-select-list';

import { municipios } from '~/municipios.json';
import { RequestBody } from './spp/name+api';
import Select from '~/components/Select';

export default function Details() {
  const { id } = useLocalSearchParams();
  const states = municipios.reduce((red: { key: string; value: string }[], mun) => {
    if (red.find((m) => m?.value === mun['UF-sigla'])) {
      return red;
    }
    const uf = mun['UF-sigla'];
    return [...red, { key: uf, value: uf }];
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
  } = useForm();

  const cities = () =>
    states &&
    municipios
      .filter((mun) => mun['UF-sigla'] === getValues('state'))
      .map((mun) => ({
        key: mun['municipio-nome'],
        value: mun['municipio-nome'],
      }));
  const onSubmit = (data: RequestBody) => {
    // Simulate form submission
    console.log(data);
  };

  return (
    <SafeAreaView>
      <Select className={''} />
      <View>
        {/* Form Girdileri */}
        <Controller
          control={control}
          render={({ field }) => <TextInput {...field} placeholder="Nome ouvido" />}
          name="name"
          rules={{ required: 'You must enter your name' }}
        />
        {errors.name && <Text>{errors?.name?.message}</Text>}

        <Controller
          control={control}
          render={({ field }) => <TextInput {...field} placeholder="Informante" />}
          name="informer"
          rules={{ required: 'You must enter your informer' }}
        />
        {errors.informer && <Text>{errors?.informer?.message}</Text>}

        <Controller
          control={control}
          render={({ field }) => (
            <SelectList
              {...field}
              setSelected={(e) => {
                setValue('state', e);
                setValue('city', '');
              }}
              data={states}
              placeholder="Informante"
            />
          )}
          name="state"
          rules={{ required: 'You must enter your informer' }}
        />
        {errors.state && <Text>{errors?.state?.message}</Text>}

        <Controller
          control={control}
          render={({ field }) => (
            <SelectList
              {...field}
              disabled={!cities()}
              setSelected={(e) => setValue('city', e)}
              data={cities()}
              placeholder="Informante"
            />
          )}
          name="city"
          rules={{ required: 'You must enter your informer' }}
        />
        {errors.state && <Text>{errors?.state?.message}</Text>}
        {/* Submit Butonu */}
        <Button title="Submit" onPress={handleSubmit(onSubmit)} />
      </View>
    </SafeAreaView>
  );
}
