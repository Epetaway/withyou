import React, { useState } from "react";
import { View, ScrollView, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CONTENT, checkinCreateSchema } from "@withyou/shared";
import { Screen } from "../../ui/components/Screen";
import { Text } from "../../ui/components/Text";
import { Button } from "../../ui/components/Button";
import { TextField } from "../../ui/components/TextField";
import { Card } from "../../ui/components/Card";
import { Section } from "../../ui/components/Section";
import { api } from "../../state/appState";
import { useAsyncAction } from "../../api/hooks";
import { Spacing } from "../../ui/tokens";
import { useTheme } from "../../ui/theme";

type CheckInScreenProps = {
  navigation: unknown;
};

const MOODS = [
  { key: "1", label: "Very low", icon: "sad-outline" },
  { key: "2", label: "Low", icon: "remove-circle-outline" },
  { key: "3", label: "Neutral", icon: "ellipse-outline" },
  { key: "4", label: "Good", icon: "happy-outline" },
  { key: "5", label: "Very good", icon: "heart-outline" },
] as const;

function MoodCard({
  selected,
  label,
  icon,
  onPress,
}: {
  selected: boolean;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: selected ? theme.primary : theme.border,
        backgroundColor: selected ? theme.surface : "transparent",
        padding: Spacing.sm,
        alignItems: "center",
        justifyContent: "center",
        minHeight: 72,
      }}
    >
      <Ionicons
        name={icon}
        size={22}
        color={selected ? theme.primary : theme.text2}
      />
      <Text
        variant="body"
        style={{
          marginTop: Spacing.xs,
          color: selected ? theme.text : theme.text2,
          fontSize: 12,
          fontWeight: "600",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function CheckInScreen({ navigation }: CheckInScreenProps) {
  const theme = useTheme();
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

  return (
    <Screen style={{ paddingHorizontal: Spacing.md, paddingTop: Spacing.lg }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Spacing.xl }}
      >
        {/* Page Header */}
        <View style={{ marginBottom: Spacing.xl }}>
          <Text style={[styles.h1, { color: theme.text }]}>{c.title}</Text>
          <Text style={[styles.h2, { color: theme.text2 }]}>{c.prompt}</Text>
        </View>

        {/* Mood Error */}
        {moodError ? (
          <Section>
            <Card>
              <Text variant="body" style={{ color: theme.danger }}>
                {moodError}
              </Text>
            </Card>
          </Section>
        ) : null}

        {/* Mood Selector */}
        <Section title={c.fields.moodLabel}>
          <View style={{ flexDirection: "row", gap: Spacing.sm }}>
            {MOODS.map((mood) => (
              <MoodCard
                key={mood.key}
                selected={moodLevel === parseInt(mood.key)}
                label={mood.label}
                icon={mood.icon}
                onPress={() => setMoodLevel(parseInt(mood.key) as 1 | 2 | 3 | 4 | 5)}
              />
            ))}
          </View>
        </Section>

        {/* Note Input */}
        <Section title={c.fields.noteLabel}>
          <Card>
            <TextField
              value={note}
              onChangeText={setNote}
              placeholder="What's on your mind?"
              multiline
              numberOfLines={4}
              style={{ minHeight: 100 }}
            />
          </Card>
        </Section>

        {/* Share Toggle */}
        <Section>
          <Card>
            <Pressable
              onPress={() => setShared(!shared)}
              style={styles.toggleRow}
            >
              <View style={{ flex: 1 }}>
                <Text variant="body" style={{ color: theme.text }}>
                  {c.fields.shareToggleLabel}
                </Text>
                <Text
                  variant="muted"
                  style={{ color: theme.text2, fontSize: 12, marginTop: Spacing.xs }}
                >
                  {c.fields.shareHelper}
                </Text>
              </View>
              <View
                style={[
                  styles.switch,
                  {
                    backgroundColor: shared ? theme.primary : theme.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.switchThumb,
                    {
                      transform: [{ translateX: shared ? 20 : 0 }],
                    },
                  ]}
                />
              </View>
            </Pressable>
          </Card>
        </Section>

        {/* API Error */}
        {errorText ? (
          <Section>
            <Card>
              <Text variant="body" style={{ color: theme.danger }}>
                {errorText}
              </Text>
            </Card>
          </Section>
        ) : null}

        {/* Action Buttons */}
        <View style={{ gap: Spacing.sm, marginTop: Spacing.md }}>
          <Button
            label={loading ? CONTENT.app.common.loading : c.actions.primary}
            onPress={onSubmit}
            disabled={loading || !moodLevel}
            variant="primary"
          />
          <Button
            label={c.actions.secondary}
            onPress={onCancel}
            variant="secondary"
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 28, fontWeight: "700" },
  h2: { fontSize: 16, marginTop: Spacing.sm },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  switch: {
    width: 48,
    height: 28,
    borderRadius: 14,
    padding: 2,
  },
  switchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
});
