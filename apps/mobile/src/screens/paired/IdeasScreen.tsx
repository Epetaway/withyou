import React, { useEffect, useState } from "react";
import { View, ScrollView } from "react-native";
import { CONTENT, IdeasResponse } from "@withyou/shared";
import { Screen } from "../../ui/components/Screen";
import { Text } from "../../ui/components/Text";
import { Button } from "../../ui/components/Button";
import { Card } from "../../ui/components/Card";
import { api } from "../../state/appState";

type IdeasScreenProps = {
  navigation: unknown;
};

export function IdeasScreen({ navigation }: IdeasScreenProps) {
  const [ideas, setIdeas] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState("");

  const fetchIdeas = async () => {
    try {
      setErrorText("");
      setLoading(true);
      const res = await api.request<IdeasResponse>("/ideas");
      setIdeas(res.ideas || []);
    } catch (err) {
      if (err instanceof Error) {
        setErrorText(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIdeas();
  }, []);

  const onGoToPreferences = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (navigation as any)?.navigate?.("Preferences");
  };

  if (errorText) {
    return (
      <Screen>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text variant="body" style={{ textAlign: "center", marginBottom: 16 }}>
            {errorText}
          </Text>
          <Button
            label={CONTENT.ideas.actions.goToPreferences}
            onPress={onGoToPreferences}
          />
        </View>
      </Screen>
    );
  }

  if (!ideas.length && !loading) {
    return (
      <Screen>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text
            variant="title"
            style={{ textAlign: "center", marginBottom: 16 }}
          >
            {CONTENT.ideas.empty.needsPreferencesTitle}
          </Text>
          <Text
            variant="body"
            style={{ textAlign: "center", marginBottom: 16 }}
          >
            {CONTENT.ideas.empty.needsPreferencesBody}
          </Text>
          <Button
            label={CONTENT.ideas.actions.goToPreferences}
            onPress={onGoToPreferences}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} style={{ gap: 16 }}>
        <Text variant="title">{CONTENT.ideas.title}</Text>
        <Text variant="body">{CONTENT.ideas.body}</Text>

        {loading ? (
          <Text variant="body">{CONTENT.app.common.loading}</Text>
        ) : (
          <View style={{ gap: 10, marginVertical: 16 }}>
            {ideas.map((idea, idx) => (
              <Card key={idx}>
                <View style={{ gap: 10 }}>
                  <Text variant="subtitle">{idea}</Text>
                  <Button
                    label={CONTENT.ideas.actions.save}
                    onPress={() => console.log("Saved idea:", idea)}
                    variant="secondary"
                  />
                </View>
              </Card>
            ))}
          </View>
        )}

        <Button
          label={loading ? CONTENT.app.common.loading : CONTENT.ideas.actions.refresh}
          onPress={fetchIdeas}
          disabled={loading}
        />
      </ScrollView>
    </Screen>
  );
}
