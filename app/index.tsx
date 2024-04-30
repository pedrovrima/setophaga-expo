import { useState } from 'react';
import { FlashList } from '@shopify/flash-list';
import { useQuery } from '@tanstack/react-query';
import { Stack, Link } from 'expo-router';
import { Text, Input, XStack, YStack, H4 } from 'tamagui';

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

      <YStack padding="$2" maxWidth={600} flex={1}>
        <Input onChangeText={(text) => setSerachTerm(text)} value={searchTerm} marginBottom="$6" />

        <Text>{query.isLoading && 'Loading'}</Text>
        {query.data && (
          <FlashList
            estimatedItemSize={10}
            renderItem={({ item, index }) => {
              if (typeof item === 'string') {
                return <H4 className="mb-4 mt-6 w-3/4 text-lg font-bold">{item}</H4>;
              }
              return (
                <Link href={`/spp/${'' + item?.id}`}>
                  <XStack
                    paddingHorizontal="$6"
                    paddingVertical="$2"
                    backgroundColor={index % 2 ? `#fff` : `#ccc`}
                    justifyContent="space-between"
                    flex={1}
                    className={`max-w-screen flex w-screen flex-[1] flex-row gap-6 py-4 ${index % 2 ? 'bg-gray-300' : 'bg-white'} px-2`}>
                    <Text>{item?.stringFound}</Text>
                    <Text fontStyle="italic">{item?.scientificName}</Text>
                  </XStack>
                </Link>
              );
            }}
            data={results}
          />
        )}
      </YStack>
    </>
  );
}
