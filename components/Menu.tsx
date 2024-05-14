import { View, Text, Button, YStack } from 'tamagui';
import { router } from 'expo-router';
import { Icon } from 'react-native-elements';
import { ScreenWidth } from 'react-native-elements/dist/helpers';
export default function Menu({ show }: { show: boolean }) {
  console.log(show);
  return (
    <View
      height={80}
      paddingHorizontal={40}
      width={ScreenWidth}
      backgroundColor={'#F3EDF7'}
      flexDirection="row"
      alignItems="center"
      display={show ? 'flex' : 'none'}
      justifyContent="space-between">
      <Button
        onPress={() => {
          router.push('/search');
        }}
        backgroundColor={'transparent'}>
        <YStack gap={'$1'} flexDirection="column">
          <Icon size={24} name="search" color="#49454F" />
          <Text>Busca</Text>
        </YStack>
      </Button>
      <Button
        onPress={() => {
          router.push('/profile');
        }}
        backgroundColor={'transparent'}>
        <YStack gap={'$1'} flexDirection="column">
          <Icon size={24} name="person" color="#49454F" />
          <Text>Perfil</Text>
        </YStack>
      </Button>
    </View>
  );
}
