import React, { useEffect, useMemo, useState } from "react";
import { Linking, StyleSheet, View, Alert } from "react-native";
import { Screen } from "../../ui/components/Screen";
import { Text } from "../../ui/components/Text";
import { Button } from "../../ui/components/Button";
import { Idea, IdeaCard, IdeaType } from "../../ui/components/IdeaCard";
import { EmptyState } from "../../ui/components/EmptyState";
import { SkeletonCard } from "../../ui/components/SkeletonCard";
import { Spacing } from "../../ui/tokens";
import { api } from "../../state/appState";
import { ApiError } from "../../api/client";

type Params = {
  radiusMiles?: number;
  filters?: string[];
};

type Nav = { goBack: () => void };

type Route = { params?: Params };

type IdeasResponse = { ideas: Idea[] };

type SavedIdeaResponse = {
  id: string;
  ideaId: string;
};

function openMaps(lat?: number, lng?: number, label?: string) {
  if (!lat || !lng) return;
  const query = encodeURIComponent(label || "Location");
  const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${query}`;
  Linking.openURL(url).catch(() => {});
}

export function LocalResultsScreen({ navigation, route }: { navigation: Nav; route: Route }) {
  const radiusMiles = route.params?.radiusMiles ?? 10;
  const filters = route.params?.filters ?? [];
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const paramsBody = useMemo(
    () => ({
      type: "LOCAL" as IdeaType,
      radiusMiles,
      filters: filters.length ? filters : undefined,
    }),
    [radiusMiles, filters]
  );

  const fetchIdeas = async () => {
    setLoading(true);
    setErrorText(null);
    try {
      const res = await api.request<IdeasResponse>("/ideas/query", {
        method: "POST",
        body: JSON.stringify(paramsBody),
      });
      setIdeas(res.ideas ?? []);
    } catch (e) {
      if (e instanceof ApiError) setErrorText(e.message);
      else setErrorText("Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const saveIdea = async (idea: Idea) => {
    try {
      await api.request<SavedIdeaResponse>(`/ideas/${idea.id}/save`, {
        method: "POST",
        body: JSON.stringify({ notes: null }),
      });
      setSavedIds((prev) => new Set(prev).add(idea.id));
    } catch (e) {
      Alert.alert("Save failed", e instanceof Error ? e.message : "Unknown error");
    }
  };

  useEffect(() => {
    fetchIdeas();
  }, [radiusMiles, filters]);

  const goBack = () => navigation.goBack();

  return (
    <Screen style={styles.screen} scrollable>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text variant="title" style={styles.h1}>Local results</Text>
            <Text variant="body" style={styles.h2}>
              Radius {radiusMiles} mi{filters.length ? ` • ${filters.join(", ")}` : ""}
            </Text>
          </View>
          <Button label="Back" onPress={goBack} variant="secondary" />
        </View>

        {loading ? (
          <View style={{ gap: Spacing.md }}>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </View>
        ) : errorText ? (
          <EmptyState
            title="Couldn’t load ideas"
            description={errorText}
            actionLabel="Try again"
            onAction={fetchIdeas}
          />
        ) : ideas.length === 0 ? (
          <EmptyState
            title="No nearby ideas yet"
            description="Try expanding the radius or removing filters."
            actionLabel="Adjust filters"
            onAction={goBack}
          />
        ) : (
          <View style={{ gap: Spacing.md }}>
            {ideas.map((idea) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                saved={savedIds.has(idea.id)}
                onSave={saveIdea}
                onOpenMap={(i) => openMaps(i.metadata.lat, i.metadata.lng, i.title)}
                onAddToCalendar={() => Alert.alert("Calendar", "Add to calendar coming soon")}
              />
            ))}
          </View>
        )}

        {!loading ? (
          <View style={styles.bottomActions}>
            <Button label="Refresh" onPress={fetchIdeas} variant="secondary" />
            <Button label="Adjust filters" onPress={goBack} variant="primary" />
          </View>
        ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: Spacing.md, paddingTop: Spacing.lg },
  scrollContent: { paddingBottom: Spacing.xl, gap: Spacing.lg },
  headerRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  h1: { fontSize: 24, fontWeight: "700" },
  h2: { color: "rgba(34,23,42,0.70)", marginTop: 2 },
  bottomActions: { flexDirection: "row", gap: Spacing.sm, marginTop: Spacing.lg },
});
