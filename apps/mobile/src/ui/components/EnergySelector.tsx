import React from 'react';
import { View, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { Text } from './Text';
import { Spacing, BorderRadius, Typography } from '../tokens';
import { useTheme } from '../theme/ThemeProvider';
import type { EnergyLevel } from '@withyou/shared';

const ENERGY_LEVELS: Array<{ key: EnergyLevel; label: string; icon: string }> = [
  { key: 'low', label: 'Low', icon: 'battery-quarter' },
  { key: 'medium', label: 'Medium', icon: 'battery-half' },
  { key: 'high', label: 'High', icon: 'battery-full' },
];

interface EnergySelectorProps {
  value?: EnergyLevel;
  onChange: (energy: EnergyLevel) => void;
  style?: ViewStyle;
}

export function EnergySelector({ value, onChange, style }: EnergySelectorProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, style]}>
      {ENERGY_LEVELS.map((energy) => {
        const selected = value === energy.key;
        return (
          <Pressable
            key={energy.key}
            onPress={() => onChange(energy.key)}
            style={[
              styles.energyButton,
              {
                backgroundColor: selected ? theme.colors.primary : theme.colors.surface2,
                borderColor: selected ? theme.colors.primary : theme.colors.border,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Select ${energy.label} energy level`}
            accessibilityState={{ selected }}
          >
            <FontAwesome6
              name={energy.icon as 'battery-quarter' | 'battery-half' | 'battery-full'}
              size={28}
              color={selected ? theme.colors.textInverse : theme.colors.text}
            />
            <Text
              style={[
                styles.energyText,
                { color: selected ? theme.colors.textInverse : theme.colors.text },
              ]}
            >
              {energy.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  energyButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    gap: Spacing.xs,
    minHeight: 80,
    justifyContent: 'center',
  },
  energyText: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    marginTop: Spacing.xxs,
  },
});
