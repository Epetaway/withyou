import React, { useEffect, useState } from "react";
import { View, StyleSheet, Pressable, Dimensions, ScrollView } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { CONTENT, DashboardResponse, Note, NoteType, NotesResponse } from "@withyou/shared";
import { Screen } from "../../ui/components/Screen";
import { Text } from "../../ui/components/Text";
import { clearSession } from "../../state/session";
import { api } from "../../state/appState";
import { useTheme } from "../../ui/theme/ThemeProvider";
import { TextField } from "../../ui/components/TextField";

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

export function DashboardScreen({ navigation }: DashboardScreenProps) {
  const theme = useTheme();
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [userMood, setUserMood] = useState<number | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteType, setNoteType] = useState<NoteType>("TEXT");
  const [noteContent, setNoteContent] = useState("");
  const [noteMediaUrl, setNoteMediaUrl] = useState("");
  const [noteSubmitting, setNoteSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [_errorText, setErrorText] = useState("");

  const partnerMood = dashboard?.partnerLastCheckIn?.mood_level ?? null;
  const moodTip = getMoodTip(userMood, partnerMood);
  const blendedColors = [getMoodColor(userMood ?? 3), getMoodColor(partnerMood ?? 3)];

  const submitNote = async () => {
    if (noteSubmitting) return;

    if (noteType === "TEXT" && !noteContent.trim()) return;
    if (noteType !== "TEXT" && !noteMediaUrl.trim()) return;

    try {
      setNoteSubmitting(true);
      const payload = {
        type: noteType,
        content: noteContent.trim() || undefined,
        media_url: noteType === "TEXT" ? undefined : noteMediaUrl.trim(),
      };

      const res = await api.request<{ note: Note }>("/notes", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setNotes((prev) => [res.note, ...prev].slice(0, 10));
      setNoteContent("");
      setNoteMediaUrl("");
      setNoteType("TEXT");
    } finally {
      setNoteSubmitting(false);
    }
  };

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
                  <Text style={styles.cardLocation}>
                    {userMood ? CONTENT.checkIn.create.moodLabels[userMood as 1 | 2 | 3 | 4 | 5] : "No check-in yet"}
                  </Text>
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
                  <Text style={styles.cardLocation}>
                    {dashboard?.partnerLastCheckIn
                      ? CONTENT.checkIn.create.moodLabels[dashboard.partnerLastCheckIn.mood_level]
                      : dashboard?.relationshipStage
                        ? "Waiting for check-in"
                        : "Not paired"}
                  </Text>
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

      {/* Mood board */}
      <View style={[styles.section, styles.moodBoard]}>
        <View style={styles.sectionHeader}>
          <Text variant="sectionLabel" style={{ color: theme.colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5 }}>MOOD BOARD</Text>
          <Text variant="helper" style={{ color: theme.colors.textSecondary }}>
            Updated after both check-ins
          </Text>
        </View>

        <View style={styles.moodPairRow}>
          <View style={styles.moodPill}>
            <View style={[styles.moodDot, { backgroundColor: userMood ? getMoodColor(userMood) : theme.colors.border }]} />
            <View>
              <Text variant="helper" style={{ color: theme.colors.textSecondary }}>You</Text>
              <Text variant="body" style={{ color: theme.colors.text }}>
                {userMood ? CONTENT.checkIn.create.moodLabels[userMood as 1 | 2 | 3 | 4 | 5] : "No check-in"}
              </Text>
            </View>
          </View>

          <View style={styles.moodPill}>
            <View style={[styles.moodDot, { backgroundColor: partnerMood ? getMoodColor(partnerMood) : theme.colors.border }]} />
            <View>
              <Text variant="helper" style={{ color: theme.colors.textSecondary }}>Partner</Text>
              <Text variant="body" style={{ color: theme.colors.text }}>
                {partnerMood
                  ? CONTENT.checkIn.create.moodLabels[partnerMood as 1 | 2 | 3 | 4 | 5]
                  : dashboard?.relationshipStage
                    ? "Waiting for check-in"
                    : "Not paired"}
              </Text>
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
          <View style={[styles.tipCard, { backgroundColor: theme.colors.primary + "10" }]}> 
            <FontAwesome6 name="lightbulb" size={16} color={theme.colors.primary} weight="solid" style={{ marginRight: 8 }} />
            <Text variant="body" style={{ color: theme.colors.text, flex: 1 }}>
              {moodTip}
            </Text>
          </View>
        ) : (
          <Text variant="helper" style={{ color: theme.colors.textSecondary }}>
            Waiting for both check-ins to blend moods.
          </Text>
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
          onPress={() => {
            setNoteType("TEXT");
            setNoteMediaUrl("");
          }}
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

        {/* Composer */}
        <View style={[styles.noteComposer, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}> 
          <View style={styles.noteTypeRow}>
            {["TEXT", "VOICE", "VIDEO"].map((type) => (
              <Pressable
                key={type}
                onPress={() => setNoteType(type as NoteType)}
                style={[
                  styles.noteTypePill,
                  {
                    backgroundColor: noteType === type ? theme.colors.primary + "20" : theme.colors.background,
                    borderColor: noteType === type ? theme.colors.primary : theme.colors.border,
                  },
                ]}
              >
                <Text variant="helper" style={{ color: noteType === type ? theme.colors.primary : theme.colors.textSecondary }}>
                  {type === "TEXT" ? "Text" : type === "VOICE" ? "Voice" : "Video"}
                </Text>
              </Pressable>
            ))}
          </View>

          <TextField
            value={noteContent}
            onChangeText={setNoteContent}
            placeholder={noteType === "TEXT" ? "Type a short note" : "Add a caption (optional)"}
            multiline
            numberOfLines={noteType === "TEXT" ? 3 : 2}
          />

          {noteType !== "TEXT" ? (
            <TextField
              value={noteMediaUrl}
              onChangeText={setNoteMediaUrl}
              placeholder={noteType === "VOICE" ? "Voice clip URL" : "Video clip URL"}
              autoCapitalize="none"
            />
          ) : null}

          <Pressable
            style={[
              styles.sendNoteButton,
              { backgroundColor: theme.colors.primary },
              noteSubmitting && { opacity: 0.6 },
            ]}
            disabled={noteSubmitting}
            onPress={submitNote}
          >
            <FontAwesome6 name="paper-plane" size={16} color={theme.colors.background} weight="solid" />
            <Text style={{ color: theme.colors.background, fontWeight: "700", marginLeft: 8 }}>
              {noteSubmitting ? CONTENT.app.common.loading : "Send"}
            </Text>
          </Pressable>
        </View>

        {/* Notes feed - Card Grid */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.notesScroll}>
          {/* Add note card */}
          <Pressable 
            style={[styles.noteCard, styles.addNoteCard, { borderColor: theme.colors.border }]}
            onPress={() => {
              setNoteType("TEXT");
              setNoteMediaUrl("");
            }}
          >
            <FontAwesome6 name="plus" size={32} color={theme.colors.primary} weight="light" />
            <Text style={[styles.addNoteText, { color: theme.colors.textSecondary }]}>Send a note</Text>
          </Pressable>

          {/* Note cards */}
          {notes.map((note) => {
            let bgColor = "#FEF3C7"; // yellow for TEXT
            if (note.type === "VOICE") bgColor = "#DBEAFE"; // light blue
            if (note.type === "VIDEO") bgColor = "#F5D4FF"; // light purple
            
            return (
              <View key={note.id} style={[styles.noteCard, { backgroundColor: bgColor }]}>
                <View style={{ flex: 1 }}>
                  <Text 
                    variant="body" 
                    style={{ color: "#1F2937", fontWeight: "600", marginBottom: 8 }}
                    numberOfLines={3}
                  >
                    {note.content || (note.type === "VOICE" ? "🎤 Voice note" : "🎥 Video note")}
                  </Text>
                </View>
                <Text variant="helper" style={{ color: "#6B7280" }}>
                  {new Date(note.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            );
          })}
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
  moodBoard: {
    gap: 12,
  },
  moodPairRow: {
    flexDirection: 'row',
    gap: 12,
  },
  moodPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  moodDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  blendBar: {
    height: 12,
    borderRadius: 999,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    borderRadius: 12,
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
    paddingVertical: 4,
  },
  noteCard: {
    width: 160,
    height: 140,
    borderRadius: 16,
    padding: 14,
    justifyContent: 'space-between',
    minWidth: 160,
  },
  addNoteCard: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addNoteText: {
    fontSize: 13,
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
  noteComposer: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  noteTypeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  noteTypePill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
  },
  sendNoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
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
