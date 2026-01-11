import React from "react";
import { Button as PaperButton } from "react-native-paper";
import { ViewStyle } from "react-native";

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
  const getMode = () => {
    if (variant === "primary") return "contained";
    if (variant === "danger") return "outlined";
    return "outlined";
  };

  const getButtonColor = () => {
    if (variant === "danger") return "#EF4444";
    return undefined; // Use theme default
  };

  return (
    <PaperButton
      mode={getMode()}
      onPress={onPress}
      disabled={disabled}
      buttonColor={getButtonColor()}
      textColor={variant === "danger" ? "#EF4444" : undefined}
      style={[{ borderRadius: 12 }, style]}
      contentStyle={{ paddingVertical: 8 }}
      labelStyle={{ fontSize: 16, fontWeight: "600" }}
    >
      {label}
    </PaperButton>
  );
}
