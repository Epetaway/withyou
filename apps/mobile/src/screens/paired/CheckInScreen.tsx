import React, { useState } from "react";
import { View, ScrollView, Switch } from "react-native";
import { CONTENT, checkinCreateSchema } from "@withyou/shared";
import { Screen } from "../../ui/components/Screen";
import { Text } from "../../ui/components/Text";
import { Button } from "../../ui/components/Button";
import { TextField } from "../../ui/components/TextField";
import { api } from "../../state/appState";
import { useAsyncAction } from "../../api/hooks";

type CheckInScreenProps = {
  navigation: unknown;
};

export function CheckInScreen({ navigation }: CheckInScreenProps) {
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
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} style={{ gap: 16 }}>
        <Text variant="title">{c.title}</Text>
        <Text variant="body">{c.prompt}</Text>

        {moodError ? (
          <Text variant="muted" style={{ color: "#B00020" }}>
            {moodError}
          </Text>
        ) : null}

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            marginVertical: 16,
          }}
        >
          {[1, 2, 3, 4, 5].map((level) => (
            <View key={level} style={{ alignItems: "center" }}>
              <Button
                label={moodLevel === level ? `✓ ${level}` : String(level)}
                onPress={() =>
                  setMoodLevel(level as 1 | 2 | 3 | 4 | 5)
                }
                variant={moodLevel === level ? "primary" : "secondary"}
              />
              <Text variant="muted" style={{ marginTop: 4, fontSize: 11, textAlign: "center" }}>
                {c.moodLabels[level as 1 | 2 | 3 | 4 | 5]}
              </Text>
            </View>
          ))}
        </View>

        <TextField
          label={c.fields.noteLabel}
          value={note}
          onChangeText={setNote}
          placeholder="How are you feeling?"
        />

        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text variant="body">{c.fields.shareToggleLabel}</Text>
          <Switch value={shared} onValueChange={setShared} />
        </View>
        <Text variant="muted">{c.fields.shareHelper}</Text>

        {errorText ? (
          <Text variant="muted" style={{ color: "#B00020" }}>
            {errorText}
          </Text>
        ) : null}

        <View style={{ gap: 10, marginTop: 16 }}>
          <Button
            label={loading ? CONTENT.app.common.loading : c.actions.primary}
            onPress={onSubmit}
            disabled={loading || !moodLevel}
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
