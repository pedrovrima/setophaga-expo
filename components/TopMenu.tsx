import { XStack, Button, Image, Text } from 'tamagui';
import { Link, usePathname } from 'expo-router';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tokens as t } from '~/src/theme/tokens';
import useSessionAuth from '~/hooks/useSessionAuth';

export default function TopMenu() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const { session } = useSessionAuth();
  const isLargeScreen = width >= 768;
  const isHome = pathname === '/';

  if (!isLargeScreen && !isHome) return null;

  const authActions = session?.user ? (
    <Link href="/profile" asChild>
      <Button
        backgroundColor="transparent"
        padding={0}
        hoverStyle={{ backgroundColor: 'transparent', opacity: 1 }}
        pressStyle={{ backgroundColor: 'transparent', opacity: 1 }}
        focusStyle={{ backgroundColor: 'transparent' }}>
        <Text color={t.colors.primary} fontWeight="700" fontSize={15}>
          Perfil
        </Text>
      </Button>
    </Link>
  ) : (
    <XStack gap="$2" alignItems="center">
      <Link href="/profile?mode=signin" asChild>
        <Button
          backgroundColor="transparent"
          paddingHorizontal={8}
          paddingVertical={6}
          hoverStyle={{ backgroundColor: 'transparent', opacity: 1 }}
          pressStyle={{ backgroundColor: 'transparent', opacity: 1 }}
          focusStyle={{ backgroundColor: 'transparent' }}>
          <Text color={t.colors.textSecondary} fontWeight="600" fontSize={15} opacity={0.8}>
            Entrar
          </Text>
        </Button>
      </Link>
      <Link href="/profile?mode=signup" asChild>
        <Button
          backgroundColor="transparent"
          paddingHorizontal={8}
          paddingVertical={6}
          hoverStyle={{ backgroundColor: 'transparent', opacity: 1 }}
          pressStyle={{ backgroundColor: 'transparent', opacity: 1 }}
          focusStyle={{ backgroundColor: 'transparent' }}>
          <Text color={t.colors.primary} fontWeight="800" fontSize={15}>
            Registrar
          </Text>
        </Button>
      </Link>
    </XStack>
  );

  return (
    <XStack
      backgroundColor={t.colors.secondaryLight}
      width="100%"
      minHeight={isLargeScreen ? 48 : 56 + insets.top}
      paddingTop={isLargeScreen ? 0 : insets.top}
      justifyContent="center"
      alignItems="center">
      <XStack
        maxWidth={1000}
        width="100%"
        paddingHorizontal={20}
        justifyContent="space-between"
        alignItems="center">
        <Link href="/" asChild>
          <Button
            backgroundColor="transparent"
            padding={0}
            hoverStyle={{ backgroundColor: 'transparent', opacity: 1 }}
            pressStyle={{ backgroundColor: 'transparent', opacity: 1 }}
            focusStyle={{ backgroundColor: 'transparent' }}>
            <Image
              source={require('../assets/logo.png')}
              height={32}
              width={93}
              resizeMode="contain"
            />
          </Button>
        </Link>
        {authActions}
      </XStack>
    </XStack>
  );
}
