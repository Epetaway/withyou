import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Spacing, BorderRadius, Typography } from '../tokens';
import { useTheme } from '../theme/ThemeProvider';

export type MoodOption = {
  key: string;
  icon: keyof typeof Feather.glyphMap;
  label: string;
};

interface MoodPickerProps {
  options: MoodOption[];
  value?: string;
  onChange: (key: string) => void;
}

export const MoodPickerNew: React.FC<MoodPickerProps> = ({ options, value, onChange }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      {options.map((opt) => {
        const selected = opt.key === value;
        return (
          <TouchableOpacity
            key={opt.key}
            onPress={() => onChange(opt.key)}
            style={[
              styles.item,
              {
                backgroundColor: selected ? colors.accentPale : colors.surface2,
                borderColor: selected ? colors.primary : colors.border,
              },
            ]}
            accessibilityRole="button"
          >
            <Feather
              name={opt.icon}
              size={28}
              color={selected ? colors.primary : colors.textMuted}
            />
            <Text
              style={[
                styles.label,
                selected && { color: colors.primary },
                !selected && { color: colors.textMuted },
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  label: {
    marginTop: Spacing.xs,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
  },
});
