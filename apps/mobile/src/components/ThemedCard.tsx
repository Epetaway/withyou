import React from "react";
import { View, type ViewStyle, type ViewProps } from "react-native";
import { useTheme } from "../theme/ThemeProvider";

export type ThemedCardProps = ViewProps & {
  elevation?: "none" | "xs" | "sm" | "md" | "lg";
  padding?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
  radius?: "sm" | "md" | "lg" | "xl" | "pill";
  surface?: "default" | "alt" | "muted";
  color?: "surface" | "primary" | "alt" | "muted" | string;
};

export function ThemedCard({
  elevation = "sm",
  padding = "md",
  radius = "md",
  surface = "default",
  color,
  style,
  children,
  ...props
}: ThemedCardProps) {
  const theme = useTheme();

  const paddingValue =
    padding === "none"
      ? 0
      : padding === "xs"
      ? theme.spacing.xs
      : padding === "sm"
      ? theme.spacing.sm
      : padding === "md"
      ? theme.spacing.md
      : padding === "lg"
      ? theme.spacing.lg
      : theme.spacing.xl;

  const resolvedColor = color
    ? color === "surface"
      ? theme.colors.surface
      : color === "primary"
      ? theme.colors.primary
      : color === "alt"
      ? theme.colors.surfaceAlt
      : color === "muted"
      ? theme.colors.surfaceMuted
      : color
    : undefined;

  const cardStyle: ViewStyle = {
    backgroundColor:
      resolvedColor ??
      (surface === "alt"
        ? theme.colors.surfaceAlt
        : surface === "muted"
        ? theme.colors.surfaceMuted
        : theme.colors.surface),
    borderRadius: theme.radius[radius],
    padding: paddingValue,
    ...theme.elevation[elevation],
  };

  return (
    <View style={[cardStyle, style]} {...props}>
      {children}
    </View>
  );
}
