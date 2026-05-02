import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { colors, typography } from '../../theme';

interface CountdownProps {
  onComplete: () => void;
}

export function Countdown({ onComplete }: CountdownProps): React.JSX.Element {
  const [count, setCount] = useState(3);
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (count === 0) {
      onComplete();
      return;
    }

    Animated.sequence([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCount((prev) => prev - 1);
    });
  }, [count]);

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.number, { opacity }]}>
        {count}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  number: {
    fontSize: 72,
    fontWeight: typography.weights.bold,
    color: colors.neonGreen,
  },
});
