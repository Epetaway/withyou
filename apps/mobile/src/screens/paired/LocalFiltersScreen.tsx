import React, { useMemo, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, View } from "react-native";
import { NavigationProp, useNavigation, useRoute } from "@react-navigation/native";
import { ThemedText } from "../../components/ThemedText";
import { ThemedCard } from "../../components/ThemedCard";
import { ScreenHeader } from "../../components/ScreenHeader";
import { Button } from "../../ui/components/Button";
import { RadiusSelector } from "../../ui/components/RadiusSelector";
import { FilterChips } from "../../ui/components/FilterChips";
import { useTheme } from "../../theme/ThemeProvider";
import { spacing } from "../../theme/tokens";

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

type LocalStackParamList = {
  LocalResults: { radiusMiles?: number; filters?: string[] };
};

type Route = { params?: Params };

export function LocalFiltersScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp<LocalStackParamList>>();
  const route = useRoute<Route>();
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          title="Local filters"
          subtitle="Adjust radius and filters to refine nearby ideas."
        />

        <ThemedCard elevation="sm" padding="lg" radius="lg">
          <ThemedText variant="overline" color="muted" style={styles.label}>
            RADIUS
          </ThemedText>
          <RadiusSelector value={radius} onChange={setRadius} />
        </ThemedCard>

        <ThemedCard elevation="sm" padding="lg" radius="lg">
          <ThemedText variant="overline" color="muted" style={styles.label}>
            FILTERS
          </ThemedText>
          <FilterChips options={filterOptions} selected={selectedFilters} onToggle={toggleFilter} />
        </ThemedCard>

        <View style={styles.actions}>
          <Button label="See results" onPress={submit} variant="primary" />
          <Button label="Back" onPress={navigation.goBack} variant="secondary" />
        </View>
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
    paddingBottom: 100,
    gap: spacing.lg,
  },
  label: {
    marginBottom: spacing.sm,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
