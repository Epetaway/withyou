import React, { useState } from "react";
import { View, Pressable } from "react-native";
import { CONTENT, preferencesSchema } from "@withyou/shared";
import { Screen } from "../../ui/components/Screen";
import { Text } from "../../ui/components/Text";
import { Button } from "../../ui/components/Button";
import { api } from "../../state/appState";
import { useAsyncAction } from "../../api/hooks";
import { Spacing, BorderRadius } from "../../ui/tokens";
import { useTheme } from "../../ui/theme/ThemeProvider";

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
        borderColor: selected ? theme.colors.primary : theme.colors.border,
        backgroundColor: selected ? theme.colors.primary : "transparent",
        minHeight: 36,
      }}
    >
      <Text
        variant="body"
        style={{
          fontSize: 14,
          fontWeight: "600",
          color: selected ? theme.colors.background : theme.colors.text,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function PreferencesScreen(_navigation: unknown) {
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
    <Screen scrollable>
      {/* Page Header */}
      <View style={{ marginBottom: Spacing.xl, gap: Spacing.sm }}>
        <Text variant="title">{c.title}</Text>
        <Text variant="body" style={{ color: theme.colors.textSecondary }}>{c.body}</Text>
      </View>

      {/* Activity Style */}
      <View style={{ marginBottom: Spacing.xl, gap: Spacing.sm }}>
        <Text variant="subtitle">{c.fields.activityStyleLabel}</Text>
        <View style={{ flexDirection: "row", gap: Spacing.sm, flexWrap: "wrap" }}>
          {(["chill", "active", "surprise"] as const).map((style) => (
            <Chip
              key={style}
              label={c.options.activityStyle[style]}
              selected={activityStyle === style}
              onPress={() => setActivityStyle(style)}
            />
          ))}
        </View>
      </View>

      {/* Food Types */}
      <View style={{ marginBottom: Spacing.xl, gap: Spacing.sm }}>
        <Text variant="subtitle">{c.fields.foodTypesLabel}</Text>
        <Text variant="body" style={{ color: theme.colors.textSecondary, fontSize: 13 }}>{c.fields.foodTypesHelper}</Text>
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
      </View>

      {/* Budget */}
      <View style={{ marginBottom: Spacing.xl, gap: Spacing.sm }}>
        <Text variant="subtitle">{c.fields.budgetLabel}</Text>
        <View style={{ flexDirection: "row", gap: Spacing.sm, flexWrap: "wrap" }}>
          {(["low", "medium", "high"] as const).map((level) => (
            <Chip
              key={level}
              label={c.options.budget[level]}
              selected={budget === level}
              onPress={() => setBudget(level)}
            />
          ))}
        </View>
      </View>

      {/* Energy Level */}
      <View style={{ marginBottom: Spacing.xl, gap: Spacing.sm }}>
        <Text variant="subtitle">{c.fields.energyLabel}</Text>
        <Text variant="body" style={{ color: theme.colors.textSecondary, fontSize: 13 }}>{c.fields.energyHelper}</Text>
        <View style={{ flexDirection: "row", gap: Spacing.sm, flexWrap: "wrap" }}>
          {[1, 2, 3, 4, 5].map((level) => (
            <Chip
              key={level}
              label={String(level)}
              selected={energyLevel === level}
              onPress={() => setEnergyLevel(level as 1 | 2 | 3 | 4 | 5)}
            />
          ))}
        </View>
      </View>

      {/* Error State */}
      {errorText ? (
        <View style={{ marginBottom: Spacing.lg }}>
          <Text variant="body" style={{ color: theme.colors.error }}>
            {errorText}
          </Text>
        </View>
      ) : null}

      {/* Submit Button */}
      <Button
        label={loading ? CONTENT.app.common.loading : c.actions.primary}
        onPress={onSubmit}
        disabled={loading}
        variant="primary"
      />
    </Screen>
  );
}
