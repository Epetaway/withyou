import { useMemo } from "react";
import { useColorScheme } from "react-native";
import { MD3LightTheme, MD3DarkTheme } from "react-native-paper";
import type { MD3Theme } from "react-native-paper";
import { colorTokens } from "../theme/tokens";
import { ThemeProvider, useTheme, type ThemeMode } from "./ThemeProvider";

const baseLight = colorTokens.light;
const baseDark = colorTokens.dark;

export const lightTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: baseLight.primary,
    primaryContainer: baseLight.primarySoft,
    secondary: baseLight.accent,
    secondaryContainer: baseLight.surfaceAlt,
    tertiary: baseLight.primary,
    error: baseLight.danger,
    background: baseLight.background,
    surface: baseLight.surface,
    surfaceVariant: baseLight.surfaceAlt,
    onPrimary: "#FFFFFF",
    onSecondary: "#0F1115",
    onBackground: baseLight.textPrimary,
    onSurface: baseLight.textPrimary,
    onSurfaceVariant: baseLight.textSecondary,
    outline: baseLight.border,
  },
};

export const darkTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: baseDark.primary,
    primaryContainer: baseDark.primarySoft,
    secondary: baseDark.accent,
    secondaryContainer: baseDark.surfaceAlt,
    tertiary: baseDark.primary,
    error: baseDark.danger,
    background: baseDark.background,
    surface: baseDark.surface,
    surfaceVariant: baseDark.surfaceAlt,
    onPrimary: "#FFFFFF",
    onSecondary: baseDark.textPrimary,
    onBackground: baseDark.textPrimary,
    onSurface: baseDark.textPrimary,
    onSurfaceVariant: baseDark.textSecondary,
    outline: baseDark.border,
  },
};

export { ThemeProvider, useTheme };
export type { ThemeMode };

export function usePaperTheme() {
  const scheme = useColorScheme();
  return scheme === "dark" ? darkTheme : lightTheme;
}

export function usePaperThemeWithContext(mode?: ThemeMode) {
  const system = useColorScheme();
  const chosen = mode ?? (system === "dark" ? "dark" : "light");
  return chosen === "dark" ? darkTheme : lightTheme;
}
