import React, { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../app/AppNavigator';
import { colors, spacing, typography } from '../theme';
import {
  deleteProject,
  listProjects,
  loadProject,
  type ProjectIndexEntry,
} from '../persistence/projectStorage';
import { useProjectStore } from '../state/projectStore';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'ProjectList'>;

function formatDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

export function ProjectListScreen(): React.JSX.Element {
  const navigation = useNavigation<NavProp>();
  const setProject = useProjectStore((s) => s.setProject);

  const [projects, setProjects] = useState<ProjectIndexEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const list = await listProjects();
      setProjects(list);
    } catch (err: any) {
      Alert.alert('Failed to load projects', err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const handleLoad = useCallback(
    async (entry: ProjectIndexEntry) => {
      setBusyId(entry.id);
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
      } finally {
        setBusyId(null);
      }
    },
    [navigation, refresh, setProject],
  );

  const handleDelete = useCallback(
    (entry: ProjectIndexEntry) => {
      Alert.alert(
        'Delete project?',
        `Permanently delete "${entry.name}"? This can't be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              setBusyId(entry.id);
              try {
                await deleteProject(entry.id);
                await refresh();
              } catch (err: any) {
                Alert.alert('Delete failed', err?.message ?? String(err));
              } finally {
                setBusyId(null);
              }
            },
          },
        ],
      );
    },
    [refresh],
  );

  const renderItem = ({ item }: { item: ProjectIndexEntry }) => {
    const isBusy = busyId === item.id;
    return (
      <View style={styles.row}>
        <Pressable
          style={({ pressed }) => [
            styles.rowMain,
            pressed && !isBusy && { opacity: 0.7 },
          ]}
          onPress={() => handleLoad(item)}
          disabled={isBusy}
          accessibilityRole="button"
          accessibilityLabel={`Load project ${item.name}`}
        >
          <Text style={styles.projectName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.projectMeta}>
            {item.bpm} BPM · {formatDate(item.updatedAt)}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => handleDelete(item)}
          disabled={isBusy}
          style={({ pressed }) => [
            styles.deleteBtn,
            pressed && !isBusy && { opacity: 0.6 },
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Delete project ${item.name}`}
        >
          <Text style={styles.deleteText}>Delete</Text>
        </Pressable>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Projects</Text>
      <FlatList
        data={projects}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={
          projects.length === 0 ? styles.emptyContent : styles.listContent
        }
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor={colors.neonPurple}
          />
        }
        ListEmptyComponent={
          <Text style={styles.placeholder}>
            No saved projects yet.{'\n'}Record a beat and tap Save to add one.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.neonPurple,
    marginBottom: spacing.md,
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  emptyContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  rowMain: {
    flex: 1,
    padding: spacing.md,
  },
  projectName: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
  },
  projectMeta: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    marginTop: 2,
  },
  deleteBtn: {
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: colors.background,
  },
  deleteText: {
    color: colors.neonPink,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
});
