import { Fragment, useEffect, useMemo, useState } from 'react';
import { FlashList } from '@shopify/flash-list';

import { Stack, router } from 'expo-router';
import { Pressable, Linking, Platform, useWindowDimensions } from 'react-native';
import { Text, Input, YStack, View, Button, Image } from 'tamagui';

import useSearch from '~/hooks/useSearch';
import LoadingSpinner from '~/components/LoadingSpinner';
import type { SearchResultItem } from '~/services/searchMetadata';
import { tokens as t } from '~/src/theme/tokens';

type SearchRow =
  | {
      type: 'section';
      key: string;
      title: 'CBRO' | 'Outros resultados';
      count: number;
      countLabel: 'resultados' | 'encontrados';
      hasTopGap: boolean;
    }
  | {
      type: 'item';
      key: string;
      result: SearchResultItem;
    }
  | {
      type: 'divider';
      key: string;
    };

const stripDiacritics = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const highlightMatch = (text: string, query: string) => {
  const normalizedQuery = stripDiacritics(query.trim().toLowerCase());
  if (!normalizedQuery) return text;

  const normalizedText = stripDiacritics(text.toLowerCase());
  const startIndex = normalizedText.indexOf(normalizedQuery);

  if (startIndex < 0) return text;

  const endIndex = startIndex + normalizedQuery.length;
  const before = text.slice(0, startIndex);
  const match = text.slice(startIndex, endIndex);
  const after = text.slice(endIndex);

  return (
    <Fragment>
      {before}
      <Text color="#6B4EFF" fontWeight="600">
        {match}
      </Text>
      {after}
    </Fragment>
  );
};

const getMeta = (result: SearchResultItem): string | null => {
  if (result.isCBRO) return null;

  if (result.matchType === 'scientific') {
    return 'científico';
  }

  const languageMap: Record<string, string> = {
    pt: 'português',
    en: 'inglês',
    es: 'espanhol',
  };

  const lang = result.language ? languageMap[result.language] ?? result.language : null;
  return lang ? `${lang} • nome comum` : 'nome comum';
};

const buildRows = (results: SearchResultItem[]): SearchRow[] => {
  const cbro = results.filter((item) => item.isCBRO);
  const others = results.filter((item) => !item.isCBRO);

  const rows: SearchRow[] = [];

  const appendSection = (
    section: 'CBRO' | 'Outros resultados',
    items: SearchResultItem[],
    countLabel: 'resultados' | 'encontrados',
    hasTopGap: boolean
  ) => {
    if (items.length === 0) return;

    rows.push({
      type: 'section',
      key: `section-${section}`,
      title: section,
      count: items.length,
      countLabel,
      hasTopGap,
    });

    items.forEach((result, index) => {
      rows.push({
        type: 'item',
        key: `item-${section}-${result.id}`,
        result,
      });

      if (index < items.length - 1) {
        rows.push({
          type: 'divider',
          key: `divider-${section}-${result.id}-${index}`,
        });
      }
    });
  };

  appendSection('CBRO', cbro, 'resultados', false);
  appendSection('Outros resultados', others, 'encontrados', cbro.length > 0);

  return rows;
};

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
  const rows = useMemo(() => buildRows(results), [results]);
  const trimmedSearch = searchTerm.trim();

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
                estimatedItemSize={64}
                showsVerticalScrollIndicator={true}
                contentContainerStyle={{
                  paddingTop: 8,
                  paddingHorizontal: 16,
                  paddingBottom: 24,
                }}
                data={rows}
                keyExtractor={(item) => item.key}
                renderItem={({ item }) => {
                  if (item.type === 'section') {
                    return (
                      <View
                        marginTop={item.hasTopGap ? 24 : 0}
                        marginBottom={8}
                        flexDirection="row"
                        justifyContent="space-between"
                        alignItems="center">
                        <Text fontSize={14} fontWeight="700" color="#111">
                          {item.title}
                        </Text>
                        <Text fontSize={12} color="#666">
                          {item.count} {item.countLabel}
                        </Text>
                      </View>
                    );
                  }

                  if (item.type === 'divider') {
                    return <View height={1} backgroundColor="#EEE" />;
                  }

                  const result = item.result;
                  const meta = getMeta(result);

                  return (
                    <Pressable
                      onPress={() =>
                        router.push({
                          pathname: '/spp/[id]',
                          params: { id: result.id },
                        })
                      }
                      accessibilityRole="button"
                      accessibilityLabel={`Abrir espécie ${result.primaryName}`}>
                      <View paddingVertical={13}>
                        <Text fontSize={16} fontWeight="600" color="#111">
                          {highlightMatch(result.primaryName, trimmedSearch)}
                        </Text>
                        <Text fontSize={13} color="#666" fontStyle="italic" marginTop={2}>
                          {result.scientificName}
                        </Text>
                        {meta && (
                          <Text fontSize={12} color="#999" marginTop={2}>
                            {meta}
                          </Text>
                        )}
                      </View>
                    </Pressable>
                  );
                }}
              />
            ) : (
              <View marginTop="$4" alignItems="center" gap="$2">
                <Text color={t.colors.textMuted} textAlign="center">
                  Nenhum resultado para "{trimmedSearch}"
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
