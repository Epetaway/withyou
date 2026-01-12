import React, { useEffect, useState, useMemo } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { RootNavigator } from './navigation/RootNavigator';
import { ThemeProvider, useTheme } from './ui/theme/ThemeProvider';
import { lightTheme, darkTheme } from './ui/theme';

function AppInner() {
  const [isLoading, setIsLoading] = useState(true);
  const { colors, mode, toggle } = useTheme();
  const paperTheme = useMemo(() => (mode === 'dark' ? darkTheme : lightTheme), [mode]);

  useEffect(() => {
    const prepare = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (e) {
        console.warn(e);
      } finally {
        setIsLoading(false);
      }
    };

    prepare();
  }, []);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: paperTheme.colors.background,
        }}
      >
        <ActivityIndicator size="large" color={paperTheme.colors.primary} />
      </View>
    );
  }

  return (
    <PaperProvider theme={paperTheme}>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <RootNavigator />
    </PaperProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}
