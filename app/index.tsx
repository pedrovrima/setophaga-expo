import { useState } from 'react';
import { FlashList } from '@shopify/flash-list';

import { Stack, Link, router } from 'expo-router';
import { Text, Input, XStack, YStack, H4, SizableText, View, Button } from 'tamagui';

import useSpeciesSearch from '~/hooks/useSpeciesSearch';
import useSpeciesData from '~/hooks/useSpeciesData';
import { Pressable } from 'react-native';

export default function Home() {
  const query = useSpeciesData();
  const [searchTerm, setSerachTerm] = useState('');
  const [results, isLoading] = useSpeciesSearch(query.data, searchTerm);

  return (
    <>
      <Stack.Screen options={{ title: 'Home' }} />

      <YStack padding="$2" maxWidth={600} flex={1} backgroundColor={'$background075'}>
        <Input
          borderColor={'$borderColor'}
          onChangeText={(text) => setSerachTerm(text)}
          value={searchTerm}
          marginBottom="$6"
        />

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
                <Button
                  onPress={() => router.push(`spp/${item.id}`)}
                  width={'100%'}
                  alignSelf="stretch"
                  paddingHorizontal="$2"
                  paddingVertical="$2"
                  backgroundColor={index % 2 ? `#fff` : `#ccc`}
                  justifyContent="space-between"
                  borderRadius={0}
                  display="flex">
                  <Text flex={1.5}>{item?.stringFound}</Text>
                  <Text flex={2} fontStyle="italic">
                    {item?.scientificName}
                  </Text>
                </Button>
              );
            }}
            data={results}
          />
        )}
      </YStack>
    </>
  );
}
