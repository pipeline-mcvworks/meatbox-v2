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

const RECENT_PROJECTS = [
  { id: '1', name: 'Demo Beat', date: '2025-03-15' },
  { id: '2', name: 'Loop Test', date: '2025-03-14' },
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

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Record')}
        activeOpacity={0.75}
      >
        <Text style={styles.buttonText}>🎙 Start Recording</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Timeline')}
        activeOpacity={0.75}
      >
        <Text style={styles.buttonText}>📁 Demo Project</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Recent Projects</Text>
      {RECENT_PROJECTS.length === 0 ? (
        <Text style={styles.emptyText}>No recent projects yet.</Text>
      ) : (
        RECENT_PROJECTS.map((project) => (
          <View key={project.id} style={styles.projectItem}>
            <Text style={styles.projectName}>{project.name}</Text>
            <Text style={styles.projectDate}>{project.date}</Text>
          </View>
        ))
      )}
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
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  button: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.neonGreen,
    borderRadius: 8,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    minHeight: 44,
    justifyContent: 'center',
  },
  buttonText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.medium,
  },
  projectItem: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectName: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
  },
  projectDate: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.md,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
