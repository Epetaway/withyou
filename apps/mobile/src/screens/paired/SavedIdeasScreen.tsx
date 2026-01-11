import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Screen } from "../../ui/components/Screen";
import { Text } from "../../ui/components/Text";
import { Button } from "../../ui/components/Button";
import { Idea, IdeaCard } from "../../ui/components/IdeaCard";
import { EmptyState } from "../../ui/components/EmptyState";
import { SkeletonCard } from "../../ui/components/SkeletonCard";
import { Spacing } from "../../ui/tokens";
import { api } from "../../state/appState";
import { ApiError } from "../../api/client";

type SavedIdeasResponse = { ideas: Idea[] };

export function SavedIdeasScreen() {
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
    <Screen style={styles.screen} scrollable>
        <View style={styles.header}>
          <Text variant="title" style={styles.h1}>Saved Ideas</Text>
          <Text variant="body" style={styles.h2}>Ideas you bookmarked to try together.</Text>
        </View>

        {loading ? (
          <View style={{ gap: Spacing.md }}>
            <SkeletonCard />
            <SkeletonCard />
          </View>
        ) : errorText ? (
          <EmptyState
            title="Couldn’t load saved ideas"
            description={errorText}
            actionLabel="Try again"
            onAction={load}
          />
        ) : ideas.length === 0 ? (
          <EmptyState
            title="No saved ideas"
            description="Save ideas from Local, Food, or Movie modes and they’ll appear here."
            actionLabel="Refresh"
            onAction={load}
          />
        ) : (
          <View style={{ gap: Spacing.md }}>
            {ideas.map((idea) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                saved
                onSave={unsave}
                onUnsave={unsave}
                onAddToCalendar={() => Alert.alert("Calendar", "Add to calendar coming soon")}
              />
            ))}
          </View>
        )}

        <Button label="Refresh" onPress={load} variant="secondary" style={{ marginTop: Spacing.lg }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: Spacing.md, paddingTop: Spacing.lg },
  scroll: { paddingBottom: Spacing.xl, gap: Spacing.md },
  header: { gap: Spacing.xs },
  h1: { fontSize: 24, fontWeight: "700" },
  h2: { color: "rgba(34,23,42,0.70)" },
});
