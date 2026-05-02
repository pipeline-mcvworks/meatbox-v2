import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import type { Project } from '../state/projectStore';
import { toJSON } from '../persistence/projectSerialization';

function safeFilename(name: string): string {
  const trimmed = (name ?? '').trim() || 'project';
  return trimmed.replace(/[^a-zA-Z0-9_\-]+/g, '_');
}

/**
 * Serialize the given project to JSON, write it to a temporary file under
 * the app's cache directory, and open the system share sheet.
 *
 * Returns the file URI of the temp file (still on disk after sharing).
 */
export async function exportProjectJson(project: Project): Promise<string> {
  const envelope = toJSON(project);
  const json = JSON.stringify(envelope, null, 2);

  const dir = `${FileSystem.cacheDirectory ?? FileSystem.documentDirectory ?? ''}exports/`;
  const dirInfo = await FileSystem.getInfoAsync(dir);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }

  const filename = `${safeFilename(project.name)}.json`;
  const fileUri = `${dir}${filename}`;
  await FileSystem.writeAsStringAsync(fileUri, json);

  const available = await Sharing.isAvailableAsync();
  if (!available) {
    throw new Error('Sharing is not available on this device.');
  }
  await Sharing.shareAsync(fileUri, {
    mimeType: 'application/json',
    dialogTitle: `Export ${project.name}`,
    UTI: 'public.json',
  });

  return fileUri;
}
