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
const CARD_WIDTH = (width - 60) / 2;

type DashboardScreenProps = {
  navigation: unknown;
};

const dateIdeas = [
  { id: 1, title: "Romantic Dinner", emoji: "🍷", category: "Food", image: "restaurant" },
  { id: 2, title: "Movie Night", emoji: "🎬", category: "Entertainment", image: "film" },
  { id: 3, title: "Hiking Adventure", emoji: "⛰️", category: "Outdoor", image: "trail" },
  { id: 4, title: "Cook Together", emoji: "👨‍🍳", category: "Home", image: "cooking" },
  { id: 5, title: "Game Night", emoji: "🎮", category: "Fun", image: "games" },
  { id: 6, title: "Spa Day", emoji: "💆", category: "Relaxation", image: "spa" },
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
  const [errorText, setErrorText] = useState("");

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
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.appTitle, { color: theme.colors.text }]}>WithYou</Text>
          <Pressable onPress={clearSession}>
            <FontAwesome6 name="right-from-bracket" size={24} color={theme.colors.text} weight="bold" />
          </Pressable>
        </View>

        {/* Couple Profile Cards - Side by Side */}
        <View style={styles.coupleSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Your Connection</Text>
          <View style={styles.coupleCards}>
            {/* User Card */}
            <View style={[styles.profileCard, { backgroundColor: theme.colors.surface }]}>
              <View style={[styles.profileImagePlaceholder, { backgroundColor: '#E9D5FF' }]}>
                <FontAwesome6 name="user" size={40} color="#A78BFA" weight="bold" />
              </View>
              <Text style={[styles.profileName, { color: theme.colors.text }]}>You</Text>
              <View style={styles.statusBadge}>
                <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
                <Text style={styles.statusText}>Active</Text>
              </View>
            </View>

            {/* Partner Card - Mood Ring */}
            <View style={[styles.profileCard, { 
              backgroundColor: theme.colors.surface,
              borderWidth: 3,
              borderColor: dashboard?.partnerLastCheckIn ? getMoodColor(dashboard.partnerLastCheckIn.mood_level) : '#D1D5DB'
            }]}>
              <View style={[styles.profileImagePlaceholder, { backgroundColor: '#FED7AA' }]}>
                <FontAwesome6 name="user" size={40} color="#F97316" weight="bold" />
              </View>
              <Text style={[styles.profileName, { color: theme.colors.text }]}>Partner</Text>
              <View style={styles.statusBadge}>
                <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
                <Text style={styles.statusText}>Active</Text>
              </View>
            </View>
          </View>

          {/* Relationship Stage */}
          {dashboard?.relationshipStage && (
            <View style={[styles.stageBadge, { backgroundColor: '#EDE9FE' }]}>
              <FontAwesome6 name="heart" size={16} color="#A78BFA" weight="solid" />
              <Text style={[styles.stageText, { color: '#7C3AED' }]}>
                {CONTENT.preferences.options.stage[dashboard.relationshipStage]}
              </Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Pressable 
            style={[styles.actionButton, { backgroundColor: '#EDE9FE' }]}
            onPress={() => (navigation as any)?.navigate?.("CheckIn")}
          >
            <FontAwesome6 name="heart" size={24} color="#7C3AED" weight="solid" />
            <Text style={[styles.actionText, { color: '#7C3AED' }]}>Check In</Text>
          </Pressable>

          <Pressable 
            style={[styles.actionButton, { backgroundColor: '#DBEAFE' }]}
            onPress={() => {}}
          >
            <FontAwesome6 name="message" size={24} color="#2563EB" weight="solid" />
            <Text style={[styles.actionText, { color: '#2563EB' }]}>Send Note</Text>
          </Pressable>
        </View>

        {/* Private Notes Section */}
        <View style={styles.notesSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Private Notes</Text>
            <Pressable>
              <Text style={[styles.viewAll, { color: theme.colors.primary }]}>View all</Text>
            </Pressable>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.notesScroll}
          >
            {/* Add Note Card */}
            <Pressable style={[styles.noteCard, styles.addNoteCard, { borderColor: theme.colors.border }]}>
              <FontAwesome6 name="plus-circle" size={32} color={theme.colors.primary} weight="solid" />
              <Text style={[styles.addNoteText, { color: theme.colors.text2 }]}>Send a note</Text>
            </Pressable>

            {/* Example Notes */}
            <View style={[styles.noteCard, { backgroundColor: '#FEF3C7' }]}>
              <Text style={styles.noteEmoji}>💌</Text>
              <Text style={styles.notePreview}>Love you!</Text>
              <Text style={styles.noteTime}>2h ago</Text>
            </View>

            <View style={[styles.noteCard, { backgroundColor: '#DBEAFE' }]}>
              <FontAwesome6 name="microphone" size={24} color="#2563EB" weight="solid" />
              <Text style={styles.notePreview}>Voice note</Text>
              <Text style={styles.noteTime}>1d ago</Text>
            </View>
          </ScrollView>
        </View>

        {/* Explore Date Ideas */}
        <View style={styles.exploreSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Explore Ideas</Text>
            <Pressable onPress={() => (navigation as any)?.navigate?.("Ideas")}>
              <Text style={[styles.viewAll, { color: theme.colors.primary }]}>View all</Text>
            </Pressable>
          </View>

          <View style={styles.ideasGrid}>
            {dateIdeas.slice(0, 4).map((idea) => (
              <Pressable 
                key={idea.id}
                style={[styles.ideaCard, { backgroundColor: theme.colors.surface }]}
              >
                <View style={styles.ideaImagePlaceholder}>
                  <Text style={styles.ideaEmoji}>{idea.emoji}</Text>
                </View>
                <View style={styles.ideaContent}>
                  <Text style={[styles.ideaCategory, { color: theme.colors.primary }]}>
                    {idea.category}
                  </Text>
                  <Text style={[styles.ideaTitle, { color: theme.colors.text }]} numberOfLines={2}>
                    {idea.title}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  coupleSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  coupleCards: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  profileCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F0FDF4',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '500',
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
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  notesSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  notesScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  noteCard: {
    width: 140,
    height: 140,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'space-between',
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
  },
  noteEmoji: {
    fontSize: 32,
  },
  notePreview: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  noteTime: {
    fontSize: 11,
    color: '#6B7280',
  },
  checkInSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  moodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  moodIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  moodTime: {
    fontSize: 12,
    marginTop: 4,
  },
  exploreSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  ideasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  ideaCard: {
    width: CARD_WIDTH,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  ideaImagePlaceholder: {
    width: '100%',
    height: 100,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ideaEmoji: {
    fontSize: 40,
  },
  ideaContent: {
    padding: 12,
  },
  ideaCategory: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  ideaTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
});
