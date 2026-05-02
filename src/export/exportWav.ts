import type { Project } from '../state/projectStore';
import { NotImplementedError } from './exportMidi';

export { NotImplementedError };

/**
 * Stub. WAV export will render the full project mix offline (summing all
 * lane events through the kit) and write the result as a 16-bit PCM WAV
 * file. Tracked for a future ticket.
 */
export async function exportWav(_project: Project): Promise<string> {
  throw new NotImplementedError(
    'WAV export is not implemented yet. It will be added in a future release.',
  );
}
