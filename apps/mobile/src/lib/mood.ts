import type { MoodLevel, MoodColor, EmotionLabel, EnergyLevel } from "@withyou/shared";

/**
 * Maps mood levels (1-5) to color values
 */
export function getMoodLevelColor(level: MoodLevel | null | undefined): string {
  if (!level) return "#9CA3AF"; // neutral gray
  
  switch (level) {
    case 1:
      return "#EF4444"; // red - very low
    case 2:
      return "#F97316"; // orange - low
    case 3:
      return "#EAB308"; // yellow - neutral
    case 4:
      return "#22C55E"; // green - good
    case 5:
      return "#A78BFA"; // purple - very good
    default:
      return "#9CA3AF";
  }
}

/**
 * Maps new mood color system to actual color values
 */
export function getMoodColorValue(color: MoodColor | null | undefined): string {
  if (!color) return "#9CA3AF";
  
  const moodColorMap: Record<MoodColor, string> = {
    red: "#EF4444",
    orange: "#F97316",
    yellow: "#FBBF24",
    green: "#22C55E",
    blue: "#3B82F6",
    purple: "#A78BFA",
    pink: "#EC4899",
  };
  
  return moodColorMap[color];
}

/**
 * Blends two colors for gradient overlay effect
 * Returns CSS-compatible gradient string
 */
export function blendMoodColors(
  color1: string,
  color2: string,
  opacity: number = 0.25
): { start: string; end: string } {
  return {
    start: color1,
    end: color2,
  };
}

/**
 * Creates mood overlay gradient data for hero image
 */
export function createMoodOverlay(
  userMood: MoodLevel | MoodColor | null,
  partnerMood: MoodLevel | MoodColor | null,
  isDark: boolean
): {
  colors: string[];
  locations: number[];
  overlayColor: string;
  overlayOpacity: number;
} {
  // Determine if we're using new mood color system or old level system
  const userColor =
    typeof userMood === "string"
      ? getMoodColorValue(userMood as MoodColor)
      : getMoodLevelColor(userMood as MoodLevel);
  
  const partnerColor =
    typeof partnerMood === "string"
      ? getMoodColorValue(partnerMood as MoodColor)
      : getMoodLevelColor(partnerMood as MoodLevel);

  return {
    colors: [userColor, partnerColor],
    locations: [0, 1],
    overlayColor: isDark ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0.10)",
    overlayOpacity: isDark ? 0.35 : 0.1,
  };
}

/**
 * Returns guidance tip based on mood combination
 */
export function getMoodGuidance(
  userMood: MoodLevel | null,
  partnerMood: MoodLevel | null
): string | null {
  if (!userMood || !partnerMood) return null;

  const getMoodCategory = (level: MoodLevel): "positive" | "neutral" | "negative" => {
    if (level >= 4) return "positive";
    if (level === 3) return "neutral";
    return "negative";
  };

  const userCat = getMoodCategory(userMood);
  const partnerCat = getMoodCategory(partnerMood);

  if (userCat === "positive" && partnerCat === "positive") {
    return "You're both in a good place. Celebrate it—share appreciation or do something light and fun together.";
  }

  if ((userCat === "positive" && partnerCat === "negative") || (userCat === "negative" && partnerCat === "positive")) {
    return "Different vibes today. The calmer partner can listen and support; the stressed partner can share what they need.";
  }

  if (userCat === "negative" && partnerCat === "negative") {
    return "Both running low. Be gentle, keep plans low-pressure, and do something soothing together.";
  }

  if (userCat === "neutral" && partnerCat === "neutral") {
    return "Steady but flat—try sharing one good thing from today or plan a small treat to lift the mood.";
  }

  return "Check in with each other: ask what would feel supportive right now. Small gestures go a long way.";
}

/**
 * Get emoji-free mood label
 */
export function getMoodLabel(level: MoodLevel | null | undefined): string {
  if (!level) return "No check-in yet";
  
  const labels: Record<MoodLevel, string> = {
    1: "Very low",
    2: "Low",
    3: "Neutral",
    4: "Good",
    5: "Very good",
  };
  
  return labels[level];
}

/**
 * Get emotion icon name (Ionicons)
 */
export function getEmotionIcon(emotion: EmotionLabel | null | undefined): string {
  if (!emotion) return "help-circle-outline";
  
  const iconMap: Record<EmotionLabel, string> = {
    happy: "happy-outline",
    excited: "sparkles-outline",
    calm: "leaf-outline",
    loved: "heart-outline",
    tired: "bed-outline",
    stressed: "cloud-outline",
    anxious: "alert-circle-outline",
    sad: "sad-outline",
    frustrated: "warning-outline",
    content: "checkmark-circle-outline",
  };
  
  return iconMap[emotion];
}

/**
 * Get energy level icon (battery metaphor)
 */
export function getEnergyIcon(energy: EnergyLevel | null | undefined): string {
  if (!energy) return "battery-half-outline";
  
  const iconMap: Record<EnergyLevel, string> = {
    low: "battery-dead-outline",
    medium: "battery-half-outline",
    high: "battery-full-outline",
  };
  
  return iconMap[energy];
}
