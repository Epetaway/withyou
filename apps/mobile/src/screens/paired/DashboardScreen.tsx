import React, { useEffect, useState } from "react";
import { View, StyleSheet, Pressable, ScrollView, Dimensions } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import { CONTENT, DashboardResponse } from "@withyou/shared";
import { Screen } from "../../ui/components/Screen";
import { Text } from "../../ui/components/Text";
import { clearSession } from "../../state/session";
import { api } from "../../state/appState";
import { useTheme } from "../../ui/theme/ThemeProvider";

const { width } = Dimensions.get('window');
const _CARD_WIDTH = (width - 60) / 2;

type DashboardScreenProps = {
  navigation: unknown;
};

const dateIdeas = [
  { id: 1, title: "Romantic Dinner", icon: "utensils", category: "Food", image: "restaurant" },
  { id: 2, title: "Movie Night", icon: "film", category: "Entertainment", image: "film" },
  { id: 3, title: "Hiking Adventure", icon: "tree", category: "Outdoor", image: "trail" },
  { id: 4, title: "Cook Together", icon: "fire", category: "Home", image: "cooking" },
  { id: 5, title: "Game Night", icon: "gamepad", category: "Fun", image: "games" },
  { id: 6, title: "Spa Day", icon: "spa", category: "Relaxation", image: "spa" },
];

// Mood ring color mapping based on mood level (1-5)
function getMoodColor(moodLevel: number): string {
  switch (moodLevel) {
    case 5:
      return "#A78BFA"; // Purple - very good/happy
    case 4:
      return "#22C55E"; // Green - good
    case 3:
      return "#EAB308"; // Yellow - neutral
    case 2:
      return "#F97316"; // Orange - low
    case 1:
      return "#EF4444"; // Red - very low/sad
    default:
      return "#D1D5DB"; // Gray - no mood set
  }
}

export function DashboardScreen({ navigation }: DashboardScreenProps) {
  const theme = useTheme();
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [_errorText, setErrorText] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setErrorText("");
        const res = await api.request<DashboardResponse>("/dashboard");
        setDashboard(res);
      } catch (err) {
        if (err instanceof Error) {
          setErrorText(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <Screen>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text variant="body">{CONTENT.app.common.loading}</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen scrollable>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text variant="screenTitle">Home</Text>
        <Pressable onPress={clearSession}>
          <FontAwesome6 name="right-from-bracket" size={24} color={theme.colors.text} weight="bold" />
        </Pressable>
      </View>

      {/* Connection Card */}
      <View style={styles.section}>
        <View style={styles.coupleCards}>
          {/* User Card */}
          <Pressable style={[styles.largeProfileCard, { backgroundColor: theme.colors.primary }]}>
            <View style={styles.cardContent}>
              <View style={styles.cardBottom}>
                <View>
                  <Text style={styles.cardName}>You</Text>
                  <Text style={styles.cardLocation}>Active now</Text>
                </View>
                <View style={styles.moodRing} />
              </View>
            </View>
          </Pressable>

          {/* Partner Card - with Mood Ring */}
          <Pressable 
            style={[
              styles.largeProfileCard, 
              { 
                backgroundColor: theme.colors.error || '#D946EF',
                borderWidth: dashboard?.partnerLastCheckIn ? 3 : 0,
                borderColor: dashboard?.partnerLastCheckIn ? getMoodColor(dashboard.partnerLastCheckIn.mood_level) : 'transparent'
              }
            ]}
          >
            <View style={styles.cardContent}>
              <View style={styles.cardBottom}>
                <View>
                  <Text style={styles.cardName}>Partner</Text>
                  <Text style={styles.cardLocation}>Active now</Text>
                </View>
                <View style={styles.moodRing} />
              </View>
            </View>
          </Pressable>
        </View>

        {/* Relationship Stage */}
        {dashboard?.relationshipStage && (
          <View style={[styles.stageBadge, { backgroundColor: theme.colors.primary + "20" }]}>
            <FontAwesome6 name="heart" size={16} color={theme.colors.primary} weight="solid" />
            <Text style={[styles.stageText, { color: theme.colors.primary }]}>
              {CONTENT.preferences.options.stage[dashboard.relationshipStage]}
            </Text>
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.actionRow}>
        <Pressable 
          style={[styles.actionButton, { backgroundColor: theme.colors.primary + "20" }]}
          onPress={() => (navigation as Record<string, unknown>)?.navigate?.("CheckIn")}
        >
          <FontAwesome6 name="heart" size={20} color={theme.colors.primary} weight="solid" />
          <Text style={[styles.actionText, { color: theme.colors.primary }]}>Check In</Text>
        </Pressable>

        <Pressable 
          style={[styles.actionButton, { backgroundColor: theme.colors.secondary + "20" }]}
          onPress={() => {}}
        >
          <FontAwesome6 name="message" size={20} color={theme.colors.secondary} weight="solid" />
          <Text style={[styles.actionText, { color: theme.colors.secondary }]}>Send Note</Text>
        </Pressable>
      </View>

      {/* Notes Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text variant="sectionLabel" style={{ color: theme.colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5 }}>NOTES</Text>
          <Pressable>
            <Text variant="helper" style={{ color: theme.colors.primary }}>View all</Text>
          </Pressable>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.notesScroll}
        >
          {/* Add Note Card */}
          <Pressable style={[styles.noteCard, styles.addNoteCard, { borderColor: theme.colors.secondary }]}>
            <FontAwesome6 name="plus" size={24} color={theme.colors.primary} weight="solid" />
            <Text style={[styles.addNoteText, { color: theme.colors.secondary }]}>Add note</Text>
          </Pressable>

          {/* Example Notes */}
          <View style={[styles.noteCard, { backgroundColor: "#FEF3C7" }]}>
            <Text style={styles.notePreview}>Love you!</Text>
            <Text style={styles.noteTime}>2h ago</Text>
          </View>

          <View style={[styles.noteCard, { backgroundColor: "#DBEAFE" }]}>
            <FontAwesome6 name="microphone" size={20} color="#2563EB" weight="solid" />
            <Text style={styles.notePreview}>Voice note</Text>
            <Text style={styles.noteTime}>1d ago</Text>
          </View>
        </ScrollView>
      </View>

      {/* Ideas Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text variant="sectionLabel" style={{ color: theme.colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5 }}>IDEAS</Text>
          <Pressable onPress={() => (navigation as Record<string, unknown>)?.navigate?.("Ideas")}>
            <Text variant="helper" style={{ color: theme.colors.primary }}>View all</Text>
          </Pressable>
        </View>

        <View style={styles.ideasPills}>
          {dateIdeas.slice(0, 6).map((idea) => (
            <Pressable 
              key={idea.id}
              style={[styles.ideaPill, { backgroundColor: theme.colors.primary + "20" }]}
            >
              <FontAwesome6 
                name={idea.icon as "utensils" | "film" | "tree" | "fire" | "gamepad" | "spa"}
                size={16}
                color={theme.colors.primary}
                weight="bold"
              />
              <Text style={[styles.ideaPillText, { color: theme.colors.text }]}>{idea.title}</Text>
            </Pressable>
          ))}
        </View>

        {/* Find Near Me Button */}
        <Pressable 
          style={[styles.findNearMeButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => (navigation as Record<string, unknown>)?.navigate?.("LocalMap")}
        >
          <FontAwesome6 name="map" size={18} color="#FFFFFF" weight="bold" />
          <Text style={styles.findNearMeText}>Find near me</Text>
          <FontAwesome6 name="arrow-right" size={14} color="#FFFFFF" weight="bold" />
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  coupleCards: {
    flexDirection: 'row',
    gap: 12,
  },
  largeProfileCard: {
    flex: 1,
    height: 200,
    borderRadius: 24,
    padding: 20,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  cardLocation: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  moodRing: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  stageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'center',
  },
  stageText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  notesScroll: {
    gap: 12,
  },
  noteCard: {
    width: 140,
    height: 120,
    borderRadius: 16,
    padding: 12,
    justifyContent: 'space-between',
    minWidth: 140,
  },
  addNoteCard: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addNoteText: {
    fontSize: 12,
    marginTop: 8,
    fontWeight: '600',
  },
  notePreview: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  noteTime: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
  },
  ideasPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ideaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    minHeight: 36,
  },
  ideaPillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  findNearMeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 12,
  },
  findNearMeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
