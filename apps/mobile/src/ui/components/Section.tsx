import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Spacing } from "../tokens";
import { useTheme } from "../theme";

export function Section({
  title,
  subtitle,
  children,
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const theme = useTheme();
  return (
    <View style={{ marginBottom: Spacing.lg }}>
      {title ? (
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      ) : null}
      {subtitle ? (
        <Text style={[styles.subtitle, { color: theme.text2 }]}>{subtitle}</Text>
      ) : null}
      <View style={{ marginTop: Spacing.md }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: "600" },
  subtitle: { fontSize: 14, marginTop: Spacing.xs },
});
