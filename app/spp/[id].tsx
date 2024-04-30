import { Link, Stack, useLocalSearchParams, router } from 'expo-router';
import { Text, View, TouchableOpacity } from 'react-native';
import { Button } from 'tamagui';
import useSpeciesData from '~/hooks/useSpeciesData';
import { languageDictionary } from '~/hooks/useSpeciesSearch';

export default function Species() {
  const { id } = useLocalSearchParams();
  const sppDataQuery = useSpeciesData();

  if (!sppDataQuery.data && sppDataQuery.isLoading) {
    return <Text>Loading</Text>;
  }

  const thisSpecies = sppDataQuery?.data.find((spp) => '' + spp.Evaldo__c === id);
  return (
    <>
      <Button onPress={() => router.push(`/add?id=${id}` as string)}>Adicionar</Button>
      <Stack.Screen options={{ title: thisSpecies?.Name }} />

      <View>
        {thisSpecies &&
          Object.keys(languageDictionary).map((dct) => {
            if (thisSpecies[dct]) {
              return (
                <Text key={dct}>
                  <Text>{languageDictionary[dct]}:</Text> {thisSpecies[dct]}
                </Text>
              );
            }
          })}
      </View>
    </>
  );
}
