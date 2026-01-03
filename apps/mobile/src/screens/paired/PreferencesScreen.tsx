import React, { useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { CONTENT } from "@withyou/shared";
import { tokens } from "../../ui/tokens";
import { Screen } from "../../ui/components/Screen";
import { Text } from "../../ui/components/Text";
import { Button } from "../../ui/components/Button";

export function PreferencesScreen() {
  const [activityStyle, setActivityStyle] = useState<"chill" | "active" | "surprise" | null>(null);
  const [foodTypes, setFoodTypes] = useState<string[]>([]);
  const [budget, setBudget] = useState<"low" | "medium" | "high" | null>(null);
  const [energyLevel, setEnergyLevel] = useState<1 | 2 | 3 | 4 | 5 | null>(null);
  const [loading, setLoading] = useState(false);

  const toggleFoodType = (food: string) => {
    setFoodTypes((prev) =>
      prev.includes(food) ? prev.filter((f) => f !== food) : [...prev, food]
    );
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      console.log("Saving preferences:", {
        activity_style: activityStyle,
        food_types: foodTypes,
        budget_level: budget,
        energy_level: energyLevel,
      });

    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text variant="title">{CONTENT.preferences.title}</Text>
        <Text variant="body" style={styles.description}>
          {CONTENT.preferences.body}
        </Text>

        <Text variant="subtitle" style={styles.sectionTitle}>
          {CONTENT.preferences.fields.activityStyleLabel}
        </Text>
        <View style={styles.optionsRow}>
          {(["chill", "active", "surprise"] as const).map((style) => (
            <Button
              key={style}
              label={CONTENT.preferences.options.activityStyle[style]}
              onPress={() => setActivityStyle(style)}
              variant={activityStyle === style ? "primary" : "secondary"}
              style={styles.optionButton}
            />
          ))}
        </View>

        <Text variant="subtitle" style={styles.sectionTitle}>
          {CONTENT.preferences.fields.foodTypesLabel}
        </Text>
        <Text variant="muted" style={styles.helper}>
          {CONTENT.preferences.fields.foodTypesHelper}
        </Text>
        <View style={styles.foodGrid}>
          {CONTENT.lists.foodTypes.map((food) => (
            <Button
              key={food}
              label={food}
              onPress={() => toggleFoodType(food)}
              variant={foodTypes.includes(food) ? "primary" : "secondary"}
              style={styles.foodButton}
            />
          ))}
        </View>

        <Text variant="subtitle" style={styles.sectionTitle}>
          {CONTENT.preferences.fields.budgetLabel}
        </Text>
        <View style={styles.optionsRow}>
          {(["low", "medium", "high"] as const).map((level) => (
            <Button
              key={level}
              label={CONTENT.preferences.options.budget[level]}
              onPress={() => setBudget(level)}
              variant={budget === level ? "primary" : "secondary"}
              style={styles.optionButton}
            />
          ))}
        </View>

        <Text variant="subtitle" style={styles.sectionTitle}>
          {CONTENT.preferences.fields.energyLabel}
        </Text>
        <Text variant="muted" style={styles.helper}>
          {CONTENT.preferences.fields.energyHelper}
        </Text>
        <View style={styles.optionsRow}>
          {[1, 2, 3, 4, 5].map((level) => (
            <Button
              key={level}
              label={String(level)}
              onPress={() => setEnergyLevel(level as 1 | 2 | 3 | 4 | 5)}
              variant={energyLevel === level ? "primary" : "secondary"}
              style={styles.optionButton}
            />
          ))}
        </View>

        <Button
          label={CONTENT.preferences.actions.primary}
          onPress={handleSave}
          disabled={loading}
          style={styles.submitButton}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  description: { marginVertical: tokens.space.lg },
  sectionTitle: { marginTop: tokens.space.lg, marginBottom: tokens.space.md },
  helper: { marginBottom: tokens.space.md },
  optionsRow: { flexDirection: "row", gap: tokens.space.sm, marginBottom: tokens.space.md },
  optionButton: { flex: 1 },
  foodGrid: { flexDirection: "row", flexWrap: "wrap", gap: tokens.space.sm, marginBottom: tokens.space.md },
  foodButton: { width: "30%" },
  submitButton: { marginTop: tokens.space.lg, marginBottom: tokens.space.xl },
});
