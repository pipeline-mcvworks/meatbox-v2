/**
 * Typography tokens for MouthBeat Machine.
 */
export const typography = {
  sizes: {
    /** 10 */
    xs: 10,
    /** 12 */
    sm: 12,
    /** 14 */
    md: 14,
    /** 16 */
    lg: 16,
    /** 20 */
    xl: 20,
    /** 28 */
    xxl: 28,
    /** 36 */
    xxxl: 36,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export type TypographySizes = keyof typeof typography.sizes;
export type TypographyWeights = keyof typeof typography.weights;
