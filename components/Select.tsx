import { FlashList } from '@shopify/flash-list';
import { useState } from 'react';
import { Modal, Text, TextInput, View } from 'react-native';

export default function Select({ options, ...props }: { options: string[] }) {
  const [optionsOpen, setOptionsOpen] = useState(false);
  return (
    <>
      <TextInput
        onFocus={() => {
          setOptionsOpen(true);
        }}
        onBlur={() => setOptionsOpen(false)}
        {...props}
      />
      <FlashList
        estimatedItemSize={10}
        data={options}
        renderItem={({ item, index }) => (
          <div key={index}>
            <p>{item}</p>
          </div>
        )}
      />
    </>
  );
}
