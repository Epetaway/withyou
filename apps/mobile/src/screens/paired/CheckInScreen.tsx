import React, { useState } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { 
  faArrowDown,
  faMinus,
  faEquals,
  faWaveSquare,
  faArrowUp
} from "@fortawesome/free-solid-svg-icons";
import { CONTENT, checkinCreateSchema } from "@withyou/shared";
import { Screen } from "../../ui/components/Screen";
import { Text } from "../../ui/components/Text";
import { Button } from "../../ui/components/Button";
import { TextField } from "../../ui/components/TextField";
import { Card } from "../../ui/components/Card";
import { Section } from "../../ui/components/Section";
import { api } from "../../state/appState";
import { useAsyncAction } from "../../api/hooks";
import { useTheme } from "../../ui/theme";

type CheckInScreenProps = {
  navigation: unknown;
};

const MOODS = [
  { key: "1", label: "Very low", icon: faArrowDown },
  { key: "2", label: "Low", icon: faMinus },
  { key: "3", label: "Neutral", icon: faEquals },
  { key: "4", label: "Good", icon: faWaveSquare },
  { key: "5", label: "Very good", icon: faArrowUp },
] as const;

const ACTIVE_COLOR = "#9B8CFF";
const INACTIVE_COLOR = "#B9B5D0";

function MoodCard({
  selected,
  label,
  icon,
  onPress,
}: {
  selected: boolean;
  label: string;
  icon: any;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.moodCard,
        {
          backgroundColor: selected ? "#EDE9FE" : "transparent",
          borderColor: selected ? ACTIVE_COLOR : "#E5E7EB",
        },
      ]}
    >
      <FontAwesomeIcon
        icon={icon}
        size={24}
        color={selected ? ACTIVE_COLOR : INACTIVE_COLOR}
      />
      <Text
        variant="body"
        style={{
          marginTop: 8,
          color: selected ? "#1F2937" : "#6B7280",
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

    await api.request("/check-in", { method: "POST", body: parsed.data });
    setMoodLevel(null);
    setNote("");
    setShared(false);
  });

  return (
    <Screen scrollable>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.h1}>{c.title}</Text>
        <Text style={styles.h2}>{c.subtitle}</Text>
      </View>

        {/* Mood Selection */}
        <Section title="How are you feeling?" subtitle="Select your mood level">
          <Card>
            <View style={styles.moodGrid}>
              {MOODS.map((mood) => (
                <MoodCard
                  key={mood.key}
                  label={mood.label}
                  icon={mood.icon}
                  selected={moodLevel === parseInt(mood.key) as any}
                  onPress={() => setMoodLevel(parseInt(mood.key) as any)}
                />
              ))}
            </View>
            {moodError ? (
              <Text
                variant="body"
                style={{ color: "#EF4444", marginTop: 12, fontSize: 14 }}
              >
                {moodError}
              </Text>
            ) : null}
          </Card>
        </Section>

        {/* Note */}
        <Section title="Add a note" subtitle="Tell your partner more">
          <TextField
            value={note}
            onChangeText={setNote}
            placeholder="Share more about your mood..."
            multiline
            numberOfLines={4}
          />
        </Section>

        {/* Share Option */}
        <Section>
          <Card>
            <Pressable
              onPress={() => setShared(!shared)}
              style={styles.shareRow}
            >
              <Text variant="body">{c.share}</Text>
              <View
                style={[
                  styles.checkbox,
                  { backgroundColor: shared ? ACTIVE_COLOR : "transparent" },
                ]}
              >
                {shared ? (
                  <Text style={{ color: "white", fontSize: 12 }}>✓</Text>
                ) : null}
              </View>
            </Pressable>
          </Card>
        </Section>

        {/* Error */}
        {errorText ? (
          <Card>
            <Text style={{ color: "#EF4444" }}>{errorText}</Text>
          </Card>
        ) : null}

        {/* Submit Button */}
        <Button
          label={c.action}
          onPress={() => run()}
          disabled={loading}
          style={{ marginTop: 24 }}
        />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 24,
  },
  h1: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1F2937",
  },
  h2: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 8,
  },
  moodGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  moodCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 80,
  },
  shareRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: INACTIVE_COLOR,
    alignItems: "center",
    justifyContent: "center",
  },
});
