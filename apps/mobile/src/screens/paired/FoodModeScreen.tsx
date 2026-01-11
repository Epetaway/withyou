import React, { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Screen } from "../../ui/components/Screen";
import { Text } from "../../ui/components/Text";
import { Button } from "../../ui/components/Button";
import { TextField } from "../../ui/components/TextField";
import { Idea, IdeaCard } from "../../ui/components/IdeaCard";
import { EmptyState } from "../../ui/components/EmptyState";
import { SkeletonCard } from "../../ui/components/SkeletonCard";
import { Spacing } from "../../ui/tokens";
import { api } from "../../state/appState";
import { ApiError } from "../../api/client";

type RecipesResponse = { recipes: Idea[] };
type SavedIdeaResponse = { id: string; ideaId: string };

export function FoodModeScreen() {
  const [ingredientsText, setIngredientsText] = useState<string>("");
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const parsedIngredients = ingredientsText
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);

  const fetchRecipes = async () => {
    setLoading(true);
    setErrorText(null);
    try {
      const res = await api.request<RecipesResponse>("/ideas/recipes", {
        method: "POST",
        body: JSON.stringify({ ingredients: parsedIngredients }),
      });
      setIdeas(res.recipes ?? []);
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

  return (
    <Screen style={styles.screen} scrollable>
        <View style={styles.header}>
          <Text variant="title" style={styles.h1}>Food & Cooking</Text>
          <Text variant="body" style={styles.h2}>
            Enter ingredients to get cook-at-home ideas. Order-in and go-out modes will follow this beta.
          </Text>
        </View>

        <TextField
          label="Ingredients (comma or newline separated)"
          value={ingredientsText}
          onChangeText={setIngredientsText}
          placeholder="eggs, pasta, tomatoes"
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          style={{ minHeight: 96 }}
        />

        <Button
          label={loading ? "Loading recipes..." : "Get recipes"}
          onPress={fetchRecipes}
          disabled={loading || parsedIngredients.length === 0}
          variant="primary"
        />

        {loading ? (
          <View style={{ gap: Spacing.md, marginTop: Spacing.md }}>
            <SkeletonCard />
            <SkeletonCard />
          </View>
        ) : errorText ? (
          <EmptyState
            title="Couldn’t load recipes"
            description={errorText}
            actionLabel="Try again"
            onAction={fetchRecipes}
            style={{ marginTop: Spacing.md }}
          />
        ) : ideas.length === 0 ? (
          <EmptyState
            title="No recipes yet"
            description="Add ingredients and tap Get recipes."
            style={{ marginTop: Spacing.md }}
          />
        ) : (
          <View style={{ gap: Spacing.md, marginTop: Spacing.md }}>
            {ideas.map((idea) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                saved={savedIds.has(idea.id)}
                onSave={saveIdea}
                onAddToCalendar={() => Alert.alert("Calendar", "Add to calendar coming soon")}
              />
            ))}
          </View>
        )}
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
