import React from "react";
import { SafeAreaView, View, StyleSheet, ViewStyle } from "react-native";
import { tokens } from "../tokens";

export function Screen({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.container, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: tokens.color.bg, paddingTop: tokens.space.xl },
  container: { flex: 1, padding: tokens.space.lg },
});
