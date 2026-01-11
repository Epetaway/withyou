import React from "react";
import { View, StyleSheet, ViewStyle, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Surface } from "react-native-paper";

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
  scrollable?: boolean;
};

export function Screen({ children, style, scrollable = false }: Props) {
  const content = (
    <View style={[styles.container, style]}>
      {children}
    </View>
  );

  return (
    <Surface style={styles.surface}>
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        {scrollable ? (
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {content}
          </ScrollView>
        ) : (
          content
        )}
      </SafeAreaView>
    </Surface>
  );
}

const styles = StyleSheet.create({
  surface: { flex: 1 },
  safe: { flex: 1 },
  container: { 
    flex: 1, 
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
});
