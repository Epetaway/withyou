import { colorTokens, elevation, radius, spacing, typography, type ThemeMode, type ThemeTokens } from "./tokens";

export type Theme = ThemeTokens & {
  isDark: boolean;
};

export function getTheme(mode: ThemeMode): Theme {
  const colors = colorTokens[mode];
  return {
    mode,
    isDark: mode === "dark",
    colors,
    spacing,
    radius,
    elevation,
    typography,
    text: colors.text,
    text2: colors.text2,
  };
}
