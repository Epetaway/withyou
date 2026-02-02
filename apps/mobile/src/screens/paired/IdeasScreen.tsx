import React, { useMemo, useState } from "react";
import { StyleSheet, View, SafeAreaView, ScrollView } from "react-native";
import { ThemedText } from "../../components/ThemedText";
import { ThemedCard } from "../../components/ThemedCard";
import { ScreenHeader } from "../../components/ScreenHeader";
import { Button } from "../../ui/components/Button";
import { RadiusSelector } from "../../ui/components/RadiusSelector";
import { FilterChips } from "../../ui/components/FilterChips";
import { useTheme } from "../../theme/ThemeProvider";
import { spacing } from "../../theme/tokens";

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
  const theme = useTheme();
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          title="Ideas"
          subtitle="Discover gentle, low-pressure activities for you and your partner."
        />

        {/* Local Activities Section */}
        <ThemedCard elevation="sm" padding="lg" radius="lg" style={styles.section}>
          <ThemedText variant="h3" color="primary" style={styles.sectionTitle}>
            Local activities
          </ThemedText>
          <ThemedText variant="body" color="muted" style={styles.sectionBody}>
            Choose a nearby radius and optional filters to see curated ideas.
          </ThemedText>

          <ThemedText variant="overline" color="muted" style={styles.label}>
            RADIUS
          </ThemedText>
          <RadiusSelector value={radius} onChange={setRadius} />

          <ThemedText variant="overline" color="muted" style={[styles.label, { marginTop: spacing.md }]}>
            FILTERS
          </ThemedText>
          <FilterChips
            options={localFilterOptions}
            selected={selectedFilters}
            onToggle={toggleFilter}
          />

          <View style={styles.actionRow}>
            <Button
              label="Find near me"
              onPress={() => navigation.navigate("LocalMap", { radiusMiles: radius, filters: filtersArray })}
              variant="primary"
            />
          </View>
        </ThemedCard>

        {/* Quick Modes Section */}
        <ThemedCard elevation="sm" padding="lg" radius="lg" style={styles.section}>
          <ThemedText variant="h3" color="primary" style={styles.sectionTitle}>
            Try a mode
          </ThemedText>
          <ThemedText variant="body" color="muted" style={styles.sectionBody}>
            Quick-start ideas for cooking at home or a cozy movie night. Saved ideas live here too.
          </ThemedText>

          <View style={styles.modeButtons}>
            <Button label="Food mode" onPress={() => navigation.navigate("FoodMode")} variant="primary" />
            <Button label="Movie mode" onPress={() => navigation.navigate("MovieMode")} variant="secondary" />
            <Button label="Saved ideas" onPress={() => navigation.navigate("SavedIdeas")} variant="secondary" />
          </View>
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
  sectionTitle: {
    marginBottom: spacing.xs,
  },
  sectionBody: {
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  label: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  actionRow: {
    marginTop: spacing.md,
  },
  modeButtons: {
    flexDirection: "row",
    gap: spacing.sm,
    flexWrap: "wrap",
    marginTop: spacing.md,
  },
});
