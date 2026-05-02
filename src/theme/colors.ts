/**
 * Dark / neon color palette for MouthBeat Machine.
 */
export const colors = {
  // Backgrounds
  background: '#0a0a0f',
  surface: '#13131a',
  surfaceElevated: '#1c1c28',

  // Neon accents
  neonGreen: '#39ff14',
  neonCyan: '#00f5ff',
  neonPink: '#ff2d78',
  neonPurple: '#bf5fff',
  neonOrange: '#ff6b00',
  neonYellow: '#ffe600',

  // Text
  textPrimary: '#f0f0f5',
  textSecondary: '#8888aa',
  textDisabled: '#44445a',

  // UI
  border: '#2a2a3a',
  divider: '#1e1e2e',
  error: '#ff3b30',
  success: '#39ff14',
  warning: '#ff6b00',
} as const;

export type ColorKey = keyof typeof colors;
