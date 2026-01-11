import { useColorScheme } from "react-native";
import { MD3LightTheme, MD3DarkTheme } from "react-native-paper";
import type { MD3Theme } from "react-native-paper";

// Material Design 3 Custom Theme
export const lightTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#A78BFA",
    primaryContainer: "#EDE9FE",
    secondary: "#8B5CF6",
    secondaryContainer: "#DDD6FE",
    tertiary: "#7C3AED",
    error: "#EF4444",
    background: "#FFFFFF",
    surface: "#F8F9FB",
    surfaceVariant: "#E5E7EB",
    onPrimary: "#FFFFFF",
    onSecondary: "#FFFFFF",
    onBackground: "#1F2937",
    onSurface: "#1F2937",
    onSurfaceVariant: "#6B7280",
    outline: "#D1D5DB",
  },
};

export const darkTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#A78BFA",
    primaryContainer: "#4C1D95",
    secondary: "#8B5CF6",
    secondaryContainer: "#5B21B6",
    tertiary: "#7C3AED",
    error: "#F87171",
    background: "#0F1115",
    surface: "#181B22",
    surfaceVariant: "#2A2F3A",
    onPrimary: "#FFFFFF",
    onSecondary: "#FFFFFF",
    onBackground: "#E5E7EB",
    onSurface: "#E5E7EB",
    onSurfaceVariant: "#9CA3AF",
    outline: "#4B5563",
  },
};

// Legacy color export for gradual migration
export const colors = {
  light: {
    bg: "#FFFFFF",
    surface: "#F8F9FB",
    card: "#FFFFFF",
    text: "#1F2937",
    text2: "#6B7280",
    border: "#E5E7EB",
    primary: "#A78BFA",
    primaryPressed: "#8B5CF6",
    danger: "#EF4444",
    success: "#22C55E",
  },
  dark: {
    bg: "#0F1115",
    surface: "#181B22",
    card: "#181B22",
    text: "#E5E7EB",
    text2: "#9CA3AF",
    border: "#2A2F3A",
    primary: "#A78BFA",
    primaryPressed: "#8B5CF6",
    danger: "#F87171",
    success: "#34D399",
  },
} as const;

export function useTheme() {
  const scheme = useColorScheme();
  return colors[scheme === "dark" ? "dark" : "light"];
}

export function usePaperTheme() {
  const scheme = useColorScheme();
  return scheme === "dark" ? darkTheme : lightTheme;
}
