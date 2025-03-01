import { View, XStack, Button, Image, Popover, YStack } from 'tamagui';
import { Link, router } from 'expo-router';
import { Platform, useWindowDimensions } from 'react-native';
import { Icon } from 'react-native-elements';

export default function TopMenu() {
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768; // Common tablet/desktop breakpoint

  if (!isLargeScreen) return null;

  return (
    <XStack
      backgroundColor="#DED2F9"
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

        {/* Hamburger menu on the right */}
        <Popover placement="bottom-end">
          <Popover.Trigger asChild>
            <Button backgroundColor="transparent" padding="$2">
              <Icon name="menu" type="material" color="#6750A4" size={24} />
            </Button>
          </Popover.Trigger>

          <Popover.Content borderWidth={1} borderColor="$borderColor" padding="$2" width={200}>
            <YStack gap="$2">
              <Button
                backgroundColor="transparent"
                onPress={() => router.push('/profile')}
                icon={
                  <Icon
                    name="person-outline"
                    type="material"
                    color="#000"
                    size={20}
                    style={{ marginRight: 8 }}
                  />
                }>
                Profile
              </Button>
              <Button
                backgroundColor="transparent"
                onPress={() => {
                  // Add your logout logic here
                  console.log('Logout clicked');
                }}
                icon={
                  <Icon
                    name="logout"
                    type="material"
                    color="#000"
                    size={20}
                    style={{ marginRight: 8 }}
                  />
                }>
                Logout
              </Button>
            </YStack>
          </Popover.Content>
        </Popover>
      </XStack>
    </XStack>
  );
}
