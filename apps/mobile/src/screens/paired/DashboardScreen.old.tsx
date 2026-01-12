import React, { useEffect, useState } from "react";
import { View, StyleSheet, Pressable, ScrollView, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
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
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.appTitle, { color: theme.colors.text }]}>WithYou</Text>
          <Pressable onPress={clearSession}>
            <Ionicons name="log-out-outline" size={24} color={theme.colors.text} />
          </Pressable>
        </View>

        {/* Couple Profile Cards - Side by Side */}
        <View style={styles.coupleSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Your Connection</Text>
          <View style={styles.coupleCards}>
            {/* User Card */}
            <View style={[styles.profileCard, { backgroundColor: theme.colors.surface }]}>
              <View style={[styles.profileImagePlaceholder, { backgroundColor: '#E9D5FF' }]}>
                <Ionicons name="person" size={40} color="#A78BFA" />
              </View>
              <Text style={[styles.profileName, { color: theme.colors.text }]}>You</Text>
              <View style={styles.statusBadge}>
                <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
                <Text style={styles.statusText}>Active</Text>
              </View>
            </View>

            {/* Partner Card */}
            <View style={[styles.profileCard, { backgroundColor: theme.colors.surface }]}>
              <View style={[styles.profileImagePlaceholder, { backgroundColor: '#FED7AA' }]}>
                <Ionicons name="person" size={40} color="#F97316" />
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
              <Ionicons name="heart" size={16} color="#A78BFA" />
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
            <Ionicons name="heart-circle" size={24} color="#7C3AED" />
            <Text style={[styles.actionText, { color: '#7C3AED' }]}>Check In</Text>
          </Pressable>

          <Pressable 
            style={[styles.actionButton, { backgroundColor: '#DBEAFE' }]}
            onPress={() => {}}
          >
            <Ionicons name="chatbubble-ellipses" size={24} color="#2563EB" />
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
              <Ionicons name="add-circle" size={32} color={theme.colors.primary} />
              <Text style={[styles.addNoteText, { color: theme.colors.text2 }]}>Send a note</Text>
            </Pressable>

            {/* Example Notes */}
            <View style={[styles.noteCard, { backgroundColor: '#FEF3C7' }]}>
              <Text style={styles.noteEmoji}>💌</Text>
              <Text style={styles.notePreview}>Love you!</Text>
              <Text style={styles.noteTime}>2h ago</Text>
            </View>

            <View style={[styles.noteCard, { backgroundColor: '#DBEAFE' }]}>
              <Ionicons name="mic" size={24} color="#2563EB" />
              <Text style={styles.notePreview}>Voice note</Text>
              <Text style={styles.noteTime}>1d ago</Text>
            </View>
          </ScrollView>
        </View>

        {/* Partner's Latest Check-in */}
        {dashboard?.partnerLastCheckIn && (
          <View style={styles.checkInSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Partner's Mood</Text>
            <View style={[styles.moodCard, { backgroundColor: theme.colors.surface }]}>
              <View style={styles.moodIconContainer}>
                <Ionicons
                  name={
                    dashboard.partnerLastCheckIn.mood_level === 5
                      ? "heart"
                      : dashboard.partnerLastCheckIn.mood_level === 4
                      ? "happy"
                      : dashboard.partnerLastCheckIn.mood_level === 3
                      ? "ellipse"
                      : dashboard.partnerLastCheckIn.mood_level === 2
                      ? "remove-circle"
                      : "sad"
                  }
                  size={32}
                  color="#A78BFA"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.moodLabel, { color: theme.colors.text }]}>
                  {CONTENT.checkIn.create.moodLabels[dashboard.partnerLastCheckIn.mood_level]}
                </Text>
                <Text style={[styles.moodTime, { color: theme.colors.text2 }]}>
                  {new Date(dashboard.partnerLastCheckIn.timestamp).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>
        )}

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
                  name={
                    dashboard.partnerLastCheckIn.mood_level === 5
                      ? "heart-outline"
                      : dashboard.partnerLastCheckIn.mood_level === 4
                      ? "happy-outline"
                      : dashboard.partnerLastCheckIn.mood_level === 3
                      ? "ellipse-outline"
                      : dashboard.partnerLastCheckIn.mood_level === 2
                      ? "remove-circle-outline"
                      : "sad-outline"
                  }
                  size={22}
                  color={theme.primary}
                />
                <View style={{ marginLeft: Spacing.sm }}>
                  <Text style={[styles.value2, { color: theme.text }]}>
                    {
                      CONTENT.checkIn.create
                        .moodLabels[dashboard.partnerLastCheckIn.mood_level]
                    }
                  </Text>
                  <Text style={[styles.meta, { color: theme.text2 }]}>
                    {new Date(
                      dashboard.partnerLastCheckIn.timestamp
                    ).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </Card>
          </Section>
        ) : (
          <Section title="Partner check-in" subtitle="Latest shared update">
            <Card>
              <Text variant="body" style={{ color: theme.text2 }}>
                {CONTENT.dashboard.paired.empty.noSharedCheckIns}
              </Text>
            </Card>
          </Section>
        )}

        {/* Action Buttons */}
        <View style={{ gap: Spacing.sm, marginTop: Spacing.md }}>
          <Button
            label={CONTENT.dashboard.paired.actions.newCheckIn}
            onPress={() =>
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (navigation as any)?.navigate?.("CheckIn")
            }
            variant="primary"
          />
          <Button
            label={CONTENT.dashboard.paired.actions.updatePreferences}
            onPress={() =>
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (navigation as any)?.navigate?.("Preferences")
            }
            variant="secondary"
          />
          <Button
            label={CONTENT.dashboard.paired.actions.getIdeas}
            onPress={() =>
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (navigation as any)?.navigate?.("Ideas")
            }
            variant="secondary"
          />
          <Button
            label="Logout"
            onPress={handleLogout}
            variant="secondary"
          />
        </View>
    </Screen>
  );
}


const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 20,
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

