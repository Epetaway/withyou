import React from 'react';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';

interface MoodIconProps {
  level: 1 | 2 | 3 | 4 | 5;
  size?: number;
}

export const MoodIcon: React.FC<MoodIconProps> = ({ level, size = 24 }) => {
  const { colors } = useTheme();

  const moodIcons: Record<1 | 2 | 3 | 4 | 5, { icon: keyof typeof Feather.glyphMap; label: string }> = {
    1: { icon: 'frown', label: 'Very low' },
    2: { icon: 'meh', label: 'Low' },
    3: { icon: 'smile', label: 'Neutral' },
    4: { icon: 'smile', label: 'Good' },
    5: { icon: 'heart', label: 'Very good' },
  };

  const mood = moodIcons[level];
  const iconColor = level === 5 ? colors.secondary : level === 1 ? colors.error : colors.primary;

  return (
    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
      <Feather name={mood.icon} size={size} color={iconColor} />
    </View>
  );
};
