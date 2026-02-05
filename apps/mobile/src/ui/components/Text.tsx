import React from "react";
import { Text as RNText, StyleProp, TextStyle } from "react-native";

type Variant =
  | "screenTitle"
  | "screenSubtitle"
  | "cardTitle"
  | "sectionLabel"
  | "title"
  | "muted"
  | "body"
  | "helper";

type TextProps = React.ComponentProps<typeof RNText> & {
  variant?: Variant;
  style?: StyleProp<TextStyle>;
};

export function Text({ variant = "body", style, children, ...props }: TextProps) {
  const getFontSize = () => {
    switch (variant) {
      case "screenTitle":
        return 28;
      case "screenSubtitle":
        return 16;
      case "cardTitle":
        return 18;
      case "title":
        return 20;
      case "sectionLabel":
        return 12;
      case "muted":
        return 14;
      case "helper":
        return 14;
      default:
        return 16;
    }
  };

  const getFontWeight = () => {
    switch (variant) {
      case "screenTitle":
        return "700" as const;
      case "cardTitle":
      case "sectionLabel":
      case "title":
        return "600" as const;
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
