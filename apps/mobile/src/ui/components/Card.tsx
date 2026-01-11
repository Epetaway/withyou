import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { BorderRadius, Spacing } from "../tokens";
import { useTheme } from "../theme";

export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  const theme = useTheme();
  return <View style={[styles.card, { backgroundColor: theme.card }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 0,
    borderRadius: BorderRadius.card,
    padding: Spacing.md,
  },
});

