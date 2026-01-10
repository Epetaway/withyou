import React, { useState } from "react";
import { View, ScrollView } from "react-native";
import { CONTENT, checkinCreateSchema } from "@withyou/shared";
import { Screen } from "../../ui/components/Screen";
import { Text } from "../../ui/components/Text";
import { ButtonNew as Button } from "../../ui/components/ButtonNew";
import { TextFieldNew as TextField } from "../../ui/components/TextFieldNew";
import { CardNew as Card } from "../../ui/components/CardNew";
import { ToggleNew } from "../../ui/components/ToggleNew";
import { MoodPickerNew } from "../../ui/components/MoodPickerNew";
import { api } from "../../state/appState";
import { useAsyncAction } from "../../api/hooks";
import { Spacing } from "../../ui/tokens";
import { useTheme } from "../../ui/theme/ThemeProvider";

type CheckInScreenProps = {
  navigation: unknown;
};

export function CheckInScreen({ navigation }: CheckInScreenProps) {
  const { colors } = useTheme();
  const c = CONTENT.checkIn.create;

  const [moodLevel, setMoodLevel] = useState<1 | 2 | 3 | 4 | 5 | null>(null);
  const [note, setNote] = useState("");
  const [shared, setShared] = useState(false);
  const [moodError, setMoodError] = useState("");

  const { run, loading, errorText } = useAsyncAction(async () => {
    setMoodError("");

    if (!moodLevel) {
      setMoodError(c.validation.moodRequired);
      throw new Error(c.validation.moodRequired);
    }

    const parsed = checkinCreateSchema.safeParse({
      mood_level: moodLevel,
      note: note || null,
      shared,
    });

    if (!parsed.success) {
      throw new Error("Validation failed");
    }

    await api.request("/checkins", {
      method: "POST",
      body: JSON.stringify(parsed.data),
    });

    // Success - navigate back to dashboard
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (navigation as any)?.goBack?.();
    return null;
  });

  const onSubmit = async () => {
    try {
      await run();
    } catch {
      // Error handled in useAsyncAction
    }
  };

  const onCancel = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (navigation as any)?.goBack?.();
  };

  const moodOptions = [
    { key: "1", icon: "frown", label: "Very low" },
    { key: "2", icon: "meh", label: "Low" },
    { key: "3", icon: "smile", label: "Neutral" },
    { key: "4", icon: "smile", label: "Good" },
    { key: "5", icon: "heart", label: "Very good" },
  ];

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.lg, paddingBottom: Spacing.xl }}>
        {/* Header */}
        <View style={{ gap: Spacing.sm }}>
          <Text variant="title">{c.title}</Text>
          <Text variant="body" style={{ color: colors.textMuted }}>
            {c.prompt}
          </Text>
        </View>

        {/* Mood Error */}
        {moodError ? (
          <Card variant="outlined">
            <Text variant="body" style={{ color: colors.error }}>
              {moodError}
            </Text>
          </Card>
        ) : null}

        {/* Mood Picker */}
        <Card variant="elevated">
          <View style={{ gap: Spacing.md }}>
            <Text variant="subtitle">{c.fields.moodLabel}</Text>
            <MoodPickerNew
              options={moodOptions}
              value={moodLevel ? String(moodLevel) : undefined}
              onChange={(key) => setMoodLevel(parseInt(key) as 1 | 2 | 3 | 4 | 5)}
            />
          </View>
        </Card>

        {/* Note Input */}
        <TextField
          label={c.fields.noteLabel}
          value={note}
          onChangeText={setNote}
          placeholder="What's on your mind?"
        />

        {/* Share Toggle */}
        <Card>
          <ToggleNew
            label={c.fields.shareToggleLabel}
            helper={c.fields.shareHelper}
            value={shared}
            onValueChange={setShared}
          />
        </Card>

        {/* API Error */}
        {errorText ? (
          <Card variant="outlined">
            <Text variant="body" style={{ color: colors.error }}>
              {errorText}
            </Text>
          </Card>
        ) : null}

        {/* Action Buttons */}
        <View style={{ gap: Spacing.sm, marginTop: Spacing.md }}>
          <Button
            label={loading ? CONTENT.app.common.loading : c.actions.primary}
            onPress={onSubmit}
            disabled={loading || !moodLevel}
            fullWidth
          />
          <Button
            label={c.actions.secondary}
            onPress={onCancel}
            variant="secondary"
            fullWidth
          />
        </View>
      </ScrollView>
    </Screen>
  );
}
