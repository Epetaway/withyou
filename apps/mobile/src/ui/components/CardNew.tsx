import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { Spacing, BorderRadius, Shadows } from '../tokens';
import { useTheme } from '../theme/ThemeProvider';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: keyof typeof Spacing;
  onPress?: () => void;
  style?: ViewStyle;
}

export const CardNew: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  onPress,
  style,
}) => {
  const { colors } = useTheme();
  const Container = onPress ? TouchableOpacity : View;

  const variantStyles: Record<string, ViewStyle> = {
    default: { backgroundColor: colors.surface2 },
    elevated: { backgroundColor: colors.surface },
    outlined: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  };
  
  return (
    <Container
      style={[
        styles.base,
        variantStyles[variant],
        { padding: Spacing[padding] },
        style,
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {children}
    </Container>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.lg,
  },
  
  default: {
    ...Shadows.sm,
  },
  
  elevated: {
    ...Shadows.md,
  },
  
  outlined: {
  },
});
