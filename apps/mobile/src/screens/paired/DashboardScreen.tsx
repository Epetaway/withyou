import React, { useEffect, useState } from "react";
import { View, ScrollView } from "react-native";
import { CONTENT, DashboardResponse } from "@withyou/shared";
import { Screen } from "../../ui/components/Screen";
import { Text } from "../../ui/components/Text";
import { ButtonNew as Button } from "../../ui/components/ButtonNew";
import { CardNew as Card } from "../../ui/components/CardNew";
import { api } from "../../state/appState";
import { Spacing } from "../../ui/tokens";
import { useTheme } from "../../ui/theme/ThemeProvider";

type DashboardScreenProps = {
  navigation: unknown;
};

export function DashboardScreen({ navigation }: DashboardScreenProps) {
  const { colors } = useTheme();
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
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.lg, paddingBottom: Spacing.xl }}>
        {/* Welcome Header */}
        <View style={{ gap: Spacing.sm }}>
          <Text variant="title">{CONTENT.dashboard.paired.title}</Text>
          <Text variant="body" style={{ color: colors.textMuted }}>
            Welcome back! 👋
          </Text>
        </View>

        {/* Error State */}
        {errorText ? (
          <Card variant="outlined">
            <Text variant="body" style={{ color: colors.error }}>
              {errorText}
            </Text>
          </Card>
        ) : null}

        {/* Relationship Stage Card */}
        {dashboard?.relationshipStage ? (
          <Card variant="elevated">
            <View style={{ gap: Spacing.sm }}>
              <Text variant="muted" style={{ color: colors.textMuted }}>
                {CONTENT.dashboard.paired.labels.stage}
              </Text>
              <Text variant="title" style={{ color: colors.primary }}>
                {CONTENT.preferences.options.stage[dashboard.relationshipStage]}
              </Text>
            </View>
          </Card>
        ) : null}

        {/* Partner Mood Card */}
        {dashboard?.partnerLastCheckIn ? (
          <Card variant="elevated">
            <View style={{ gap: Spacing.md }}>
              <Text variant="subtitle">
                {CONTENT.dashboard.paired.labels.partnerCheckInHeader}
              </Text>
              <View style={{ gap: Spacing.sm }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: Spacing.sm }}>
                  <Text variant="body" style={{ fontSize: 20 }}>
                    {["😟", "😕", "😐", "🙂", "😄"][
                      (dashboard.partnerLastCheckIn.mood_level as 1 | 2 | 3 | 4 | 5) - 1
                    ]}
                  </Text>
                  <Text variant="body">
                    {
                      CONTENT.checkIn.create
                        .moodLabels[dashboard.partnerLastCheckIn.mood_level]
                    }
                  </Text>
                </View>
                <Text variant="muted" style={{ color: colors.textMuted }}>
                  {new Date(
                    dashboard.partnerLastCheckIn.timestamp
                  ).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </Card>
        ) : (
          <Card variant="outlined">
            <Text variant="body" style={{ color: colors.textMuted }}>
              {CONTENT.dashboard.paired.empty.noSharedCheckIns}
            </Text>
          </Card>
        )}

        {/* Action Buttons */}
        <View style={{ gap: Spacing.sm, marginTop: Spacing.md }}>
          <Button
            label={CONTENT.dashboard.paired.actions.newCheckIn}
            onPress={() =>
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (navigation as any)?.navigate?.("CheckIn")
            }
            fullWidth
          />
          <Button
            label={CONTENT.dashboard.paired.actions.updatePreferences}
            onPress={() =>
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (navigation as any)?.navigate?.("Preferences")
            }
            variant="secondary"
            fullWidth
          />
          <Button
            label={CONTENT.dashboard.paired.actions.getIdeas}
            onPress={() =>
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (navigation as any)?.navigate?.("Ideas")
            }
            variant="secondary"
            fullWidth
          />
        </View>
      </ScrollView>
    </Screen>
  );
}
