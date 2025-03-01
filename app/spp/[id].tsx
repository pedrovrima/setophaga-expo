import { Link, Stack, useLocalSearchParams, router } from 'expo-router';
import { Icon } from 'react-native-elements';
import { Button, Text, XStack, YStack, View, ScrollView, Image } from 'tamagui';
import useSpeciesData from '~/hooks/useSpeciesData';
import { languageDictionary } from '~/hooks/useSpeciesSearch';
import Toast from 'react-native-root-toast';
import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import Menu from '~/components/Menu';
import { BirdWithSynonyms } from '~/app/species+api';
export const languageFlags = {
  name_ptbr: '\uD83C\uDDE7\uD83C\uDDF7', // Brazil
  name_english: '\uD83C\uDDFA\uD83C\uDDF8', // United States
  name_spanish: '\uD83C\uDDEA\uD83C\uDDF8', // Spain
  name_danish: '\uD83C\uDDE9\uD83C\uDDF0', // Denmark
  name_dutch: '\uD83C\uDDF3\uD83C\uDDF1', // Netherlands
  name_estonian: '\uD83C\uDDEA\uD83C\uDDEA', // Estonia
  name_finnish: '\uD83C\uDDEB\uD83C\uDDEE', // Finland
  name_french: '\uD83C\uDDEB\uD83C\uDDF7', // France
  name_german: '\uD83C\uDDE9\uD83C\uDDEA', // Germany
  name_hungarian: '\uD83C\uDDED\uD83C\uDDFA', // Hungary
  name_japanese: '\uD83C\uDDEF\uD83C\uDDF5', // Japan
  name_norwegian: '\uD83C\uDDF3\uD83C\uDDF4', // Norway
  name_polish: '\uD83C\uDDF5\uD83C\uDDF1', // Poland
  name_russian: '\uD83C\uDDF7\uD83C\uDDFA', // Russia
  name_slovak: '\uD83C\uDDF8\uD83C\uDDF0', // Slovakia
  name_swedish: '\uD83C\uDDF8\uD83C\uDDEA', // Sweden
};

export default function Species() {
  const { id, querySuccess } = useLocalSearchParams();
  const sppDataQuery = useSpeciesData();

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

  if (!sppDataQuery.data && sppDataQuery.isLoading) {
    return <Text>Loading</Text>;
  }
  if (!sppDataQuery.data) {
    return <Text>Carregando</Text>;
  }

  const thisSpecies = sppDataQuery?.data?.find((spp) => '' + spp.id === id) as
    | BirdWithSynonyms
    | undefined;
  let words = thisSpecies?.name_sci.split(' ');
  console.log(words);

  let species = words![0][0] + '. ' + words![1];
  return (
    <>
      <Stack.Screen options={{ title: thisSpecies?.name_sci, headerShown: false }} />

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
                {thisSpecies?.name_sci}
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
            onPress={() => router.push(`/add?id=${id}`)}
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
            <Text>{thisSpecies?.order}</Text>
          </XStack>
          <XStack
            justifyContent="space-between"
            borderBottomWidth={1}
            paddingVertical={8}
            borderBottomColor={'#CAC4D0'}>
            <Text lineHeight={20} color="#6750A4" fontWeight={'bold'}>
              FAMÍLIA
            </Text>
            <Text>{thisSpecies?.family}</Text>
          </XStack>
          <XStack
            justifyContent="space-between"
            borderBottomWidth={1}
            paddingVertical={8}
            borderBottomColor={'#CAC4D0'}>
            <Text lineHeight={20} color="#6750A4" fontWeight={'bold'}>
              GÊNERO
            </Text>
            <Text>{thisSpecies?.genera}</Text>
          </XStack>
          <XStack justifyContent="space-between" paddingTop={8}>
            <Text lineHeight={20} color="#6750A4" fontWeight={'bold'}>
              ESPÉCIE
            </Text>
            <Text>{species}</Text>
          </XStack>

          <Button
            onPress={() =>
              Linking.openURL(`https://www.wikiaves.com.br/wiki/${thisSpecies?.name_ptbr}`)
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
          {thisSpecies &&
            Object.keys(languageDictionary).map((dct) => {
              if (thisSpecies[dct]?.length > 0 && dct === 'synonyms') {
                return (
                  <View
                    key={dct}
                    paddingVertical={16}
                    borderBottomColor={'#CAC4D0'}
                    borderBottomWidth={1}>
                    <Text fontSize={14} lineHeight={20} textTransform="uppercase">
                      <Text fontWeight="bold">{languageDictionary[dct]}</Text>
                    </Text>

                    {thisSpecies.synonyms
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((sin) => (
                        <Text key={sin.id} fontSize={18} lineHeight={20}>
                          {`${sin.name} (${sin.region})`}
                        </Text>
                      ))}
                  </View>
                );
              }
              if (thisSpecies[dct as keyof typeof thisSpecies] && dct !== 'synonyms') {
                return (
                  <View
                    key={dct}
                    paddingVertical={16}
                    borderBottomColor={'#CAC4D0'}
                    borderBottomWidth={1}>
                    <Text fontSize={14} lineHeight={20} textTransform="uppercase">
                      <Text>{languageFlags[dct as keyof typeof languageFlags]}</Text>{' '}
                      <Text fontWeight="bold">
                        {languageDictionary[dct as keyof typeof languageDictionary]}
                      </Text>
                    </Text>
                    <Text fontSize={18} lineHeight={20} fontStyle="italic">
                      {thisSpecies[dct as keyof typeof thisSpecies]}
                    </Text>
                  </View>
                );
              }
            })}
          <View height={100}></View>
        </YStack>
      </ScrollView>
    </>
  );
}

const breakWords = (text: string) => {
  if (text.length < 10) {
    return text;
  }
  const words = text.split('-');
  return words.map((word, index) => {
    if (index === words.length - 1) {
      return word;
    }
    if (index === 0) {
      return word + '- ';
    }
    return word + '- ';
  });
};
