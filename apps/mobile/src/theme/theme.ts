import { colorTokens, elevation, radius, spacing, typography, type ThemeMode, type ThemeTokens } from "./tokens";

export type Theme = ThemeTokens & {
  isDark: boolean;
};

export function getTheme(mode: ThemeMode): Theme {
  return {
    mode,
    isDark: mode === "dark",
    colors: colorTokens[mode],
    spacing,
    radius,
    elevation,
    typography,
  };
}
