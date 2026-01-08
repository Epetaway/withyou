import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { Spacing, BorderRadius, Typography, Shadows, TouchTarget } from '../tokens';
import { useTheme } from '../theme/ThemeProvider';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const ButtonNew: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  style,
  textStyle,
}) => {
  const { colors } = useTheme();

  const variantStyles: Record<ButtonVariant, ViewStyle> = {
    primary: { backgroundColor: colors.primary },
    secondary: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary },
    ghost: { backgroundColor: 'transparent' },
    danger: { backgroundColor: colors.error },
  };

  const variantTextColors: Record<ButtonVariant, TextStyle> = {
    primary: { color: colors.textInverse },
    secondary: { color: colors.primary },
    ghost: { color: colors.primary },
    danger: { color: colors.textInverse },
  };

  const buttonStyles: ViewStyle[] = [
    styles.base,
    variantStyles[variant],
    styles[`${size}Size`],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ].filter(Boolean) as ViewStyle[];

  const textStyles: TextStyle[] = [
    styles.text,
    variantTextColors[variant],
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle,
  ].filter(Boolean) as TextStyle[];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'danger' ? colors.textInverse : colors.primary}
          size="small"
        />
      ) : (
        <>
          {icon}
          <Text style={textStyles}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
    minHeight: TouchTarget.min,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xs,
    ...Shadows.sm,
  },
  
  // Variants moved to dynamic theme colors
  
  // Sizes
  smallSize: {
    minHeight: 36,
    paddingHorizontal: Spacing.md,
  },
  mediumSize: {
    minHeight: TouchTarget.min,
    paddingHorizontal: Spacing.lg,
  },
  largeSize: {
    minHeight: 52,
    paddingHorizontal: Spacing.xl,
  },
  
  // Full width
  fullWidth: {
    width: '100%',
  },
  
  // Disabled state
  disabled: {
    opacity: 0.5,
  },
  
  // Text styles
  text: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
    lineHeight: Typography.size.base * Typography.lineHeight.normal,
  },
  disabledText: {
    opacity: 0.7,
  },
  smallText: {
    fontSize: Typography.size.sm,
  },
  mediumText: {
    fontSize: Typography.size.base,
  },
  largeText: {
    fontSize: Typography.size.lg,
  },
});
