import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Screen } from '../../ui/components/Screen';
import { Text } from '../../ui/components/Text';
import { Button } from '../../ui/components/Button';
import { TextField } from '../../ui/components/TextField';
import { MoodColorPicker } from '../../ui/components/MoodColorPicker';
import { EmotionSelector } from '../../ui/components/EmotionSelector';
import { EnergySelector } from '../../ui/components/EnergySelector';
import { MoodGradient } from '../../ui/components/MoodGradient';
import { Spacing, Typography } from '../../ui/tokens';
import { useTheme } from '../../ui/theme/ThemeProvider';
import { api } from '../../state/appState';
import { useAsyncAction } from '../../api/hooks';
import type { MoodColor, EmotionLabel, EnergyLevel, CheckinTodayResponse } from '@withyou/shared';

interface CheckInV2ScreenProps {
  navigation?: {
    goBack: () => void;
  };
}

export function CheckInV2Screen({ navigation: _navigation }: CheckInV2ScreenProps) {
  const theme = useTheme();
  const [moodColor, setMoodColor] = useState<MoodColor | undefined>();
  const [emotionLabel, setEmotionLabel] = useState<EmotionLabel | undefined>();
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel | undefined>();
  const [note, setNote] = useState('');
  const [todayData, setTodayData] = useState<CheckinTodayResponse | null>(null);

  // Fetch today's check-ins on mount
  const { run: fetchToday } = useAsyncAction(async () => {
    const response = await api.request('/checkins/today', { method: 'GET' });
    const data = await response.json() as CheckinTodayResponse;
    setTodayData(data);
  });

  React.useEffect(() => {
    fetchToday();
  }, []);

  const { run: submitCheckin, loading, errorText } = useAsyncAction(async () => {
    if (!moodColor || !emotionLabel || !energyLevel) {
      throw new Error('Please complete all fields');
    }

    await api.request('/checkins/v2', {
      method: 'POST',
      body: JSON.stringify({
        moodColor,
        emotionLabel,
        energyLevel,
        note: note || undefined,
      }),
    });

    // Refresh today's data
    await fetchToday();

    // Clear form
    setMoodColor(undefined);
    setEmotionLabel(undefined);
    setEnergyLevel(undefined);
    setNote('');
  });

  // Show gradient if both have checked in
  const showGradient = todayData?.gradient && todayData.userCheckin && todayData.partnerCheckin;

  return (
    <Screen scrollable>
      <View style={styles.header}>
        <Text variant="screenTitle" style={{ color: theme.colors.text }}>
          Check-In
        </Text>
        <Text variant="screenSubtitle" style={{ color: theme.colors.textSecondary }}>
          How are you feeling right now?
        </Text>
      </View>

      {showGradient && todayData?.gradient && todayData.userCheckin && todayData.partnerCheckin ? (
        <MoodGradient
          userColor={todayData.userCheckin.moodColor as MoodColor}
          partnerColor={todayData.partnerCheckin.moodColor as MoodColor}
          insight={todayData.gradient.insight}
          tips={todayData.gradient.tips}
          style={styles.section}
        />
      ) : todayData?.userCheckin && !todayData?.partnerCheckin ? (
        <View style={[styles.waitingCard, { backgroundColor: theme.colors.surface2 }]}>
          <Text style={[styles.waitingText, { color: theme.colors.textSecondary }]}>
            ✓ You&apos;ve checked in! Waiting for your partner to check in to reveal the mood blend.
          </Text>
        </View>
      ) : null}

      <View style={styles.section}>
        <Text variant="sectionLabel" style={styles.label}>
          MOOD COLOR
        </Text>
        <MoodColorPicker value={moodColor} onChange={setMoodColor} />
      </View>

      <View style={styles.section}>
        <Text variant="sectionLabel" style={styles.label}>
          HOW YOU FEEL
        </Text>
        <EmotionSelector value={emotionLabel} onChange={setEmotionLabel} />
      </View>

      <View style={styles.section}>
        <Text variant="sectionLabel" style={styles.label}>
          ENERGY LEVEL
        </Text>
        <EnergySelector value={energyLevel} onChange={setEnergyLevel} />
      </View>

      <View style={styles.section}>
        <Text variant="sectionLabel" style={styles.label}>
          NOTE (OPTIONAL)
        </Text>
        <TextField
          value={note}
          onChangeText={setNote}
          placeholder="Share more about your mood..."
          multiline
          numberOfLines={4}
        />
      </View>

      {errorText ? (
        <View style={[styles.errorCard, { backgroundColor: theme.colors.error + '20' }]}>
          <Text style={{ color: theme.colors.error }}>{errorText}</Text>
        </View>
      ) : null}

      <Button
        label="Submit Check-In"
        onPress={() => submitCheckin()}
        disabled={loading || !moodColor || !emotionLabel || !energyLevel}
        style={styles.submitButton}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  label: {
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.semibold,
  },
  waitingCard: {
    padding: Spacing.lg,
    borderRadius: 12,
    marginBottom: Spacing.lg,
  },
  waitingText: {
    fontSize: Typography.size.base,
    textAlign: 'center',
    lineHeight: Typography.lineHeight.normal * Typography.size.base,
  },
  errorCard: {
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.md,
  },
  submitButton: {
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
});
