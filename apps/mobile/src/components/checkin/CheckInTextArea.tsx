import React from "react";
import { View, TextInput, StyleSheet, ViewStyle } from "react-native";
import { ThemedText } from "../ThemedText";
import { useTheme } from "../../theme/ThemeProvider";

type CheckInTextAreaProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  maxLength?: number;
  helperText?: string;
  style?: ViewStyle;
};

export function CheckInTextArea({
  label,
  placeholder,
  value,
  onChangeText,
  maxLength = 250,
  helperText,
  style,
}: CheckInTextAreaProps) {
  const theme = useTheme();
  const charCount = value.length;

  return (
    <View style={style}>
      <ThemedText variant="overline" color="muted" style={{ marginBottom: 12 }}>
        {label}
      </ThemedText>

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.colors.surfaceAlt,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          maxLength={maxLength}
          multiline
          numberOfLines={4}
          style={[
            styles.input,
            {
              color: theme.colors.textPrimary,
              fontSize: 14,
            },
          ]}
          accessibilityLabel={label}
          accessibilityHint={placeholder}
        />

        <ThemedText
          variant="caption"
          color="muted"
          style={{
            alignSelf: "flex-end",
            marginTop: 8,
          }}
        >
          {charCount} / {maxLength}
        </ThemedText>
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
  inputContainer: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  input: {
    flex: 1,
    minHeight: 100,
    textAlignVertical: "top",
  },
});
