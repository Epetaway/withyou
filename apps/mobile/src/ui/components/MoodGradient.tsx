import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from './Text';
import { Spacing, BorderRadius, Typography } from '../tokens';
import { useTheme } from '../theme/ThemeProvider';
import type { MoodColor } from '@withyou/shared';

const COLOR_MAP: Record<MoodColor, string> = {
  red: '#EF4444',
  orange: '#F97316',
  yellow: '#FBBF24',
  green: '#22C55E',
  blue: '#3B82F6',
  purple: '#A78BFA',
  pink: '#EC4899',
};

interface MoodGradientProps {
  userColor: MoodColor;
  partnerColor: MoodColor;
  insight: string;
  tips: string[];
  style?: ViewStyle;
}

export function MoodGradient({ userColor, partnerColor, insight, tips, style }: MoodGradientProps) {
  const theme = useTheme();
  
  const colors = [COLOR_MAP[userColor], COLOR_MAP[partnerColor]];

  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.overlay}>
          <Text style={styles.title}>Your Mood Blend</Text>
        </View>
      </LinearGradient>

      <View style={[styles.content, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.insight, { color: theme.colors.text }]}>{insight}</Text>
        
        <View style={styles.tipsContainer}>
          <Text style={[styles.tipsTitle, { color: theme.colors.textSecondary }]}>Suggestions:</Text>
          {tips.map((tip, index) => (
            <View key={index} style={styles.tipRow}>
              <Text style={[styles.bullet, { color: theme.colors.primary }]}>•</Text>
              <Text style={[styles.tip, { color: theme.colors.text }]}>{tip}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.card,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  gradient: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  title: {
    fontSize: Typography.size.xxl,
    fontWeight: Typography.weight.bold,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  insight: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.medium,
    textAlign: 'center',
    lineHeight: Typography.lineHeight.normal * Typography.size.lg,
  },
  tipsContainer: {
    gap: Spacing.sm,
  },
  tipsTitle: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tipRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    alignItems: 'flex-start',
  },
  bullet: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    marginTop: -2,
  },
  tip: {
    flex: 1,
    fontSize: Typography.size.base,
    lineHeight: Typography.lineHeight.normal * Typography.size.base,
  },
});
