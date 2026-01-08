import React from 'react';
import { View, Text, StyleSheet, Switch, ViewStyle } from 'react-native';
import { Spacing, Typography } from '../tokens';
import { useTheme } from '../theme/ThemeProvider';

interface ToggleProps {
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  helper?: string;
  style?: ViewStyle;
}

export const ToggleNew: React.FC<ToggleProps> = ({ label, value, onValueChange, helper, style }) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, style]}>
      <View style={styles.texts}>
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        {helper ? <Text style={[styles.helper, { color: colors.textMuted }]}>{helper}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.secondaryLight }}
        thumbColor={value ? colors.secondary : colors.surface}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  texts: {
    flex: 1,
    paddingRight: Spacing.md,
  },
  label: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.medium,
  },
  helper: {
    marginTop: 2,
    fontSize: Typography.size.sm,
  },
});
