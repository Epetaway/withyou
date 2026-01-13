import React from 'react';
import { View, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { Text } from './Text';
import { Spacing, BorderRadius, Typography } from '../tokens';
import { useTheme } from '../theme/ThemeProvider';
import type { EmotionLabel } from '@withyou/shared';

const EMOTIONS: Array<{ key: EmotionLabel; label: string }> = [
  { key: 'happy', label: 'Happy' },
  { key: 'excited', label: 'Excited' },
  { key: 'calm', label: 'Calm' },
  { key: 'loved', label: 'Loved' },
  { key: 'tired', label: 'Tired' },
  { key: 'stressed', label: 'Stressed' },
  { key: 'anxious', label: 'Anxious' },
  { key: 'sad', label: 'Sad' },
  { key: 'frustrated', label: 'Frustrated' },
  { key: 'content', label: 'Content' },
];

interface EmotionSelectorProps {
  value?: EmotionLabel;
  onChange: (emotion: EmotionLabel) => void;
  style?: ViewStyle;
}

export function EmotionSelector({ value, onChange, style }: EmotionSelectorProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, style]}>
      {EMOTIONS.map((emotion) => {
        const selected = value === emotion.key;
        return (
          <Pressable
            key={emotion.key}
            onPress={() => onChange(emotion.key)}
            style={[
              styles.emotionChip,
              {
                backgroundColor: selected ? theme.colors.primary : theme.colors.surface2,
                borderColor: selected ? theme.colors.primary : theme.colors.border,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Select ${emotion.label} emotion`}
            accessibilityState={{ selected }}
          >
            <Text
              style={[
                styles.emotionText,
                { color: selected ? theme.colors.textInverse : theme.colors.text },
              ]}
            >
              {emotion.label}
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
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  emotionChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emotionText: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
  },
});
