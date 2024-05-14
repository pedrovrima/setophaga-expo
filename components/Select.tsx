import { useMemo, useState } from 'react';
import { Icon } from 'react-native-elements';
import type { FontSizeTokens, SelectProps } from 'tamagui';
import { Adapt, Label, Select, Sheet, XStack, YStack, View, Text } from 'tamagui';

const ChevronDown = () => (
  <Icon type="material-community" name="chevron-down" size={20} color="black" />
);

const ChevronUp = () => (
  <Icon type="material-community" name="chevron-up" size={20} color="black" />
);

const Check = ({ size }: { size: number }) => (
  <Icon type="material-community" name="check" size={size} color="black" />
);

export default function SelectComp({
  value,
  onChange,
  changeCallback,
  items,
  label,
  disabled,
  backgroundColor,
  ...props
}) {
  return (
    <Select
      value={value}
      onValueChange={(e) => {
        onChange(e);
        changeCallback();
      }}
      disablePreventBodyScroll
      {...props}>
      <View position="relative">
        <Select.Trigger
          borderColor={'#79747E'}
          backgroundColor={backgroundColor}
          disabled={disabled}
          iconAfter={ChevronDown}>
          <Select.Value placeholder={`Selecione uma opção`} />
        </Select.Trigger>
        <Text
          position="absolute"
          top={-8}
          left={12}
          fontSize={12}
          color={'#49454F'}
          backgroundColor={'#FEF7FF'}>
          {label}
        </Text>
      </View>
      <Adapt when="sm" platform="touch">
        <Sheet
          native={!!props.native}
          modal
          dismissOnSnapToBottom
          animationConfig={{
            type: 'spring',
            damping: 20,
            mass: 1.2,
            stiffness: 250,
          }}>
          <Sheet.Frame>
            <Sheet.ScrollView>
              <Adapt.Contents />
            </Sheet.ScrollView>
          </Sheet.Frame>
          <Sheet.Overlay animation="lazy" enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} />
        </Sheet>
      </Adapt>

      <Select.Content zIndex={200000}>
        <Select.ScrollUpButton
          alignItems="center"
          justifyContent="center"
          position="relative"
          width="100%"
          height="$3">
          <YStack zIndex={10}>
            <ChevronUp />
          </YStack>
        </Select.ScrollUpButton>

        <Select.Viewport
          // to do animations:
          // animation="quick"
          // animateOnly={['transform', 'opacity']}
          // enterStyle={{ o: 0, y: -10 }}
          // exitStyle={{ o: 0, y: 10 }}
          minWidth={200}>
          <Select.Group>
            <Select.Label>{label}</Select.Label>
            {/* for longer lists memoizing these is useful */}
            {useMemo(
              () =>
                items.map((item, i) => {
                  return (
                    <Select.Item index={i} key={item} value={item}>
                      <Select.ItemText>{item}</Select.ItemText>
                      <Select.ItemIndicator marginLeft="auto">
                        <Check size={16} />
                      </Select.ItemIndicator>
                    </Select.Item>
                  );
                }),
              [items]
            )}
          </Select.Group>
          {/* Native gets an extra icon */}
          {props.native && (
            <YStack
              position="absolute"
              right={0}
              top={0}
              bottom={0}
              alignItems="center"
              justifyContent="center"
              width={'$4'}
              pointerEvents="none">
              <ChevronDown />
            </YStack>
          )}
        </Select.Viewport>

        <Select.ScrollDownButton
          alignItems="center"
          justifyContent="center"
          position="relative"
          width="100%"
          height="$3">
          <YStack zIndex={10}>
            <ChevronDown />
          </YStack>
        </Select.ScrollDownButton>
      </Select.Content>
    </Select>
  );
}
