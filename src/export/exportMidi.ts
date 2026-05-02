import type { Project } from '../state/projectStore';

export class NotImplementedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotImplementedError';
  }
}

/**
 * Stub. MIDI export will encode each lane's events as MIDI notes on a
 * separate channel, using the project BPM as tempo. Tracked for a future
 * ticket.
 */
export async function exportMidi(_project: Project): Promise<string> {
  throw new NotImplementedError(
    'MIDI export is not implemented yet. It will be added in a future release.',
  );
}
