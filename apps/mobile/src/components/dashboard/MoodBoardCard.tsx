import React from "react";
import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { ThemedCard } from "../ThemedCard";
import { ThemedText } from "../ThemedText";
import { useTheme } from "../../theme/ThemeProvider";
import { getMoodLabel, getMoodLevelColor } from "../../lib/mood";
import type { MoodLevel } from "@withyou/shared";

type MoodBoardCardProps = {
  userMood: MoodLevel | null;
  partnerMood: MoodLevel | null;
  guidance: string | null;
  userHasCheckedIn: boolean;
};

export function MoodBoardCard({ userMood, partnerMood, guidance, userHasCheckedIn }: MoodBoardCardProps) {
  const theme = useTheme();

  const userColor = getMoodLevelColor(userMood);
  const partnerColor = getMoodLevelColor(partnerMood);

  return (
    <ThemedCard elevation="sm" padding="lg" radius="lg" style={{ marginTop: -40, marginHorizontal: 16 }}>
      <ThemedText variant="overline" color="muted" style={{ marginBottom: 12 }}>
        MOOD BOARD
      </ThemedText>

      {userHasCheckedIn ? (
        <>
          {/* Mood rows */}
          <View style={styles.moodRow}>
            <View style={[styles.dot, { backgroundColor: userColor }]} />
            <ThemedText variant="body" color="secondary">
              You: {getMoodLabel(userMood)}
            </ThemedText>
          </View>

          <View style={[styles.moodRow, { marginTop: 8 }]}>
            <View style={[styles.dot, { backgroundColor: partnerColor }]} />
            <ThemedText variant="body" color="secondary">
              Partner: {partnerMood ? getMoodLabel(partnerMood) : "Waiting for check-in"}
            </ThemedText>
          </View>

          {/* Vibe bar */}
          {userMood && partnerMood && (
            <LinearGradient
              colors={[userColor, partnerColor]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.vibeBar}
            />
          )}

          {/* Guidance */}
          {guidance && (
            <View style={[styles.guidanceCard, { backgroundColor: theme.colors.primarySoft }]}>
              <Ionicons name="bulb-outline" size={20} color={theme.colors.primary} style={{ marginRight: 10 }} />
              <ThemedText variant="caption" color="secondary" style={{ flex: 1 }}>
                {guidance}
              </ThemedText>
            </View>
          )}
        </>
      ) : (
        <View style={[styles.guidanceCard, { backgroundColor: theme.colors.surfaceAlt }]}>
          <Ionicons name="lock-closed-outline" size={20} color={theme.colors.textMuted} style={{ marginRight: 10 }} />
          <ThemedText variant="caption" color="muted" style={{ flex: 1 }}>
            Check in to unlock your partner&apos;s mood today
          </ThemedText>
        </View>
      )}
    </ThemedCard>
  );
}

const styles = StyleSheet.create({
  moodRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  vibeBar: {
    height: 6,
    borderRadius: 3,
    marginTop: 16,
    marginBottom: 12,
  },
  guidanceCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    borderRadius: 10,
    marginTop: 12,
  },
});
