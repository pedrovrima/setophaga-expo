import { useState } from 'react';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { Icon } from 'react-native-elements';
import { Button, Text, XStack, YStack, View, ScrollView, Image } from 'tamagui';
import Toast from 'react-native-root-toast';
import { useEffect } from 'react';
import * as Linking from 'expo-linking';

import useSpeciesDetail from '~/hooks/useSpeciesDetail';
import { languageDictionary } from '~/services/searchMetadata';
import { speciesTokens as t } from '~/src/theme/speciesTokens';

export const languageFlags = {
  name_ptbr: '\uD83C\uDDE7\uD83C\uDDF7',
  name_english: '\uD83C\uDDFA\uD83C\uDDF8',
  name_spanish: '\uD83C\uDDEA\uD83C\uDDF8',
  name_danish: '\uD83C\uDDE9\uD83C\uDDF0',
  name_dutch: '\uD83C\uDDF3\uD83C\uDDF1',
  name_estonian: '\uD83C\uDDEA\uD83C\uDDEA',
  name_finnish: '\uD83C\uDDEB\uD83C\uDDEE',
  name_french: '\uD83C\uDDEB\uD83C\uDDF7',
  name_german: '\uD83C\uDDE9\uD83C\uDDEA',
  name_hungarian: '\uD83C\uDDED\uD83C\uDDFA',
  name_japanese: '\uD83C\uDDEF\uD83C\uDDF5',
  name_norwegian: '\uD83C\uDDF3\uD83C\uDDF4',
  name_polish: '\uD83C\uDDF5\uD83C\uDDF1',
  name_russian: '\uD83C\uDDF7\uD83C\uDDFA',
  name_slovak: '\uD83C\uDDF8\uD83C\uDDF0',
  name_swedish: '\uD83C\uDDF8\uD83C\uDDEA',
};

export default function Species() {
  const { id, querySuccess } = useLocalSearchParams<{ id?: string; querySuccess?: string }>();
  const speciesQuery = useSpeciesDetail(id);
  const [expandedLangKey, setExpandedLangKey] = useState<string | null>(null);

  useEffect(() => {
    if (querySuccess === 'true') {
      Toast.show('Sinônimo cadastrado com sucesso!', {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
        shadow: true,
        animation: true,
        hideOnPress: true,
        delay: 0,
        backgroundColor: '#322F35',
        textColor: '#FFF',
        opacity: 1,
      });
    }
  }, [querySuccess]);

  if (speciesQuery.isLoading) {
    return (
      <View flex={1} backgroundColor={t.colors.bg} justifyContent="center" alignItems="center">
        <Text color={t.colors.textMuted}>Carregando espécie...</Text>
      </View>
    );
  }

  if (speciesQuery.isError || !speciesQuery.data) {
    return (
      <View flex={1} backgroundColor={t.colors.bg} justifyContent="center" alignItems="center">
        <Text color={t.colors.textMuted}>Espécie não encontrada</Text>
      </View>
    );
  }

  const thisSpecies = speciesQuery.data;

  const languageKeys = Object.keys(languageDictionary) as Array<keyof typeof languageDictionary>;
  const otherLanguageKeys = languageKeys.filter(
    (key) => key !== 'name_ptbr' && key !== 'synonyms' && thisSpecies[key]
  );

  const orderedSynonyms = [...thisSpecies.synonyms].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <>
      <Stack.Screen options={{ title: thisSpecies.name_sci, headerShown: false }} />

      <ScrollView
        paddingHorizontal={t.spacing.screenX}
        paddingTop={60}
        contentContainerStyle={{
          flex: 0,
          alignItems: 'center',
          width: '100%',
          minWidth: '100%',
          paddingBottom: 120,
        }}
        backgroundColor={t.colors.bg}
        flex={1}
        width="100%">
        <YStack maxWidth={600} width="100%" marginBottom={24} gap="$4">
          {/* Header */}
          <XStack gap={16} alignItems="flex-start" width="100%">
            <View paddingTop={4}>
              <Icon
                name="arrow-back"
                type="material"
                color={t.colors.primary}
                onPress={() => router.back()}
              />
            </View>
            <YStack flex={1} gap={4}>
              <Text fontSize={28} fontWeight="800" color={t.colors.text}>
                {thisSpecies.name_ptbr}
              </Text>
              <Text fontSize={16} fontStyle="italic" color={t.colors.textMuted}>
                {thisSpecies.name_sci}
              </Text>
            </YStack>
          </XStack>

          {/* Taxonomy Card */}
          <View
            backgroundColor={t.colors.surfaceTint}
            borderColor={t.colors.borderSoft}
            borderWidth={1}
            padding={t.spacing.cardPad}
            borderRadius={t.radii.card}
            width="100%">
            <XStack
              justifyContent="space-between"
              paddingBottom={12}
              borderBottomWidth={1}
              borderBottomColor={t.colors.borderSoft}
              width="100%">
              <Text color={t.colors.primary} fontWeight="bold" fontSize={13}>
                ORDEM
              </Text>
              <Text color={t.colors.text}>{thisSpecies.order}</Text>
            </XStack>
            <XStack
              justifyContent="space-between"
              paddingTop={12}>
              <Text color={t.colors.primary} fontWeight="bold" fontSize={13}>
                FAMÍLIA
              </Text>
              <Text color={t.colors.text}>{thisSpecies.family}</Text>
            </XStack>

            <Button
              onPress={() =>
                Linking.openURL(`https://www.wikiaves.com.br/wiki/${thisSpecies.name_ptbr}`)
              }
              borderRadius={t.radii.pill}
              paddingVertical={10}
              borderColor={t.colors.primary}
              maxWidth={400}
              height={44}
              alignSelf="center"
              backgroundColor="transparent"
              borderWidth={1}
              width="100%"
              marginTop={16}>
              <Image source={require('../../assets/wikiaves_col.png')} height={24} width={32} />
              <Text color={t.colors.primary}> Veja no WikiAves</Text>
            </Button>
          </View>

          {/* Portuguese Names Section */}
          <View
            backgroundColor={t.colors.surface}
            borderColor={t.colors.borderSoft}
            borderWidth={1}
            padding={t.spacing.cardPad}
            borderRadius={t.radii.card}
            width="100%">
            <Text fontWeight="bold" fontSize={14} color={t.colors.text} marginBottom={12}>
              Português
            </Text>

            <XStack alignItems="center" gap={8} marginBottom={8}>
              <Text fontSize={16} color={t.colors.text}>
                {thisSpecies.name_ptbr}
              </Text>
              <View
                backgroundColor={t.colors.surfaceTint}
                paddingHorizontal={10}
                paddingVertical={3}
                borderRadius={t.radii.pill}>
                <Text fontSize={12} color={t.colors.primary} fontWeight="600">
                  Principal
                </Text>
              </View>
            </XStack>

            {orderedSynonyms.length > 0 ? (
              <YStack gap={4} marginTop={4}>
                {orderedSynonyms.map((synonym) => (
                  <XStack key={synonym.id} gap={6} alignItems="baseline">
                    <Text color={t.colors.textMuted} fontSize={14}>•</Text>
                    <Text fontSize={15} color={t.colors.text}>
                      {synonym.name}
                      {synonym.region ? (
                        <Text color={t.colors.textMuted} fontSize={13}> ({synonym.region})</Text>
                      ) : null}
                    </Text>
                  </XStack>
                ))}
              </YStack>
            ) : (
              <Text fontSize={14} color={t.colors.textMuted} fontStyle="italic" marginTop={4}>
                Nenhum sinônimo registrado ainda.
              </Text>
            )}
          </View>

          {/* Other Languages Accordion */}
          {otherLanguageKeys.length > 0 && (
            <View
              backgroundColor={t.colors.surface}
              borderColor={t.colors.borderSoft}
              borderWidth={1}
              padding={t.spacing.cardPad}
              borderRadius={t.radii.card}
              width="100%">
              <Text fontWeight="bold" fontSize={14} color={t.colors.text} marginBottom={8}>
                Outras línguas
              </Text>

              <YStack>
                {otherLanguageKeys.map((key) => {
                  const isExpanded = expandedLangKey === key;
                  const flag = languageFlags[key as keyof typeof languageFlags] || '';
                  const label = languageDictionary[key];
                  const value = thisSpecies[key];

                  return (
                    <View key={key}>
                      <XStack
                        alignItems="center"
                        justifyContent="space-between"
                        paddingVertical={10}
                        borderBottomWidth={1}
                        borderBottomColor={t.colors.borderSoft}
                        onPress={() =>
                          setExpandedLangKey(isExpanded ? null : key)
                        }
                        cursor="pointer">
                        <XStack gap={8} alignItems="center">
                          <Text fontSize={16}>{flag}</Text>
                          <Text fontSize={14} fontWeight="600" color={t.colors.text}>
                            {label}
                          </Text>
                        </XStack>
                        <Text fontSize={14} color={t.colors.textMuted}>
                          {isExpanded ? '▾' : '▸'}
                        </Text>
                      </XStack>
                      {isExpanded && (
                        <View paddingVertical={8} paddingLeft={32}>
                          <Text fontSize={15} fontStyle="italic" color={t.colors.textMuted}>
                            {value}
                          </Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </YStack>
            </View>
          )}
        </YStack>
      </ScrollView>

      {/* Sticky Footer CTA */}
      <YStack
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        paddingHorizontal={t.spacing.screenX}
        paddingVertical={12}
        backgroundColor={t.colors.bg}
        alignItems="center"
        elevation={8}>
        <Button
          borderRadius={t.radii.pill}
          backgroundColor={t.colors.primary}
          color="#FFF"
          fontWeight="bold"
          fontSize={16}
          height={56}
          width="100%"
          maxWidth={600}
          onPress={() =>
            router.push({
              pathname: '/add',
              params: { id: String(id || '') },
            })
          }>
          Adicionar sinônimo
        </Button>
      </YStack>
    </>
  );
}
