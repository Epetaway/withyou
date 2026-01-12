import React from "react";
import { Text as RNText, StyleProp, TextStyle } from "react-native";

type Variant = "title" | "subtitle" | "body" | "muted";

type TextProps = React.ComponentProps<typeof RNText> & {
  variant?: Variant;
  style?: StyleProp<TextStyle>;
};

export function Text({ variant = "body", style, children, ...props }: TextProps) {
  const getFontSize = () => {
    switch (variant) {
      case "title":
        return 32;
      case "subtitle":
        return 20;
      case "muted":
        return 13;
      default:
        return 16;
    }
  };

  const getFontWeight = () => {
    switch (variant) {
      case "title":
        return "800" as const;
      case "subtitle":
        return "700" as const;
      case "muted":
        return "500" as const;
      default:
        return "400" as const;
    }
  };

  const fontSize = getFontSize();
  const fontWeight = getFontWeight();

  const textStyle: TextStyle = {
    fontSize,
    fontWeight,
    lineHeight: fontSize * 1.35,
    includeFontPadding: false,
    textAlignVertical: "center",
  };

  return (
    <RNText 
      {...props}
      style={[textStyle, style]}
    >
      {children}
    </RNText>
  );
}
