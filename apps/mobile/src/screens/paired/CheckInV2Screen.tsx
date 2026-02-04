import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Button } from '../../ui/components/Button';
import { TextField } from '../../ui/components/TextField';
import { MoodColorPicker } from '../../ui/components/MoodColorPicker';
import { EmotionSelector } from '../../ui/components/EmotionSelector';
import { EnergySelector } from '../../ui/components/EnergySelector';
import { MoodGradient } from '../../ui/components/MoodGradient';
import { ThemedCard } from '../../ui/components/ThemedCard';
import { ThemedText } from '../../ui/components/ThemedText';
import { ScreenHeader } from '../../ui/components/ScreenHeader';
import { spacing } from '../../ui/tokens';
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <ScreenHeader title="Check-In" subtitle="How are you feeling right now?" />

        {showGradient && todayData?.gradient && todayData.userCheckin && todayData.partnerCheckin ? (
          <MoodGradient
            userColor={todayData.userCheckin.moodColor as MoodColor}
            partnerColor={todayData.partnerCheckin.moodColor as MoodColor}
            insight={todayData.gradient.insight}
            tips={todayData.gradient.tips}
            style={styles.section}
          />
        ) : todayData?.userCheckin && !todayData?.partnerCheckin ? (
          <ThemedCard style={styles.section} color="surface">
            <ThemedText variant="body" color="secondary">
              ✓ You&apos;ve checked in! Waiting for your partner to check in to reveal the mood blend.
            </ThemedText>
          </ThemedCard>
        ) : null}

        <View style={styles.section}>
          <ThemedText variant="overline" color="secondary">
            MOOD COLOR
          </ThemedText>
          <MoodColorPicker value={moodColor} onChange={setMoodColor} />
        </View>

        <View style={styles.section}>
          <ThemedText variant="overline" color="secondary">
            HOW YOU FEEL
          </ThemedText>
          <EmotionSelector value={emotionLabel} onChange={setEmotionLabel} />
        </View>

        <View style={styles.section}>
          <ThemedText variant="overline" color="secondary">
            ENERGY LEVEL
          </ThemedText>
          <EnergySelector value={energyLevel} onChange={setEnergyLevel} />
        </View>

        <View style={styles.section}>
          <ThemedText variant="overline" color="secondary">
            NOTE (OPTIONAL)
          </ThemedText>
          <TextField
            value={note}
            onChangeText={setNote}
            placeholder="Share more about your mood..."
            multiline
            numberOfLines={4}
          />
        </View>

        {errorText ? (
          <ThemedCard style={styles.section} color="surface">
            <ThemedText color="danger">{errorText}</ThemedText>
          </ThemedCard>
        ) : null}

        <Button
          label="Submit Check-In"
          onPress={() => submitCheckin()}
          disabled={loading || !moodColor || !emotionLabel || !energyLevel}
          style={styles.submitButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { padding: spacing.lg, paddingBottom: 100, gap: spacing.lg },
  section: { gap: spacing.sm },
  submitButton: { marginTop: spacing.md, marginBottom: spacing.xl },
});
