import React, { useState } from "react";
import { View, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { CONTENT, preferencesSchema } from "@withyou/shared";
import { Screen } from "../../ui/components/Screen";
import { Text } from "../../ui/components/Text";
import { ButtonNew as Button } from "../../ui/components/ButtonNew";
import { CardNew as Card } from "../../ui/components/CardNew";
import { api } from "../../state/appState";
import { useAsyncAction } from "../../api/hooks";
import { Spacing } from "../../ui/tokens";
import { useTheme } from "../../ui/theme/ThemeProvider";

type PreferencesScreenProps = {
  navigation: unknown;
};

export function PreferencesScreen({ navigation }: PreferencesScreenProps) {
  const { colors } = useTheme();
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

  const activityIcons: Record<"chill" | "active" | "surprise", keyof typeof Feather.glyphMap> = {
    chill: "moon",
    active: "zap",
    surprise: "star",
  };

  const budgetIcons: Record<"low" | "medium" | "high", keyof typeof Feather.glyphMap> = {
    low: "dollar-sign",
    medium: "trending-up",
    high: "trending-up",
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.lg, paddingBottom: Spacing.xl }}>
        {/* Header */}
        <View style={{ gap: Spacing.sm }}>
          <Text variant="title">{c.title}</Text>
          <Text variant="body" style={{ color: colors.textMuted }}>
            {c.body}
          </Text>
        </View>

        {/* Activity Style */}
        <Card>
          <View style={{ gap: Spacing.md }}>
            <Text variant="subtitle">{c.fields.activityStyleLabel}</Text>
            <View style={{ flexDirection: "row", gap: Spacing.sm }}>
              {(["chill", "active", "surprise"] as const).map((style) => {
                const isSelected = activityStyle === style;
                return (
                  <Button
                    key={style}
                    label={c.options.activityStyle[style]}
                    onPress={() => setActivityStyle(style)}
                    variant={isSelected ? "primary" : "secondary"}
                    icon={
                      <Feather
                        name={activityIcons[style]}
                        size={16}
                        color={isSelected ? colors.textInverse : colors.primary}
                      />
                    }
                  />
                );
              })}
            </View>
          </View>
        </Card>

        {/* Food Types */}
        <Card>
          <View style={{ gap: Spacing.md }}>
            <View>
              <Text variant="subtitle">{c.fields.foodTypesLabel}</Text>
              <Text variant="muted" style={{ color: colors.textMuted, marginTop: Spacing.xs }}>
                {c.fields.foodTypesHelper}
              </Text>
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm }}>
              {CONTENT.lists.foodTypes.map((food) => {
                const isSelected = foodTypes.includes(food);
                return (
                  <Button
                    key={food}
                    label={food}
                    onPress={() => toggleFoodType(food)}
                    variant={isSelected ? "primary" : "secondary"}
                    size="small"
                  />
                );
              })}
            </View>
          </View>
        </Card>

        {/* Budget */}
        <Card>
          <View style={{ gap: Spacing.md }}>
            <Text variant="subtitle">{c.fields.budgetLabel}</Text>
            <View style={{ flexDirection: "row", gap: Spacing.sm }}>
              {(["low", "medium", "high"] as const).map((level) => {
                const isSelected = budget === level;
                return (
                  <Button
                    key={level}
                    label={c.options.budget[level]}
                    onPress={() => setBudget(level)}
                    variant={isSelected ? "primary" : "secondary"}
                    icon={
                      <Feather
                        name={budgetIcons[level]}
                        size={16}
                        color={isSelected ? colors.textInverse : colors.primary}
                      />
                    }
                  />
                );
              })}
            </View>
          </View>
        </Card>

        {/* Energy Level */}
        <Card>
          <View style={{ gap: Spacing.md }}>
            <View>
              <Text variant="subtitle">{c.fields.energyLabel}</Text>
              <Text variant="muted" style={{ color: colors.textMuted, marginTop: Spacing.xs }}>
                {c.fields.energyHelper}
              </Text>
            </View>
            <View style={{ flexDirection: "row", gap: Spacing.sm }}>
              {[1, 2, 3, 4, 5].map((level) => {
                const isSelected = energyLevel === level;
                return (
                  <Button
                    key={level}
                    label={String(level)}
                    onPress={() => setEnergyLevel(level as 1 | 2 | 3 | 4 | 5)}
                    variant={isSelected ? "primary" : "secondary"}
                    size="small"
                  />
                );
              })}
            </View>
          </View>
        </Card>

        {/* Error State */}
        {errorText ? (
          <Card variant="outlined">
            <Text variant="body" style={{ color: colors.error }}>
              {errorText}
            </Text>
          </Card>
        ) : null}

        {/* Submit Button */}
        <Button
          label={loading ? CONTENT.app.common.loading : c.actions.primary}
          onPress={onSubmit}
          disabled={loading}
          fullWidth
        />
      </ScrollView>
    </Screen>
  );
}
