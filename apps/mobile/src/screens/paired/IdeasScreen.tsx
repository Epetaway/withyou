import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Screen } from "../../ui/components/Screen";
import { Text } from "../../ui/components/Text";
import { Button } from "../../ui/components/Button";
import { RadiusSelector } from "../../ui/components/RadiusSelector";
import { FilterChips } from "../../ui/components/FilterChips";
import { Spacing } from "../../ui/tokens";

type Navigation = {
  navigate: (screen: string, params?: unknown) => void;
};

const localFilterOptions = [
  { id: "outdoors", label: "Outdoors" },
  { id: "entertainment", label: "Entertainment" },
  { id: "food", label: "Food" },
  { id: "lowcost", label: "Low-cost" },
];

export function IdeasScreen({ navigation }: { navigation: Navigation }) {
  const [radius, setRadius] = useState<number>(10);
  const [selectedFilters, setSelectedFilters] = useState<Set<string>>(new Set());

  const filtersArray = useMemo(() => Array.from(selectedFilters), [selectedFilters]);

  const toggleFilter = (id: string) => {
    setSelectedFilters((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <Screen style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text variant="title" style={styles.h1}>Ideas</Text>
          <Text variant="body" style={styles.h2}>
            Pick a mode and we’ll suggest gentle, low-pressure activities.
          </Text>
        </View>

        <View style={styles.section}>
          <Text variant="subtitle" style={styles.sectionTitle}>Local activities</Text>
          <Text variant="body" style={styles.sectionBody}>
            Choose a nearby radius and optional filters to see curated ideas.
          </Text>

          <Text variant="body" style={styles.label}>Radius</Text>
          <RadiusSelector value={radius} onChange={setRadius} />

          <Text variant="body" style={[styles.label, { marginTop: Spacing.md }]}>Filters</Text>
          <FilterChips
            options={localFilterOptions}
            selected={selectedFilters}
            onToggle={toggleFilter}
          />

          <View style={styles.actionsRow}>
            <Button
              label="See local ideas"
              onPress={() => navigation.navigate("LocalResults", { radiusMiles: radius, filters: filtersArray })}
              variant="primary"
            />
            <Button
              label="Adjust filters"
              onPress={() => navigation.navigate("LocalFilters", { radiusMiles: radius, filters: filtersArray })}
              variant="secondary"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text variant="subtitle" style={styles.sectionTitle}>Try a mode</Text>
          <Text variant="body" style={styles.sectionBody}>
            Quick-start ideas for cooking at home or a cozy movie night. Saved ideas live here too.
          </Text>

          <View style={styles.modeButtons}>
            <Button label="Food mode" onPress={() => navigation.navigate("FoodMode")} variant="primary" />
            <Button label="Movie mode" onPress={() => navigation.navigate("MovieMode")} variant="secondary" />
            <Button label="Saved ideas" onPress={() => navigation.navigate("SavedIdeas")} variant="secondary" />
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: Spacing.md, paddingTop: Spacing.lg },
  scrollContent: { paddingBottom: Spacing.xl, gap: Spacing.lg },
  header: { gap: Spacing.xs },
  h1: { fontSize: 28, fontWeight: "700" },
  h2: { color: "rgba(34,23,42,0.70)" },
  section: { gap: Spacing.sm },
  sectionTitle: { fontWeight: "700" },
  sectionBody: { color: "rgba(34,23,42,0.70)" },
  label: { marginTop: Spacing.xs, color: "rgba(34,23,42,0.70)" },
  actionsRow: { flexDirection: "row", gap: Spacing.sm, marginTop: Spacing.md },
  modeButtons: { flexDirection: "row", gap: Spacing.sm, flexWrap: "wrap" },
});
