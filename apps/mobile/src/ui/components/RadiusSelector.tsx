import React, { useMemo } from "react";
import { Pressable, StyleSheet, View, ViewStyle, TextStyle } from "react-native";
import { Text } from "./Text";

const palette = {
  primary: "#4B164C",
  accent: "#DD88CF",
  surface: "#F7F4F8",
  text: "#22172A",
  textSecondary: "rgba(34,23,42,0.70)",
  border: "rgba(75,22,76,0.10)",
};

type RadiusSelectorProps = {
  value: number;
  options?: number[];
  onChange: (value: number) => void;
  style?: ViewStyle;
};

export function RadiusSelector({ value, options = [1, 5, 10, 25], onChange, style }: RadiusSelectorProps) {
  const displayOptions = useMemo(() => options.map((opt) => ({ label: `${opt} mi`, value: opt })), [options]);

  return (
    <View style={[styles.container, style]}
      accessibilityRole="radiogroup"
    >
      {displayOptions.map((opt) => {
        const selected = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={({ pressed }) => [
              styles.chip,
              {
                backgroundColor: selected ? palette.primary : palette.surface,
                borderColor: selected ? palette.primary : palette.border,
                opacity: pressed ? 0.9 : 1,
              },
            ]}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={`Radius ${opt.label}`}
          >
            <Text
              variant="body"
              style={[
                styles.chipText,
                {
                  color: selected ? "#FFFFFF" : palette.text,
                },
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  } as ViewStyle,
  chipText: {
    fontWeight: "600",
  } as TextStyle,
});
