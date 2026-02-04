import React, { useEffect, useMemo, useState } from "react";
import { Linking, StyleSheet, View, Alert, SafeAreaView, ScrollView, ActivityIndicator } from "react-native";
import { NavigationProp, useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "../../components/ThemedText";
import { ThemedCard } from "../../components/ThemedCard";
import { ScreenHeader } from "../../components/ScreenHeader";
import { Button } from "../../ui/components/Button";
import { useTheme } from "../../theme/ThemeProvider";
import { spacing } from "../../theme/tokens";
import { api } from "../../state/appState";
import { ApiError } from "../../api/client";

type Params = {
  radiusMiles?: number;
  filters?: string[];
};

type LocalStackParamList = {
  LocalResults: { radiusMiles?: number; filters?: string[] };
};

type Route = { params?: Params };

type Idea = {
  id: string;
  title: string;
  description?: string;
  category?: string;
  metadata: {
    lat?: number;
    lng?: number;
    distanceMiles?: number;
  };
};

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

export function LocalResultsScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp<LocalStackParamList>>();
  const route = useRoute<Route>();
  const radiusMiles = route.params?.radiusMiles ?? 10;
  const filters = route.params?.filters ?? [];
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const paramsBody = useMemo(
    () => ({
      type: "LOCAL",
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <ScreenHeader
          title="Local results"
          subtitle={`Radius ${radiusMiles} mi${filters.length ? ` • ${filters.join(", ")}` : ""}`}
        />

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <ThemedText variant="body" color="secondary" style={styles.loadingText}>
              Loading nearby ideas...
            </ThemedText>
          </View>
        )}

        {errorText && !loading && (
          <ThemedCard elevation="xs" padding="lg" radius="lg">
            <View style={styles.errorContent}>
              <Ionicons name="alert-circle" size={48} color={theme.colors.danger} />
              <ThemedText variant="h3" color="danger" style={styles.errorTitle}>
                Couldn&apos;t load ideas
              </ThemedText>
              <ThemedText variant="body" color="secondary" style={styles.errorText}>
                {errorText}
              </ThemedText>
              <Button label="Try again" onPress={fetchIdeas} variant="primary" />
            </View>
          </ThemedCard>
        )}

        {!loading && !errorText && ideas.length === 0 && (
          <ThemedCard elevation="xs" padding="lg" radius="lg">
            <View style={styles.emptyContent}>
              <Ionicons name="search" size={48} color={theme.colors.textMuted} />
              <ThemedText variant="h3" color="primary" style={styles.emptyTitle}>
                No nearby ideas yet
              </ThemedText>
              <ThemedText variant="body" color="secondary" style={styles.emptyText}>
                Try expanding the radius or removing filters.
              </ThemedText>
            </View>
          </ThemedCard>
        )}

        {!loading && !errorText && ideas.length > 0 && (
          <View style={styles.ideasList}>
            {ideas.map((idea) => (
              <ThemedCard key={idea.id} elevation="sm" padding="md" radius="lg">
                <View style={styles.ideaHeader}>
                  <View style={styles.ideaTitleContainer}>
                    <ThemedText variant="h3" color="primary" style={styles.ideaTitle}>
                      {idea.title}
                    </ThemedText>
                    {idea.category && (
                      <ThemedText variant="caption" color="muted">
                        {idea.category}
                      </ThemedText>
                    )}
                  </View>
                  <Button
                    label={savedIds.has(idea.id) ? "Saved" : "Save"}
                    onPress={() => saveIdea(idea)}
                    variant={savedIds.has(idea.id) ? "primary" : "secondary"}
                  />
                </View>
                {idea.description && (
                  <ThemedText variant="body" color="secondary" style={styles.ideaDescription}>
                    {idea.description}
                  </ThemedText>
                )}
                <View style={styles.ideaActions}>
                  <Button
                    label="Open in Maps"
                    onPress={() => openMaps(idea.metadata.lat, idea.metadata.lng, idea.title)}
                    variant="secondary"
                  />
                  <Button
                    label="Add to Calendar"
                    onPress={() => Alert.alert("Calendar", "Add to calendar coming soon")}
                    variant="secondary"
                  />
                </View>
              </ThemedCard>
            ))}
          </View>
        )}

        {!loading && (
          <View style={styles.bottomActions}>
            <Button label="Refresh" onPress={fetchIdeas} variant="secondary" />
            <Button label="Adjust filters" onPress={goBack} variant="primary" />
          </View>
        )}
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
  loadingContainer: {
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
  },
  errorContent: {
    alignItems: "center",
    gap: spacing.md,
  },
  errorTitle: {
    textAlign: "center",
  },
  errorText: {
    textAlign: "center",
    lineHeight: 20,
  },
  emptyContent: {
    alignItems: "center",
    gap: spacing.md,
  },
  emptyTitle: {
    textAlign: "center",
  },
  emptyText: {
    textAlign: "center",
    lineHeight: 20,
  },
  ideasList: {
    gap: spacing.md,
  },
  ideaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  ideaTitleContainer: {
    flex: 1,
    gap: spacing.xs,
  },
  ideaTitle: {
    lineHeight: 24,
  },
  ideaDescription: {
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  ideaActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  bottomActions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
});
