import { View, Input, Text, TextArea } from 'tamagui';
import { tokens as t } from '~/src/theme/tokens';

interface FloatingLabelInputProps {
  label: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  multiline?: boolean;
  error?: string;
  hint?: string;
  secureTextEntry?: boolean;
  width?: number | string;
}

export default function FloatingLabelInput({
  label,
  placeholder,
  value,
  onChangeText,
  multiline = false,
  error,
  hint,
  secureTextEntry,
  width,
}: FloatingLabelInputProps) {
  const InputComponent = multiline ? TextArea : Input;

  return (
    <View gap={4} width={width}>
      <View position="relative">
        <InputComponent
          borderColor={error ? t.colors.error : t.colors.inputBorder}
          value={value}
          placeholder={placeholder}
          onChangeText={onChangeText}
          paddingVertical={12}
          paddingLeft={16}
          backgroundColor="transparent"
          placeholderTextColor={t.colors.placeholder}
          secureTextEntry={secureTextEntry}
        />
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
      {hint && !error && (
        <Text marginLeft={12} fontSize={12} color={t.colors.textSecondary}>
          {hint}
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
