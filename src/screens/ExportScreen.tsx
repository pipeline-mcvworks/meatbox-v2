import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, spacing, typography } from '../theme';
import { useProjectStore } from '../state/projectStore';
import { saveProject } from '../persistence/projectStorage';
import { exportProjectJson } from '../export/exportProjectJson';
import { exportMidi } from '../export/exportMidi';
import { exportWav } from '../export/exportWav';

export function ExportScreen(): React.JSX.Element {
  const project = useProjectStore((s) => s.project);
  const setProject = useProjectStore((s) => s.setProject);
  const [busy, setBusy] = useState<string | null>(null);

  const handleSave = async () => {
    if (!project) {
      Alert.alert('No project', 'There is no active project to save.');
      return;
    }
    setBusy('save');
    try {
      const persisted = await saveProject(project);
      // Reflect bumped updatedAt in the live store.
      setProject(persisted);
      Alert.alert('Saved', 'Project saved locally.');
    } catch (err: any) {
      Alert.alert('Save failed', err?.message ?? String(err));
    } finally {
      setBusy(null);
    }
  };

  const handleExportJson = async () => {
    if (!project) {
      Alert.alert('No project', 'There is no active project to export.');
      return;
    }
    setBusy('json');
    try {
      await exportProjectJson(project);
    } catch (err: any) {
      Alert.alert('Export failed', err?.message ?? String(err));
    } finally {
      setBusy(null);
    }
  };

  const handleExportMidi = async () => {
    if (!project) return;
    setBusy('midi');
    try {
      await exportMidi(project);
    } catch (err: any) {
      Alert.alert('MIDI export', err?.message ?? String(err));
    } finally {
      setBusy(null);
    }
  };

  const handleExportWav = async () => {
    if (!project) return;
    setBusy('wav');
    try {
      await exportWav(project);
    } catch (err: any) {
      Alert.alert('WAV export', err?.message ?? String(err));
    } finally {
      setBusy(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Export</Text>
        <Text style={styles.subtitle}>Save or share your project.</Text>
      </View>
      <View style={styles.body}>
        <ActionButton
          label="Save Project Locally"
          color={colors.neonCyan}
          onPress={handleSave}
          disabled={busy !== null}
          loading={busy === 'save'}
        />
        <ActionButton
          label="Export Project JSON"
          color={colors.neonGreen}
          onPress={handleExportJson}
          disabled={busy !== null}
          loading={busy === 'json'}
        />
        <ActionButton
          label="Export MIDI (coming soon)"
          color={colors.neonPink}
          onPress={handleExportMidi}
          disabled={busy !== null}
          loading={busy === 'midi'}
        />
        <ActionButton
          label="Export WAV (coming soon)"
          color={colors.neonOrange}
          onPress={handleExportWav}
          disabled={busy !== null}
          loading={busy === 'wav'}
        />
      </View>
    </SafeAreaView>
  );
}

interface ActionButtonProps {
  label: string;
  color: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}

function ActionButton({
  label,
  color,
  onPress,
  disabled,
  loading,
}: ActionButtonProps): React.JSX.Element {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        { borderColor: color, shadowColor: color },
        disabled && styles.buttonDisabled,
        pressed && !disabled && { opacity: 0.85 },
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
    >
      <Text style={[styles.buttonText, { color }]}>
        {loading ? '…' : label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.neonCyan,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  body: {
    flex: 1,
    padding: spacing.lg,
  },
  button: {
    borderWidth: 2,
    borderRadius: 10,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 3,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
});
