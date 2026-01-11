import React from "react";
import { Linking, Pressable, StyleSheet, View, ViewStyle, TextStyle } from "react-native";
import { Text } from "./Text";
import { useTheme } from "../theme";

export type IdeaType = "LOCAL" | "FOOD" | "MOVIE" | "HOME";
export type IdeaSource = "CURATED" | "GENERATED" | "USER_SAVED";

type IdeaMetadata = {
  address?: string;
  lat?: number;
  lng?: number;
  distanceMiles?: number;
  websiteUrl?: string;
  priceLevel?: number;
  placeId?: string;
  ingredients?: string[];
  missingIngredients?: string[];
  recipeUrl?: string;
  timeMinutes?: number;
  difficulty?: string;
  provider?: string;
  deepLinkUrl?: string;
  genre?: string;
};

type Idea = {
  id: string;
  type: IdeaType;
  title: string;
  description?: string | null;
  category?: string | null;
  source: IdeaSource;
  metadata: IdeaMetadata;
};

type IdeaCardProps = {
  idea: Idea;
  onSave?: (idea: Idea) => void;
  onOpenMap?: (idea: Idea) => void;
  onAddToCalendar?: (idea: Idea) => void;
  saved?: boolean;
  style?: ViewStyle;
};

const palette = {
  primary: "#4B164C",
  accent: "#DD88CF",
  surface: "#F7F4F8",
  text: "#22172A",
  textSecondary: "rgba(34,23,42,0.70)",
  border: "rgba(75,22,76,0.10)",
};

export function IdeaCard({ idea, onSave, onOpenMap, onAddToCalendar, saved, style }: IdeaCardProps) {
  const theme = useTheme();
  const distance = idea.metadata.distanceMiles ? `${idea.metadata.distanceMiles.toFixed(1)} mi` : undefined;
  const priceIndicator = typeof idea.metadata.priceLevel === "number" ? "$".repeat(Math.max(1, Math.min(4, idea.metadata.priceLevel || 1))) : undefined;
  const websiteUrl = idea.metadata.websiteUrl || idea.metadata.recipeUrl || idea.metadata.deepLinkUrl;

  const handleOpen = () => {
    if (websiteUrl) Linking.openURL(websiteUrl).catch(() => {});
  };

  return (
    <View style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }, style]}>
      <View style={styles.headerRow}>
        <Text variant="body" style={styles.category}>
          {idea.category || idea.type}
        </Text>
        <Text variant="muted" style={styles.badge}>
          {idea.source === "CURATED" ? "Curated" : idea.source === "GENERATED" ? "Generated" : "Saved"}
        </Text>
      </View>

      <Text variant="title" style={styles.title}>
        {idea.title}
      </Text>

      {idea.description ? (
        <Text variant="body" style={styles.description}>
          {idea.description}
        </Text>
      ) : null}

      <View style={styles.metaRow}>
        {distance ? (
          <Text variant="muted" style={styles.metaChip}>
            {distance} away
          </Text>
        ) : null}
        {priceIndicator ? (
          <Text variant="muted" style={styles.metaChip}>
            {priceIndicator} cost
          </Text>
        ) : null}
        {idea.metadata.genre ? (
          <Text variant="muted" style={styles.metaChip}>
            {idea.metadata.genre}
          </Text>
        ) : null}
        {idea.metadata.provider ? (
          <Text variant="muted" style={styles.metaChip}>
            {idea.metadata.provider}
          </Text>
        ) : null}
      </View>

      <View style={styles.actionsRow}>
        {onOpenMap && idea.metadata.lat && idea.metadata.lng ? (
          <GhostButton label="Open in Maps" onPress={() => onOpenMap(idea)} />
        ) : null}
        {websiteUrl ? <GhostButton label="Open" onPress={handleOpen} /> : null}
        {onAddToCalendar ? <GhostButton label="Calendar" onPress={() => onAddToCalendar(idea)} /> : null}
        {onSave ? (
          <PrimaryButton label={saved ? "Saved" : "Save"} onPress={() => onSave(idea)} />
        ) : null}
      </View>
    </View>
  );
}

type ButtonProps = {
  label: string;
  onPress: () => void;
};

function GhostButton({ label, onPress }: ButtonProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [
      styles.ghostButton,
      { opacity: pressed ? 0.8 : 1 },
    ]} accessibilityRole="button" accessibilityLabel={label}>
      <Text variant="body" style={styles.ghostLabel}>{label}</Text>
    </Pressable>
  );
}

function PrimaryButton({ label, onPress }: ButtonProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [
      styles.primaryButton,
      { opacity: pressed ? 0.9 : 1 },
    ]} accessibilityRole="button" accessibilityLabel={label}>
      <Text variant="body" style={styles.primaryLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    gap: 8,
  } as ViewStyle,
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  } as ViewStyle,
  category: {
    color: "rgba(34,23,42,0.70)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontSize: 12,
    fontWeight: "600",
  } as TextStyle,
  badge: {
    backgroundColor: "rgba(75,22,76,0.08)",
    color: "#4B164C",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    fontWeight: "600",
    fontSize: 12,
  } as TextStyle,
  title: {
    color: "#22172A",
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "700",
  } as TextStyle,
  description: {
    color: "rgba(34,23,42,0.70)",
  } as TextStyle,
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  } as ViewStyle,
  metaChip: {
    backgroundColor: "rgba(75,22,76,0.06)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    fontSize: 12,
  } as TextStyle,
  actionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  } as ViewStyle,
  ghostButton: {
    minHeight: 40,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(75,22,76,0.20)",
    justifyContent: "center",
  } as ViewStyle,
  ghostLabel: {
    color: "#4B164C",
    fontWeight: "600",
  } as TextStyle,
  primaryButton: {
    minHeight: 40,
    paddingHorizontal: 16,
    borderRadius: 32,
    backgroundColor: "#4B164C",
    justifyContent: "center",
  } as ViewStyle,
  primaryLabel: {
    color: "#FFFFFF",
    fontWeight: "700",
  } as TextStyle,
});
