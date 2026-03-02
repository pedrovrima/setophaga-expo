import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

const SIZE = 48;
const BORDER = 3;

export default function LoadingSpinner() {
  const outerRotation = useRef(new Animated.Value(0)).current;
  const middleRotation = useRef(new Animated.Value(0)).current;
  const innerRotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = (value: Animated.Value, duration: number, reverse = false) =>
      Animated.loop(
        Animated.timing(value, {
          toValue: reverse ? -1 : 1,
          duration,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );

    const animation = Animated.parallel([
      loop(outerRotation, 1000),
      loop(middleRotation, 500, true),
      loop(innerRotation, 1500),
    ]);

    animation.start();
    return () => animation.stop();
  }, []);

  const spin = (value: Animated.Value) =>
    value.interpolate({ inputRange: [-1, 0, 1], outputRange: ['-360deg', '0deg', '360deg'] });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.ring, styles.outer, { transform: [{ rotate: spin(outerRotation) }] }]}
      />
      <Animated.View
        style={[styles.ring, styles.middle, { transform: [{ rotate: spin(middleRotation) }] }]}
      />
      <Animated.View
        style={[styles.ring, styles.inner, { transform: [{ rotate: spin(innerRotation) }] }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: BORDER,
  },
  outer: {
    width: SIZE,
    height: SIZE,
    borderTopColor: '#6750A4',
    borderRightColor: '#6750A4',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  middle: {
    width: SIZE - 8,
    height: SIZE - 8,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#DED2F9',
    borderLeftColor: '#DED2F9',
  },
  inner: {
    width: SIZE - 16,
    height: SIZE - 16,
    borderTopColor: '#6750A4',
    borderRightColor: '#6750A4',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  },
});
