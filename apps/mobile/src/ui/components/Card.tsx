import React from "react";
import { Card as PaperCard } from "react-native-paper";
import { ViewStyle } from "react-native";

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export function Card({ children, style }: Props) {
  return (
    <PaperCard mode="elevated" style={[{ borderRadius: 16 }, style]}>
      <PaperCard.Content>{children}</PaperCard.Content>
    </PaperCard>
  );
}
