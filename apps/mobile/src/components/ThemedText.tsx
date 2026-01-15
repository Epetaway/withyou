import React from "react";
import { Text as RNText, type TextStyle, type TextProps as RNTextProps } from "react-native";
import { useTheme } from "../../theme/ThemeProvider";

type TextVariant = "title" | "h1" | "h2" | "h3" | "body" | "bodyStrong" | "caption" | "overline";

export type ThemedTextProps = RNTextProps & {
  variant?: TextVariant;
  color?: "primary" | "secondary" | "muted" | "accent" | "danger" | "success";
};

export function ThemedText({ variant = "body", color, style, ...props }: ThemedTextProps) {
  const theme = useTheme();

  const textStyle: TextStyle = {
    ...theme.typography[variant],
    color: color
      ? color === "primary"
        ? theme.colors.textPrimary
        : color === "secondary"
        ? theme.colors.textSecondary
        : color === "muted"
        ? theme.colors.textMuted
        : color === "accent"
        ? theme.colors.accent
        : color === "danger"
        ? theme.colors.danger
        : theme.colors.success
      : theme.colors.textPrimary,
  };

  return <RNText style={[textStyle, style]} {...props} />;
}
