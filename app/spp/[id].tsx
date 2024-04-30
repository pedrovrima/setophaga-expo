import { Link, Stack, useLocalSearchParams, router } from 'expo-router';

import { Button, Text, YStack } from 'tamagui';
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

      <YStack>
        {thisSpecies &&
          Object.keys(languageDictionary).map((dct) => {
            if (thisSpecies[dct]) {
              return (
                <Text key={dct}>
                  <Text fontWeight="bold">{languageDictionary[dct]}:</Text> {thisSpecies[dct]}
                </Text>
              );
            }
          })}
      </YStack>
    </>
  );
}
