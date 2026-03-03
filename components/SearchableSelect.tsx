import { useState, useMemo, useCallback } from 'react';
import { FlashList } from '@shopify/flash-list';
import { View, Input, Text, XStack } from 'tamagui';
import { Pressable } from 'react-native';
import { Icon } from 'react-native-elements';
import { tokens as t } from '~/src/theme/tokens';

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  items: string[];
  label: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

export default function SearchableSelect({
  value,
  onChange,
  items,
  label,
  placeholder = 'Digite para buscar...',
  disabled = false,
  error,
}: SearchableSelectProps) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredItems = useMemo(() => {
    if (!search.trim()) return items.slice(0, 50);
    const lower = search.toLowerCase();
    return items.filter((item) => item.toLowerCase().includes(lower)).slice(0, 50);
  }, [items, search]);

  const handleSelect = useCallback(
    (item: string) => {
      onChange(item);
      setSearch('');
      setIsOpen(false);
    },
    [onChange]
  );

  const displayValue = value && !isOpen ? value : search;

  return (
    <View gap={4}>
      <View position="relative">
        <XStack alignItems="center">
          <Input
            flex={1}
            borderColor={error ? t.colors.error : t.colors.inputBorder}
            value={displayValue}
            placeholder={placeholder}
            onChangeText={(text) => {
              setSearch(text);
              setIsOpen(true);
              if (value) onChange('');
            }}
            onFocus={() => {
              setIsOpen(true);
              if (value) {
                setSearch(value);
                onChange('');
              }
            }}
            paddingVertical={12}
            paddingLeft={16}
            paddingRight={40}
            backgroundColor="transparent"
            placeholderTextColor={t.colors.placeholder}
            editable={!disabled}
            opacity={disabled ? 0.5 : 1}
          />
          {value ? (
            <Pressable
              onPress={() => {
                onChange('');
                setSearch('');
                setIsOpen(false);
              }}
              style={{ position: 'absolute', right: 12, padding: 4 }}
              accessibilityLabel="Limpar seleção">
              <Text color={t.colors.textMuted}>✕</Text>
            </Pressable>
          ) : (
            <View position="absolute" right={12}>
              <Icon name="arrow-drop-down" type="material" color={t.colors.textMuted} size={24} />
            </View>
          )}
        </XStack>
        <Text
          position="absolute"
          top={-8}
          left={12}
          fontSize={12}
          color={error ? t.colors.error : t.colors.textSecondary}
          backgroundColor={t.colors.surfaceTint}>
          {label}
        </Text>
      </View>

      {isOpen && filteredItems.length > 0 && (
        <View
          borderWidth={1}
          borderColor={t.colors.borderSoft}
          borderRadius={t.radii.card}
          backgroundColor={t.colors.surface}
          maxHeight={200}
          overflow="hidden">
          <FlashList
            data={filteredItems}
            estimatedItemSize={44}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => handleSelect(item)}
                style={({ pressed }) => ({
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  backgroundColor: pressed ? t.colors.surfaceTint : 'transparent',
                })}>
                <Text fontSize={14} color={t.colors.text}>
                  {item}
                </Text>
              </Pressable>
            )}
          />
        </View>
      )}

      {isOpen && search.trim().length > 0 && filteredItems.length === 0 && (
        <Text fontSize={12} color={t.colors.textMuted} marginLeft={12}>
          Nenhum resultado para "{search}"
        </Text>
      )}

      {error && (
        <Text marginLeft={12} fontSize={12} color={t.colors.error}>
          {error}
        </Text>
      )}
    </View>
  );
}
