import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { colors } from '../../theme';

export function InputMeter(): React.JSX.Element {
  const barHeight = useRef(new Animated.Value(0.2)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(barHeight, {
          toValue: 0.8,
          duration: 500,
          useNativeDriver: false,
        }),
        Animated.timing(barHeight, {
          toValue: 0.2,
          duration: 500,
          useNativeDriver: false,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.barBackground}>
        <Animated.View
          style={[
            styles.barFill,
            {
              height: barHeight.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 40,
    justifyContent: 'center',
    marginVertical: 10,
  },
  barBackground: {
    width: '100%',
    height: 20,
    backgroundColor: colors.surface,
    borderRadius: 10,
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    backgroundColor: colors.neonGreen,
    borderRadius: 10,
    position: 'absolute',
    bottom: 0,
  },
});
