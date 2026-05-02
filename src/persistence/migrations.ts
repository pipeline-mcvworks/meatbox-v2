import type { SerializedProject } from './projectSerialization';
import { PROJECT_SCHEMA_VERSION } from './projectSerialization';

/**
 * A single migration step. `from` is the version it upgrades from; the
 * resulting object will have version `from + 1`.
 */
export type Migration = {
  from: number;
  migrate: (envelope: SerializedProject) => SerializedProject;
};

/**
 * Empty registry. When the project schema changes, add a Migration entry
 * here that bumps the version by exactly one.
 */
export const MIGRATIONS: Migration[] = [];

/**
 * Run all applicable migrations against a serialized project envelope so
 * its version equals PROJECT_SCHEMA_VERSION. Throws if a needed migration
 * is missing.
 */
export function runMigrations(envelope: SerializedProject): SerializedProject {
  let current = envelope;
  while (current.version < PROJECT_SCHEMA_VERSION) {
    const step = MIGRATIONS.find((m) => m.from === current.version);
    if (!step) {
      throw new Error(
        `No migration registered from version ${current.version} to ${current.version + 1}`,
      );
    }
    current = step.migrate(current);
    if (current.version !== step.from + 1) {
      throw new Error(
        `Migration from ${step.from} did not bump version correctly (got ${current.version})`,
      );
    }
  }
  if (current.version > PROJECT_SCHEMA_VERSION) {
    throw new Error(
      `Project version ${current.version} is newer than supported ${PROJECT_SCHEMA_VERSION}`,
    );
  }
  return current;
}
