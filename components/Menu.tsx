import { View, Text, Button, YStack } from 'tamagui';
import { router } from 'expo-router';
import { Icon } from 'react-native-elements';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tokens as t } from '~/src/theme/tokens';

export default function Menu({ show }: { show: boolean }) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  return (
    <View
      position="absolute"
      bottom={0}
      left={0}
      right={0}
      height={80 + insets.bottom}
      paddingBottom={insets.bottom}
      paddingHorizontal={40}
      width={width}
      backgroundColor={t.colors.menuBg}
      flexDirection="row"
      alignItems="center"
      display={show ? 'flex' : 'none'}
      justifyContent="space-between">
      <Button
        onPress={() => {
          router.push('/');
        }}
        backgroundColor="transparent">
        <YStack gap="$1" flexDirection="column">
          <Icon size={24} name="search" color={t.colors.textSecondary} />
          <Text color={t.colors.textSecondary}>Busca</Text>
        </YStack>
      </Button>
      <Button
        onPress={() => {
          router.push('/profile');
        }}
        backgroundColor="transparent">
        <YStack gap="$1" flexDirection="column">
          <Icon size={24} name="person" color={t.colors.textSecondary} />
          <Text color={t.colors.textSecondary}>Perfil</Text>
        </YStack>
      </Button>
    </View>
  );
}
