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
    <YStack paddingVertical="$8">
      <Stack.Screen options={{ title: thisSpecies?.Name }} />
      <Button
        marginBottom="$4"
        marginHorizontal="$4"
        backgroundColor="slategray"
        onPress={() => router.push(`/add?id=${id}` as string)}>
        Adicionar Nome
      </Button>

      <YStack paddingHorizontal="$6">
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
    </YStack>
  );
}
