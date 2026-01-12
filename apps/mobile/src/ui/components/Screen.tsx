import React from "react";
import { View, StyleSheet, ViewStyle, ScrollView } from "react-native";
import { useSafeAreaInsets, SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "./theme/ThemeProvider";

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
  scrollable?: boolean;
};

export function Screen({ children, style, scrollable = false }: Props) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const containerStyle = {
    paddingTop: insets.top + 16,
    paddingHorizontal: 16,
    paddingBottom: 32,
  };

  const content = (
    <View style={[{ flex: 1 }, style]}>
      {children}
    </View>
  );

  return (
    <View style={[styles.surface, { backgroundColor: theme.colors.background }]}>
      <SafeAreaView style={styles.safe} edges={["left", "right"]}>
        {scrollable ? (
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.scrollContent, containerStyle]}
            scrollEventThrottle={16}
          >
            {content}
          </ScrollView>
        ) : (
          <View style={[styles.container, containerStyle]}>
            {content}
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  surface: { flex: 1 },
  safe: { flex: 1 },
  container: { 
    flex: 1, 
  },
  scrollContent: {
    minHeight: "100%",
  },
});
