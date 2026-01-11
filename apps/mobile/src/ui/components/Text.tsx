import React from "react";
import { Text as PaperText } from "react-native-paper";
import { TextProps as RNTextProps, StyleProp, TextStyle } from "react-native";

type Variant = "title" | "subtitle" | "body" | "muted";

type TextProps = RNTextProps & {
  variant?: Variant;
  style?: StyleProp<TextStyle>;
};

export function Text({ variant = "body", style, children, ...props }: TextProps) {
  const getPaperVariant = () => {
    switch (variant) {
      case "title":
        return "titleLarge";
      case "subtitle":
        return "titleMedium";
      case "muted":
        return "bodySmall";
      default:
        return "bodyMedium";
    }
  };

  return (
    <PaperText variant={getPaperVariant() as any} style={style} {...props}>
      {children}
    </PaperText>
  );
}
