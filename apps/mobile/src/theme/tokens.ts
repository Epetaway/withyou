import type { TextStyle, ViewStyle } from "react-native";

export type ThemeMode = "light" | "dark";

export type ColorTokens = {
  background: string;
  surface: string;
  surfaceAlt: string;
  surfaceMuted: string;
  surface2: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  text: string;
  text2: string;
  textInverse: string;
  border: string;
  borderStrong: string;
  primary: string;
  primarySoft: string;
  accent: string;
  accentPale: string;
  secondary: string;
  secondaryLight: string;
  error: string;
  danger: string;
  success: string;
  overlay: string;
  overlaySoft: string;
  overlayStrong: string;
};

export const colorTokens: Record<ThemeMode, ColorTokens> = {
  light: {
    background: "#F7F7FB",
    surface: "#FFFFFF",
    surfaceAlt: "#F0F2F7",
    surfaceMuted: "#E9ECF2",
    surface2: "#F9F9F9",
    textPrimary: "#0F1115",
    textSecondary: "#4B5563",
    textMuted: "#6B7280",
    text: "#0F1115",
    text2: "#4B5563",
    textInverse: "#FFFFFF",
    border: "#E5E7EB",
    borderStrong: "#D1D5DB",
    primary: "#A78BFA",
    primarySoft: "#EDE9FE",
    accent: "#F4AE85",
    accentPale: "#F0F8FB",
    secondary: "#FBBF24",
    secondaryLight: "#FDE68A",
    error: "#EF4444",
    danger: "#EF4444",
    success: "#22C55E",
    overlay: "rgba(0,0,0,0.5)",
    overlaySoft: "rgba(0,0,0,0.10)",
    overlayStrong: "rgba(0,0,0,0.25)",
  },
  dark: {
    background: "#0B0D12",
    surface: "#11151C",
    surfaceAlt: "#161B24",
    surfaceMuted: "#1E2430",
    surface2: "#1F2329",
    textPrimary: "#E5E7EB",
    textSecondary: "#C7CDD8",
    textMuted: "#9CA3AF",
    text: "#E5E7EB",
    text2: "#C7CDD8",
    textInverse: "#0B0D12",
    border: "#2F3542",
    borderStrong: "#3D4554",
    primary: "#B69CFF",
    primarySoft: "#2B2540",
    accent: "#F4AE85",
    accentPale: "#1A1F2E",
    secondary: "#FBBF24",
    secondaryLight: "#FDE68A",
    error: "#F87171",
    danger: "#F87171",
    success: "#34D399",
    overlay: "rgba(0,0,0,0.7)",
    overlaySoft: "rgba(0,0,0,0.35)",
    overlayStrong: "rgba(0,0,0,0.55)",
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 40,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export const elevation: Record<"none" | "xs" | "sm" | "md" | "lg", ViewStyle> = {
  none: {
    shadowColor: "transparent",
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 10,
  },
};

export const typography: Record<
  "title" | "h1" | "h2" | "h3" | "body" | "bodyStrong" | "caption" | "overline",
  TextStyle
> = {
  title: { fontSize: 32, lineHeight: 38, fontWeight: "700" },
  h1: { fontSize: 24, lineHeight: 30, fontWeight: "700" },
  h2: { fontSize: 20, lineHeight: 26, fontWeight: "600" },
  h3: { fontSize: 18, lineHeight: 24, fontWeight: "600" },
  body: { fontSize: 16, lineHeight: 22, fontWeight: "500" },
  bodyStrong: { fontSize: 16, lineHeight: 22, fontWeight: "700" },
  caption: { fontSize: 14, lineHeight: 18, fontWeight: "500", letterSpacing: 0.1 },
  overline: { fontSize: 12, lineHeight: 16, fontWeight: "600", letterSpacing: 1 },
};

export type ThemeTokens = {
  mode: ThemeMode;
  colors: ColorTokens;
  spacing: typeof spacing;
  radius: typeof radius;
  elevation: typeof elevation;
  typography: typeof typography;
  text: string;
  text2: string;
};
