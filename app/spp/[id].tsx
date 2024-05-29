import { Link, Stack, useLocalSearchParams, router } from 'expo-router';
import { Icon } from 'react-native-elements';
import { Button, Text, XStack, YStack, View, ScrollView, Image } from 'tamagui';
import useSpeciesData from '~/hooks/useSpeciesData';
import { languageDictionary } from '~/hooks/useSpeciesSearch';
import Toast from 'react-native-root-toast';
import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import Menu from '~/components/Menu';

export const languageFlags = {
  NVP__c: '\uD83C\uDDE7\uD83C\uDDF7', // Brazil
  USName__c: '\uD83C\uDDFA\uD83C\uDDF8', // United States
  Spanish__c: '\uD83C\uDDEA\uD83C\uDDF8', // Spain
  Danish__c: '\uD83C\uDDE9\uD83C\uDDF0', // Denmark
  Dutch__c: '\uD83C\uDDF3\uD83C\uDDF1', // Netherlands
  Estonian__c: '\uD83C\uDDEA\uD83C\uDDEA', // Estonia
  Finnish__c: '\uD83C\uDDEB\uD83C\uDDEE', // Finland
  French__c: '\uD83C\uDDEB\uD83C\uDDF7', // France
  German__c: '\uD83C\uDDE9\uD83C\uDDEA', // Germany
  Hungarian__c: '\uD83C\uDDED\uD83C\uDDFA', // Hungary
  Japanese__c: '\uD83C\uDDEF\uD83C\uDDF5', // Japan
  Norwegian__c: '\uD83C\uDDF3\uD83C\uDDF4', // Norway
  Polish__c: '\uD83C\uDDF5\uD83C\uDDF1', // Poland
  Russian__c: '\uD83C\uDDF7\uD83C\uDDFA', // Russia
  Slovak__c: '\uD83C\uDDF8\uD83C\uDDF0', // Slovakia
  Swedish__c: '\uD83C\uDDF8\uD83C\uDDEA', // Sweden
};

export default function Species() {
  const { id, querySuccess } = useLocalSearchParams();
  const sppDataQuery = useSpeciesData();

  // if (!sppDataQuery.data && sppDataQuery.isLoading) {
  //   return <Text>Loading</Text>;
  // }

  // useEffect(() => {
  //   if (querySuccess === 'true') {
  //     Toast.show('Sinônimo cadastrado com sucesso!', {
  //       duration: Toast.durations.LONG,
  //       position: Toast.positions.BOTTOM,
  //       shadow: true,
  //       animation: true,
  //       hideOnPress: true,
  //       delay: 0,
  //       backgroundColor: '#322F35',
  //       textColor: '#FFF',
  //       opacity: 1,
  //     });
  //   }
  // }, [querySuccess]);
  // const thisSpecies = sppDataQuery?.data.find((spp) => '' + spp.Evaldo__c === id);
  // let words = thisSpecies?.Name.split(' ');
  // let species = words![0][0] + '. ' + words![1];
  return (
    <>
      {/* <Stack.Screen options={{ title: thisSpecies?.Name, headerShown: false }} />

      <ScrollView
        paddingHorizontal={20}
        paddingTop={60}
        contentContainerStyle={{ flex: 0 }}
        backgroundColor={'#FFFBF7'}>
        <YStack marginBottom={24} gap={'$4'}>
          <XStack gap={16} alignItems="center" flex={1}>
            <Icon
              style={{ flex: 1 }}
              name="arrow-back"
              type="material"
              color="#6750A4"
              onPress={() => router.back()}
            />
            <Text flex={2} wordWrap="normal" fontSize={22}>
              {thisSpecies?.NVP__c}
            </Text>
          </XStack>
          <Button
            borderRadius="$12"
            color={'#FFF'}
            paddingHorizontal={24}
            paddingVertical={10}
            fontSize={14}
            fontWeight={'bold'}
            width={'full'}
            backgroundColor="#6750A4"
            onPress={() => router.push(`/add?id=${id}` as string)}>
            Adicionar sinônimo
          </Button>
        </YStack>
        <View
          backgroundColor={'#FEF7FF'}
          borderColor={'#CAC4D0'}
          borderWidth={1}
          paddingVertical={24}
          paddingHorizontal={24}
          borderRadius={'$6'}>
          <XStack
            justifyContent="space-between"
            borderBottomWidth={1}
            paddingBottom={8}
            borderBottomColor={'#CAC4D0'}>
            <Text color="#6750A4" fontWeight={'bold'}>
              ORDEM
            </Text>
            <Text>{thisSpecies?.Ordem__c}</Text>
          </XStack>
          <XStack
            justifyContent="space-between"
            borderBottomWidth={1}
            paddingVertical={8}
            borderBottomColor={'#CAC4D0'}>
            <Text lineHeight={20} color="#6750A4" fontWeight={'bold'}>
              FAMÍLIA
            </Text>
            <Text>{thisSpecies?.Familia__c}</Text>
          </XStack>
          <XStack
            justifyContent="space-between"
            borderBottomWidth={1}
            paddingVertical={8}
            borderBottomColor={'#CAC4D0'}>
            <Text lineHeight={20} color="#6750A4" fontWeight={'bold'}>
              GÊNERO
            </Text>
            <Text>{thisSpecies?.Genero__c}</Text>
          </XStack>
          <XStack justifyContent="space-between" paddingTop={8}>
            <Text lineHeight={20} color="#6750A4" fontWeight={'bold'}>
              ESPÉCIE
            </Text>
            <Text>{species}</Text>
          </XStack>

          <Button
            onPress={() =>
              Linking.openURL(`https://www.wikiaves.com.br/wiki/${thisSpecies?.NVP__c}`)
            }
            borderRadius="$12"
            paddingVertical={10}
            borderColor={'#6750A4'}
            backgroundColor={'transparent'}
            borderWidth={1}
            width={'full'}
            marginTop={16}>
            <Image source={require('../../assets/wikiaves_col.png')} height={24} width={32} />
            <Text> Veja no WikiAves</Text>
          </Button>
        </View>

        <YStack>
          {thisSpecies &&
            Object.keys(languageDictionary).map((dct) => {
              if (thisSpecies[dct]?.length > 0 && dct === 'sinom') {
                return (
                  <View
                    key={dct}
                    paddingVertical={16}
                    borderBottomColor={'#CAC4D0'}
                    borderBottomWidth={1}>
                    <Text fontSize={14} lineHeight={20} textTransform="uppercase">
                      <Text fontWeight="bold">{languageDictionary[dct]}</Text>
                    </Text>

                    {thisSpecies.sinom
                      .sort((a, b) => a.Name.localeCompare(b.Name))
                      .map((sin) => (
                        <Text key={sin.ColetorId__c + sin.Name} fontSize={18} lineHeight={20}>
                          {`${sin.Name} (${sin.Regiao__c})`}
                        </Text>
                      ))}
                  </View>
                );
              }
              if (thisSpecies[dct] && dct !== 'sinom') {
                return (
                  <View
                    key={dct}
                    paddingVertical={16}
                    borderBottomColor={'#CAC4D0'}
                    borderBottomWidth={1}>
                    <Text fontSize={14} lineHeight={20} textTransform="uppercase">
                      <Text>{languageFlags[dct]}</Text>{' '}
                      <Text fontWeight="bold">{languageDictionary[dct]}</Text>
                    </Text>
                    <Text fontSize={18} lineHeight={20} fontStyle="italic">
                      {thisSpecies[dct]}
                    </Text>
                  </View>
                );
              }
            })}
          <View height={100}></View>
        </YStack>
      </ScrollView> */}
      <Text>{id}</Text>
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
