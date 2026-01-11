import React, { useState } from "react";
import { View, ScrollView, Pressable, StyleSheet } from "react-native";
import { CONTENT, preferencesSchema } from "@withyou/shared";
import { Screen } from "../../ui/components/Screen";
import { Text } from "../../ui/components/Text";
import { Button } from "../../ui/components/Button";
import { Section } from "../../ui/components/Section";
import { api } from "../../state/appState";
import { useAsyncAction } from "../../api/hooks";
import { Spacing, BorderRadius } from "../../ui/tokens";
import { useTheme } from "../../ui/theme";

type PreferencesScreenProps = {
  navigation: unknown;
};

function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.pill,
        borderWidth: 1,
        borderColor: selected ? theme.primary : theme.border,
        backgroundColor: selected ? theme.primary : "transparent",
      }}
    >
      <Text
        variant="body"
        style={{
          fontSize: 14,
          fontWeight: "600",
          color: selected ? "#fff" : theme.text,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function PreferencesScreen({ navigation }: PreferencesScreenProps) {
  const theme = useTheme();
  const c = CONTENT.preferences;

  const [activityStyle, setActivityStyle] = useState<
    "chill" | "active" | "surprise" | null
  >(null);
  const [foodTypes, setFoodTypes] = useState<string[]>([]);
  const [budget, setBudget] = useState<"low" | "medium" | "high" | null>(null);
  const [energyLevel, setEnergyLevel] = useState<1 | 2 | 3 | 4 | 5 | null>(null);

  const toggleFoodType = (food: string) => {
    setFoodTypes((prev) =>
      prev.includes(food) ? prev.filter((f) => f !== food) : [...prev, food]
    );
  };

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

    // Success - navigate back to dashboard
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (navigation as any)?.goBack?.();
    return null;
  });

  const onSubmit = async () => {
    try {
      await run();
    } catch {
      // Error handled in useAsyncAction
    }
  };

  return (
    <Screen style={{ paddingHorizontal: Spacing.md, paddingTop: Spacing.lg }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Spacing.xl }}
      >
        {/* Page Header */}
        <View style={{ marginBottom: Spacing.xl }}>
          <Text style={[styles.h1, { color: theme.text }]}>{c.title}</Text>
          <Text style={[styles.h2, { color: theme.text2 }]}>{c.body}</Text>
        </View>

        {/* Activity Style */}
        <Section title={c.fields.activityStyleLabel}>
          <View style={{ flexDirection: "row", gap: Spacing.sm }}>
            {(["chill", "active", "surprise"] as const).map((style) => (
              <Chip
                key={style}
                label={c.options.activityStyle[style]}
                selected={activityStyle === style}
                onPress={() => setActivityStyle(style)}
              />
            ))}
          </View>
        </Section>

        {/* Food Types */}
        <Section
          title={c.fields.foodTypesLabel}
          subtitle={c.fields.foodTypesHelper}
        >
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm }}>
            {CONTENT.lists.foodTypes.map((food) => (
              <Chip
                key={food}
                label={food}
                selected={foodTypes.includes(food)}
                onPress={() => toggleFoodType(food)}
              />
            ))}
          </View>
        </Section>

        {/* Budget */}
        <Section title={c.fields.budgetLabel}>
          <View style={{ flexDirection: "row", gap: Spacing.sm }}>
            {(["low", "medium", "high"] as const).map((level) => (
              <Chip
                key={level}
                label={c.options.budget[level]}
                selected={budget === level}
                onPress={() => setBudget(level)}
              />
            ))}
          </View>
        </Section>

        {/* Energy Level */}
        <Section title={c.fields.energyLabel} subtitle={c.fields.energyHelper}>
          <View style={{ flexDirection: "row", gap: Spacing.sm }}>
            {[1, 2, 3, 4, 5].map((level) => (
              <Chip
                key={level}
                label={String(level)}
                selected={energyLevel === level}
                onPress={() => setEnergyLevel(level as 1 | 2 | 3 | 4 | 5)}
              />
            ))}
          </View>
        </Section>

        {/* Error State */}
        {errorText ? (
          <View style={{ marginTop: Spacing.md }}>
            <Text variant="body" style={{ color: theme.danger }}>
              {errorText}
            </Text>
          </View>
        ) : null}

        {/* Submit Button */}
        <View style={{ marginTop: Spacing.lg }}>
          <Button
            label={loading ? CONTENT.app.common.loading : c.actions.primary}
            onPress={onSubmit}
            disabled={loading}
            variant="primary"
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 28, fontWeight: "700" },
  h2: { fontSize: 16, marginTop: Spacing.sm },
});
