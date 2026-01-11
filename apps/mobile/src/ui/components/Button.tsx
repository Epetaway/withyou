import React from "react";
import { Pressable, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { BorderRadius, Size, Spacing } from "../tokens";
import { useTheme } from "../theme";
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
  const theme = useTheme();

  const getButtonStyle = (pressed: boolean) => {
    if (disabled) {
      return { backgroundColor: theme.border, borderColor: theme.border };
    }

    switch (variant) {
      case "primary":
        return {
          backgroundColor: pressed ? theme.primaryPressed : theme.primary,
          borderColor: pressed ? theme.primaryPressed : theme.primary,
        };
      case "secondary":
        return {
          backgroundColor: pressed ? theme.surface : "transparent",
          borderColor: theme.primary,
        };
      case "danger":
        return {
          backgroundColor: "transparent",
          borderColor: theme.danger,
        };
    }
  };

  const getTextColor = () => {
    if (disabled) {
      return theme.text2;
    }

    switch (variant) {
      case "primary":
        return "#fff";
      case "secondary":
        return theme.primary;
      case "danger":
        return theme.danger;
    }
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        getButtonStyle(pressed),
        style,
      ]}
      accessibilityRole="button"
    >
      <Text variant="body" style={[styles.textBase, { color: getTextColor() }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: Size.button,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.button,
    borderWidth: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  textBase: {
    fontWeight: "600",
  } as TextStyle,
});
