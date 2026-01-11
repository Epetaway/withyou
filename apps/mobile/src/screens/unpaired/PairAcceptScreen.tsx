import React, { useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import {
  CONTENT,
  inviteAcceptSchema,
  RelationshipAcceptResponse,
} from "@withyou/shared";
import { Screen } from "../../ui/components/Screen";
import { Text } from "../../ui/components/Text";
import { TextField } from "../../ui/components/TextField";
import { Button } from "../../ui/components/Button";
import { Card } from "../../ui/components/Card";
import { Section } from "../../ui/components/Section";
import { api } from "../../state/appState";
import { useAsyncAction } from "../../api/hooks";
import { Spacing } from "../../ui/tokens";
import { useTheme } from "../../ui/theme";

type PairAcceptScreenProps = {
  navigation: unknown;
};

export function PairAcceptScreen({ navigation }: PairAcceptScreenProps) {
  const theme = useTheme();
  const c = CONTENT.pairing.accept;

  const [inviteCode, setInviteCode] = useState("");
  const [inviteCodeError, setInviteCodeError] = useState("");

  const { run, loading, errorText } = useAsyncAction(async () => {
    setInviteCodeError("");

    const parsed = inviteAcceptSchema.safeParse({ inviteCode });
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      if (fieldErrors.inviteCode) {
        setInviteCodeError(fieldErrors.inviteCode[0]);
      }
      throw new Error("Validation failed");
    }

    const res = await api.request<RelationshipAcceptResponse>(
      "/relationship/accept",
      {
        method: "POST",
        body: JSON.stringify({ inviteCode }),
      }
    );

    // Success - navigate to dashboard
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (navigation as any)?.navigate?.("Dashboard");
    return res;
  });

  const onSubmit = async () => {
    try {
      await run();
    } catch {
      // Error handled in useAsyncAction
    }
  };

  return (
    <Screen style={{ paddingHorizontal: Spacing.md, paddingTop: Spacing.lg }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Spacing.xl }}>
        {/* Page Header */}
        <View style={{ marginBottom: Spacing.xl }}>
          <Text style={[styles.h1, { color: theme.text }]}>{c.title}</Text>
          <Text style={[styles.h2, { color: theme.text2 }]}>{c.helper}</Text>
        </View>

        {/* Input Section */}
        <Section title={c.fields.inviteCodeLabel}>
          <Card>
            <TextField
              value={inviteCode}
              onChangeText={setInviteCode}
              placeholder="ABC123"
              autoCapitalize="characters"
            />
            {inviteCodeError ? (
              <Text style={{ color: theme.danger, fontSize: 12, marginTop: Spacing.xs }}>
                {inviteCodeError}
              </Text>
            ) : null}
          </Card>
        </Section>

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

        {/* Submit Button */}
        <View style={{ gap: Spacing.sm, marginTop: Spacing.lg }}>
          <Button
            label={loading ? CONTENT.app.common.loading : c.actions.primary}
            onPress={onSubmit}
            disabled={loading || !inviteCode}
            variant="primary"
          />
          <Button
            label={c.actions.back}
            onPress={() => {
              const nav = navigation as { goBack?: () => void };
              nav.goBack?.();
            }}
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
});
