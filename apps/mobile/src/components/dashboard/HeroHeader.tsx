import React from "react";
import { View, ImageBackground, StyleSheet, Pressable, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "../ThemedText";
import { useTheme } from "../../theme/ThemeProvider";
import { createMoodOverlay } from "../../lib/mood";
import type { MoodLevel, MoodColor } from "@withyou/shared";

type HeroHeaderProps = {
  imageUri?: string;
  relationshipStage?: string;
  userMood?: MoodLevel | MoodColor | null;
  partnerMood?: MoodLevel | MoodColor | null;
  onGalleryPress?: () => void;
  onSettingsPress?: () => void;
};

const { width } = Dimensions.get("window");
const HERO_HEIGHT = 320;

export function HeroHeader({
  imageUri,
  relationshipStage,
  userMood,
  partnerMood,
  onGalleryPress,
  onSettingsPress,
}: HeroHeaderProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const moodOverlay = createMoodOverlay(userMood ?? null, partnerMood ?? null, theme.isDark);

  const defaultImage = "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800";

  return (
    <ImageBackground
      source={{ uri: imageUri || defaultImage }}
      style={[styles.hero, { height: HERO_HEIGHT }]}
      resizeMode="cover"
    >
      {/* Mood gradient overlay */}
      <LinearGradient
        colors={[
          `${moodOverlay.colors[0]}40`,
          `${moodOverlay.colors[1]}40`,
          moodOverlay.overlayColor,
        ]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
        <View>
          <ThemedText variant="caption" style={{ color: "#FFFFFF", opacity: 0.9 }}>
            WithYou
          </ThemedText>
          <ThemedText variant="h1" style={{ color: "#FFFFFF", marginTop: 4 }}>
            Home
          </ThemedText>
        </View>
        <View style={styles.topActions}>
          {onGalleryPress && (
            <Pressable
              onPress={onGalleryPress}
              style={[styles.iconButton, { backgroundColor: "rgba(255,255,255,0.2)" }]}
              accessibilityLabel="Change background photo"
            >
              <Ionicons name="images-outline" size={20} color="#FFFFFF" />
            </Pressable>
          )}
          {onSettingsPress && (
            <Pressable
              onPress={onSettingsPress}
              style={[styles.iconButton, { backgroundColor: "rgba(255,255,255,0.2)" }]}
              accessibilityLabel="Settings"
            >
              <Ionicons name="settings-outline" size={20} color="#FFFFFF" />
            </Pressable>
          )}
        </View>
      </View>

      {/* Relationship stage pill */}
      {relationshipStage && (
        <View style={styles.stagePill}>
          <View style={[styles.stagePillInner, { backgroundColor: "rgba(255,255,255,0.25)" }]}>
            <Ionicons name="heart" size={16} color="#FFFFFF" />
            <ThemedText variant="caption" style={{ color: "#FFFFFF", marginLeft: 6 }}>
              {relationshipStage}
            </ThemedText>
          </View>
        </View>
      )}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  hero: {
    width,
    overflow: "hidden",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
  },
  topActions: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  stagePill: {
    position: "absolute",
    bottom: 16,
    left: 20,
    right: 20,
    alignItems: "flex-start",
  },
  stagePillInner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backdropFilter: "blur(10px)",
  },
});
