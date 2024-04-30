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
        <FlashList
          estimatedItemSize={20}
          data={filteredOptions}
          renderItem={({ item, index }) => (
            <Pressable
              key={index}
              onPress={() => {
                setOptionsOpen(false);
                onChange(item);
                setInputText(item);
              }}>
              <Text>{item}</Text>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}
