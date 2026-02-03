import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, View, SafeAreaView, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "../../components/ThemedText";
import { ThemedCard } from "../../components/ThemedCard";
import { ScreenHeader } from "../../components/ScreenHeader";
import { Button } from "../../ui/components/Button";
import { useTheme } from "../../theme/ThemeProvider";
import { spacing } from "../../theme/tokens";
import { api } from "../../state/appState";
import { ApiError } from "../../api/client";

interface Idea {
  id: string;
  title: string;
  description?: string;
  type?: string;
}

type SavedIdeasResponse = { ideas: Idea[] };

export function SavedIdeasScreen() {
  const theme = useTheme();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setErrorText(null);
    try {
      const res = await api.request<SavedIdeasResponse>("/ideas/saved", { method: "GET" });
      setIdeas(res.ideas ?? []);
    } catch (e) {
      if (e instanceof ApiError) setErrorText(e.message);
      else setErrorText("Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const unsave = async (idea: Idea) => {
    try {
      await api.request(`/ideas/${idea.id}/save`, { method: "DELETE" });
      setIdeas((prev) => prev.filter((i) => i.id !== idea.id));
    } catch (e) {
      Alert.alert("Remove failed", e instanceof Error ? e.message : "Unknown error");
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <ScreenHeader 
          title="Saved Ideas"
          subtitle="Your collection of date ideas"
        />

        {/* Error State */}
        {errorText && (
          <ThemedCard elevation="xs" padding="lg" radius="lg" style={styles.errorCard}>
            <View style={styles.errorContent}>
              <Ionicons name="alert-circle" size={48} color={theme.colors.danger} style={styles.errorIcon} />
              <ThemedText variant="h3" color="danger" style={styles.errorTitle}>
                Couldn&apos;t load saved ideas
              </ThemedText>
              <ThemedText variant="body" color="secondary" style={styles.errorText}>
                {errorText}
              </ThemedText>
              <Button
                label="Try again"
                onPress={load}
                variant="primary"
                style={styles.retryButton}
              />
            </View>
          </ThemedCard>
        )}

        {/* Loading State */}
        {loading && !errorText && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <ThemedText variant="body" color="secondary" style={styles.loadingText}>
              Loading saved ideas...
            </ThemedText>
          </View>
        )}

        {/* Empty State */}
        {ideas.length === 0 && !loading && !errorText && (
          <ThemedCard elevation="xs" padding="lg" radius="lg" style={styles.emptyCard}>
            <Ionicons name="bookmark-outline" size={64} color={theme.colors.textMuted} style={styles.emptyIcon} />
            <ThemedText variant="h3" color="primary" style={styles.emptyTitle}>
              No saved ideas yet
            </ThemedText>
            <ThemedText variant="body" color="secondary" style={styles.emptyText}>
              Save date ideas you like to find them here later
            </ThemedText>
          </ThemedCard>
        )}

        {/* Ideas List */}
        {ideas.map((idea) => (
          <ThemedCard key={idea.id} elevation="sm" padding="md" radius="lg">
            <View style={styles.ideaHeader}>
              <View style={styles.ideaTitleContainer}>
                <ThemedText variant="h3" color="primary" style={styles.ideaTitle}>
                  {idea.title}
                </ThemedText>
                {idea.type && (
                  <ThemedText variant="caption" color="muted">
                    {idea.type}
                  </ThemedText>
                )}
              </View>
              <Button
                onPress={() => unsave(idea)}
                variant="secondary"
                label="Remove"
                style={styles.removeButton}
              />
            </View>
            {idea.description && (
              <ThemedText variant="body" color="secondary" style={styles.ideaDescription}>
                {idea.description}
              </ThemedText>
            )}
          </ThemedCard>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 100,
    gap: spacing.lg,
  },
  errorCard: {
    marginTop: spacing.sm,
  },
  errorContent: {
    alignItems: "center",
    gap: spacing.md,
  },
  errorIcon: {
    marginBottom: spacing.sm,
  },
  errorTitle: {
    textAlign: "center",
  },
  errorText: {
    textAlign: "center",
    lineHeight: 20,
  },
  retryButton: {
    marginTop: spacing.sm,
  },
  loadingContainer: {
    paddingVertical: spacing.xl,
    alignItems: "center",
    gap: spacing.md,
  },
  loadingText: {
    marginTop: spacing.md,
  },
  emptyCard: {
    alignItems: "center",
    gap: spacing.md,
  },
  emptyIcon: {
    marginBottom: spacing.sm,
    opacity: 0.5,
  },
  emptyTitle: {
    textAlign: "center",
  },
  emptyText: {
    textAlign: "center",
    lineHeight: 20,
  },
  ideaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  ideaTitleContainer: {
    flex: 1,
    gap: spacing.xs,
  },
  ideaTitle: {
    lineHeight: 24,
  },
  removeButton: {
    minWidth: 80,
  },
  ideaDescription: {
    lineHeight: 20,
  },
});
