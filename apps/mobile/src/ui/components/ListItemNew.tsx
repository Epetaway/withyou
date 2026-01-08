import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Spacing, BorderRadius, Typography } from '../tokens';
import { useTheme } from '../theme/ThemeProvider';

interface ListItemProps {
  title: string;
  subtitle?: string;
  leftIcon?: React.ReactNode;
  rightAccessory?: React.ReactNode; // e.g., chevron or toggle
  onPress?: () => void;
  style?: ViewStyle;
}

export const ListItemNew: React.FC<ListItemProps> = ({
  title,
  subtitle,
  leftIcon,
  rightAccessory,
  onPress,
  style,
}) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: colors.surface },
        style
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {leftIcon ? <View style={styles.left}>{leftIcon}</View> : null}
      <View style={styles.center}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text> : null}
      </View>
      {rightAccessory ? <View style={styles.right}>{rightAccessory}</View> : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  left: {
    marginRight: Spacing.md,
  },
  center: {
    flex: 1,
  },
  right: {
    marginLeft: Spacing.md,
  },
  title: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
  },
  subtitle: {
    marginTop: 2,
    fontSize: Typography.size.sm,
  },
});
