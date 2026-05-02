import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { AppNavigator } from './src/app/AppNavigator';
import { colors } from './src/theme';

export default function App(): React.JSX.Element {
  return (
    <NavigationContainer
      theme={{
        dark: true,
        colors: {
          primary: colors.neonGreen,
          background: colors.background,
          card: colors.surface,
          text: colors.textPrimary,
          border: colors.border,
          notification: colors.neonPink,
        },
      }}
    >
      <StatusBar style="light" />
      <AppNavigator />
    </NavigationContainer>
  );
}
