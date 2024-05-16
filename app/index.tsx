import { useState } from 'react';
import { FlashList } from '@shopify/flash-list';

import { Stack, Link, router } from 'expo-router';
import {
  Text,
  Input,
  XStack,
  YStack,
  H4,
  SizableText,
  View,
  Button,
  ButtonIcon,
  Image,
} from 'tamagui';

import useSpeciesSearch from '~/hooks/useSpeciesSearch';
import useSpeciesData from '~/hooks/useSpeciesData';
import { ScreenHeight, ScreenWidth } from 'react-native-elements/dist/helpers';
import Menu from '~/components/Menu';

export default function Home() {
  const query = useSpeciesData();
  const [searchTerm, setSerachTerm] = useState('');
  const [results, isLoading] = useSpeciesSearch(query.data, searchTerm);

  return (
    <>
      <YStack paddingHorizontal={20} paddingTop={60} flex={1} backgroundColor={'#FFFBF7'}>
        <View alignItems="center" marginBottom="$4">
          <Stack.Screen options={{ title: 'Home', headerShown: false }} />
          <Image source={require('../assets/logo.png')} height={48} width={140} />
        </View>
        <Text textAlign="center">popular - vernáculo - científico</Text>
        <Text textAlign="center" marginBottom={40}>
          Registre e pesquise nomes de Pássaros
        </Text>
        <View borderRadius={'$12'} overflow="hidden">
          <Input
            borderColor={'$borderColor'}
            onChangeText={(text) => setSerachTerm(text)}
            value={searchTerm}
            backgroundColor={'#ECE6F0'}
            placeholder="Busque o nome do pássaro"
            placeholderTextColor={'#49454F'}
          />
          <Image
            source={require('../assets/icons/search.png')}
            height={17}
            width={17}
            position="absolute"
            right={15}
            top={15}
          />
        </View>
        {searchTerm.length > 3 && (
          <>
            {results?.length > 0 ? (
              <FlashList
                estimatedItemSize={20}
                renderItem={({ item, index }) => {
                  if (typeof item === 'string') {
                    return (
                      <H4 marginTop="$6" fontWeight={'bold'}>
                        {item}
                      </H4>
                    );
                  }
                  return (
                    <Button
                      onPress={() => router.push(`spp/${item.id}`)}
                      width="100%"
                      alignSelf="stretch"
                      paddingHorizontal="$2"
                      paddingVertical="$2"
                      justifyContent="space-around"
                      alignItems="flex-start"
                      borderRadius={0}
                      backgroundColor={'transparent'}
                      flexDirection="column"
                      marginBottom="$2"
                      display="flex"
                      gap="$0">
                      <Text padding={0} margin={0} fontWeight={'bold'}>
                        {item?.stringFound}
                      </Text>
                      <Text padding={0} margin={0} fontStyle="italic">
                        {item?.scientificName}
                      </Text>
                    </Button>
                  );
                }}
                data={results}
              />
            ) : (
              <Text marginTop={'$4'}>Nenhum resultado encontrado</Text>
            )}
          </>
        )}
      </YStack>
    </>
  );
}
