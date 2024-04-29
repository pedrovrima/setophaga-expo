import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { Text, View, TouchableOpacity } from 'react-native';
import { Button } from '~/components/Button';
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
      <Link className=" w-min" href="/add">
        <Text>Adicionar</Text>
      </Link>
      <Stack.Screen options={{ title: thisSpecies?.Name }} />

      <View>
        {thisSpecies &&
          Object.keys(languageDictionary).map((dct) => {
            if (thisSpecies[dct]) {
              return (
                <Text key={dct}>
                  <Text className="font-bold">{languageDictionary[dct]}:</Text> {thisSpecies[dct]}
                </Text>
              );
            }
          })}
      </View>
    </>
  );
}
