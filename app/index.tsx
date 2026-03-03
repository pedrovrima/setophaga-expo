import { useEffect, useState } from 'react';
import { FlashList } from '@shopify/flash-list';

import { Stack, router } from 'expo-router';
import { Pressable, Linking, Platform, useWindowDimensions } from 'react-native';
import { Text, Input, YStack, H4, View, Button, Image } from 'tamagui';

import useSearch from '~/hooks/useSearch';
import LoadingSpinner from '~/components/LoadingSpinner';
import { tokens as t } from '~/src/theme/tokens';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const searchQuery = useSearch(searchTerm);
  const results = searchQuery.data.results;
  const isLoading = searchQuery.isPending;
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;

  useEffect(() => {
    const openIfCan = async () => {
      const can = await Linking.canOpenURL('setophaga-expo://');
      if (can && Platform.OS === 'web') {
        Linking.openURL('setophaga-expo://');
      }
    };
    openIfCan();
  }, []);

  const shouldShowResults = searchTerm.trim().length > 2;

  return (
    <View flex={1} alignItems="center" backgroundColor={t.colors.bg} paddingHorizontal={t.spacing.screenX}>
      <YStack
        paddingHorizontal={t.spacing.screenX}
        paddingTop={40}
        maxWidth={1000}
        minWidth={isLargeScreen ? 700 : 'auto'}
        width="100%"
        flex={1}
        backgroundColor={t.colors.bg}>
        <View alignItems="center" marginBottom="$3">
          <Stack.Screen options={{ title: 'Home', headerShown: false }} />
          <Image source={require('../assets/logo.png')} height={48} width={140} resizeMode="contain" />
        </View>
        <Text textAlign="center" color={t.colors.textMuted} marginBottom={20}>
          popular - vernáculo - científico
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
            borderRadius="$12"
            overflow="hidden"
            maxWidth={Platform.OS === 'web' ? 600 : '100%'}
            width="100%"
            position="relative">
            <Input
              borderColor="$borderColor"
              onChangeText={setSearchTerm}
              value={searchTerm}
              backgroundColor={t.colors.inputBg}
              placeholder="Busque o nome do pássaro"
              placeholderTextColor={t.colors.textSecondary}
              height={48}
              fontSize={16}
              paddingRight={40}
            />
            {searchTerm.length > 0 ? (
              <Pressable
                onPress={() => setSearchTerm('')}
                style={{ position: 'absolute', right: 12, top: 12, padding: 4 }}
                accessibilityLabel="Limpar busca">
                <Text fontSize={18} color={t.colors.textSecondary}>✕</Text>
              </Pressable>
            ) : (
              <Image
                source={require('../assets/icons/search.png')}
                height={17}
                width={17}
                position="absolute"
                right={15}
                top={15}
              />
            )}
          </View>
        </View>

        {shouldShowResults && (
          <View
            width="100%"
            overflow="hidden"
            alignSelf="center"
            flex={1}
            position="relative"
            zIndex={0}
            maxWidth={Platform.OS === 'web' ? 600 : '100%'}>
            {isLoading ? (
              <View marginTop="$4" alignItems="center">
                <LoadingSpinner />
              </View>
            ) : searchQuery.isError ? (
              <View marginTop="$4" alignItems="center" gap="$2">
                <Text color={t.colors.textMuted}>Erro na busca. Tente novamente.</Text>
                <Button
                  size="$3"
                  backgroundColor="transparent"
                  borderColor={t.colors.primary}
                  borderWidth={1}
                  color={t.colors.primary}
                  borderRadius={t.radii.pill}
                  onPress={() => setSearchTerm((prev) => prev + ' ')}>
                  Tentar novamente
                </Button>
              </View>
            ) : results.length > 0 ? (
              <FlashList
                estimatedItemSize={70}
                showsVerticalScrollIndicator={true}
                contentContainerStyle={{
                  paddingRight: 10,
                  paddingTop: 8,
                }}
                renderItem={({ item }) => {
                  if (typeof item === 'string') {
                    return (
                      <H4 marginTop="$4" marginBottom="$2" fontWeight="bold" color={t.colors.text}>
                        {item}
                      </H4>
                    );
                  }

                  return (
                    <Button
                      onPress={() =>
                        router.push({
                          pathname: '/spp/[id]',
                          params: { id: String(item.id) },
                        })
                      }
                      width="100%"
                      alignSelf="stretch"
                      paddingHorizontal={t.spacing.cardPad}
                      paddingVertical={12}
                      justifyContent="center"
                      alignItems="flex-start"
                      borderRadius={t.radii.card}
                      backgroundColor={t.colors.surface}
                      flexDirection="column"
                      marginBottom={8}
                      display="flex"
                      gap={2}
                      elevation={1}
                      shadowColor="rgba(0,0,0,0.08)"
                      shadowOffset={{ width: 0, height: 1 }}
                      shadowRadius={4}
                      borderWidth={1}
                      borderColor={t.colors.borderSoft}>
                      <Text padding={0} margin={0} fontWeight="bold" color={t.colors.text}>
                        {item.stringFound}
                      </Text>
                      <Text padding={0} margin={0} fontStyle="italic" color={t.colors.textMuted}>
                        {item.scientificName}
                      </Text>
                    </Button>
                  );
                }}
                data={results}
              />
            ) : (
              <View marginTop="$4" alignItems="center" gap="$2">
                <Text color={t.colors.textMuted} textAlign="center">
                  Nenhum resultado para "{searchTerm.trim()}"
                </Text>
                <Text color={t.colors.textMuted} fontSize={14} textAlign="center">
                  Tente o nome científico ou popular da espécie.
                </Text>
              </View>
            )}
          </View>
        )}
      </YStack>
    </View>
  );
}
