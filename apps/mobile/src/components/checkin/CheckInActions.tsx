import React from "react";
import { View, Pressable, StyleSheet, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ThemedText } from "../ThemedText";
import { useTheme } from "../../theme/ThemeProvider";

type CheckInActionsProps = {
  onSave: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  style?: ViewStyle;
};

export function CheckInActions({ onSave, onCancel, isLoading = false, style }: CheckInActionsProps) {
  const theme = useTheme();

  return (
    <View style={style}>
      <Pressable
        onPress={onSave}
        disabled={isLoading}
        style={({ pressed }) => [
          styles.primaryButton,
          {
            opacity: pressed || isLoading ? 0.7 : 1,
          },
        ]}
        accessibilityLabel="Save check-in"
        accessibilityRole="button"
        accessibilityState={{ disabled: isLoading }}
      >
        <LinearGradient
          colors={[theme.colors.primary, `${theme.colors.primary}CC`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientButton}
        >
          <ThemedText
            variant="title"
            color="primary"
            style={{
              color: "#FFFFFF",
              fontWeight: "600",
            }}
          >
            {isLoading ? "Saving..." : "Save check-in"}
          </ThemedText>
        </LinearGradient>
      </Pressable>

      <Pressable
        onPress={onCancel}
        disabled={isLoading}
        style={({ pressed }) => [
          styles.secondaryButton,
          {
            opacity: pressed ? 0.6 : 1,
          },
        ]}
        accessibilityLabel="Cancel"
        accessibilityRole="button"
      >
        <ThemedText
          variant="body"
          color="secondary"
          style={{
            textAlign: "center",
          }}
        >
          Cancel
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  primaryButton: {
    width: "100%",
    height: 54,
    borderRadius: 28,
    overflow: "hidden",
    marginBottom: 12,
  },
  gradientButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});
