import { FlashList } from '@shopify/flash-list';
import { useState } from 'react';
import { Modal, Pressable, Text, TextInput, View } from 'react-native';

export default function Select({
  options,
  value,
  onChange,
  disabled,
  placeholder,
  changeCallback,
  ...props
}: {
  options: string[];
  value: string;
  disabled?: boolean;
  placeholder?: string;
  onChange: (value: string) => void;
  changeCallback?: () => void;
}) {
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [inputText, setInputText] = useState('');

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(inputText?.toLowerCase())
  );
  return (
    <View>
      <TextInput
        editable={!disabled}
        selectTextOnFocus={!disabled}
        placeholder={placeholder}
        onBlur={() => {
          setOptionsOpen(false);
        }}
        onFocus={() => {
          setOptionsOpen(true);
        }}
        {...props}
        value={inputText}
        onChangeText={(e) => {
          setInputText(e);
          onChange('');
          changeCallback && changeCallback();
        }}
      />
      {optionsOpen && (
        <View className="h-max-[300px] h-[100px] h-fit">
          <FlashList
            estimatedItemSize={10}
            data={filteredOptions}
            renderItem={({ item, index }) => (
              <Pressable
                key={index}
                onPress={() => {
                  onChange(item);
                  setInputText(item);
                  setOptionsOpen(false);
                }}>
                <Text>{item}</Text>
              </Pressable>
            )}
          />
        </View>
      )}
    </View>
  );
}
