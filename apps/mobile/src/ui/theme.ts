import { useColorScheme } from "react-native";

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
