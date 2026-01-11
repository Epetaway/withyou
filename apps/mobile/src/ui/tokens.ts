// Design System Tokens
// WithYou Relationship App - Calm, Meditation-Inspired Design System
// Based on 8px grid, soft pastels, and emotional clarity

export const LightTheme = {
  // Primary & Brand Colors
  primary: '#A78BFA', // Soft lavender - trust and calmness
  primaryDark: '#8B5CF6',
  primaryLight: '#C4B5FD',
  
  // Secondary & Accent
  secondary: '#FBBF24', // Gentle peach/amber - warmth and love
  secondaryLight: '#FDE68A',
  accent: '#F4AE85', // Coral accent
  accentWeak: '#E8D5C4',
  accentPale: '#F0F8FB',
  
  // Neutrals & Backgrounds
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surface2: '#F9F9F9', // Cards
  surface3: '#F5F5F5', // Subtle sections
  
  // Text
  text: '#1F2937', // Dark charcoal (not pure black)
  textSecondary: '#6B7280', // Medium gray
  textMuted: '#9CA3AF', // Light gray
  textInverse: '#FFFFFF',
  
  // Borders & Dividers
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  divider: '#E5E7EB',
  
  // Semantic Colors
  success: '#10B981', // Soft green
  successLight: '#D1FAE5',
  error: '#EF4444', // Soft red
  errorLight: '#FEE2E2',
  warning: '#F59E0B', // Amber
  warningLight: '#FEF3C7',
  info: '#3B82F6', // Blue
  infoLight: '#DBEAFE',
  
  // Special
  overlay: 'rgba(0, 0, 0, 0.5)',
  shadow: 'rgba(0, 0, 0, 0.1)',
} as const;

export const DarkTheme = {
  // Primary & Brand Colors
  primary: '#A78BFA',
  primaryDark: '#8B5CF6',
  primaryLight: '#C4B5FD',
  
  // Secondary & Accent
  secondary: '#FBBF24',
  secondaryLight: '#FDE68A',
  accent: '#F4AE85',
  accentWeak: '#E8D5C4',
  accentPale: '#1A1F2E',
  
  // Neutrals & Backgrounds
  background: '#0F1115',
  surface: '#181B22',
  surface2: '#1F2329',
  surface3: '#282C34',
  
  // Text
  text: '#E5E7EB',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  textInverse: '#1F2937',
  
  // Borders & Dividers
  border: '#2A2F3A',
  borderLight: '#374151',
  divider: '#2A2F3A',
  
  // Semantic Colors
  success: '#10B981',
  successLight: '#064E3B',
  error: '#F87171',
  errorLight: '#7F1D1D',
  warning: '#F59E0B',
  warningLight: '#78350F',
  info: '#60A5FA',
  infoLight: '#1E3A8A',
  
  // Special
  overlay: 'rgba(0, 0, 0, 0.7)',
  shadow: 'rgba(0, 0, 0, 0.3)',
} as const;

// Spacing (8px grid system)
export const Spacing = {
  xxs: 4,  // 0.5 units
  xs: 8,   // 1 unit
  sm: 12,  // 1.5 units
  md: 16,  // 2 units
  lg: 24,  // 3 units
  xl: 32,  // 4 units
  xxl: 40, // 5 units
  xxxl: 48, // 6 units
  huge: 64, // 8 units
} as const;

// Border Radius (rounded, friendly)
export const BorderRadius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 10,
  lg: 12,
  card: 16,
  button: 12,
  pill: 999,
  full: 9999,
} as const;

// Size constants (touch targets, buttons, inputs)
export const Size = {
  tap: 44,
  button: 48,
  input: 48,
  tab: 56,
  icon: 22,
} as const;

// Typography Scale
export const Typography = {
  size: {
    xs: 12,    // Caption
    sm: 14,    // Small body
    base: 16,  // Body
    lg: 18,    // Large body
    xl: 20,    // Subtitle
    xxl: 24,   // Heading 3
    xxxl: 28,  // Heading 2
    huge: 32,  // Heading 1
    display: 40, // Display text
  },
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },
} as const;

// Shadows (subtle, for cards and elevation)
export const Shadows = {
  none: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

// Animation Durations
export const Animation = {
  fast: 150,
  normal: 250,
  slow: 350,
} as const;

// Touch Targets (minimum 44px for accessibility)
export const TouchTarget = {
  min: 44,
} as const;

// Legacy token structure (for backwards compatibility)
export const tokens = {
  color: {
    bg: LightTheme.background,
    text: LightTheme.text,
    muted: LightTheme.textMuted,
    border: LightTheme.border,
    danger: LightTheme.error,
    button: LightTheme.primary,
    buttonText: LightTheme.textInverse,
    cardBg: LightTheme.surface,
  },
  space: {
    xs: Spacing.xxs,
    sm: Spacing.xs,
    md: Spacing.md,
    lg: Spacing.lg,
    xl: Spacing.xl,
  },
  radius: {
    sm: BorderRadius.sm,
    md: BorderRadius.md,
    lg: BorderRadius.lg,
  },
  font: {
    size: {
      sm: Typography.size.sm,
      md: Typography.size.base,
      lg: Typography.size.xl,
      xl: Typography.size.xxxl,
    },
    weight: {
      regular: Typography.weight.regular,
      medium: Typography.weight.medium,
      semibold: Typography.weight.semibold,
    },
  },
};

// Export default theme (light)
export const Colors = LightTheme;
