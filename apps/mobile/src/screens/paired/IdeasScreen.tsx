import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { CONTENT } from "@withyou/shared";
import { tokens } from "../../ui/tokens";
import { Screen } from "../../ui/components/Screen";
import { Text } from "../../ui/components/Text";
import { Button } from "../../ui/components/Button";
import { Card } from "../../ui/components/Card";

export function IdeasScreen() {
  const [ideas, _setIdeas] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        setError("");
        setLoading(true);

        console.log("Fetching ideas");

      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchIdeas();
  }, []);

  const handleRefresh = async () => {
    try {
      setLoading(true);
      console.log("Refreshing ideas");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveIdea = (idea: string) => {
    console.log("Saving idea:", idea);
  };

  const handleGoToPreferences = () => {
    console.log("Navigate to preferences");
  };

  if (error) {
    return (
      <Screen>
        <View style={styles.center}>
          <Text variant="body">{error}</Text>
          <Button
            label={CONTENT.ideas.actions.goToPreferences}
            onPress={handleGoToPreferences}
            style={styles.button}
          />
        </View>
      </Screen>
    );
  }

  if (!ideas.length && !loading) {
    return (
      <Screen>
        <View style={styles.center}>
          <Text variant="title" style={styles.centerText}>
            {CONTENT.ideas.empty.needsPreferencesTitle}
          </Text>
          <Text variant="body" style={[styles.centerText, styles.description]}>
            {CONTENT.ideas.empty.needsPreferencesBody}
          </Text>
          <Button
            label={CONTENT.ideas.actions.goToPreferences}
            onPress={handleGoToPreferences}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text variant="title">{CONTENT.ideas.title}</Text>
        <Text variant="body" style={styles.description}>
          {CONTENT.ideas.body}
        </Text>

        {loading ? (
          <Text variant="body">{CONTENT.app.common.loading}</Text>
        ) : (
          <View style={styles.ideasContainer}>
            {ideas.map((idea, idx) => (
              <Card key={idx} style={styles.ideaCard}>
                <Text variant="subtitle">{idea}</Text>
                <Button
                  label={CONTENT.ideas.actions.save}
                  onPress={() => handleSaveIdea(idea)}
                  variant="secondary"
                  style={styles.saveButton}
                />
              </Card>
            ))}
          </View>
        )}

        <Button
          label={CONTENT.ideas.actions.refresh}
          onPress={handleRefresh}
          disabled={loading}
          style={styles.refreshButton}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  centerText: { textAlign: "center" },
  description: { marginVertical: tokens.space.lg },
  ideasContainer: { gap: tokens.space.md, marginVertical: tokens.space.lg },
  ideaCard: { paddingVertical: tokens.space.md },
  saveButton: { marginTop: tokens.space.md },
  refreshButton: { marginTop: tokens.space.lg, marginBottom: tokens.space.xl },
  button: { marginTop: tokens.space.lg },
});
