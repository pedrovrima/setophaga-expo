import { useState } from 'react';
import { View, Input, Text, TextArea, Button } from 'tamagui';
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
  showLabel?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  autoComplete?:
    | 'additional-name'
    | 'address-line1'
    | 'address-line2'
    | 'birthdate-day'
    | 'birthdate-full'
    | 'birthdate-month'
    | 'birthdate-year'
    | 'cc-csc'
    | 'cc-exp'
    | 'cc-exp-day'
    | 'cc-exp-month'
    | 'cc-exp-year'
    | 'cc-number'
    | 'country'
    | 'current-password'
    | 'email'
    | 'family-name'
    | 'given-name'
    | 'name'
    | 'new-password'
    | 'off'
    | 'one-time-code'
    | 'password'
    | 'postal-code'
    | 'street-address'
    | 'tel'
    | 'username';
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
  showLabel = true,
  autoCapitalize = 'sentences',
  autoCorrect,
  autoComplete,
}: FloatingLabelInputProps) {
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const InputComponent = multiline ? TextArea : Input;
  const isPasswordField = Boolean(secureTextEntry);

  return (
    <View gap={4} width={width}>
      <View position="relative">
        <InputComponent
          borderColor={error ? t.colors.error : t.colors.inputBorder}
          value={value}
          color={t.colors.text}
          placeholder={placeholder}
          onChangeText={onChangeText}
          paddingVertical={12}
          paddingLeft={16}
          paddingRight={isPasswordField ? 72 : 16}
          minHeight={multiline ? 140 : undefined}
          textAlignVertical={multiline ? 'top' : 'center'}
          backgroundColor="transparent"
          placeholderTextColor={t.colors.placeholder}
          secureTextEntry={isPasswordField && !isPasswordVisible}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect ?? !isPasswordField}
          autoComplete={autoComplete}
        />
        {isPasswordField && (
          <Button
            position="absolute"
            top={6}
            right={8}
            height={36}
            minWidth={54}
            paddingHorizontal={10}
            borderRadius={t.radii.pill}
            backgroundColor="transparent"
            color={t.colors.primary}
            onPress={() => setPasswordVisible((value) => !value)}>
            {isPasswordVisible ? 'Ocultar' : 'Ver'}
          </Button>
        )}
        {showLabel && (
          <Text
            position="absolute"
            top={-8}
            left={12}
            fontSize={12}
            color={error ? t.colors.error : t.colors.textSecondary}
            backgroundColor={t.colors.surfaceTint}>
            {label}
          </Text>
        )}
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
