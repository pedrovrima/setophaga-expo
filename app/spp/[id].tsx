import { Stack, useLocalSearchParams, router } from 'expo-router';
import { Icon } from 'react-native-elements';
import { Button, Text, XStack, YStack, View, ScrollView, Image } from 'tamagui';
import Toast from 'react-native-root-toast';
import { useEffect } from 'react';
import * as Linking from 'expo-linking';

import useSpeciesDetail from '~/hooks/useSpeciesDetail';
import { languageDictionary } from '~/services/searchMetadata';

export const languageFlags = {
  name_ptbr: '\uD83C\uDDE7\uD83C\uDDF7',
  name_english: '\uD83C\uDDFA\uD83C\uDDF8',
  name_spanish: '\uD83C\uDDEA\uD83C\uDDF8',
  name_danish: '\uD83C\uDDE9\uD83C\uDDF0',
  name_dutch: '\uD83C\uDDF3\uD83C\uDDF1',
  name_estonian: '\uD83C\uDDEA\uD83C\uDDEA',
  name_finnish: '\uD83C\uDDEB\uD83C\uDDEE',
  name_french: '\uD83C\uDDEB\uD83C\uDDF7',
  name_german: '\uD83C\uDDE9\uD83C\uDDEA',
  name_hungarian: '\uD83C\uDDED\uD83C\uDDFA',
  name_japanese: '\uD83C\uDDEF\uD83C\uDDF5',
  name_norwegian: '\uD83C\uDDF3\uD83C\uDDF4',
  name_polish: '\uD83C\uDDF5\uD83C\uDDF1',
  name_russian: '\uD83C\uDDF7\uD83C\uDDFA',
  name_slovak: '\uD83C\uDDF8\uD83C\uDDF0',
  name_swedish: '\uD83C\uDDF8\uD83C\uDDEA',
};

export default function Species() {
  const { id, querySuccess } = useLocalSearchParams<{ id?: string; querySuccess?: string }>();
  const speciesQuery = useSpeciesDetail(id);

  useEffect(() => {
    if (querySuccess === 'true') {
      Toast.show('Sinônimo cadastrado com sucesso!', {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
        shadow: true,
        animation: true,
        hideOnPress: true,
        delay: 0,
        backgroundColor: '#322F35',
        textColor: '#FFF',
        opacity: 1,
      });
    }
  }, [querySuccess]);

  if (speciesQuery.isLoading) {
    return <Text>Carregando espécie...</Text>;
  }

  if (speciesQuery.isError || !speciesQuery.data) {
    return <Text>Espécie não encontrada</Text>;
  }

  const thisSpecies = speciesQuery.data;
  const words = thisSpecies.name_sci?.split(' ');
  const speciesName =
    words && words.length >= 2 ? `${words[0][0]}. ${words[1]}` : thisSpecies.name_sci || '';

  const languageKeys = Object.keys(languageDictionary) as Array<keyof typeof languageDictionary>;

  return (
    <>
      <Stack.Screen options={{ title: thisSpecies.name_sci, headerShown: false }} />

      <ScrollView
        paddingHorizontal={20}
        paddingTop={60}
        contentContainerStyle={{
          flex: 0,
          alignItems: 'center',
          width: '100%',
          minWidth: '100%',
        }}
        backgroundColor={'#FFFBF7'}
        flex={1}
        width="100%">
        <YStack maxWidth={600} width="100%" marginBottom={24} gap={'$4'}>
          <XStack justifyContent="space-between" width="100%" marginBottom={24}>
            <XStack gap={16} alignItems="center" flex={1}>
              <Icon
                style={{ flex: 1 }}
                name="arrow-back"
                type="material"
                color="#6750A4"
                onPress={() => router.back()}
              />
              <Text flex={2} wordWrap="normal" fontSize={22} fontStyle="italic">
                {thisSpecies.name_sci}
              </Text>
            </XStack>
          </XStack>

          <Button
            borderRadius="$12"
            color={'#FFF'}
            paddingHorizontal={24}
            paddingVertical={10}
            fontSize={14}
            fontWeight={'bold'}
            width={'$20'}
            backgroundColor="#6750A4"
            onPress={() =>
              router.push({
                pathname: '/add',
                params: { id: String(id || '') },
              })
            }
            marginTop={16}
            alignSelf="center">
            Adicionar sinônimo
          </Button>
        </YStack>

        <View
          backgroundColor={'#FEF7FF'}
          borderColor={'#CAC4D0'}
          borderWidth={1}
          paddingVertical={24}
          paddingHorizontal={24}
          borderRadius={'$6'}
          maxWidth={600}
          width="100%">
          <XStack
            justifyContent="space-between"
            borderBottomWidth={1}
            paddingBottom={8}
            borderBottomColor={'#CAC4D0'}
            width="100%">
            <Text color="#6750A4" fontWeight={'bold'}>
              ORDEM
            </Text>
            <Text>{thisSpecies.order}</Text>
          </XStack>
          <XStack
            justifyContent="space-between"
            borderBottomWidth={1}
            paddingVertical={8}
            borderBottomColor={'#CAC4D0'}>
            <Text lineHeight={20} color="#6750A4" fontWeight={'bold'}>
              FAMÍLIA
            </Text>
            <Text>{thisSpecies.family}</Text>
          </XStack>
          <XStack
            justifyContent="space-between"
            borderBottomWidth={1}
            paddingVertical={8}
            borderBottomColor={'#CAC4D0'}>
            <Text lineHeight={20} color="#6750A4" fontWeight={'bold'}>
              GÊNERO
            </Text>
            <Text>{thisSpecies.genera}</Text>
          </XStack>
          <XStack justifyContent="space-between" paddingTop={8}>
            <Text lineHeight={20} color="#6750A4" fontWeight={'bold'}>
              ESPÉCIE
            </Text>
            <Text>{speciesName}</Text>
          </XStack>

          <Button
            onPress={() =>
              Linking.openURL(`https://www.wikiaves.com.br/wiki/${thisSpecies.name_ptbr}`)
            }
            borderRadius="$12"
            paddingVertical={10}
            borderColor={'#6750A4'}
            maxWidth={400}
            alignSelf="center"
            backgroundColor={'transparent'}
            borderWidth={1}
            width={'full'}
            marginTop={16}>
            <Image source={require('../../assets/wikiaves_col.png')} height={24} width={32} />
            <Text> Veja no WikiAves</Text>
          </Button>
        </View>

        <YStack maxWidth={600} width="100%" marginTop={48}>
          {languageKeys.map((dictionaryKey) => {
            if (dictionaryKey === 'synonyms' && thisSpecies.synonyms.length > 0) {
              const orderedSynonyms = [...thisSpecies.synonyms].sort((a, b) =>
                a.name.localeCompare(b.name)
              );

              return (
                <View
                  key={dictionaryKey}
                  paddingVertical={16}
                  borderBottomColor={'#CAC4D0'}
                  borderBottomWidth={1}>
                  <Text fontSize={14} lineHeight={20} textTransform="uppercase">
                    <Text fontWeight="bold">{languageDictionary[dictionaryKey]}</Text>
                  </Text>

                  {orderedSynonyms.map((synonym) => (
                    <Text key={synonym.id} fontSize={18} lineHeight={20}>
                      {`${synonym.name} (${synonym.region})`}
                    </Text>
                  ))}
                </View>
              );
            }

            if (dictionaryKey === 'synonyms') {
              return null;
            }

            const value = thisSpecies[dictionaryKey];
            if (!value) {
              return null;
            }

            return (
              <View
                key={dictionaryKey}
                paddingVertical={16}
                borderBottomColor={'#CAC4D0'}
                borderBottomWidth={1}>
                <Text fontSize={14} lineHeight={20} textTransform="uppercase">
                  <Text>{languageFlags[dictionaryKey as keyof typeof languageFlags]}</Text>{' '}
                  <Text fontWeight="bold">{languageDictionary[dictionaryKey]}</Text>
                </Text>
                <Text fontSize={18} lineHeight={20} fontStyle="italic">
                  {value}
                </Text>
              </View>
            );
          })}
          <View height={100} />
        </YStack>
      </ScrollView>
    </>
  );
}
