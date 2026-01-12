import React, { useState } from "react";
import { View, ScrollView, StyleSheet, Pressable } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import { CONTENT, InviteResponse } from "@withyou/shared";
import { Screen } from "../../ui/components/Screen";
import { Text } from "../../ui/components/Text";
import { Button } from "../../ui/components/Button";
import { Card } from "../../ui/components/Card";
import { Section } from "../../ui/components/Section";
import { api } from "../../state/appState";
import { useAsyncAction } from "../../api/hooks";
import { Spacing } from "../../ui/tokens";
import { useTheme } from "../../ui/theme/ThemeProvider";
import * as Clipboard from "expo-clipboard";

type PairInviteScreenProps = {
  navigation: unknown;
};

export function PairInviteScreen({ navigation }: PairInviteScreenProps) {
  const theme = useTheme();
  const c = CONTENT.pairing.invite;

  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  const { run, loading, errorText } = useAsyncAction(async () => {
    const res = await api.request<InviteResponse>("/relationship/invite", {
      method: "POST",
    });
    setInviteCode(res.inviteCode);
    setExpiresAt(res.expiresAt);
    return res;
  });

  const copyLink = async () => {
    if (!inviteCode) return;
    const link = `withyou://pair?code=${inviteCode}`;
    await Clipboard.setStringAsync(link);
  };

  const copyCode = async () => {
    if (!inviteCode) return;
    await Clipboard.setStringAsync(inviteCode);
  };

  return (
    <Screen style={{ paddingHorizontal: Spacing.md, paddingTop: Spacing.lg }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Spacing.xl }}>
        {/* Page Header */}
        <View style={{ marginBottom: Spacing.xl }}>
          <Text style={[styles.h1, { color: theme.text }]}>{c.title}</Text>
          <Text style={[styles.h2, { color: theme.text2 }]}>{c.body}</Text>
        </View>

        {errorText ? (
          <Section>
            <Card>
              <Text variant="body" style={{ color: theme.danger }}>
                {errorText}
              </Text>
            </Card>
          </Section>
        ) : null}

        {!inviteCode ? (
          <Button
            label={loading ? CONTENT.app.common.loading : c.actions.generate}
            onPress={run}
            disabled={loading}
            variant="primary"
          />
        ) : (
          <Section title="Your invite code">
            <Card>
              <View style={{ gap: Spacing.md }}>
                <View style={[styles.codeBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <Text style={[styles.codeText, { color: theme.primary }]}>{inviteCode}</Text>
                </View>
                
                <View style={{ gap: Spacing.sm }}>
                  <Pressable
                    onPress={copyCode}
                    style={({ pressed }) => [
                      styles.actionButton,
                      { backgroundColor: pressed ? theme.surface : "transparent" }
                    ]}
                  >
                    <FontAwesome6 name="copy" size={18} color={theme.primary} weight="bold" />
                    <Text style={{ color: theme.primary, fontWeight: "600" }}>Copy Code</Text>
                  </Pressable>
                  
                  <Pressable
                    onPress={copyLink}
                    style={({ pressed }) => [
                      styles.actionButton,
                      { backgroundColor: pressed ? theme.surface : "transparent" }
                    ]}
                  >
                    <FontAwesome6 name="link" size={18} color={theme.primary} weight="bold" />
                    <Text style={{ color: theme.primary, fontWeight: "600" }}>Copy Link</Text>
                  </Pressable>
                </View>

                {expiresAt ? (
                  <Text style={{ fontSize: 12, color: theme.text2, marginTop: Spacing.sm }}>
                    Expires: {new Date(expiresAt).toLocaleDateString()}
                  </Text>
                ) : null}
              </View>
            </Card>
          </Section>
        )}

        <Button
          label={c.actions.back}
          onPress={() => {
            const nav = navigation as { goBack?: () => void };
            nav.goBack?.();
          }}
          variant="secondary"
          style={{ marginTop: Spacing.lg }}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 28, fontWeight: "700" },
  h2: { fontSize: 16, marginTop: Spacing.sm },
  codeBox: {
    padding: Spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  codeText: { fontSize: 18, fontWeight: "700", fontFamily: "Menlo" },
  actionButton: { 
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: 8,
  },
});
