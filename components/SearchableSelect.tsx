import { useState, useMemo, useCallback } from 'react';
import { View, Input, Text, XStack } from 'tamagui';
import { Modal, Pressable, ScrollView } from 'react-native';
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
    if (!search.trim()) return items;
    const lower = search.toLowerCase();
    return items.filter((item) => item.toLowerCase().includes(lower));
  }, [items, search]);

  const handleSelect = useCallback(
    (item: string) => {
      onChange(item);
      setSearch('');
      setIsOpen(false);
    },
    [onChange]
  );

  return (
    <View gap={4}>
      <View position="relative">
        <Pressable
          disabled={disabled}
          onPress={() => {
            if (!disabled) {
              setSearch('');
              setIsOpen(true);
            }
          }}
          style={{ opacity: disabled ? 0.5 : 1 }}>
          <XStack
            minHeight={50}
            alignItems="center"
            justifyContent="space-between"
            borderWidth={1}
            borderColor={error ? t.colors.error : t.colors.inputBorder}
            borderRadius={t.radii.input}
            paddingHorizontal={16}
            backgroundColor="transparent">
            <Text color={value ? t.colors.text : t.colors.placeholder} flex={1}>
              {value || placeholder}
            </Text>
            <XStack alignItems="center" gap="$2">
              {value ? (
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    onChange('');
                    setSearch('');
                    setIsOpen(false);
                  }}
                  style={{
                    width: 24,
                    height: 24,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  accessibilityLabel="Limpar seleção">
                  <Icon
                    name="close"
                    type="material"
                    color={t.colors.textMuted}
                    size={18}
                  />
                </Pressable>
              ) : null}
              <Icon name="arrow-drop-down" type="material" color={t.colors.textMuted} size={24} />
            </XStack>
          </XStack>
        </Pressable>
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

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}>
        <Pressable
          onPress={() => setIsOpen(false)}
          style={{
            flex: 1,
            backgroundColor: 'rgba(26,26,26,0.24)',
            justifyContent: 'center',
            padding: 20,
          }}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View
              backgroundColor={t.colors.surface}
              borderRadius={t.radii.card}
              borderWidth={1}
              borderColor={t.colors.borderSoft}
              overflow="hidden"
              alignSelf="center"
              width="100%"
              maxWidth={560}
              height={420}>
              <XStack
                paddingHorizontal="$4"
                paddingTop="$4"
                paddingBottom="$3"
                alignItems="center"
                justifyContent="space-between"
                borderBottomWidth={1}
                borderColor={t.colors.borderSoft}
                backgroundColor={t.colors.surfaceTint}>
                <Text color={t.colors.text} fontSize={16} fontWeight="700">
                  {label}
                </Text>
                <Pressable
                  onPress={() => setIsOpen(false)}
                  style={{
                    width: 28,
                    height: 28,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  accessibilityLabel="Fechar seleção">
                  <Icon name="close" type="material" color={t.colors.textMuted} size={20} />
                </Pressable>
              </XStack>

              <View padding="$4" borderBottomWidth={1} borderColor={t.colors.borderSoft}>
                <Input
                  value={search}
                  onChangeText={setSearch}
                  autoFocus
                  color={t.colors.text}
                  placeholder={placeholder}
                  placeholderTextColor={t.colors.placeholder}
                  borderColor={t.colors.inputBorder}
                  backgroundColor="transparent"
                />
              </View>

              {filteredItems.length > 0 ? (
                <ScrollView
                  nestedScrollEnabled
                  showsVerticalScrollIndicator
                  contentContainerStyle={{ paddingBottom: 8 }}
                  style={{ flex: 1 }}>
                  {filteredItems.map((item) => (
                    <Pressable
                      key={item}
                      onPress={() => handleSelect(item)}
                      style={({ pressed }) => ({
                        paddingVertical: 14,
                        paddingHorizontal: 16,
                        backgroundColor:
                          pressed || item === value ? t.colors.surfaceTint : 'transparent',
                      })}>
                      <XStack alignItems="center" justifyContent="space-between" gap="$3">
                        <Text fontSize={14} color={t.colors.text} flex={1}>
                          {item}
                        </Text>
                        {item === value ? (
                          <Icon
                            name="check"
                            type="material-community"
                            color={t.colors.primary}
                            size={16}
                          />
                        ) : null}
                      </XStack>
                    </Pressable>
                  ))}
                </ScrollView>
              ) : (
                <View flex={1} alignItems="center" justifyContent="center" padding="$4">
                  <Text color={t.colors.textMuted}>Nenhum resultado para "{search}"</Text>
                </View>
              )}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {error && (
        <Text marginLeft={12} fontSize={12} color={t.colors.error}>
          {error}
        </Text>
      )}
    </View>
  );
}
