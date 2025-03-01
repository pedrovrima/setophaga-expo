import { YStack, Image } from 'tamagui';
import { Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import ResetPassword from '~/components/ResetPassword';

export default function ResetPasswordPage() {
  const router = useRouter();
  const ScreenHeight = Dimensions.get('window').height;

  const url = window.location.hash;
  console.log(url);

  // Parse all parameters from the hash
  const params = new URLSearchParams(url.substring(1)); // Remove the # and parse
  const access_token = params.get('access_token');
  const refresh_token = params.get('refresh_token');

  console.log({ access_token, refresh_token });

  // If no tokens are present, redirect to home
  if (!access_token || !refresh_token) {
    router.replace('/');
    return null;
  }

  return (
    <YStack
      height={ScreenHeight}
      marginTop={60}
      alignItems="center"
      justifyContent="flex-start"
      backgroundColor={'#FFFBF7'}
      gap={'$8'}>
      <Image source={require('../assets/logo.png')} height={48 * 2} width={140 * 2} />
      <ResetPassword
        token={access_token}
        refreshToken={refresh_token}
        setType={() => {
          router.replace('/');
        }}
      />
    </YStack>
  );
}
