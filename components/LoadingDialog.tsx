import { Spinner, View } from 'tamagui';

export default function LoadingDialog({ loading }: { loading: boolean }) {
  if (!loading) return null;

  return (
    <View
      position="absolute"
      top={0}
      right={0}
      bottom={0}
      left={0}
      zIndex={1000}
      backgroundColor="rgba(0,0,0,0.35)"
      alignItems="center"
      justifyContent="center"
      pointerEvents="auto">
      <View
        backgroundColor="$background"
        borderRadius="$6"
        padding="$4"
        elevate
        shadowColor="$shadowColor"
        shadowOpacity={0.2}
        shadowRadius={12}>
        <Spinner size="large" />
      </View>
    </View>
  );
}
