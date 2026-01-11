import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Screen } from "../../ui/components/Screen";
import { Text } from "../../ui/components/Text";
import { Button } from "../../ui/components/Button";
import { RadiusSelector } from "../../ui/components/RadiusSelector";
import { FilterChips } from "../../ui/components/FilterChips";
import { Spacing } from "../../ui/tokens";

const filterOptions = [
  { id: "outdoors", label: "Outdoors" },
  { id: "entertainment", label: "Entertainment" },
  { id: "food", label: "Food" },
  { id: "lowcost", label: "Low-cost" },
];

type Params = {
  radiusMiles?: number;
  filters?: string[];
};

type Nav = {
  navigate: (screen: string, params?: unknown) => void;
  goBack: () => void;
};

type Route = { params?: Params };

export function LocalFiltersScreen({ navigation, route }: { navigation: Nav; route: Route }) {
  const initialRadius = route.params?.radiusMiles ?? 10;
  const initialFilters = new Set(route.params?.filters ?? []);
  const [radius, setRadius] = useState<number>(initialRadius);
  const [selectedFilters, setSelectedFilters] = useState<Set<string>>(initialFilters);

  const filtersArray = useMemo(() => Array.from(selectedFilters), [selectedFilters]);

  const toggleFilter = (id: string) => {
    setSelectedFilters((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const submit = () => {
    navigation.navigate("LocalResults", { radiusMiles: radius, filters: filtersArray });
  };

  return (
    <Screen style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text variant="title" style={styles.h1}>Local filters</Text>
        <Text variant="body" style={styles.body}>Adjust radius and filters to refine nearby ideas.</Text>

        <Text variant="body" style={styles.label}>Radius</Text>
        <RadiusSelector value={radius} onChange={setRadius} />

        <Text variant="body" style={[styles.label, { marginTop: Spacing.md }]}>Filters</Text>
        <FilterChips options={filterOptions} selected={selectedFilters} onToggle={toggleFilter} />

        <View style={styles.actions}>
          <Button label="See results" onPress={submit} variant="primary" />
          <Button label="Back" onPress={navigation.goBack} variant="secondary" />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: Spacing.md, paddingTop: Spacing.lg },
  scrollContent: { paddingBottom: Spacing.xl, gap: Spacing.md },
  h1: { fontSize: 24, fontWeight: "700" },
  body: { color: "rgba(34,23,42,0.70)" },
  label: { color: "rgba(34,23,42,0.70)" },
  actions: { flexDirection: "row", gap: Spacing.sm, marginTop: Spacing.lg },
});
