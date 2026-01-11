import React from "react";
import { View, TextInput, StyleSheet, TextStyle } from "react-native";
import { tokens } from "../tokens";
import { Text } from "./Text";

type Props = {
  label?: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  errorText?: string;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "default" | "email-address";
  multiline?: boolean;
  numberOfLines?: number;
  textAlignVertical?: "top" | "center" | "auto" | "bottom";
  style?: TextStyle;
};

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  errorText,
  autoCapitalize = "none",
  keyboardType = "default",
  multiline,
  numberOfLines,
  textAlignVertical,
  style,
}: Props) {
  return (
    <View style={styles.wrap}>
      {label ? (
        <Text variant="muted" style={styles.label}>
          {label}
        </Text>
      ) : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={numberOfLines}
        textAlignVertical={textAlignVertical}
        style={[styles.input, style, errorText ? styles.inputError : null]}
      />
      {errorText ? (
        <Text variant="muted" style={styles.error}>
          {errorText}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: tokens.space.md },
  label: { marginBottom: tokens.space.xs },
  input: {
    borderWidth: 0,
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.md,
    paddingVertical: tokens.space.sm,
    paddingHorizontal: tokens.space.md,
    fontSize: tokens.font.size.md,
    color: tokens.color.text,
  },
  inputError: {
    borderColor: tokens.color.danger,
  },
  error: { marginTop: tokens.space.xs, color: tokens.color.danger },
});
