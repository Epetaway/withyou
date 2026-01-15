import React from "react";
import { View, Image, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "../ThemedText";
import { useTheme } from "../../theme/ThemeProvider";
import placeholderImage from "../../../assets/placeholder.png";

type CheckInHeroProps = {
  heroImageUrl?: string;
  onBackPress: () => void;
  onInfoPress?: () => void;
};

export function CheckInHero({ heroImageUrl, onBackPress, onInfoPress }: CheckInHeroProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  // Gradient overlay colors - darker and more pronounced in dark mode
  const gradientColors = theme.isDark
    ? ["rgba(0,0,0,0)", "rgba(88,39,142,0.4)", "rgba(11,13,18,0.8)"]
    : ["rgba(0,0,0,0)", "rgba(200,180,220,0.3)", "rgba(247,247,251,0.7)"];

  const defaultImage = "https://images.unsplash.com/photo-1502763382598-1e4dde6c1d66?w=400&h=320&fit=crop";

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: heroImageUrl || defaultImage }}
        style={styles.image}
        defaultSource={placeholderImage}
      />

      <LinearGradient
        colors={gradientColors}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.overlay}
      />

      {/* Top bar with back + info icons */}
      <View
        style={[
          styles.topBar,
          {
            paddingTop: insets.top + 12,
            paddingHorizontal: 16,
          },
        ]}
      >
        <Pressable
          onPress={onBackPress}
          style={({ pressed }) => [
            styles.iconButton,
            { backgroundColor: "rgba(255,255,255,0.2)", opacity: pressed ? 0.7 : 1 },
          ]}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </Pressable>

        <Pressable
          onPress={onInfoPress}
          style={({ pressed }) => [
            styles.iconButton,
            { backgroundColor: "rgba(255,255,255,0.2)", opacity: pressed ? 0.7 : 1 },
          ]}
          accessibilityLabel="Information"
          accessibilityRole="button"
        >
          <Ionicons name="information-circle-outline" size={24} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* Text content centered in middle of hero */}
      <View style={styles.textContainer}>
        <ThemedText
          variant="h1"
          color="primary"
          style={{
            color: "#FFFFFF",
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          Check in
        </ThemedText>
        <ThemedText
          variant="body"
          color="secondary"
          style={{
            color: "#FFFFFF",
            textAlign: "center",
            opacity: 0.95,
          }}
        >
          How are you feeling right now?
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 280,
    position: "relative",
    overflow: "hidden",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  image: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  overlay: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    position: "absolute",
    top: "50%",
    left: 16,
    right: 16,
    transform: [{ translateY: -40 }],
    justifyContent: "center",
    alignItems: "center",
  },
});
