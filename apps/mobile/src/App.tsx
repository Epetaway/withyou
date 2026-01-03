import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { RootNavigator } from './navigation/RootNavigator';
import { tokens } from './ui/tokens';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize app state here (font loading, etc)
    const prepare = async () => {
      try {
        // Add any async initialization here
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
          backgroundColor: tokens.colors.bg,
        }}
      >
        <ActivityIndicator size="large" color={tokens.colors.button} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <RootNavigator />
    </>
  );
}
