import React from "react";
import { View, Pressable, StyleSheet, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "../ThemedText";
import { useTheme } from "../../theme/ThemeProvider";
import type { CheckInOption, CheckInOptionId } from "../../lib/checkinOptions";

type ChipGroupProps = {
  label: string;
  options: CheckInOption[];
  selectedIds: CheckInOptionId[];
  onSelectionChange: (selectedIds: CheckInOptionId[]) => void;
  helperText?: string;
  style?: ViewStyle;
};

export function ChipGroup({
  label,
  options,
  selectedIds,
  onSelectionChange,
  helperText,
  style,
}: ChipGroupProps) {
  const theme = useTheme();

  const toggleOption = (optionId: CheckInOptionId) => {
    if (selectedIds.includes(optionId)) {
      onSelectionChange(selectedIds.filter((id) => id !== optionId));
    } else {
      onSelectionChange([...selectedIds, optionId]);
    }
  };

  return (
    <View style={style}>
      <ThemedText variant="overline" color="muted" style={{ marginBottom: 12 }}>
        {label}
      </ThemedText>

      <View style={styles.chipContainer}>
        {options.map((option) => {
          const isSelected = selectedIds.includes(option.id);
          return (
            <Pressable
              key={option.id}
              onPress={() => toggleOption(option.id)}
              style={({ pressed }) => [
                styles.chip,
                {
                  backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
                  borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
              accessibilityLabel={`${option.label} - ${isSelected ? "selected" : "not selected"}`}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isSelected }}
            >
              <Ionicons
                name={option.iconName as keyof typeof Ionicons.glyphMap}
                size={16}
                color={isSelected ? "#FFFFFF" : theme.colors.primary}
                style={{ marginRight: 6 }}
              />
              <ThemedText
                variant="body"
                color={isSelected ? "primary" : "secondary"}
                style={{
                  color: isSelected ? "#FFFFFF" : theme.colors.textSecondary,
                  fontSize: 14,
                }}
              >
                {option.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {helperText && (
        <ThemedText
          variant="caption"
          color="muted"
          style={{
            marginTop: 8,
            lineHeight: 18,
          }}
        >
          {helperText}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1.5,
    minHeight: 44,
    justifyContent: "center",
  },
});
