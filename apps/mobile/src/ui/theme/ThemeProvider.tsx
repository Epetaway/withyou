import React, { createContext, useContext, useMemo, useState } from 'react';
import { Appearance } from 'react-native';
import { LightTheme, DarkTheme } from '../tokens';

export type ThemeMode = 'light' | 'dark';

type ThemeContextValue = {
  mode: ThemeMode;
  colors: typeof LightTheme;
  setMode: (m: ThemeMode) => void;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const system = Appearance.getColorScheme();
  const [mode, setMode] = useState<ThemeMode>(system === 'dark' ? 'dark' : 'light');

  const colors = useMemo(() => (mode === 'dark' ? DarkTheme : LightTheme), [mode]);
  const toggle = () => setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));

  const value = useMemo(() => ({ mode, colors, setMode, toggle }), [mode, colors]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
};
