import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { useTheme } from "../../theme/ThemeProvider";
import { api } from "../../state/appState";
import type { WorkoutGoal } from "@withyou/shared";

type WorkoutGoalsStackParamList = {
  WorkoutGoals: undefined;
  WorkoutGoalDetail: { goalId: string };
  WorkoutGoalCreate: undefined;
};

export function WorkoutGoalsScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp<WorkoutGoalsStackParamList>>();
  const [goals, setGoals] = useState<WorkoutGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchGoals = async () => {
    try {
      const response = await api.request<{ goals: WorkoutGoal[]; count: number }>(
        "/workouts/goals",
        { method: "GET" }
      );
      setGoals(response.goals);
    } catch (error) {
      const err = error as { message?: string };
      Alert.alert("Error", err.message || "Failed to load workout goals");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchGoals();
  };

  const renderGoalCard = (goal: WorkoutGoal) => {
    const isCouple = !!goal.relationshipId;
    const isActive = goal.status === "active";
    const progressPercent = goal.userProgress || 0;
    const partnerProgressPercent = goal.partnerProgress || 0;

    return (
      <Pressable
        key={goal.id}
        style={[styles.goalCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
        onPress={() => navigation.navigate("WorkoutGoalDetail", { goalId: goal.id })}
      >
        <View style={styles.goalHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.goalTitle, { color: theme.colors.text }]}>{goal.title}</Text>
            {goal.description && (
              <Text style={[styles.goalDescription, { color: theme.colors.text2 }]} numberOfLines={2}>
                {goal.description}
              </Text>
            )}
          </View>
          <View style={[styles.statusBadge, { backgroundColor: isActive ? "#10B981" : "#6B7280" }]}>
            <Text style={styles.statusText}>{goal.status}</Text>
          </View>
        </View>

        <View style={styles.goalMeta}>
          <View style={styles.metaItem}>
            <FontAwesome6 name="bullseye" size={14} color={theme.colors.text2} />
            <Text style={[styles.metaText, { color: theme.colors.text2 }]}>
              Target: {goal.targetValue} {goal.targetMetric}
            </Text>
          </View>
          {isCouple && (
            <View style={styles.metaItem}>
              <FontAwesome6 name="users" size={14} color={theme.colors.primary} />
              <Text style={[styles.metaText, { color: theme.colors.primary }]}>Couple Challenge</Text>
            </View>
          )}
        </View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressLabel, { color: theme.colors.text }]}>Your Progress</Text>
            <Text style={[styles.progressPercent, { color: theme.colors.primary }]}>
              {Math.round(progressPercent)}%
            </Text>
          </View>
          <View style={[styles.progressBarBg, { backgroundColor: theme.colors.border }]}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${progressPercent}%`, backgroundColor: theme.colors.primary },
              ]}
            />
          </View>
        </View>

        {isCouple && (
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={[styles.progressLabel, { color: theme.colors.text }]}>Partner Progress</Text>
              <Text style={[styles.progressPercent, { color: "#F59E0B" }]}>
                {Math.round(partnerProgressPercent)}%
              </Text>
            </View>
            <View style={[styles.progressBarBg, { backgroundColor: theme.colors.border }]}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${partnerProgressPercent}%`, backgroundColor: "#F59E0B" },
                ]}
              />
            </View>
          </View>
        )}

        {goal.bets && goal.bets.length > 0 && (
          <View style={[styles.betBadge, { backgroundColor: "#FEF3C7", borderColor: "#F59E0B" }]}>
            <FontAwesome6 name="trophy" size={14} color="#F59E0B" />
            <Text style={[styles.betText, { color: "#92400E" }]}>
              Bet: {goal.bets[0].wagerDescription}
            </Text>
          </View>
        )}
      </Pressable>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Workout Goals</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Workout Goals</Text>
        <Pressable
          style={[styles.createButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.navigate("WorkoutGoalCreate")}
        >
          <FontAwesome6 name="plus" size={20} color="#FFFFFF" />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        {goals.length === 0 ? (
          <View style={styles.emptyState}>
            <FontAwesome6 name="dumbbell" size={64} color={theme.colors.text2} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Goals Yet</Text>
            <Text style={[styles.emptyDescription, { color: theme.colors.text2 }]}>
              Create your first workout goal or couple challenge
            </Text>
            <Pressable
              style={[styles.createButtonLarge, { backgroundColor: theme.colors.primary }]}
              onPress={() => navigation.navigate("WorkoutGoalCreate")}
            >
              <Text style={styles.createButtonText}>Create Goal</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {goals.filter(g => g.status === "active").length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Active Goals</Text>
                {goals.filter(g => g.status === "active").map(renderGoalCard)}
              </View>
            )}

            {goals.filter(g => g.status === "completed").length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Completed</Text>
                {goals.filter(g => g.status === "completed").map(renderGoalCard)}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
  },
  createButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  goalCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  goalDescription: {
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  goalMeta: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 14,
  },
  progressSection: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: "600",
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  betBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    marginTop: 8,
  },
  betText: {
    fontSize: 13,
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
  },
  createButtonLarge: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
