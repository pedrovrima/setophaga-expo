import { XStack, YStack, Text } from 'tamagui';
import { Icon } from 'react-native-elements';
import { router } from 'expo-router';
import { tokens as t } from '~/src/theme/tokens';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
}

export default function ScreenHeader({ title, subtitle, onBack }: ScreenHeaderProps) {
  return (
    <XStack gap={16} alignItems="flex-start" width="100%">
      <Icon
        name="arrow-back"
        type="material"
        color={t.colors.primary}
        onPress={onBack || (() => router.back())}
        accessibilityLabel="Voltar"
        containerStyle={{ paddingTop: 4 }}
      />
      <YStack flex={1} gap={4}>
        <Text fontSize={22} fontWeight="700" color={t.colors.text}>
          {title}
        </Text>
        {subtitle && (
          <Text fontSize={16} fontStyle="italic" color={t.colors.textMuted}>
            {subtitle}
          </Text>
        )}
      </YStack>
    </XStack>
  );
}
