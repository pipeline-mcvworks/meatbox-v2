import type { Project } from '../state/projectStore';

/**
 * Schema version for serialized MouthBeatProject JSON files.
 *
 * Bump this whenever the on-disk shape of a project changes in a way that
 * requires migration. Add a corresponding entry to MIGRATIONS in
 * `./migrations.ts`.
 */
export const PROJECT_SCHEMA_VERSION = 1;

/**
 * The serialized envelope written to disk. The actual project data lives
 * under `data`; `version` tells the loader which migrations (if any) to run.
 */
export type SerializedProject = {
  version: number;
  data: Project;
};

/**
 * Convert an in-memory Project to a JSON-safe envelope.
 */
export function toJSON(project: Project): SerializedProject {
  return {
    version: PROJECT_SCHEMA_VERSION,
    data: project,
  };
}

/**
 * Parse a JSON string or already-parsed object into a SerializedProject.
 * Throws if the input is not a recognizable project envelope.
 *
 * Note: this does NOT run migrations; that is the storage layer's job. It
 * just normalizes legacy / bare-project JSON into the envelope shape so
 * the migration runner has something consistent to work with.
 */
export function fromJSON(input: unknown): SerializedProject {
  let parsed: any = input;
  if (typeof input === 'string') {
    try {
      parsed = JSON.parse(input);
    } catch (err: any) {
      throw new Error(`Invalid project JSON: ${err?.message ?? err}`);
    }
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid project JSON: not an object');
  }

  // Already an envelope.
  if (typeof parsed.version === 'number' && parsed.data && typeof parsed.data === 'object') {
    return {
      version: parsed.version,
      data: parsed.data as Project,
    };
  }

  // Bare project (no envelope) — assume version 1.
  if (typeof parsed.id === 'string' && Array.isArray(parsed.lanes)) {
    return {
      version: 1,
      data: parsed as Project,
    };
  }

  throw new Error('Invalid project JSON: missing required fields');
}
