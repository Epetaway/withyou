import React, { useState } from "react";
import { View, ScrollView } from "react-native";
import { CONTENT, preferencesSchema } from "@withyou/shared";
import { Screen } from "../../ui/components/Screen";
import { Text } from "../../ui/components/Text";
import { Button } from "../../ui/components/Button";
import { api } from "../../state/appState";
import { useAsyncAction } from "../../api/hooks";

type PreferencesScreenProps = {
  navigation: unknown;
};

export function PreferencesScreen({ navigation }: PreferencesScreenProps) {
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
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} style={{ gap: 16 }}>
        <Text variant="title">{c.title}</Text>
        <Text variant="body">{c.body}</Text>

        <Text variant="subtitle">{c.fields.activityStyleLabel}</Text>
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
          {(["chill", "active", "surprise"] as const).map((style) => (
            <Button
              key={style}
              label={c.options.activityStyle[style]}
              onPress={() => setActivityStyle(style)}
              variant={activityStyle === style ? "primary" : "secondary"}
            />
          ))}
        </View>

        <Text variant="subtitle">{c.fields.foodTypesLabel}</Text>
        <Text variant="muted">{c.fields.foodTypesHelper}</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
          {CONTENT.lists.foodTypes.map((food) => (
            <Button
              key={food}
              label={food}
              onPress={() => toggleFoodType(food)}
              variant={foodTypes.includes(food) ? "primary" : "secondary"}
            />
          ))}
        </View>

        <Text variant="subtitle">{c.fields.budgetLabel}</Text>
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
          {(["low", "medium", "high"] as const).map((level) => (
            <Button
              key={level}
              label={c.options.budget[level]}
              onPress={() => setBudget(level)}
              variant={budget === level ? "primary" : "secondary"}
            />
          ))}
        </View>

        <Text variant="subtitle">{c.fields.energyLabel}</Text>
        <Text variant="muted">{c.fields.energyHelper}</Text>
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
          {[1, 2, 3, 4, 5].map((level) => (
            <Button
              key={level}
              label={String(level)}
              onPress={() => setEnergyLevel(level as 1 | 2 | 3 | 4 | 5)}
              variant={energyLevel === level ? "primary" : "secondary"}
            />
          ))}
        </View>

        {errorText ? (
          <Text variant="muted" style={{ color: "#B00020" }}>
            {errorText}
          </Text>
        ) : null}

        <Button
          label={loading ? CONTENT.app.common.loading : c.actions.primary}
          onPress={onSubmit}
          disabled={loading}
        />
      </ScrollView>
    </Screen>
  );
}
