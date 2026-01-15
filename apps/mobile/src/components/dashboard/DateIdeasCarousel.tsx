import React from "react";
import { View, StyleSheet, FlatList, Dimensions, Image, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedCard } from "../ThemedCard";
import { ThemedText } from "../ThemedText";
import { useTheme } from "../../theme/ThemeProvider";

type DateIdea = {
  id: string;
  title: string;
  category: string;
  imageUrl?: string;
  distance?: string;
  priceLevel?: string;
  timeEstimate?: string;
};

type DateIdeasCarouselProps = {
  ideas: DateIdea[];
  onIdeaPress?: (id: string) => void;
  onSeeAllPress?: () => void;
};

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.7;
const CARD_SPACING = 12;

export function DateIdeasCarousel({ ideas, onIdeaPress, onSeeAllPress }: DateIdeasCarouselProps) {
  const theme = useTheme();

  const renderIdea = ({ item }: { item: DateIdea }) => (
    <Pressable
      onPress={() => onIdeaPress?.(item.id)}
      style={({ pressed }) => [styles.ideaCard, { opacity: pressed ? 0.8 : 1 }]}
    >
      <ThemedCard elevation="sm" padding="none" radius="lg" style={{ width: CARD_WIDTH }}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.ideaImage} resizeMode="cover" />
        ) : (
          <View style={[styles.ideaImagePlaceholder, { backgroundColor: theme.colors.surfaceAlt }]}>
            <Ionicons name="image-outline" size={40} color={theme.colors.textMuted} />
          </View>
        )}

        <View style={{ padding: 16 }}>
          <ThemedText variant="h3" numberOfLines={1}>
            {item.title}
          </ThemedText>

          <View style={styles.meta}>
            <View style={styles.metaItem}>
              <Ionicons name="pricetag-outline" size={14} color={theme.colors.textMuted} />
              <ThemedText variant="caption" color="muted" style={{ marginLeft: 4 }}>
                {item.priceLevel || "$"}
              </ThemedText>
            </View>
            {item.distance && (
              <View style={styles.metaItem}>
                <Ionicons name="location-outline" size={14} color={theme.colors.textMuted} />
                <ThemedText variant="caption" color="muted" style={{ marginLeft: 4 }}>
                  {item.distance}
                </ThemedText>
              </View>
            )}
            {item.timeEstimate && (
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={14} color={theme.colors.textMuted} />
                <ThemedText variant="caption" color="muted" style={{ marginLeft: 4 }}>
                  {item.timeEstimate}
                </ThemedText>
              </View>
            )}
          </View>

          <Pressable
            style={[styles.saveButton, { backgroundColor: theme.colors.primarySoft }]}
            onPress={() => {}}
            accessibilityLabel={`Save ${item.title}`}
          >
            <Ionicons name="bookmark-outline" size={16} color={theme.colors.primary} />
            <ThemedText variant="caption" style={{ color: theme.colors.primary, marginLeft: 6 }}>
              Save
            </ThemedText>
          </Pressable>
        </View>
      </ThemedCard>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText variant="h2">Date ideas</ThemedText>
        <Pressable onPress={onSeeAllPress} accessibilityLabel="See all date ideas">
          <ThemedText variant="caption" style={{ color: theme.colors.primary }}>
            See all
          </ThemedText>
        </Pressable>
      </View>

      <FlatList
        data={ideas}
        renderItem={renderIdea}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        decelerationRate="fast"
        ItemSeparatorComponent={() => <View style={{ width: CARD_SPACING }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  ideaCard: {
    marginVertical: 4,
  },
  ideaImage: {
    width: "100%",
    height: 140,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  ideaImagePlaceholder: {
    width: "100%",
    height: 140,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  meta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 8,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
});
