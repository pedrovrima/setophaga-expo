import { useState } from 'react';
import { FlashList } from '@shopify/flash-list';

import { Stack, Link } from 'expo-router';
import { Text, Input, XStack, YStack, H4, SizableText } from 'tamagui';

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
                return (
                  <H4 paddingLeft="$4" marginTop="$2">
                    {item}
                  </H4>
                );
              }
              return (
                <Link href={`/spp/${'' + item?.id}`}>
                  <XStack
                    paddingHorizontal="$6"
                    paddingVertical="$2"
                    backgroundColor={index % 2 ? `#fff` : `#ccc`}
                    justifyContent="space-between"
                    width={'100%'}
                    flex={1}>
                    <Text>{item?.stringFound}</Text>
                    <SizableText fontStyle="italic">{item?.scientificName}</SizableText>
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
