import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CONTENT, DashboardResponse } from "@withyou/shared";
import { Screen } from "../../ui/components/Screen";
import { Text } from "../../ui/components/Text";
import { Button } from "../../ui/components/Button";
import { clearSession } from "../../state/session";
import { Card } from "../../ui/components/Card";
import { Section } from "../../ui/components/Section";
import { api } from "../../state/appState";
import { Spacing } from "../../ui/tokens";
import { useTheme } from "../../ui/theme";

type DashboardScreenProps = {
  navigation: unknown;
};

export function DashboardScreen({ navigation }: DashboardScreenProps) {
  const theme = useTheme();
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState("");

  const handleLogout = async () => {
    await clearSession();
    (navigation as any).navigate("Login");
  };

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
    <Screen style={{ paddingHorizontal: Spacing.md, paddingTop: Spacing.lg }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Spacing.xl }}>
        {/* Page Header */}
        <View style={{ marginBottom: Spacing.xl }}>
          <Text style={[styles.h1, { color: theme.text }]}>Dashboard</Text>
          <Text style={[styles.h2, { color: theme.text2 }]}>Welcome back.</Text>
        </View>

        {/* Error State */}
        {errorText ? (
          <Section>
            <Card>
              <Text variant="body" style={{ color: theme.danger }}>
                {errorText}
              </Text>
            </Card>
          </Section>
        ) : null}

        {/* Relationship Stage Card */}
        {dashboard?.relationshipStage ? (
          <Section>
            <Card>
              <Text style={[styles.label, { color: theme.text2 }]}>
                Relationship stage
              </Text>
              <Text style={[styles.value, { color: theme.primary }]}>
                {CONTENT.preferences.options.stage[dashboard.relationshipStage]}
              </Text>
            </Card>
          </Section>
        ) : null}

        {/* Partner Check-in Card */}
        {dashboard?.partnerLastCheckIn ? (
          <Section title="Partner check-in" subtitle="Latest shared update">
            <Card>
              <View style={styles.row}>
                <Ionicons
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
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 28, fontWeight: "700" },
  h2: { fontSize: 16, marginTop: Spacing.sm },
  label: { fontSize: 12, fontWeight: "500" },
  value: { fontSize: 28, fontWeight: "700", marginTop: Spacing.sm },
  value2: { fontSize: 16, fontWeight: "600" },
  meta: { fontSize: 12, marginTop: Spacing.xs },
  row: { flexDirection: "row", alignItems: "center" },
});

