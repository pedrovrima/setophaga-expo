import { useState, useEffect } from 'react';
import { FlashList } from '@shopify/flash-list';
import { isMobile } from 'react-device-detect';

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
import { Linking } from 'react-native';
import { Platform } from 'react-native';

export default function Home() {
  const query = useSpeciesData();

  const [searchTerm, setSerachTerm] = useState('');
  const [results, isLoading] = useSpeciesSearch(query.data, searchTerm);

  const openIfCan = async () => {
    const can = await Linking.canOpenURL('setophaga-expo://');
    if (can && isMobile) {
      Linking.openURL('setophaga-expo://');
    }
  };

  useEffect(() => {
    openIfCan();
    console.log('Linking.openURL');
  }, []);

  return (
    <View flex={1} alignItems="center" backgroundColor={'#FFFBF7'} paddingHorizontal={20}>
      <YStack
        paddingHorizontal={20}
        paddingTop={60}
        maxWidth={1000}
        minWidth={!isMobile ? 700 : 'auto'}
        width="100%"
        flex={1}
        backgroundColor={'#FFFBF7'}>
        <View alignItems="center" marginBottom="$4">
          <Stack.Screen options={{ title: 'Home', headerShown: false }} />
          <Image source={require('../assets/logo.png')} height={48} width={140} />
        </View>
        <Text textAlign="center">popular - vernáculo - científico</Text>
        <Text textAlign="center" marginBottom={40}>
          Registre e pesquise nomes de Pássaros
        </Text>
        <View
          display="flex"
          alignItems="center"
          gap="$2"
          alignSelf="stretch"
          justifyContent="center"
          width="100%"
          position="relative"
          zIndex={1}>
          <View
            borderRadius={'$12'}
            overflow="hidden"
            maxWidth={Platform.OS === 'web' ? 600 : '100%'}
            width="100%"
            position="relative">
            <Input
              borderColor={'$borderColor'}
              onChangeText={(text) => setSerachTerm(text)}
              value={searchTerm}
              backgroundColor={'#ECE6F0'}
              placeholder="Busque o nome do pássaro"
              placeholderTextColor={'#49454F'}
              height={48}
              fontSize={16}
              paddingRight={40}
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
        </View>
        {searchTerm.length > 2 && (
          <View
            width="100%"
            overflow="hidden"
            alignSelf="center"
            height={400}
            position="relative"
            zIndex={0}
            maxWidth={Platform.OS === 'web' ? 600 : '100%'}>
            {results?.length > 0 ? (
              <FlashList
                estimatedItemSize={20}
                width="100%"
                showsVerticalScrollIndicator={true}
                contentContainerStyle={{
                  paddingRight: 10,
                  width: '100%',
                }}
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
                      height={60}
                      backgroundColor={index % 2 === 0 ? '#FFFBF7' : '#ECE6F0'}
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
          </View>
        )}
      </YStack>
    </View>
  );
}
