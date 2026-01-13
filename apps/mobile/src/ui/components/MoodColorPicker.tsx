import React from 'react';
import { View, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { Text } from './Text';
import { Spacing, BorderRadius } from '../tokens';
import { useTheme } from '../theme/ThemeProvider';
import type { MoodColor } from '@withyou/shared';

const MOOD_COLORS: Array<{ key: MoodColor; hex: string; label: string }> = [
  { key: 'red', hex: '#EF4444', label: 'Red' },
  { key: 'orange', hex: '#F97316', label: 'Orange' },
  { key: 'yellow', hex: '#FBBF24', label: 'Yellow' },
  { key: 'green', hex: '#22C55E', label: 'Green' },
  { key: 'blue', hex: '#3B82F6', label: 'Blue' },
  { key: 'purple', hex: '#A78BFA', label: 'Purple' },
  { key: 'pink', hex: '#EC4899', label: 'Pink' },
];

interface MoodColorPickerProps {
  value?: MoodColor;
  onChange: (color: MoodColor) => void;
  style?: ViewStyle;
}

export function MoodColorPicker({ value, onChange, style }: MoodColorPickerProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, style]}>
      {MOOD_COLORS.map((color) => {
        const selected = value === color.key;
        return (
          <Pressable
            key={color.key}
            onPress={() => onChange(color.key)}
            style={[
              styles.colorButton,
              {
                backgroundColor: color.hex,
                borderColor: selected ? theme.colors.text : 'transparent',
                borderWidth: selected ? 3 : 0,
                transform: [{ scale: selected ? 1.1 : 1 }],
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Select ${color.label} mood color`}
            accessibilityState={{ selected }}
          >
            {selected && (
              <View style={styles.checkmark}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    justifyContent: 'center',
  },
  colorButton: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  checkmark: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
});
