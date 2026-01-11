import React from "react";
import { Pressable, StyleSheet, View, ViewStyle, TextStyle } from "react-native";
import { Text } from "./Text";

type ChipOption = {
  id: string;
  label: string;
};

type FilterChipsProps = {
  options: ChipOption[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  style?: ViewStyle;
};

const palette = {
  primary: "#4B164C",
  accent: "#DD88CF",
  surface: "#F7F4F8",
  text: "#22172A",
  textSecondary: "rgba(34,23,42,0.70)",
  border: "rgba(75,22,76,0.10)",
};

export function FilterChips({ options, selected, onToggle, style }: FilterChipsProps) {
  return (
    <View style={[styles.container, style]} accessibilityRole="list">
      {options.map((opt) => {
        const isActive = selected.has(opt.id);
        return (
          <Pressable
            key={opt.id}
            onPress={() => onToggle(opt.id)}
            style={({ pressed }) => [
              styles.chip,
              {
                backgroundColor: isActive ? palette.primary : palette.surface,
                borderColor: isActive ? palette.primary : palette.border,
                opacity: pressed ? 0.9 : 1,
              },
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={`Filter ${opt.label}`}
          >
            <Text
              variant="body"
              style={[
                styles.label,
                { color: isActive ? "#FFFFFF" : palette.textSecondary },
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
    minHeight: 36,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  } as ViewStyle,
  label: {
    fontWeight: "600",
  } as TextStyle,
});
