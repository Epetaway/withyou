import React from "react";
import { Pressable, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { tokens } from "../tokens";
import { Text } from "./Text";

type Props = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  style?: ViewStyle;
};

export function Button({
  label,
  onPress,
  variant = "primary",
  disabled,
  style,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.base,
        styles[variant],
        disabled ? styles.disabled : null,
        style,
      ]}
      accessibilityRole="button"
    >
      <Text variant="body" style={[styles.textBase, textStyles[variant]]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    paddingVertical: tokens.space.md,
    paddingHorizontal: tokens.space.md,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    borderColor: tokens.color.border,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: {
    backgroundColor: tokens.color.button,
    borderColor: tokens.color.button,
  },
  secondary: {
    backgroundColor: "transparent",
    borderColor: tokens.color.border,
  },
  danger: {
    backgroundColor: "transparent",
    borderColor: tokens.color.danger,
  },
  disabled: {
    opacity: 0.5,
  },
  textBase: {
    fontWeight: tokens.font.weight.medium,
  } as TextStyle,
});

const textStyles = StyleSheet.create({
  primary: { color: tokens.color.buttonText },
  secondary: { color: tokens.color.text },
  danger: { color: tokens.color.danger },
});
