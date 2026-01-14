import React, { useState } from "react";
import { View, StyleSheet, Pressable, ScrollView } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Screen } from "../../ui/components/Screen";
import { Text } from "../../ui/components/Text";
import { useTheme } from "../../ui/theme/ThemeProvider";

const nearbyPlaces = [
  { id: 1, name: "Coffee House", icon: "mug-hot", category: "Cafe", distance: "0.5 km", rating: 4.8 },
  { id: 2, name: "Park", icon: "tree", category: "Outdoor", distance: "1.2 km", rating: 4.5 },
  { id: 3, name: "Cinema", icon: "film", category: "Entertainment", distance: "0.8 km", rating: 4.7 },
  { id: 4, name: "Restaurant", icon: "utensils", category: "Food", distance: "1.5 km", rating: 4.6 },
  { id: 5, name: "Museum", icon: "palette", category: "Culture", distance: "2 km", rating: 4.9 },
  { id: 6, name: "Hiking Trail", icon: "person-hiking", category: "Adventure", distance: "3 km", rating: 4.8 },
];

const categories = [
  { name: "All", icon: "border-all" },
  { name: "Food", icon: "utensils" },
  { name: "Outdoor", icon: "tree" },
  { name: "Entertainment", icon: "film" },
  { name: "Culture", icon: "palette" },
];

export function LocalMapScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const [selectedCategory, setSelectedCategory] = useState("All");

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

      {/* Map Placeholder */}
      <View style={[styles.mapContainer, { backgroundColor: '#E5E7EB' }]}>
        <FontAwesome6 name="map" size={48} color="#A78BFA" weight="bold" />
        <Text style={styles.mapPlaceholder}>Your Location Map</Text>
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
              selectedCategory === cat.name && styles.categoryPillActive
            ]}
            onPress={() => setSelectedCategory(cat.name)}
          >
            <FontAwesome6 
              name={cat.icon as "border-all" | "utensils" | "tree" | "film" | "palette"}
              size={14} 
              color={selectedCategory === cat.name ? "#FFFFFF" : "#A78BFA"}
              weight="bold"
            />
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
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {nearbyPlaces.map((place) => (
          <Pressable key={place.id} style={[styles.placeCard, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.placeLeft}>
              <View style={styles.placeIconContainer}>
                <FontAwesome6 
                  name={place.icon as "mug-hot" | "tree" | "film" | "utensils" | "palette" | "person-hiking"}
                  size={20}
                  color={theme.colors.primary}
                  weight="bold"
                />
              </View>
              <View style={styles.placeInfo}>
                <Text style={[styles.placeName, { color: theme.colors.text }]}>
                  {place.name}
                </Text>
                <View style={styles.placeDetails}>
                  <Text style={[styles.placeCategory, { color: theme.colors.secondary }]}>
                    {place.category}
                  </Text>
                  <Text style={[styles.placeDistance, { color: theme.colors.primary }]}>
                    {place.distance}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.placeRight}>
              <View style={styles.ratingBadge}>
                <FontAwesome6 name="star" size={12} color="#F59E0B" weight="solid" />
                <Text style={styles.ratingText}>{place.rating}</Text>
              </View>
              <Pressable style={[styles.selectButton, { backgroundColor: theme.colors.primary }]}>
                <FontAwesome6 name="arrow-right" size={16} color="#FFFFFF" weight="bold" />
              </Pressable>
            </View>
          </Pressable>
        ))}

        {/* Bottom Spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>
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
    fontSize: 14,
    color: '#A78BFA',
    marginTop: 12,
    fontWeight: '600',
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
    paddingHorizontal: 14,
    paddingVertical: 8,
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
    fontSize: 13,
    fontWeight: '600',
    color: '#A78BFA',
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
    gap: 12,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F59E0B',
  },
  selectButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
