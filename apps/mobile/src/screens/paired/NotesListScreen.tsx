import React, { useState, useCallback } from "react";
import { View, StyleSheet, Pressable, FlatList, RefreshControl } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Screen } from "../../ui/components/Screen";
import { Text } from "../../ui/components/Text";
import { useTheme } from "../../ui/theme/ThemeProvider";
import { api } from "../../state/appState";
import { Note, NotesResponse } from "@withyou/shared";

export function NotesListScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
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

  const getNoteIcon = (type: string) => {
    switch (type) {
      case "VIDEO":
        return "video";
      case "VOICE":
        return "microphone";
      default:
        return "message";
    }
  };

  const getNoteBackgroundColor = (type: string) => {
    switch (type) {
      case "VIDEO":
        return "#F5D4FF"; // light purple
      case "VOICE":
        return "#DBEAFE"; // light blue
      default:
        return "#FEF3C7"; // light yellow
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
    <Pressable
      style={[styles.noteCard, { backgroundColor: getNoteBackgroundColor(item.type) }]}
    >
      <View style={styles.noteHeader}>
        <FontAwesome6
          name={getNoteIcon(item.type)}
          size={18}
          color="#374151"
        />
        <Text variant="helper" style={{ color: "#6B7280", marginLeft: 8 }}>
          {formatDate(item.createdAt)}
        </Text>
      </View>
      <Text
        variant="body"
        style={{ color: "#1F2937", marginTop: 8 }}
        numberOfLines={4}
      >
        {item.content || (item.type === "VIDEO" ? "Video note" : item.type === "VOICE" ? "Voice note" : "Note")}
      </Text>
    </Pressable>
  );

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <FontAwesome6 name="arrow-left" size={24} color={theme.colors.text} />
        </Pressable>
        <Text variant="screenTitle">Notes</Text>
        <Pressable onPress={() => (navigation as { navigate: (screen: string) => void }).navigate("NoteCompose")}>
          <FontAwesome6 name="plus" size={24} color={theme.colors.primary} />
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.centerContent}>
          <Text variant="body">Loading notes...</Text>
        </View>
      ) : notes.length === 0 ? (
        <View style={styles.centerContent}>
          <FontAwesome6 name="message" size={48} color={theme.colors.textSecondary} style={{ marginBottom: 16 }} />
          <Text variant="subtitle" style={{ color: theme.colors.text, marginBottom: 8 }}>
            No notes yet
          </Text>
          <Text variant="body" style={{ color: theme.colors.textSecondary, textAlign: "center", paddingHorizontal: 40 }}>
            Send a sweet message, photo, or video to your partner
          </Text>
          <Pressable
            style={[styles.emptyButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => (navigation as { navigate: (screen: string) => void }).navigate("NoteCompose")}
          >
            <Text style={{ color: "#FFFFFF", fontWeight: "600" }}>Send your first note</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={notes}
          renderItem={renderNote}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
            />
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 20,
    gap: 12,
  },
  noteCard: {
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  noteHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  emptyButton: {
    marginTop: 24,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
});
