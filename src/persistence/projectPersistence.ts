// Compatibility shim: ExportScreen (T-009) imports from
// '../persistence/projectPersistence'. The real implementation lives in
// projectStorage.ts; this file just re-exports the same API surface.

export {
  saveProject,
  loadProject,
  deleteProject,
  listProjects,
} from './projectStorage';
export type { ProjectIndexEntry } from './projectStorage';
