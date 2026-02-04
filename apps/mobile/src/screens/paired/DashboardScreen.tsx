import React, { useEffect, useState } from "react";
import { View, StyleSheet, Pressable, Dimensions, ScrollView, SafeAreaView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { CONTENT, DashboardResponse, Note, NotesResponse } from "@withyou/shared";
import { ThemedCard } from "../../ui/components/ThemedCard";
import { ThemedText } from "../../ui/components/ThemedText";
import { ScreenHeader } from "../../ui/components/ScreenHeader";
import { spacing } from "../../ui/tokens";
import { clearSession } from "../../state/session";
import { api } from "../../state/appState";
import { useTheme } from "../../ui/theme/ThemeProvider";

const { width } = Dimensions.get('window');
const _CARD_WIDTH = (width - 60) / 2;

type PairedStackParamList = {
  Dashboard: undefined;
  CheckIn: undefined;
  Ideas: undefined;
  Preferences: undefined;
  Settings: undefined;
  LocalMap: undefined;
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

function getMoodCategory(moodLevel: number | null): "positive" | "neutral" | "negative" | "unknown" {
  if (!moodLevel) return "unknown";
  if (moodLevel >= 4) return "positive";
  if (moodLevel === 3) return "neutral";
  return "negative";
}

function getMoodTip(userMood: number | null, partnerMood: number | null): string | null {
  if (!userMood || !partnerMood) return null;

  const userCat = getMoodCategory(userMood);
  const partnerCat = getMoodCategory(partnerMood);

  if (userCat === "positive" && partnerCat === "positive") {
    return "You’re both in a good place. Celebrate it—share appreciation or do something light and fun together.";
  }

  if ((userCat === "positive" && partnerCat === "negative") || (userCat === "negative" && partnerCat === "positive")) {
    return "Different vibes today. The calmer partner can listen and support; the stressed partner can share what they need (comfort, space, or help).";
  }

  if (userCat === "negative" && partnerCat === "negative") {
    return "Both of you are running low. Be gentle, keep plans low-pressure, and do something soothing together (walk, quiet movie, or just sit close).";
  }

  if (userCat === "neutral" && partnerCat === "neutral") {
    return "Steady but flat—try sharing one good thing from today or plan a small treat to lift the mood.";
  }

  // Mixed or unsure
  return "Check in with each other: ask what would feel supportive right now. Small gestures (a quick hug or a listening ear) go a long way.";
}

export function DashboardScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp<PairedStackParamList>>();
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [userMood, setUserMood] = useState<number | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [_errorText, setErrorText] = useState("");

  const partnerMood = dashboard?.partnerLastCheckIn?.mood_level ?? null;
  const moodTip = getMoodTip(userMood, partnerMood);
  const blendedColors = [getMoodColor(userMood ?? 3), getMoodColor(partnerMood ?? 3)];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setErrorText("");

        const [dashRes, checkinRes, notesRes] = await Promise.all([
          api.request<DashboardResponse>("/dashboard"),
          api.request<{ checkins: Array<{ moodLevel: number; createdAt: string }> }>("/checkins?limit=1"),
          api.request<NotesResponse>("/notes?limit=10"),
        ]);

        setDashboard(dashRes);
        if (checkinRes.checkins?.length) {
          setUserMood(checkinRes.checkins[0].moodLevel);
        }
        setNotes(notesRes.notes ?? []);
      } catch (err) {
        if (err instanceof Error) {
          setErrorText(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <ThemedText variant="body" color="secondary" style={{ marginTop: spacing.md }}>
            {CONTENT.app.common.loading}
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header with logout */}
        <View style={styles.headerRow}>
          <ScreenHeader title="Home" subtitle="You & your partner" />
          <Pressable onPress={clearSession} style={styles.logoutButton}>
            <Ionicons name="log-out" size={24} color={theme.colors.primary} />
          </Pressable>
        </View>

        {/* Connection Card */}
        <View style={styles.coupleCards}>
          {/* User Card */}
          <ThemedCard style={styles.profileCard} color="primary" elevation="md">
            <View style={styles.cardContent}>
              <View>
                <ThemedText variant="h2" color="secondary">You</ThemedText>
                <ThemedText variant="body" color="secondary" style={{ marginTop: spacing.sm }}>
                  {userMood ? CONTENT.checkIn.create.moodLabels[userMood as 1 | 2 | 3 | 4 | 5] : "No check-in yet"}
                </ThemedText>
              </View>
              <View style={[styles.moodRing, { borderColor: theme.colors.background }]} />
            </View>
          </ThemedCard>

          {/* Partner Card */}
          <ThemedCard 
            style={[
              styles.profileCard, 
              { borderWidth: dashboard?.partnerLastCheckIn ? 2 : 0, borderColor: getMoodColor(dashboard?.partnerLastCheckIn?.mood_level ?? 3) }
            ]} 
            color="surface" 
            elevation="md"
          >
            <View style={styles.cardContent}>
              <View>
                <ThemedText variant="h2">Partner</ThemedText>
                <ThemedText variant="body" color="secondary" style={{ marginTop: spacing.sm }}>
                  {dashboard?.partnerLastCheckIn
                    ? CONTENT.checkIn.create.moodLabels[dashboard.partnerLastCheckIn.mood_level]
                    : dashboard?.relationshipStage
                      ? "Waiting for check-in"
                      : "Not paired"}
                </ThemedText>
              </View>
              <View style={[styles.moodRing, { borderColor: theme.colors.primary }]} />
            </View>
          </ThemedCard>
        </View>

        {/* Relationship Stage */}
        {dashboard?.relationshipStage && (
          <ThemedCard style={[styles.stageBadge, { paddingHorizontal: spacing.lg, paddingVertical: spacing.md }]} color="surface">
            <Ionicons name="heart" size={16} color={theme.colors.primary} />
            <ThemedText variant="caption" color="primary" style={{ marginLeft: spacing.sm }}>
              {CONTENT.preferences.options.stage[dashboard.relationshipStage].toUpperCase()}
            </ThemedText>
          </ThemedCard>
        )}

        {/* Mood board */}
        <ThemedCard style={styles.section} color="surface" elevation="sm">
          <ThemedText variant="overline" color="secondary" style={{ marginBottom: spacing.md }}>
            MOOD BOARD
          </ThemedText>

          <View style={styles.moodPairRow}>
            <View style={[styles.moodPill, { borderColor: theme.colors.border }]}>
              <View style={[styles.moodDot, { backgroundColor: userMood ? getMoodColor(userMood) : theme.colors.border }]} />
              <View>
                <ThemedText variant="caption" color="secondary">You</ThemedText>
                <ThemedText variant="body">
                  {userMood ? CONTENT.checkIn.create.moodLabels[userMood as 1 | 2 | 3 | 4 | 5] : "No check-in"}
                </ThemedText>
              </View>
            </View>

            <View style={[styles.moodPill, { borderColor: theme.colors.border }]}>
              <View style={[styles.moodDot, { backgroundColor: partnerMood ? getMoodColor(partnerMood) : theme.colors.border }]} />
              <View>
                <ThemedText variant="caption" color="secondary">Partner</ThemedText>
                <ThemedText variant="body">
                  {partnerMood
                    ? CONTENT.checkIn.create.moodLabels[partnerMood as 1 | 2 | 3 | 4 | 5]
                    : dashboard?.relationshipStage
                      ? "Waiting for check-in"
                      : "Not paired"}
                </ThemedText>
              </View>
            </View>
          </View>

          <LinearGradient
            colors={blendedColors}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.blendBar}
          />

          {partnerMood && userMood ? (
            <View style={styles.tipCard}>
              <Ionicons name="bulb" size={16} color={theme.colors.primary} style={{ marginRight: spacing.sm }} />
              <ThemedText variant="body" style={{ flex: 1 }}>
                {moodTip}
              </ThemedText>
            </View>
          ) : (
            <ThemedText variant="caption" color="secondary">
              Waiting for both check-ins to blend moods.
            </ThemedText>
          )}
        </ThemedCard>

        {/* Quick Actions */}
        <View style={styles.actionRow}>
          <Pressable 
            style={[styles.actionButton, { backgroundColor: theme.colors.primary + "20" }]}
            onPress={() => navigation.navigate("CheckIn")}
          >
            <Ionicons name="heart" size={20} color={theme.colors.primary} />
            <ThemedText variant="body" color="primary" style={{ fontWeight: "600" }}>Check In</ThemedText>
          </Pressable>

          <Pressable 
            style={[styles.actionButton, { borderColor: theme.colors.primary, borderWidth: 1.5 }]}
            onPress={() => navigation.navigate("CheckIn")}
          >
            <Ionicons name="chatbubble" size={20} color={theme.colors.primary} />
            <ThemedText variant="body" color="primary" style={{ fontWeight: "600" }}>Send Note</ThemedText>
          </Pressable>
        </View>

        {/* Notes Section */}
        <View>
          <View style={styles.sectionHeader}>
            <ThemedText variant="overline" color="secondary">Private Notes</ThemedText>
            <Pressable onPress={() => navigation.navigate("NotesList")}>
              <ThemedText variant="caption" color="primary">View all</ThemedText>
            </Pressable>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.md }}>
            {/* Add note card */}
            <ThemedCard 
              style={styles.noteCard}
              color="surface"
              elevation="sm"
            >
              <Pressable 
                style={[StyleSheet.absoluteFill, styles.noteCardContent]}
                onPress={() => navigation.navigate("NoteCompose")}
              >
                <Ionicons name="add-circle" size={32} color={theme.colors.primary} />
                <ThemedText variant="caption" color="primary" style={{ marginTop: spacing.sm }}>Send a note</ThemedText>
              </Pressable>
            </ThemedCard>

            {/* Note cards */}
            {notes.map((note) => {
              let bgGradient: [string, string] = [theme.colors.surface, theme.colors.background];
              if (note.type === "VOICE") bgGradient = ["#DBEAFE", "#E0F2FE"];
              if (note.type === "VIDEO") bgGradient = ["#F5D4FF", "#FAE8FF"];
              
              return (
                <View key={note.id} style={styles.noteCard}>
                  <LinearGradient colors={bgGradient} style={[StyleSheet.absoluteFill, { borderRadius: 12 }]} />
                  <View style={styles.noteCardContent}>
                    <ThemedText 
                      variant="body" 
                      style={{ fontWeight: "600", marginBottom: spacing.sm }}
                      numberOfLines={3}
                    >
                      {note.content || (note.type === "VOICE" ? "🎤 Voice note" : "🎥 Video note")}
                    </ThemedText>
                    <ThemedText variant="caption" color="secondary">
                      {new Date(note.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </ThemedText>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* Ideas Section */}
        <View>
          <View style={styles.sectionHeader}>
            <ThemedText variant="overline" color="secondary">Things to do</ThemedText>
            <Pressable onPress={() => navigation.navigate("Ideas")}>
              <ThemedText variant="caption" color="primary">View all</ThemedText>
            </Pressable>
          </View>

          <View style={styles.ideasPills}>
            {dateIdeas.slice(0, 6).map((idea) => (
              <ThemedCard 
                key={idea.id}
                style={styles.ideaPill}
                color="surface"
                elevation="xs"
              >
                <Ionicons 
                  name={idea.icon as keyof typeof Ionicons.glyphMap}
                  size={16}
                  color={theme.colors.primary}
                />
                <ThemedText variant="caption">
                  {idea.title}
                </ThemedText>
              </ThemedCard>
            ))}
          </View>

          {/* Find Near Me Button */}
          <Pressable 
            style={[styles.findNearMeButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => navigation.navigate("LocalMap")}
          >
            <Ionicons name="map" size={18} color={theme.colors.background} />
            <ThemedText variant="body" color="secondary" style={{ fontWeight: "700" }}>Find near me</ThemedText>
            <Ionicons name="arrow-forward" size={14} color={theme.colors.background} />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { padding: spacing.lg, paddingBottom: 100, gap: spacing.lg },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.lg },
  logoutButton: { padding: spacing.sm },
  coupleCards: { flexDirection: "row", gap: spacing.md },
  profileCard: { flex: 1, padding: spacing.lg, minHeight: 160 },
  cardContent: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  moodRing: { width: 48, height: 48, borderRadius: 24, borderWidth: 2 },
  section: { padding: spacing.lg, gap: spacing.md },
  stageBadge: { flexDirection: "row", alignItems: "center", alignSelf: "center" },
  moodPairRow: { flexDirection: "row", gap: spacing.md, marginBottom: spacing.md },
  moodPill: { flex: 1, flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: spacing.md, borderRadius: 12, borderWidth: 1 },
  moodDot: { width: 14, height: 14, borderRadius: 7 },
  blendBar: { height: 12, borderRadius: 999, marginBottom: spacing.md },
  tipCard: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, marginTop: spacing.md },
  actionRow: { flexDirection: "row", gap: spacing.md },
  actionButton: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm, paddingVertical: spacing.md, borderRadius: 12, minHeight: 48 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.md },
  noteCard: { width: 140, height: 120, borderRadius: 12, overflow: "hidden", minWidth: 140 },
  noteCardContent: { flex: 1, padding: spacing.md, justifyContent: "space-between" },
  ideasPills: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.md },
  ideaPill: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 999 },
  findNearMeButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.md, paddingVertical: spacing.md, borderRadius: 12, minHeight: 48 },
});
