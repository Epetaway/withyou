import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, Pressable, RefreshControl } from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { DashboardResponse, Note, NotesResponse, MoodLevel } from "@withyou/shared";
import { ThemedText } from "../../components/ThemedText";
import { HeroHeader } from "../../components/dashboard/HeroHeader";
import { MoodBoardCard } from "../../components/dashboard/MoodBoardCard";
import { DateIdeasCarousel } from "../../components/dashboard/DateIdeasCarousel";
import { NearYouMapPreview } from "../../components/dashboard/NearYouMapPreview";
import { PrivateNotesPreview } from "../../components/dashboard/PrivateNotesPreview";
import { useTheme } from "../../theme/ThemeProvider";
import { getMoodGuidance } from "../../lib/mood";
import { api } from "../../state/appState";

type PairedStackParamList = {
  Dashboard: undefined;
  CheckIn: undefined;
  Ideas: undefined;
  Preferences: undefined;
  Settings: undefined;
  LocalMap: undefined;
  NoteCompose: undefined;
  NotesList: undefined;
};

// Mock date ideas - replace with API call
const mockDateIdeas = [
  {
    id: "1",
    title: "Movie Night",
    category: "Entertainment",
    imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400",
    distance: "2 mi",
    priceLevel: "$$",
    timeEstimate: "2h",
  },
  {
    id: "2",
    title: "Cozy Dinner",
    category: "Food",
    imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400",
    distance: "5 mi",
    priceLevel: "$$$",
    timeEstimate: "2h",
  },
  {
    id: "3",
    title: "Hiking Adventure",
    category: "Outdoor",
    imageUrl: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=400",
    distance: "12 mi",
    priceLevel: "$",
    timeEstimate: "3h",
  },
  {
    id: "4",
    title: "Spa Day",
    category: "Relaxation",
    imageUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400",
    distance: "3 mi",
    priceLevel: "$$$",
    timeEstimate: "3h",
  },
];

export function DashboardScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<PairedStackParamList>>();

  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [userMood, setUserMood] = useState<MoodLevel | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [dashRes, checkinRes, notesRes] = await Promise.all([
        api.request<DashboardResponse>("/dashboard"),
        api.request<{ checkins: Array<{ moodLevel: number; createdAt: string }> }>("/checkins?limit=1"),
        api.request<NotesResponse>("/notes?limit=10"),
      ]);

      setDashboard(dashRes);
      if (checkinRes.checkins?.length) {
        setUserMood(checkinRes.checkins[0].moodLevel as MoodLevel);
      }
      setNotes(notesRes.notes ?? []);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const partnerMood = dashboard?.partnerLastCheckIn?.mood_level ?? null;
  const guidance = getMoodGuidance(userMood, partnerMood);
  const userHasCheckedIn = !!userMood;

  const relationshipStageLabel = dashboard?.relationshipStage
    ? dashboard.relationshipStage.charAt(0).toUpperCase() + dashboard.relationshipStage.slice(1)
    : undefined;

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ThemedText variant="body" color="secondary">
          Loading...
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Hero Header */}
        <HeroHeader
          relationshipStage={relationshipStageLabel}
          userMood={userMood}
          partnerMood={partnerMood}
          onGalleryPress={() => {
            // TODO: Navigate to gallery selector
          }}
          onSettingsPress={() => navigation.navigate("Settings")}
        />

        {/* Mood Board Card */}
        <MoodBoardCard
          userMood={userMood}
          partnerMood={partnerMood}
          guidance={guidance}
          userHasCheckedIn={userHasCheckedIn}
        />

        {/* Primary CTAs */}
        <View style={styles.ctaRow}>
          <Pressable
            style={[styles.ctaButton, { backgroundColor: theme.colors.primary, flex: 1 }]}
            onPress={() => navigation.navigate("CheckIn")}
            accessibilityLabel="Check in with your mood"
          >
            <Ionicons name="heart" size={20} color="#FFFFFF" />
            <ThemedText variant="caption" style={{ color: "#FFFFFF", marginLeft: 8 }}>
              Check in
            </ThemedText>
          </Pressable>

          <View style={{ width: 12 }} />

          <Pressable
            style={[styles.ctaButton, { backgroundColor: theme.colors.surfaceAlt, flex: 1 }]}
            onPress={() => navigation.navigate("NoteCompose")}
            accessibilityLabel="Send a note to your partner"
          >
            <Ionicons name="paper-plane-outline" size={20} color={theme.colors.primary} />
            <ThemedText variant="caption" style={{ color: theme.colors.primary, marginLeft: 8 }}>
              Send note
            </ThemedText>
          </Pressable>
        </View>

        {/* Date Ideas Carousel */}
        <DateIdeasCarousel
          ideas={mockDateIdeas}
          onIdeaPress={(id) => {
            console.log("Idea pressed:", id);
            navigation.navigate("Ideas");
          }}
          onSeeAllPress={() => navigation.navigate("Ideas")}
        />

        {/* Near You Map Preview */}
        <NearYouMapPreview
          onOpenMapPress={() => navigation.navigate("LocalMap")}
          onFiltersPress={() => {
            // TODO: Open filters modal
          }}
          hasLocationPermission={true}
          onEnableLocationPress={() => {
            // TODO: Request location permission
          }}
        />

        {/* Private Notes Preview */}
        <PrivateNotesPreview
          notes={notes}
          onCreateNotePress={() => navigation.navigate("NoteCompose")}
          onViewAllPress={() => navigation.navigate("NotesList")}
          onNotePress={(noteId) => {
            console.log("Note pressed:", noteId);
          }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  ctaRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginTop: 20,
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    minHeight: 48,
  },
});
