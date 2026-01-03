import React from "react";
import { Text as RNText, StyleSheet, TextProps } from "react-native";
import { tokens } from "../tokens";

type Variant = "title" | "subtitle" | "body" | "muted";

export function Text({
  variant = "body",
  style,
  ...props
}: TextProps & { variant?: Variant }) {
  return <RNText style={[styles[variant], style]} {...props} />;
}

const styles = StyleSheet.create({
  title: {
    fontSize: tokens.font.size.xl,
    fontWeight: tokens.font.weight.semibold,
    color: tokens.color.text,
  },
  subtitle: {
    fontSize: tokens.font.size.lg,
    fontWeight: tokens.font.weight.medium,
    color: tokens.color.text,
  },
  body: {
    fontSize: tokens.font.size.md,
    fontWeight: tokens.font.weight.regular,
    color: tokens.color.text,
    lineHeight: 22,
  },
  muted: {
    fontSize: tokens.font.size.sm,
    fontWeight: tokens.font.weight.regular,
    color: tokens.color.muted,
  },
});
