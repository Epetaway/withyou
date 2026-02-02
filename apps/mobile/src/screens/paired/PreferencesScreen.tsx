import React, { useState } from "react";
import { View, StyleSheet, SafeAreaView, ScrollView } from "react-native";
import { CONTENT, preferencesSchema } from "@withyou/shared";
import { ThemedText } from "../../components/ThemedText";
import { ThemedCard } from "../../components/ThemedCard";
import { ScreenHeader } from "../../components/ScreenHeader";
import { ChipGroup } from "../../components/checkin/ChipGroup";
import { Button } from "../../ui/components/Button";
import { api } from "../../state/appState";
import { useAsyncAction } from "../../api/hooks";
import { useTheme } from "../../theme/ThemeProvider";
import { spacing } from "../../theme/tokens";
import type { CheckInOption } from "../../lib/checkinOptions";

export function PreferencesScreen(_navigation: unknown) {
  const theme = useTheme();
  const c = CONTENT.preferences;

  const [activityStyle, setActivityStyle] = useState<"chill" | "active" | "surprise" | null>(null);
  const [foodTypes, setFoodTypes] = useState<string[]>([]);
  const [budget, setBudget] = useState<"low" | "medium" | "high" | null>(null);
  const [energyLevel, setEnergyLevel] = useState<1 | 2 | 3 | 4 | 5 | null>(null);

  const { run, loading, errorText } = useAsyncAction(async () => {
    if (!activityStyle || foodTypes.length === 0 || !budget || !energyLevel) {
      throw new Error("Please fill all fields");
    }

    const parsed = preferencesSchema.safeParse({
      activity_style: activityStyle,
      food_types: foodTypes,
      budget_level: budget,
      energy_level: energyLevel,
    });

    if (!parsed.success) {
      throw new Error("Validation failed");
    }

    await api.request("/preferences", {
      method: "POST",
      body: JSON.stringify(parsed.data),
    });

    return null;
  });

  const onSubmit = async () => {
    try {
      await run();
    } catch {
      // Error handled in useAsyncAction
    }
  };

  // Convert to CheckInOption format for ChipGroup
  const activityOptions: CheckInOption[] = [
    { id: "chill", label: c.options.activityStyle.chill, iconName: "leaf-outline", section: "needs" },
    { id: "active", label: c.options.activityStyle.active, iconName: "flash-outline", section: "needs" },
    { id: "surprise", label: c.options.activityStyle.surprise, iconName: "sparkles-outline", section: "needs" },
  ];

  const budgetOptions: CheckInOption[] = [
    { id: "low", label: c.options.budget.low, iconName: "cash-outline", section: "needs" },
    { id: "medium", label: c.options.budget.medium, iconName: "wallet-outline", section: "needs" },
    { id: "high", label: c.options.budget.high, iconName: "diamond-outline", section: "needs" },
  ];

  const foodOptions: CheckInOption[] = CONTENT.lists.foodTypes.map(food => ({
    id: food,
    label: food,
    iconName: "restaurant-outline",
    section: "needs",
  }));

  const energyOptions: CheckInOption[] = [1, 2, 3, 4, 5].map(level => ({
    id: String(level),
    label: String(level),
    iconName: "battery-charging-outline",
    section: "needs",
  }));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          title="Preferences"
          subtitle="These are private and help tailor suggestions for both of you."
        />

        <ThemedCard elevation="sm" padding="lg" radius="lg" style={styles.section}>
          <ChipGroup
            label="Activity Style"
            options={activityOptions}
            selectedIds={activityStyle ? [activityStyle] : []}
            onSelectionChange={(ids) => setActivityStyle((ids[0] as "chill" | "active" | "surprise") || null)}
            style={styles.chipSection}
          />

          <ChipGroup
            label="Food Preferences"
            options={foodOptions}
            selectedIds={foodTypes}
            onSelectionChange={(ids) => setFoodTypes(ids)}
            style={styles.chipSection}
          />

          <ChipGroup
            label="Budget Level"
            options={budgetOptions}
            selectedIds={budget ? [budget] : []}
            onSelectionChange={(ids) => setBudget((ids[0] as "low" | "medium" | "high") || null)}
            style={styles.chipSection}
          />

          <ChipGroup
            label="Energy Level"
            options={energyOptions}
            selectedIds={energyLevel ? [String(energyLevel)] : []}
            onSelectionChange={(ids) => setEnergyLevel(ids[0] ? (parseInt(ids[0]) as 1 | 2 | 3 | 4 | 5) : null)}
            style={styles.chipSection}
          />

          {errorText && (
            <View style={[styles.errorContainer, { backgroundColor: theme.colors.danger + "15" }]}>
              <ThemedText variant="body" color="danger">
                {errorText}
              </ThemedText>
            </View>
          )}

          <Button
            label={loading ? CONTENT.app.common.loading : c.actions.primary}
            onPress={onSubmit}
            disabled={loading}
            variant="primary"
          />
        </ThemedCard>
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
    paddingBottom: 100, // Space for floating nav
  },
  section: {
    marginBottom: spacing.lg,
  },
  chipSection: {
    marginBottom: spacing.lg,
  },
  errorContainer: {
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
});
