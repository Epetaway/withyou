import React, { useState, useCallback } from "react";
import { View, StyleSheet, Pressable, FlatList, RefreshControl, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect, NavigationProp } from "@react-navigation/native";
import { ThemedText } from "../../components/ThemedText";
import { ThemedCard } from "../../components/ThemedCard";
import { ScreenHeader } from "../../components/ScreenHeader";
import { useTheme } from "../../theme/ThemeProvider";
import { spacing } from "../../theme/tokens";
import { api } from "../../state/appState";
import { Note, NotesResponse } from "@withyou/shared";

type NotesNavigationProp = NavigationProp<{
  NoteCompose: undefined;
}>;

export function NotesListScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NotesNavigationProp>();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotes = async () => {
    try {
      const response = await api.request<NotesResponse>("/notes?limit=50");
      setNotes(response.notes || []);
    } catch (error) {
      console.error("Failed to fetch notes:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotes();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotes();
  };

  const getNoteIcon = (type: string): "chatbubbles" | "film" | "mic" => {
    switch (type) {
      case "VIDEO":
        return "film";
      case "VOICE":
        return "mic";
      default:
        return "chatbubbles";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
  };

  const renderNote = ({ item }: { item: Note }) => (
    <ThemedCard elevation="xs" padding="md" radius="lg">
      <View style={styles.noteHeader}>
        <Ionicons
          name={getNoteIcon(item.type)}
          size={20}
          color={theme.colors.primary}
        />
        <ThemedText variant="caption" color="muted" style={styles.noteTime}>
          {formatDate(item.createdAt)}
        </ThemedText>
      </View>
      <ThemedText
        variant="body"
        color="primary"
        style={styles.noteContent}
        numberOfLines={3}
      >
        {item.content || (item.type === "VIDEO" ? "📹 Video note" : item.type === "VOICE" ? "🎙️ Voice note" : "📝 Note")}
      </ThemedText>
    </ThemedCard>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.headerContainer}>
        <ScreenHeader title="Notes" subtitle="Your private messages" />
        <Pressable 
          onPress={() => navigation.navigate("NoteCompose")}
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.centerContent}>
          <ThemedText variant="body" color="secondary">Loading notes...</ThemedText>
        </View>
      ) : notes.length === 0 ? (
        <View style={styles.centerContent}>
          <Ionicons name="chatbubbles-outline" size={64} color={theme.colors.textMuted} style={styles.emptyIcon} />
          <ThemedText variant="h2" color="primary" style={styles.emptyTitle}>
            No notes yet
          </ThemedText>
          <ThemedText variant="body" color="secondary" style={styles.emptyText}>
            Send a sweet message, photo, or video to your partner
          </ThemedText>
          <Pressable
            style={[styles.emptyButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => navigation.navigate("NoteCompose")}
          >
            <ThemedText style={styles.emptyButtonText}>Send your first note</ThemedText>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={notes}
          renderItem={renderNote}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          scrollEnabled={true}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.sm,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
  },
  listContent: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: 100,
  },
  noteHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  noteTime: {
    flex: 1,
  },
  noteContent: {
    lineHeight: 22,
  },
  emptyIcon: {
    marginBottom: spacing.lg,
    opacity: 0.5,
  },
  emptyTitle: {
    marginBottom: spacing.sm,
  },
  emptyText: {
    textAlign: "center",
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  emptyButton: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    textAlign: "center",
  },
});
