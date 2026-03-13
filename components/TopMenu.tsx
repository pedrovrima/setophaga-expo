import { XStack, Button, Image } from 'tamagui';
import { Link } from 'expo-router';
import { useWindowDimensions } from 'react-native';
import { tokens as t } from '~/src/theme/tokens';

export default function TopMenu() {
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768; // Common tablet/desktop breakpoint

  if (!isLargeScreen) return null;

  return (
    <XStack
      backgroundColor={t.colors.secondaryLight}
      width="100%"
      height={48}
      justifyContent="center"
      alignItems="center">
      <XStack
        maxWidth={1000}
        width="100%"
        paddingHorizontal={20}
        justifyContent="space-between"
        alignItems="center">
        {/* Logo on the left */}
        <Link href="/" asChild>
          <Button backgroundColor="transparent" padding={0}>
            <Image
              source={require('../assets/logo.png')}
              height={32}
              width={93}
              resizeMode="contain"
            />
          </Button>
        </Link>

        {/* Navigation buttons in the middle */}
        {/* <XStack gap="$4" flex={1} justifyContent="center">
          <Link href="/" asChild>
            <Button backgroundColor="transparent" color="white">
              Home
            </Button>
          </Link>
          <Link href="/about" asChild>
            <Button backgroundColor="transparent" color="white">
              About
            </Button>
          </Link>
          <Link href="/contact" asChild>
            <Button backgroundColor="transparent" color="white">
              Contact
            </Button>
          </Link>
        </XStack> */}

        <Link href="/profile" asChild>
          <Button
            borderRadius={t.radii.pill}
            backgroundColor={t.colors.primary}
            color={t.colors.textOnPrimary}
            fontWeight="700"
            paddingHorizontal={18}
            paddingVertical={10}>
            Entrar/Registrar
          </Button>
        </Link>
      </XStack>
    </XStack>
  );
}
