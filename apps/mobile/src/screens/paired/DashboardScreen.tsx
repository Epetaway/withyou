import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { CONTENT, DashboardResponse } from "@withyou/shared";
import { tokens } from "../../ui/tokens";
import { Screen } from "../../ui/components/Screen";
import { Text } from "../../ui/components/Text";
import { Button } from "../../ui/components/Button";
import { Card } from "../../ui/components/Card";

export function DashboardScreen() {
  const [dashboard, _setDashboard] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);

        console.log("Fetching dashboard");

      } catch (_err) {
        console.error("Failed to fetch dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const handleNewCheckIn = () => {
    console.log("Navigate to check-in");
  };

  const handleUpdatePreferences = () => {
    console.log("Navigate to preferences");
  };

  const handleGetIdeas = () => {
    console.log("Navigate to ideas");
  };

  if (loading) {
    return (
      <Screen>
        <Text variant="body">{CONTENT.app.common.loading}</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text variant="title">{CONTENT.dashboard.paired.title}</Text>

        {dashboard?.relationshipStage && (
          <Card style={styles.stageCard}>
            <Text variant="muted">{CONTENT.dashboard.paired.labels.stage}</Text>
            <Text variant="subtitle" style={styles.stageText}>
              {CONTENT.preferences.options.stage[dashboard.relationshipStage]}
            </Text>
          </Card>
        )}

        {dashboard?.partnerLastCheckIn ? (
          <Card style={styles.partnerCard}>
            <Text variant="muted">
              {CONTENT.dashboard.paired.labels.partnerCheckInHeader}
            </Text>
            <Text variant="body" style={styles.checkInText}>
              {CONTENT.dashboard.paired.labels.moodLevel}
              {" "}
              {CONTENT.checkIn.create.moodLabels[dashboard.partnerLastCheckIn.mood_level]}
            </Text>
            <Text variant="muted">
              {new Date(dashboard.partnerLastCheckIn.timestamp).toLocaleDateString()}
            </Text>
          </Card>
        ) : (
          <Card style={styles.emptyCard}>
            <Text variant="muted">
              {CONTENT.dashboard.paired.empty.noSharedCheckIns}
            </Text>
          </Card>
        )}

        <View style={styles.actions}>
          <Button
            label={CONTENT.dashboard.paired.actions.newCheckIn}
            onPress={handleNewCheckIn}
          />
          <Button
            label={CONTENT.dashboard.paired.actions.updatePreferences}
            onPress={handleUpdatePreferences}
            variant="secondary"
          />
          <Button
            label={CONTENT.dashboard.paired.actions.getIdeas}
            onPress={handleGetIdeas}
            variant="secondary"
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stageCard: { marginVertical: tokens.space.md },
  stageText: { marginTop: tokens.space.sm },
  partnerCard: { marginVertical: tokens.space.md },
  checkInText: { marginVertical: tokens.space.sm },
  emptyCard: { marginVertical: tokens.space.md },
  actions: { marginTop: tokens.space.lg, gap: tokens.space.md },
});
