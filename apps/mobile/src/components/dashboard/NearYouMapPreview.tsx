import React from "react";
import { View, StyleSheet, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedCard } from "../ThemedCard";
import { ThemedText } from "../ThemedText";
import { useTheme } from "../../theme/ThemeProvider";

type NearYouMapPreviewProps = {
  onOpenMapPress?: () => void;
  onFiltersPress?: () => void;
  hasLocationPermission?: boolean;
  onEnableLocationPress?: () => void;
};

export function NearYouMapPreview({
  onOpenMapPress,
  onFiltersPress,
  hasLocationPermission = true,
  onEnableLocationPress,
}: NearYouMapPreviewProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText variant="h2">Near you</ThemedText>
        <Pressable onPress={onFiltersPress} accessibilityLabel="Open filters">
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <ThemedText variant="caption" style={{ color: theme.colors.primary, marginRight: 4 }}>
              Filters
            </ThemedText>
            <Ionicons name="options-outline" size={16} color={theme.colors.primary} />
          </View>
        </Pressable>
      </View>

      {hasLocationPermission ? (
        <>
          {/* Map preview placeholder */}
          <ThemedCard elevation="sm" padding="none" radius="lg" style={styles.mapPreview}>
            <View style={[styles.mapPlaceholder, { backgroundColor: theme.colors.surfaceAlt }]}>
              <Ionicons name="map-outline" size={48} color={theme.colors.textMuted} />
              <ThemedText variant="caption" color="muted" style={{ marginTop: 8 }}>
                Map loading...
              </ThemedText>
            </View>
          </ThemedCard>

          {/* Place chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsContainer}
          >
            {["Food", "Coffee", "Drinks", "Outdoors", "Shopping"].map((category) => (
              <Pressable
                key={category}
                style={[styles.chip, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              >
                <ThemedText variant="caption" color="secondary">
                  {category}
                </ThemedText>
              </Pressable>
            ))}
          </ScrollView>

          {/* Open map button */}
          <Pressable
            onPress={onOpenMapPress}
            style={[styles.openMapButton, { backgroundColor: theme.colors.primary }]}
            accessibilityLabel="Open full map"
          >
            <Ionicons name="map" size={18} color="#FFFFFF" />
            <ThemedText variant="caption" style={{ color: "#FFFFFF", marginLeft: 8 }}>
              Open map
            </ThemedText>
            <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 4 }} />
          </Pressable>
        </>
      ) : (
        <ThemedCard elevation="sm" padding="lg" radius="lg">
          <View style={{ alignItems: "center", paddingVertical: 20 }}>
            <Ionicons name="location-outline" size={48} color={theme.colors.textMuted} />
            <ThemedText variant="body" color="secondary" style={{ marginTop: 12, textAlign: "center" }}>
              Enable location to discover places nearby
            </ThemedText>
            <Pressable
              onPress={onEnableLocationPress}
              style={[styles.enableButton, { backgroundColor: theme.colors.primary }]}
              accessibilityLabel="Enable location access"
            >
              <ThemedText variant="caption" style={{ color: "#FFFFFF" }}>
                Enable Location
              </ThemedText>
            </Pressable>
          </View>
        </ThemedCard>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  mapPreview: {
    overflow: "hidden",
  },
  mapPlaceholder: {
    height: 180,
    justifyContent: "center",
    alignItems: "center",
  },
  chipsContainer: {
    paddingVertical: 12,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  openMapButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  enableButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 16,
  },
});
