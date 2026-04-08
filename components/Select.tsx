import { useMemo, useState } from 'react';
import { Icon } from 'react-native-elements';
import { Modal, Pressable, ScrollView } from 'react-native';
import { Text, View, XStack } from 'tamagui';
import { tokens as t } from '~/src/theme/tokens';

type SelectProps = {
  value: string;
  onChange: (value: string) => void;
  changeCallback?: () => void;
  items: string[];
  label: string;
  disabled?: boolean;
  backgroundColor?: string;
  placeholder?: string;
};

export default function SelectComp({
  value,
  onChange,
  changeCallback = () => {},
  items,
  label,
  disabled = false,
  backgroundColor = 'transparent',
  placeholder = 'Selecione uma opção',
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedLabel = useMemo(() => {
    return value || placeholder;
  }, [placeholder, value]);

  return (
    <View gap={4}>
      <View position="relative">
        <Pressable
          disabled={disabled}
          onPress={() => setIsOpen(true)}
          style={{ opacity: disabled ? 0.5 : 1 }}>
          <XStack
            minHeight={50}
            alignItems="center"
            justifyContent="space-between"
            borderWidth={1}
            borderColor={t.colors.inputBorder}
            borderRadius={t.radii.input}
            paddingHorizontal={16}
            backgroundColor={backgroundColor}>
            <Text color={value ? t.colors.text : t.colors.placeholder}>{selectedLabel}</Text>
            <Icon
              type="material-community"
              name={isOpen ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={t.colors.textMuted}
            />
          </XStack>
        </Pressable>

        <Text
          position="absolute"
          top={-8}
          left={12}
          fontSize={12}
          color={t.colors.textSecondary}
          backgroundColor={t.colors.surfaceTint}>
          {label}
        </Text>
      </View>

      <Modal
        visible={isOpen && !disabled}
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

              <ScrollView
                nestedScrollEnabled
                showsVerticalScrollIndicator
                contentContainerStyle={{ paddingBottom: 8 }}
                style={{ flex: 1 }}>
                {items.map((item) => {
                  const isSelected = item === value;

                  return (
                    <Pressable
                      key={item}
                      onPress={() => {
                        onChange(item);
                        changeCallback();
                        setIsOpen(false);
                      }}
                      style={({ pressed }) => ({
                        paddingVertical: 14,
                        paddingHorizontal: 16,
                        backgroundColor: pressed || isSelected ? t.colors.surfaceTint : 'transparent',
                      })}>
                      <XStack alignItems="center" justifyContent="space-between">
                        <Text color={t.colors.text}>{item}</Text>
                        {isSelected ? (
                          <Icon
                            type="material-community"
                            name="check"
                            size={16}
                            color={t.colors.textMuted}
                          />
                        ) : null}
                      </XStack>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
