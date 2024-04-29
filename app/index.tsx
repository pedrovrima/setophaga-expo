import { useState } from 'react';
import { FlashList } from '@shopify/flash-list';
import { useQuery } from '@tanstack/react-query';
import { Stack, Link } from 'expo-router';
import { Text, TextInput, View } from 'react-native';

import { Container } from '~/components/Container';
import useSpeciesSearch from '~/hooks/useSpeciesSearch';
import useSpeciesData from '~/hooks/useSpeciesData';

export default function Home() {
  const query = useSpeciesData();
  const [searchTerm, setSerachTerm] = useState('');
  const [results, isLoading] = useSpeciesSearch(query.data, searchTerm);

  return (
    <>
      <Stack.Screen options={{ title: 'Home' }} />
      <Container>
        <View>
          <TextInput
            onChangeText={(text) => setSerachTerm(text)}
            value={searchTerm}
            className="w-full border-2 border-cyan-300 bg-white px-2 py-1 text-lg"
          />
        </View>
        <Text>{query.isLoading && 'Loading'}</Text>
        {query.data && (
          <FlashList
            estimatedItemSize={10}
            renderItem={({ item, index }) => {
              if (typeof item === 'string') {
                return <Text className="mb-4 mt-6 w-3/4 text-lg font-bold">{item}</Text>;
              }
              return (
                <Link href={`/spp/${'' + item?.id}`}>
                  <View
                    className={`max-w-screen flex w-screen flex-[1] flex-row gap-6 py-4 ${index % 2 ? 'bg-gray-300' : 'bg-white'} px-2`}>
                    <Text className="text-md flex-[1]">{item?.stringFound}</Text>
                    <Text className="text-md flex-[1] text-left italic ">
                      {item?.scientificName}
                    </Text>
                  </View>
                </Link>
              );
            }}
            data={results}
          />
        )}
        <Link href={{ pathname: '/details', params: { name: 'Dan' } }} asChild>
          {/* <Button onPress={() => {}} title="Show Details" /> */}
        </Link>
      </Container>
    </>
  );
}
