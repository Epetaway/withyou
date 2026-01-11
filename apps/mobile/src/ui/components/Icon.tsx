import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

type Props = {
  icon: IconDefinition;
  size?: number;
  color?: string;
  style?: ViewStyle;
  containerSize?: number;
};

export function Icon({ 
  icon, 
  size = 20, 
  color = "#9B8CFF",
  style,
  containerSize,
}: Props) {
  if (containerSize) {
    return (
      <View 
        style={[
          styles.container,
          { 
            width: containerSize, 
            height: containerSize,
            borderRadius: containerSize / 4,
          },
          style,
        ]}
      >
        <FontAwesomeIcon icon={icon} size={size} color={color} />
      </View>
    );
  }

  return <FontAwesomeIcon icon={icon} size={size} color={color} />;
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F1FB",
  },
});
