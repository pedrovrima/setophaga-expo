import { View, Text, Button, YStack } from 'tamagui';
import { router } from 'expo-router';
import { Icon } from 'react-native-elements';
import { useWindowDimensions } from 'react-native';
import { tokens as t } from '~/src/theme/tokens';

export default function Menu({ show }: { show: boolean }) {
  const { width } = useWindowDimensions();

  return (
    <View
      height={80}
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
