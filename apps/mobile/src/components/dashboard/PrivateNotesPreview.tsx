import React from "react";
import { View, StyleSheet, FlatList, Pressable, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedCard } from "../ThemedCard";
import { ThemedText } from "../ThemedText";
import { useTheme } from "../../theme/ThemeProvider";
import type { Note } from "@withyou/shared";

type PrivateNotesPreviewProps = {
  notes: Note[];
  onCreateNotePress?: () => void;
  onViewAllPress?: () => void;
  onNotePress?: (noteId: string) => void;
};

const { width } = Dimensions.get("window");
const NOTE_CARD_WIDTH = width * 0.6;

export function PrivateNotesPreview({
  notes,
  onCreateNotePress,
  onViewAllPress,
  onNotePress,
}: PrivateNotesPreviewProps) {
  const theme = useTheme();

  const getNoteIcon = (type: string) => {
    switch (type) {
      case "VOICE":
        return "mic";
      case "VIDEO":
        return "videocam";
      default:
        return "document-text";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return "Just now";
  };

  const renderNote = ({ item }: { item: Note }) => (
    <Pressable
      onPress={() => onNotePress?.(item.id)}
      style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1, marginRight: 12 }]}
    >
      <ThemedCard elevation="sm" padding="md" radius="md" style={{ width: NOTE_CARD_WIDTH }}>
        <View style={styles.noteHeader}>
          <Ionicons name={getNoteIcon(item.type)} size={20} color={theme.colors.primary} />
          <ThemedText variant="caption" color="muted">
            {formatTimestamp(item.createdAt)}
          </ThemedText>
        </View>
        <ThemedText variant="body" numberOfLines={2} style={{ marginTop: 8 }}>
          {item.content || "Media note"}
        </ThemedText>
      </ThemedCard>
    </Pressable>
  );

  const renderCreateCard = () => (
    <Pressable
      onPress={onCreateNotePress}
      style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1, marginRight: 12 }]}
    >
      <ThemedCard
        elevation="sm"
        padding="md"
        radius="md"
        style={[styles.createCard, { width: NOTE_CARD_WIDTH, borderColor: theme.colors.border, borderWidth: 1.5, borderStyle: "dashed" }]}
      >
        <View style={styles.createContent}>
          <Ionicons name="add-circle-outline" size={32} color={theme.colors.primary} />
          <ThemedText variant="body" style={{ color: theme.colors.primary, marginTop: 8 }}>
            Send a note
          </ThemedText>
        </View>
      </ThemedCard>
    </Pressable>
  );

  type NoteOrPlaceholder = Note | { id: "__create__" };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText variant="h2">Private notes</ThemedText>
        <Pressable onPress={onViewAllPress} accessibilityLabel="View all notes">
          <ThemedText variant="caption" style={{ color: theme.colors.primary }}>
            View all
          </ThemedText>
        </Pressable>
      </View>

      <FlatList
        data={[{ id: "__create__" } as NoteOrPlaceholder, ...notes.slice(0, 5)]}
        renderItem={({ item }) => {
          if (item.id === "__create__") {
            return renderCreateCard();
          }
          return renderNote({ item: item as Note });
        }}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    marginBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  noteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  createCard: {
    justifyContent: "center",
    alignItems: "center",
  },
  createContent: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
});
