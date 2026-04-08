import { Fragment, useEffect, useMemo, useState } from 'react';
import { FlashList } from '@shopify/flash-list';
import { Icon } from 'react-native-elements';

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

const getResultDisplay = (result: SearchResultItem) => {
  if (result.matchType === 'scientific') {
    return {
      primaryText: result.scientificName,
      secondaryText: result.ptbrName,
      primaryItalic: true,
      secondaryItalic: false,
    };
  }

  return {
    primaryText: result.primaryName,
    secondaryText: result.scientificName,
    primaryItalic: false,
    secondaryItalic: true,
  };
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
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    // Check if this is a password recovery or email confirmation link
    const hash = window.location.hash;
    if (hash.includes('access_token=')) {
      const params = new URLSearchParams(hash.substring(1));
      const type = params.get('type');

      // Redirect to appropriate page based on type
      if (type === 'recovery') {
        // Password recovery - redirect to reset-password page
        router.replace(`/reset-password${hash}`);
        return;
      } else if (type === 'signup' || type === 'email_change' || type === 'invite') {
        // Email confirmation - redirect to auth-callback page
        router.replace(`/auth-callback${hash}`);
        return;
      }
    }

    const mobileUserAgent =
      /Android|iPhone|iPad|iPod/i.test(window.navigator.userAgent);

    if (!mobileUserAgent) return;

    const sessionKey = 'setophaga-app-open-attempted';
    if (window.sessionStorage.getItem(sessionKey) === '1') return;
    window.sessionStorage.setItem(sessionKey, '1');

    const path = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    const normalizedPath = path === '/' ? '' : path.replace(/^\//, '');
    const deepLink = `setophaga-expo://${normalizedPath}`;

    // Use a hidden iframe on web so the browser attempts the app deep link
    // without opening a separate tab or replacing the current page.
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.setAttribute('aria-hidden', 'true');
    iframe.src = deepLink;
    document.body.appendChild(iframe);

    const cleanup = window.setTimeout(() => {
      iframe.remove();
    }, 1500);

    return () => {
      window.clearTimeout(cleanup);
      iframe.remove();
    };
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
            borderRadius={t.radii.button}
            borderWidth={1}
            borderColor={t.colors.inputBorder}
            backgroundColor={t.colors.inputBg}
            overflow="hidden"
            maxWidth={Platform.OS === 'web' ? 600 : '100%'}
            width="100%"
            position="relative">
            <Input
              borderWidth={0}
              borderRadius={0}
              onChangeText={setSearchTerm}
              value={searchTerm}
              color={t.colors.text}
              backgroundColor="transparent"
              placeholder="Busque o nome do pássaro"
              placeholderTextColor={t.colors.textSecondary}
              height={48}
              fontSize={16}
              paddingRight={40}
            />
            {searchTerm.length > 0 ? (
              <Pressable
                onPress={() => setSearchTerm('')}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  width: 24,
                  height: 24,
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: [{ translateY: -12 }],
                }}
                accessibilityLabel="Limpar busca">
                <Icon
                  type="material-community"
                  name="close"
                  size={20}
                  color={t.colors.textSecondary}
                />
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
                  const display = getResultDisplay(result);

                  return (
                    <Pressable
                      style={{ width: '100%' }}
                      onPress={() =>
                        router.push({
                          pathname: '/spp/[id]',
                          params: { id: result.id },
                        })
                      }
                      accessibilityRole="button"
                      accessibilityLabel={`Abrir espécie ${display.primaryText}`}>
                      <View paddingVertical={13} alignItems="flex-start">
                        <Text
                          fontSize={16}
                          fontWeight="600"
                          color="#111"
                          textAlign="left"
                          fontStyle={display.primaryItalic ? 'italic' : undefined}>
                          {highlightMatch(display.primaryText, trimmedSearch)}
                        </Text>
                        {display.secondaryText && (
                          <Text
                            fontSize={13}
                            color="#666"
                            fontStyle={display.secondaryItalic ? 'italic' : undefined}
                            marginTop={2}
                            textAlign="left">
                            {display.secondaryText}
                          </Text>
                        )}
                        {meta && (
                          <Text fontSize={12} color="#999" marginTop={2} textAlign="left">
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
