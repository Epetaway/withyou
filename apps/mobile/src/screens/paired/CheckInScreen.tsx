import React, { useState } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import { CONTENT, checkinCreateSchema } from "@withyou/shared";
import { Screen } from "../../ui/components/Screen";
import { Text } from "../../ui/components/Text";
import { Button } from "../../ui/components/Button";
import { TextField } from "../../ui/components/TextField";
import { api } from "../../state/appState";
import { useAsyncAction } from "../../api/hooks";
import { useTheme } from "../../ui/theme/ThemeProvider";

type CheckInScreenProps = Record<string, unknown>;

const MOODS = [
  { key: "1", label: "Very low", icon: "arrow-down", color: "#EF4444" },
  { key: "2", label: "Low", icon: "minus", color: "#F97316" },
  { key: "3", label: "Neutral", icon: "arrows-left-right", color: "#EAB308" },
  { key: "4", label: "Good", icon: "circle-check", color: "#22C55E" },
  { key: "5", label: "Very good", icon: "arrow-up", color: "#A78BFA" },
] as const;

const INACTIVE_COLOR = "#9CA3AF";

function MoodCard({
  selected,
  label,
  icon,
  onPress,
  moodColor,
}: {
  selected: boolean;
  label: string;
  icon: string;
  onPress: () => void;
  moodColor: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.moodCard,
        {
          backgroundColor: selected ? moodColor : "#F3F4F6",
          borderColor: selected ? moodColor : "transparent",
          borderWidth: selected ? 3 : 0,
        },
      ]}
    >
      <FontAwesome6
        name={icon as "arrow-down" | "minus" | "arrows-left-right" | "circle-check" | "arrow-up"}
        size={28}
        color={selected ? "#FFFFFF" : INACTIVE_COLOR}
        weight="bold"
      />
      <Text
        variant="body"
        style={{
          marginTop: 12,
          color: selected ? "#FFFFFF" : "#4B5563",
          fontSize: 14,
          fontWeight: "600",
          textAlign: "center",
        }}
        numberOfLines={2}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function CheckInScreen() {
  // eslint-disable-next-line react/prop-types
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
      <Text variant="title">{c.title}</Text>
      <Text variant="subtitle" style={[styles.subtitle, { color: theme.colors.secondary }]}>
        {c.subtitle}
      </Text>

      {/* Mood Selection */}
      <View style={styles.section}>
        <Text variant="subtitle">How are you feeling?</Text>
        <View style={styles.moodGrid}>
          {MOODS.map((mood) => (
            <MoodCard
              key={mood.key}
              label={mood.label}
              icon={mood.icon}
              moodColor={mood.color}
              selected={moodLevel === parseInt(mood.key)}
              onPress={() => setMoodLevel(parseInt(mood.key) as 1 | 2 | 3 | 4 | 5)}
            />
          ))}
        </View>
        {moodError ? (
          <Text
            variant="body"
            style={[styles.errorText, { color: theme.colors.error || "#EF4444" }]}
          >
            {moodError}
          </Text>
        ) : null}
      </View>

      {/* Note */}
      <View style={styles.section}>
        <Text variant="subtitle">Add a note</Text>
        <TextField
          value={note}
          onChangeText={setNote}
          placeholder="Share more about your mood..."
          multiline
          numberOfLines={4}
        />
      </View>

      {/* Share Option */}
      <View style={[styles.shareCard, { backgroundColor: theme.colors.surface }]}>
        <Pressable
          onPress={() => setShared(!shared)}
          style={styles.shareRow}
        >
          <Text style={{ color: theme.colors.text }}>{c.share}</Text>
          <View
            style={[
              styles.checkbox,
              { 
                backgroundColor: shared ? theme.colors.primary : "transparent",
                borderColor: shared ? theme.colors.primary : theme.colors.secondary
              },
            ]}
          >
            {shared ? (
              <FontAwesome6 name="check" size={14} color={theme.colors.onPrimary || "#FFFFFF"} weight="bold" />
            ) : null}
          </View>
        </Pressable>
      </View>

      {/* Error */}
      {errorText ? (
        <View style={[styles.errorCard, { backgroundColor: theme.colors.error + "20" }]}>
          <Text style={{ color: theme.colors.error || "#EF4444" }}>{errorText}</Text>
        </View>
      ) : null}

      {/* Submit Button */}
      <Button
        label={c.action}
        onPress={() => run()}
        disabled={loading}
        style={styles.submitButton}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    marginBottom: 24,
    marginTop: 8,
  },
  section: {
    marginBottom: 24,
    gap: 12,
  },
  moodGrid: {
    flexDirection: "row",
    gap: 8,
  },
  moodCard: {
    flex: 1,
    borderRadius: 20,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  shareCard: {
    marginBottom: 24,
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  shareRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  errorCard: {
    marginBottom: 16,
    borderRadius: 16,
    padding: 12,
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
  },
  submitButton: {
    marginTop: 24,
  },
});
