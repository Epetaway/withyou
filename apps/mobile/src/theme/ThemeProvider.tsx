import React, { createContext, useContext, useMemo, useState } from "react";
import { useColorScheme } from "react-native";
import { getTheme, type Theme } from "./theme";
import type { ThemeMode } from "./tokens";

type ThemeContextValue = Theme & {
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>(system === "dark" ? "dark" : "light");

  const value = useMemo<ThemeContextValue>(() => {
    const theme = getTheme(mode);
    return {
      ...theme,
      setMode,
      toggle: () => setMode((prev) => (prev === "dark" ? "light" : "dark")),
    };
  }, [mode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

export type { ThemeMode };
