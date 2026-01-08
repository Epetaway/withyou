import React from 'react';
import { View, TextInput, Text, StyleSheet, ViewStyle, TextInputProps } from 'react-native';
import { Spacing, BorderRadius, Typography, Animation } from '../tokens';
import { useTheme } from '../theme/ThemeProvider';

interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export const TextFieldNew: React.FC<TextFieldProps> = ({
  label,
  error,
  helper,
  leftIcon,
  rightIcon,
  containerStyle,
  style,
  ...inputProps
}) => {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, { color: colors.text }]}>{label}</Text>}
      
      <View style={[
        styles.inputContainer,
        { backgroundColor: colors.surface, borderColor: colors.border },
        isFocused && { borderColor: colors.primary, borderWidth: 1.5 },
        error && { borderColor: colors.error },
      ]}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        
        <TextInput
          style={[styles.input, { color: colors.text }, style]}
          placeholderTextColor={colors.textMuted}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...inputProps}
        />
        
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
      
      {error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}
      {helper && !error && <Text style={[styles.helper, { color: colors.textMuted }]}>{helper}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: Spacing.md,
  },
  
  label: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
    marginBottom: Spacing.xxs,
  },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    minHeight: 48,
    transitionDuration: `${Animation.fast}ms`,
  },
  
  input: {
    flex: 1,
    fontSize: Typography.size.base,
    paddingVertical: Spacing.sm,
    lineHeight: Typography.size.base * Typography.lineHeight.normal,
  },
  
  leftIcon: {
    marginRight: Spacing.xs,
  },
  
  rightIcon: {
    marginLeft: Spacing.xs,
  },
  
  error: {
    fontSize: Typography.size.xs,
    marginTop: Spacing.xxs,
  },
  
  helper: {
    fontSize: Typography.size.xs,
    marginTop: Spacing.xxs,
  },
});
