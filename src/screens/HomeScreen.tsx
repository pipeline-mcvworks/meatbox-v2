import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../app/AppNavigator';
import { colors, spacing, typography } from '../theme';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const NAV_ITEMS: { label: string; screen: keyof RootStackParamList }[] = [
  { label: '🎙 Record', screen: 'Record' },
  { label: '🔬 Analyze', screen: 'Analyze' },
  { label: '🎞 Timeline', screen: 'Timeline' },
  { label: '🥁 Pads', screen: 'Pads' },
  { label: '📊 Visualizer', screen: 'Visualizer' },
  { label: '🎛 Kit', screen: 'Kit' },
  { label: '📤 Export', screen: 'Export' },
  { label: '📁 Projects', screen: 'ProjectList' },
];

export function HomeScreen(): React.JSX.Element {
  const navigation = useNavigation<NavProp>();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title}>MouthBeat Machine</Text>
      <Text style={styles.subtitle}>Your vocal beatbox studio</Text>
      {NAV_ITEMS.map((item) => (
        <TouchableOpacity
          key={item.screen}
          style={styles.button}
          onPress={() => navigation.navigate(item.screen)}
          activeOpacity={0.75}
        >
          <Text style={styles.buttonText}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    alignItems: 'stretch',
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.neonGreen,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  button: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.neonGreen,
    borderRadius: 8,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  buttonText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.medium,
  },
});
