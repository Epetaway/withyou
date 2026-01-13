import React from "react";
import { TextInput as PaperTextInput } from "react-native-paper";
import { View, StyleSheet, TextStyle } from "react-native";

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
    <View style={styles.container}>
      <PaperTextInput
        label={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={numberOfLines}
        textAlignVertical={textAlignVertical}
        error={!!errorText}
        mode="outlined"
        style={[{ backgroundColor: "transparent" }, style]}
        outlineStyle={{ borderRadius: 12 }}
      />
      {errorText && (
        <PaperTextInput.Helper type="error">
          {errorText}
        </PaperTextInput.Helper>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
});
