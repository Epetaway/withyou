import React, { useState } from "react";
import { View, ScrollView, StyleSheet, Switch } from "react-native";
import { CONTENT, checkinCreateSchema } from "@withyou/shared";
import { tokens } from "../../ui/tokens";
import { Screen } from "../../ui/components/Screen";
import { Text } from "../../ui/components/Text";
import { Button } from "../../ui/components/Button";
import { TextField } from "../../ui/components/TextField";

export function CheckInScreen() {
  const [moodLevel, setMoodLevel] = useState<1 | 2 | 3 | 4 | 5 | null>(null);
  const [note, setNote] = useState("");
  const [shared, setShared] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    try {
      setError("");
      setLoading(true);

      if (!moodLevel) {
        setError(CONTENT.checkIn.create.validation.moodRequired);
        return;
      }

      const payload = checkinCreateSchema.parse({
        mood_level: moodLevel,
        note: note || null,
        shared,
      });

      console.log("Saving check-in:", payload);

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text variant="title">{CONTENT.checkIn.create.title}</Text>
        <Text variant="body" style={styles.prompt}>
          {CONTENT.checkIn.create.prompt}
        </Text>

        <View style={styles.moodContainer}>
          {[1, 2, 3, 4, 5].map((level) => (
            <View key={level} style={styles.moodButton}>
              <Button
                label={String(level)}
                onPress={() => setMoodLevel(level as 1 | 2 | 3 | 4 | 5)}
                variant={moodLevel === level ? "primary" : "secondary"}
              />
              <Text
                variant="muted"
                style={styles.moodLabel}
              >
                {CONTENT.checkIn.create.moodLabels[level as 1 | 2 | 3 | 4 | 5]}
              </Text>
            </View>
          ))}
        </View>

        <TextField
          label={CONTENT.checkIn.create.fields.noteLabel}
          value={note}
          onChangeText={setNote}
          placeholder="How are you feeling?"
        />

        <View style={styles.toggleContainer}>
          <Text variant="body">{CONTENT.checkIn.create.fields.shareToggleLabel}</Text>
          <Switch value={shared} onValueChange={setShared} />
        </View>
        <Text variant="muted" style={styles.shareHelper}>
          {CONTENT.checkIn.create.fields.shareHelper}
        </Text>

        {error ? (
          <Text variant="muted" style={styles.errorText}>
            {error}
          </Text>
        ) : null}

        <View style={styles.actions}>
          <Button
            label={CONTENT.checkIn.create.actions.primary}
            onPress={handleSave}
            disabled={loading || !moodLevel}
          />
          <Button
            label={CONTENT.checkIn.create.actions.secondary}
            onPress={() => console.log("Cancel")}
            variant="secondary"
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  prompt: { marginVertical: tokens.space.lg },
  moodContainer: { flexDirection: "row", justifyContent: "space-around", marginVertical: tokens.space.lg },
  moodButton: { alignItems: "center" },
  moodLabel: { marginTop: tokens.space.xs, textAlign: "center", fontSize: 11 },
  toggleContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: tokens.space.md },
  shareHelper: { marginBottom: tokens.space.lg },
  errorText: { color: tokens.color.danger, marginVertical: tokens.space.md },
  actions: { gap: tokens.space.md, marginTop: tokens.space.lg },
});
