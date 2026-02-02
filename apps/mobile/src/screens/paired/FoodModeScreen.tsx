import React, { useState } from "react";
import { Alert, StyleSheet, View, SafeAreaView, ScrollView, TextInput } from "react-native";
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
}

type RecipesResponse = { recipes: Idea[] };
type SavedIdeaResponse = { id: string; ideaId: string };

export function FoodModeScreen() {
  const theme = useTheme();
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

  const removeIngredient = (index: number) => {
    const lines = ingredientsText.split(/[\n]/);
    lines.splice(index, 1);
    setIngredientsText(lines.join("\n"));
  };

  const ingredients = ingredientsText
    .split(/[\n]/)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <ScreenHeader 
          title="Food Mode"
          subtitle="Tell us your ingredients and we&apos;ll suggest recipes"
        />

        {/* Input Section */}
        <ThemedCard elevation="sm" padding="md" radius="lg">
          <ThemedText variant="caption" color="secondary" style={styles.label}>
            INGREDIENTS
          </ThemedText>
          <TextInput
            style={[
              styles.textInput,
              {
                color: theme.colors.text,
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.border,
              },
            ]}
            placeholder="Enter ingredients (one per line)"
            placeholderTextColor={theme.colors.textMuted}
            multiline
            value={ingredientsText}
            onChangeText={setIngredientsText}
          />

          {/* Ingredient Tags */}
          {ingredients.length > 0 && (
            <View style={styles.ingredientsTags}>
              {ingredients.map((ingredient, index) => (
                <ThemedCard 
                  key={index}
                  elevation="xs"
                  padding="sm"
                  radius="lg"
                  style={[styles.ingredientTag, { backgroundColor: theme.colors.surface }]}
                >
                  <View style={styles.ingredientContent}>
                    <ThemedText variant="caption" color="primary">
                      {ingredient}
                    </ThemedText>
                    <Button
                      onPress={() => removeIngredient(index)}
                      variant="secondary"
                      label=""
                      style={styles.removeButton}
                    />
                  </View>
                </ThemedCard>
              ))}
            </View>
          )}
        </ThemedCard>

        {/* Error State */}
        {errorText && (
          <ThemedCard elevation="xs" padding="md" radius="lg" style={styles.errorCard}>
            <ThemedText variant="body" color="danger">
              {errorText}
            </ThemedText>
          </ThemedCard>
        )}

        {/* Results */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ThemedText variant="body" color="secondary">Finding recipes...</ThemedText>
          </View>
        ) : ideas.length === 0 && ingredientsText.length > 0 ? (
          <ThemedCard elevation="xs" padding="lg" radius="lg" style={styles.emptyCard}>
            <Ionicons name="search" size={48} color={theme.colors.textMuted} style={styles.emptyIcon} />
            <ThemedText variant="h3" color="primary" style={styles.emptyTitle}>
              No recipes found
            </ThemedText>
            <ThemedText variant="body" color="secondary" style={styles.emptyText}>
              Try different ingredients to get recipe suggestions
            </ThemedText>
          </ThemedCard>
        ) : (
          ideas.map((idea) => (
            <ThemedCard key={idea.id} elevation="sm" padding="md" radius="lg">
              <View style={styles.ideaHeader}>
                <ThemedText variant="h3" color="primary" style={styles.ideaTitle}>
                  {idea.title}
                </ThemedText>
                <Button
                  onPress={() => saveIdea(idea)}
                  variant={savedIds.has(idea.id) ? "primary" : "secondary"}
                  label={savedIds.has(idea.id) ? "Saved" : "Save"}
                  style={styles.saveButton}
                />
              </View>
              {idea.description && (
                <ThemedText variant="body" color="secondary" style={styles.ideaDescription}>
                  {idea.description}
                </ThemedText>
              )}
            </ThemedCard>
          ))
        )}
      </ScrollView>

      {/* Footer Button */}
      <View style={[styles.footer, { backgroundColor: theme.colors.background, borderTopColor: theme.colors.border }]}>
        <Button
          label={loading ? "Searching..." : "Find Recipes"}
          onPress={fetchRecipes}
          variant="primary"
          disabled={loading || parsedIngredients.length === 0}
        />
      </View>
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
    paddingBottom: 120,
    gap: spacing.lg,
  },
  label: {
    marginBottom: spacing.sm,
  },
  textInput: {
    minHeight: 100,
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.md,
    fontSize: 16,
    marginBottom: spacing.md,
  },
  ingredientsTags: {
    gap: spacing.sm,
  },
  ingredientTag: {
    marginTop: spacing.xs,
  },
  ingredientContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  removeButton: {
    marginLeft: spacing.sm,
  },
  errorCard: {
    marginTop: spacing.sm,
  },
  loadingContainer: {
    paddingVertical: spacing.xl,
    alignItems: "center",
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
  ideaTitle: {
    flex: 1,
  },
  saveButton: {
    minWidth: 80,
  },
  ideaDescription: {
    lineHeight: 20,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
  },
});
