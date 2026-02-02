import React, { useState } from "react";
import { View, StyleSheet, SafeAreaView, ScrollView, TextInput } from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import {
  CONTENT,
  inviteAcceptSchema,
  RelationshipAcceptResponse,
} from "@withyou/shared";
import { ThemedText } from "../../components/ThemedText";
import { ThemedCard } from "../../components/ThemedCard";
import { ScreenHeader } from "../../components/ScreenHeader";
import { Button } from "../../ui/components/Button";
import { api } from "../../state/appState";
import { useAsyncAction } from "../../api/hooks";
import { useTheme } from "../../theme/ThemeProvider";
import { spacing } from "../../theme/tokens";

type PairedStackParamList = {
  Dashboard: undefined;
};

export function PairAcceptScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp<PairedStackParamList>>();
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

    navigation.navigate("Dashboard");
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader 
          title={c.title}
          subtitle={c.helper}
        />

        {/* Input Section */}
        <View style={styles.formSection}>
          <ThemedText variant="overline" color="muted" style={styles.label}>
            {c.fields.inviteCodeLabel.toUpperCase()}
          </ThemedText>
          <ThemedCard elevation="sm" padding="md" radius="lg">
            <TextInput
              value={inviteCode}
              onChangeText={setInviteCode}
              placeholder="ABC123"
              placeholderTextColor={theme.colors.textMuted}
              autoCapitalize="characters"
              style={[
                styles.input,
                {
                  color: theme.colors.text,
                  backgroundColor: theme.colors.background,
                  borderColor: inviteCodeError ? theme.colors.danger : theme.colors.border,
                },
              ]}
            />
            {inviteCodeError && (
              <ThemedText variant="caption" color="danger" style={styles.errorText}>
                {inviteCodeError}
              </ThemedText>
            )}
          </ThemedCard>
        </View>

        {/* Error State */}
        {errorText && (
          <ThemedCard elevation="xs" padding="md" radius="lg" style={styles.errorCard}>
            <ThemedText variant="body" color="danger">
              {errorText}
            </ThemedText>
          </ThemedCard>
        )}

        {/* Submit Button */}
        <Button
          label={loading ? CONTENT.app.common.loading : c.actions.primary}
          onPress={onSubmit}
          disabled={loading}
          variant="primary"
        />

        {/* Info Card */}
        <ThemedCard elevation="xs" padding="md" radius="lg" style={[styles.infoCard, { backgroundColor: theme.colors.surface }]}>
          <ThemedText variant="body" color="secondary" style={styles.infoText}>
            Enter the invite code your partner shared with you to connect your accounts.
          </ThemedText>
        </ThemedCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 100,
    gap: spacing.lg,
  },
  formSection: {
    gap: spacing.sm,
  },
  label: {
    marginBottom: spacing.xs,
  },
  input: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 2,
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
  },
  errorText: {
    marginTop: spacing.xs,
  },
  errorCard: {
    marginTop: spacing.sm,
  },
  infoCard: {
    marginTop: spacing.sm,
  },
  infoText: {
    lineHeight: 20,
  },
});
