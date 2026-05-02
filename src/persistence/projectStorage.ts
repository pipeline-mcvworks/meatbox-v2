import * as FileSystem from 'expo-file-system';
import type { Project } from '../state/projectStore';
import { fromJSON, toJSON } from './projectSerialization';
import { runMigrations } from './migrations';

/**
 * On-disk layout (under FileSystem.documentDirectory):
 *
 *   mouthbeat/
 *     index.json            -> { projects: ProjectIndexEntry[] }
 *     projects/
 *       <id>.json           -> SerializedProject envelope
 */

const ROOT_DIR = `${FileSystem.documentDirectory ?? ''}mouthbeat/`;
const PROJECTS_DIR = `${ROOT_DIR}projects/`;
const INDEX_PATH = `${ROOT_DIR}index.json`;

export type ProjectIndexEntry = {
  id: string;
  name: string;
  bpm: number;
  createdAt: string;
  updatedAt: string;
};

type IndexFile = {
  projects: ProjectIndexEntry[];
};

async function ensureDirs(): Promise<void> {
  const root = await FileSystem.getInfoAsync(ROOT_DIR);
  if (!root.exists) {
    await FileSystem.makeDirectoryAsync(ROOT_DIR, { intermediates: true });
  }
  const projects = await FileSystem.getInfoAsync(PROJECTS_DIR);
  if (!projects.exists) {
    await FileSystem.makeDirectoryAsync(PROJECTS_DIR, { intermediates: true });
  }
}

async function readIndex(): Promise<IndexFile> {
  await ensureDirs();
  const info = await FileSystem.getInfoAsync(INDEX_PATH);
  if (!info.exists) {
    return { projects: [] };
  }
  try {
    const raw = await FileSystem.readAsStringAsync(INDEX_PATH);
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.projects)) {
      return { projects: parsed.projects as ProjectIndexEntry[] };
    }
    return { projects: [] };
  } catch {
    return { projects: [] };
  }
}

async function writeIndex(index: IndexFile): Promise<void> {
  await ensureDirs();
  await FileSystem.writeAsStringAsync(INDEX_PATH, JSON.stringify(index));
}

function projectPath(id: string): string {
  // Defensive: keep id safe for a filename.
  const safe = id.replace(/[^a-zA-Z0-9_\-]/g, '_');
  return `${PROJECTS_DIR}${safe}.json`;
}

function toIndexEntry(project: Project): ProjectIndexEntry {
  return {
    id: project.id,
    name: project.name,
    bpm: project.bpm,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
}

/**
 * List all saved projects, most recently updated first.
 */
export async function listProjects(): Promise<ProjectIndexEntry[]> {
  const index = await readIndex();
  return [...index.projects].sort((a, b) => {
    // Most recent first.
    return (b.updatedAt ?? '').localeCompare(a.updatedAt ?? '');
  });
}

/**
 * Save a project to local storage. Updates `updatedAt` and refreshes the
 * index entry. Returns the persisted project (with bumped updatedAt).
 */
export async function saveProject(project: Project): Promise<Project> {
  await ensureDirs();
  const now = new Date().toISOString();
  const persisted: Project = {
    ...project,
    createdAt: project.createdAt || now,
    updatedAt: now,
  };
  const envelope = toJSON(persisted);
  await FileSystem.writeAsStringAsync(
    projectPath(persisted.id),
    JSON.stringify(envelope),
  );

  const index = await readIndex();
  const filtered = index.projects.filter((p) => p.id !== persisted.id);
  filtered.push(toIndexEntry(persisted));
  await writeIndex({ projects: filtered });

  return persisted;
}

/**
 * Load a project by id. Runs any registered migrations. Returns null if
 * not found.
 */
export async function loadProject(id: string): Promise<Project | null> {
  await ensureDirs();
  const path = projectPath(id);
  const info = await FileSystem.getInfoAsync(path);
  if (!info.exists) return null;
  const raw = await FileSystem.readAsStringAsync(path);
  const envelope = fromJSON(raw);
  const migrated = runMigrations(envelope);
  return migrated.data;
}

/**
 * Delete a project by id. No-op if it doesn't exist.
 */
export async function deleteProject(id: string): Promise<void> {
  await ensureDirs();
  const path = projectPath(id);
  const info = await FileSystem.getInfoAsync(path);
  if (info.exists) {
    await FileSystem.deleteAsync(path, { idempotent: true });
  }
  const index = await readIndex();
  const filtered = index.projects.filter((p) => p.id !== id);
  await writeIndex({ projects: filtered });
}
