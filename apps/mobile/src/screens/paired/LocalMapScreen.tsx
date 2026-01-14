import React, { useState, useEffect } from "react";
import { View, StyleSheet, Pressable, ScrollView, ActivityIndicator, Linking, Alert } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Screen } from "../../ui/components/Screen";
import { Text } from "../../ui/components/Text";
import { useTheme } from "../../ui/theme/ThemeProvider";
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

const getCategoryIcon = (category: string) => {
  const cat = category.toLowerCase();
  if (cat.includes("outdoor")) return "tree";
  if (cat.includes("entertainment")) return "film";
  if (cat.includes("food") || cat.includes("shopping")) return "utensils";
  if (cat.includes("culture")) return "palette";
  return "location-dot";
};

const getPriceLevel = (level?: number) => {
  if (!level || level === 0) return "Free";
  return "$".repeat(Math.min(level, 3));
};

export function LocalMapScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as { radiusMiles?: number; filters?: string[] } | undefined;
  
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [ideas, setIdeas] = useState<LocalIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [radiusMiles, setRadiusMiles] = useState(params?.radiusMiles || 10);

  useEffect(() => {
    fetchIdeas();
  }, [selectedCategory, radiusMiles]);

  const fetchIdeas = async () => {
    try {
      setLoading(true);
      const selectedFilter = categories.find(c => c.name === selectedCategory)?.filter;
      const filters = selectedFilter ? [selectedFilter] : (params?.filters || []);
      
      const response = await api.request<{ ideas: LocalIdea[] }>("/ideas/query", {
        method: "POST",
        body: {
          type: "LOCAL",
          radiusMiles,
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
    <Screen style={{ paddingHorizontal: 0 }}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Pressable onPress={() => navigation.goBack()}>
          <FontAwesome6 name="arrow-left" size={24} color="#FFFFFF" weight="bold" />
        </Pressable>
        <Text style={styles.headerTitle}>Find Together</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Map Placeholder - Shows location count */}
      <View style={[styles.mapContainer, { backgroundColor: theme.colors.primary + "20" }]}>
        <FontAwesome6 name="map-location-dot" size={48} color={theme.colors.primary} weight="bold" />
        <Text style={[styles.mapPlaceholder, { color: theme.colors.primary }]}>
          {ideas.length} places nearby
        </Text>
        <Text variant="helper" style={{ color: theme.colors.textSecondary, marginTop: 4 }}>
          Within {radiusMiles} miles
        </Text>
      </View>

      {/* Filter Categories */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesScroll}
      >
        {categories.map((cat) => (
          <Pressable
            key={cat.name}
            style={[
              styles.categoryPill,
              selectedCategory === cat.name && [styles.categoryPillActive, { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]
            ]}
            onPress={() => setSelectedCategory(cat.name)}
          >
            <Text 
              style={[
                styles.categoryText,
                selectedCategory === cat.name && styles.categoryTextActive
              ]}
            >
              {cat.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Nearby Places List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text variant="body" style={{ marginTop: 16, color: theme.colors.textSecondary }}>
            Finding nearby places...
          </Text>
        </View>
      ) : ideas.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FontAwesome6 name="map-location-dot" size={48} color={theme.colors.textSecondary} style={{ marginBottom: 16 }} />
          <Text variant="subtitle" style={{ color: theme.colors.text, marginBottom: 8 }}>
            No places found
          </Text>
          <Text variant="body" style={{ color: theme.colors.textSecondary, textAlign: "center", paddingHorizontal: 40 }}>
            Try adjusting your filters or increasing the radius
          </Text>
        </View>
      ) : (
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        >
          {ideas.map((idea) => (
            <View key={idea.id} style={[styles.placeCard, { backgroundColor: theme.colors.surface }]}>
              <View style={styles.placeLeft}>
                <View style={[styles.placeIconContainer, { backgroundColor: theme.colors.primary + "20" }]}>
                  <FontAwesome6 
                    name={getCategoryIcon(idea.category)}
                    size={20}
                    color={theme.colors.primary}
                    weight="bold"
                  />
                </View>
                <View style={styles.placeInfo}>
                  <Text style={[styles.placeName, { color: theme.colors.text }]}>
                    {idea.title}
                  </Text>
                  <Text variant="helper" style={{ color: theme.colors.textSecondary, marginBottom: 4 }}>
                    {idea.description}
                  </Text>
                  <View style={styles.placeDetails}>
                    <Text style={[styles.placeCategory, { color: theme.colors.secondary }]}>
                      {idea.category}
                    </Text>
                    {idea.metadata.distanceMiles && (
                      <Text style={[styles.placeDistance, { color: theme.colors.primary }]}>
                        {idea.metadata.distanceMiles.toFixed(1)} mi
                      </Text>
                    )}
                    <View style={styles.priceBadge}>
                      <Text style={[styles.priceText, { color: "#10B981" }]}>
                        {getPriceLevel(idea.metadata.priceLevel)}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
              <View style={styles.placeRight}>
                {idea.metadata.websiteUrl && (
                  <Pressable 
                    style={[styles.actionButton, { backgroundColor: theme.colors.primary + "20" }]}
                    onPress={() => openWebsite(idea.metadata.websiteUrl!)}
                  >
                    <FontAwesome6 name="globe" size={16} color={theme.colors.primary} weight="bold" />
                  </Pressable>
                )}
                <Pressable 
                  style={[styles.selectButton, { backgroundColor: theme.colors.primary }]}
                  onPress={() => openInMaps(idea)}
                >
                  <FontAwesome6 name="location-arrow" size={16} color="#FFFFFF" weight="bold" />
                </Pressable>
              </View>
            </View>
          ))}

          {/* Bottom Spacing */}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  mapContainer: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  mapPlaceholder: {
    fontSize: 16,
    marginTop: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  categoriesScroll: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryPillActive: {
    backgroundColor: '#A78BFA',
    borderColor: '#A78BFA',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 20,
  },
  placeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  placeLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  placeIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  placeDetails: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  placeCategory: {
    fontSize: 12,
    fontWeight: '500',
  },
  placeDistance: {
    fontSize: 12,
    fontWeight: '600',
  },
  placeRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#D1FAE5',
  },
  priceText: {
    fontSize: 12,
    fontWeight: '700',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
