import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../app/AppNavigator';
import { colors, spacing, typography } from '../theme';
import {
  listProjects,
  loadProject,
  type ProjectIndexEntry,
} from '../persistence/projectStorage';
import { useProjectStore } from '../state/projectStore';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

function formatDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString();
}

export function HomeScreen(): React.JSX.Element {
  const navigation = useNavigation<NavProp>();
  const setProject = useProjectStore((s) => s.setProject);
  const [recent, setRecent] = useState<ProjectIndexEntry[]>([]);

  const refresh = useCallback(async () => {
    try {
      const list = await listProjects();
      setRecent(list.slice(0, 3));
    } catch {
      // Non-fatal: just leave Recent Projects empty if storage is unreadable.
      setRecent([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const handleOpenRecent = useCallback(
    async (entry: ProjectIndexEntry) => {
      try {
        const project = await loadProject(entry.id);
        if (!project) {
          Alert.alert('Not found', 'That project could not be loaded.');
          await refresh();
          return;
        }
        setProject(project);
        navigation.navigate('Timeline');
      } catch (err: any) {
        Alert.alert('Load failed', err?.message ?? String(err));
      }
    },
    [navigation, refresh, setProject],
  );

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

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('ProjectList')}
        activeOpacity={0.75}
      >
        <Text style={styles.buttonText}>📂 All Projects</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Recent Projects</Text>
      {recent.length === 0 ? (
        <Text style={styles.emptyText}>No recent projects yet.</Text>
      ) : (
        recent.map((project) => (
          <TouchableOpacity
            key={project.id}
            style={styles.projectItem}
            onPress={() => handleOpenRecent(project)}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel={`Open project ${project.name}`}
          >
            <Text style={styles.projectName} numberOfLines={1}>
              {project.name}
            </Text>
            <Text style={styles.projectDate}>
              {formatDate(project.updatedAt)}
            </Text>
          </TouchableOpacity>
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
    flex: 1,
    marginRight: spacing.sm,
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
