import React from "react";
import { StyleSheet, View, ViewStyle, TextStyle } from "react-native";
import { Text } from "./Text";
import { Button } from "./Button";

const palette = {
  surface: "#F7F4F8",
  text: "#22172A",
  textSecondary: "rgba(34,23,42,0.70)",
  border: "rgba(75,22,76,0.10)",
};

type EmptyStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
};

export function EmptyState({ title, description, actionLabel, onAction, style }: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}
      accessibilityRole="summary"
    >
      <Text variant="title" style={styles.title}>{title}</Text>
      {description ? (
        <Text variant="body" style={styles.description}>{description}</Text>
      ) : null}
      {actionLabel && onAction ? (
        <View style={styles.buttonWrap}>
          <Button label={actionLabel} onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 24,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    padding: 20,
    gap: 8,
    alignItems: "flex-start",
  } as ViewStyle,
  title: {
    color: palette.text,
    fontWeight: "700",
  } as TextStyle,
  description: {
    color: palette.textSecondary,
  } as TextStyle,
  buttonWrap: {
    marginTop: 8,
  } as ViewStyle,
});
