import React, { useState, useEffect } from "react";
import { View, StyleSheet, Pressable, ScrollView, ActivityIndicator, Linking, Alert, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NavigationProp, useNavigation, useRoute } from "@react-navigation/native";
import { ThemedText } from "../../components/ThemedText";
import { ThemedCard } from "../../components/ThemedCard";
import { ScreenHeader } from "../../components/ScreenHeader";
import { useTheme } from "../../theme/ThemeProvider";
import { spacing } from "../../theme/tokens";
import { api } from "../../state/appState";

type LocalIdea = {
  id: string;
  type: string;
  title: string;
  description: string;
  category: string;
  source: string;
  metadata: {
    address?: string;
    lat?: number;
    lng?: number;
    distanceMiles?: number;
    websiteUrl?: string;
    priceLevel?: number;
  };
};

const categories = [
  { name: "All", filter: null },
  { name: "Food", filter: "food" },
  { name: "Outdoor", filter: "outdoors" },
  { name: "Entertainment", filter: "entertainment" },
  { name: "Low Cost", filter: "lowcost" },
];

const getCategoryIcon = (category: string): "leaf" | "film" | "restaurant" | "color-palette" | "location" => {
  const cat = category.toLowerCase();
  if (cat.includes("outdoor")) return "leaf";
  if (cat.includes("entertainment")) return "film";
  if (cat.includes("food") || cat.includes("shopping")) return "restaurant";
  if (cat.includes("culture")) return "color-palette";
  return "location";
};

const getPriceLevel = (level?: number) => {
  if (!level || level === 0) return "Free";
  return "$".repeat(Math.min(level, 3));
};

type LocalStackParamList = {
  LocalMap: { radiusMiles?: number; filters?: string[] } | undefined;
};

export function LocalMapScreen() {
  const theme = useTheme();
  useNavigation<NavigationProp<LocalStackParamList>>();
  const route = useRoute<{ params?: { radiusMiles?: number; filters?: string[] } }>();
  const params = route.params;
  
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [ideas, setIdeas] = useState<LocalIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [_radiusMiles, _setRadiusMiles] = useState(params?.radiusMiles || 10);

  useEffect(() => {
    fetchIdeas();
  }, [selectedCategory, _radiusMiles]);

  const fetchIdeas = async () => {
    try {
      setLoading(true);
      const selectedFilter = categories.find(c => c.name === selectedCategory)?.filter;
      const filters = selectedFilter ? [selectedFilter] : (params?.filters || []);
      
      const response = await api.request<{ ideas: LocalIdea[] }>("/ideas/query", {
        method: "POST",
        body: {
          type: "LOCAL",
          radiusMiles: _radiusMiles,
          filters,
        },
      });
      
      setIdeas(response.ideas || []);
    } catch (error) {
      console.error("Failed to fetch ideas:", error);
      Alert.alert("Error", "Failed to load nearby places. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const openInMaps = (idea: LocalIdea) => {
    if (idea.metadata.lat && idea.metadata.lng) {
      const url = `https://www.google.com/maps/search/?api=1&query=${idea.metadata.lat},${idea.metadata.lng}`;
      Linking.openURL(url);
    } else if (idea.metadata.address) {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(idea.metadata.address)}`;
      Linking.openURL(url);
    }
  };

  const openWebsite = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <ScreenHeader title="Find Together" subtitle={`Within ${_radiusMiles} miles`} />

        <ThemedCard elevation="sm" padding="lg" radius="lg" style={styles.mapCard}>
          <Ionicons name="map" size={48} color={theme.colors.primary} />
          <ThemedText variant="h3" color="primary" style={styles.mapTitle}>
            {ideas.length} places nearby
          </ThemedText>
          <ThemedText variant="caption" color="secondary">
            Map preview coming soon
          </ThemedText>
        </ThemedCard>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
          {categories.map((cat) => (
            <Pressable
              key={cat.name}
              style={[
                styles.categoryPill,
                {
                  borderColor: selectedCategory === cat.name ? theme.colors.primary : theme.colors.border,
                  backgroundColor: selectedCategory === cat.name ? theme.colors.primary : theme.colors.surface,
                },
              ]}
              onPress={() => setSelectedCategory(cat.name)}
            >
              <ThemedText
                variant="caption"
                color="primary"
                style={{ color: selectedCategory === cat.name ? theme.colors.surface : theme.colors.textPrimary }}
              >
                {cat.name}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <ThemedText variant="body" color="secondary" style={styles.loadingText}>
              Finding nearby places...
            </ThemedText>
          </View>
        ) : ideas.length === 0 ? (
          <ThemedCard elevation="xs" padding="lg" radius="lg" style={styles.emptyCard}>
            <Ionicons name="location" size={48} color={theme.colors.textMuted} />
            <ThemedText variant="h3" color="primary" style={styles.emptyTitle}>
              No places found
            </ThemedText>
            <ThemedText variant="body" color="secondary" style={styles.emptyText}>
              Try adjusting your filters or increasing the radius
            </ThemedText>
          </ThemedCard>
        ) : (
          <View style={styles.listContent}>
            {ideas.map((idea) => (
              <ThemedCard key={idea.id} elevation="sm" padding="md" radius="lg">
                <View style={styles.placeHeader}>
                  <View style={styles.placeIconContainer}>
                    <Ionicons name={getCategoryIcon(idea.category)} size={20} color={theme.colors.primary} />
                  </View>
                  <View style={styles.placeInfo}>
                    <ThemedText variant="h3" color="primary" style={styles.placeName}>
                      {idea.title}
                    </ThemedText>
                    <ThemedText variant="body" color="secondary" numberOfLines={2}>
                      {idea.description}
                    </ThemedText>
                  </View>
                </View>
                <View style={styles.placeDetails}>
                  <ThemedText variant="caption" color="muted">
                    {idea.category}
                  </ThemedText>
                  {idea.metadata.distanceMiles && (
                    <ThemedText variant="caption" color="primary">
                      {idea.metadata.distanceMiles.toFixed(1)} mi
                    </ThemedText>
                  )}
                  <ThemedText variant="caption" color="success">
                    {getPriceLevel(idea.metadata.priceLevel)}
                  </ThemedText>
                </View>
                <View style={styles.placeActions}>
                  {idea.metadata.websiteUrl && (
                    <Pressable
                      style={[styles.actionButton, { borderColor: theme.colors.border }]}
                      onPress={() => openWebsite(idea.metadata.websiteUrl!)}
                    >
                      <Ionicons name="globe" size={16} color={theme.colors.primary} />
                      <ThemedText variant="caption" color="primary">Website</ThemedText>
                    </Pressable>
                  )}
                  <Pressable
                    style={[styles.actionButton, { borderColor: theme.colors.border }]}
                    onPress={() => openInMaps(idea)}
                  >
                    <Ionicons name="navigate" size={16} color={theme.colors.primary} />
                    <ThemedText variant="caption" color="primary">Maps</ThemedText>
                  </Pressable>
                </View>
              </ThemedCard>
            ))}
          </View>
        )}
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
  mapCard: {
    alignItems: "center",
    gap: spacing.sm,
  },
  mapTitle: {
    textAlign: "center",
  },
  categoriesScroll: {
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  categoryPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
  },
  loadingContainer: {
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
  },
  emptyCard: {
    alignItems: "center",
    gap: spacing.md,
  },
  emptyTitle: {
    textAlign: "center",
  },
  emptyText: {
    textAlign: "center",
    lineHeight: 20,
  },
  listContent: {
    gap: spacing.md,
  },
  placeHeader: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  placeIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    marginBottom: spacing.xs,
  },
  placeDetails: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  placeActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 10,
    borderWidth: 1,
  },
});
