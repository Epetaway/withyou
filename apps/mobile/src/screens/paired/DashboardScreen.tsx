import React, { useEffect, useState } from "react";
import { View, ScrollView } from "react-native";
import { CONTENT, DashboardResponse } from "@withyou/shared";
import { Screen } from "../../ui/components/Screen";
import { Text } from "../../ui/components/Text";
import { Button } from "../../ui/components/Button";
import { Card } from "../../ui/components/Card";
import { api } from "../../state/appState";

type DashboardScreenProps = {
  navigation: unknown;
};

export function DashboardScreen({ navigation }: DashboardScreenProps) {
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
        <Text variant="body">{CONTENT.app.common.loading}</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} style={{ gap: 16 }}>
        <Text variant="title">{CONTENT.dashboard.paired.title}</Text>

        {errorText ? (
          <Text variant="muted" style={{ color: "#B00020" }}>
            {errorText}
          </Text>
        ) : null}

        {dashboard?.relationshipStage ? (
          <Card>
            <View style={{ gap: 10 }}>
              <Text variant="muted">{CONTENT.dashboard.paired.labels.stage}</Text>
              <Text variant="subtitle">
                {
                  CONTENT.preferences.options
                    .stage[dashboard.relationshipStage]
                }
              </Text>
            </View>
          </Card>
        ) : null}

        {dashboard?.partnerLastCheckIn ? (
          <Card>
            <View style={{ gap: 10 }}>
              <Text variant="muted">
                {CONTENT.dashboard.paired.labels.partnerCheckInHeader}
              </Text>
              <Text variant="body">
                {CONTENT.dashboard.paired.labels.moodLevel}{" "}
                {
                  CONTENT.checkIn.create
                    .moodLabels[dashboard.partnerLastCheckIn.mood_level]
                }
              </Text>
              <Text variant="muted">
                {new Date(
                  dashboard.partnerLastCheckIn.timestamp
                ).toLocaleDateString()}
              </Text>
            </View>
          </Card>
        ) : (
          <Card>
            <Text variant="muted">
              {CONTENT.dashboard.paired.empty.noSharedCheckIns}
            </Text>
          </Card>
        )}

        <View style={{ gap: 10, marginTop: 16 }}>
          <Button
            label={CONTENT.dashboard.paired.actions.newCheckIn}
            onPress={() =>
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (navigation as any)?.navigate?.("CheckIn")
            }
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
        </View>
      </ScrollView>
    </Screen>
  );
}
