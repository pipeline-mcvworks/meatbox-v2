/**
 * Spacing scale (in dp) for MouthBeat Machine.
 */
export const spacing = {
  /** 2 */
  xxs: 2,
  /** 4 */
  xs: 4,
  /** 8 */
  sm: 8,
  /** 12 */
  md: 12,
  /** 16 */
  lg: 16,
  /** 24 */
  xl: 24,
  /** 32 */
  xxl: 32,
  /** 48 */
  xxxl: 48,
} as const;

export type SpacingKey = keyof typeof spacing;
