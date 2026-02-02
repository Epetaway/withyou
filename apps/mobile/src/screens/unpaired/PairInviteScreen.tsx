import React, { useState } from "react";
import { View, StyleSheet, SafeAreaView, ScrollView, Pressable, Share } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CONTENT, InviteResponse } from "@withyou/shared";
import { ThemedText } from "../../components/ThemedText";
import { ThemedCard } from "../../components/ThemedCard";
import { ScreenHeader } from "../../components/ScreenHeader";
import { Button } from "../../ui/components/Button";
import { api } from "../../state/appState";
import { useAsyncAction } from "../../api/hooks";
import { useTheme } from "../../theme/ThemeProvider";
import { spacing } from "../../theme/tokens";
import * as Clipboard from "expo-clipboard";

export function PairInviteScreen() {
  const theme = useTheme();
  const c = CONTENT.pairing.invite;

  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [deepLink, setDeepLink] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const { run, loading, errorText } = useAsyncAction(async () => {
    const res = await api.request<InviteResponse>("/relationship/invite", {
      method: "POST",
    });
    setInviteCode(res.inviteCode);
    setExpiresAt(res.expiresAt);
    setDeepLink(res.deepLink || null);
    return res;
  });

  const copyLink = async () => {
    if (!deepLink) return;
    try {
      await Clipboard.setStringAsync(deepLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (error) {
      console.error("Clipboard error:", error);
    }
  };

  const copyCode = async () => {
    if (!inviteCode) return;
    try {
      await Clipboard.setStringAsync(inviteCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (error) {
      console.error("Clipboard error:", error);
    }
  };

  const shareLink = async () => {
    if (!deepLink) return;
    
    try {
      await Share.share({
        message: `Join me on WithYou! Use this link to pair: ${deepLink}`,
        url: deepLink,
      });
    } catch (error) {
      console.error("Share error:", error);
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
          subtitle={c.body}
        />

        {errorText && (
          <ThemedCard elevation="xs" padding="md" radius="lg" style={styles.errorCard}>
            <ThemedText variant="body" color="danger">
              {errorText}
            </ThemedText>
          </ThemedCard>
        )}

        {!inviteCode ? (
          <Button
            label={loading ? CONTENT.app.common.loading : c.actions.generate}
            onPress={run}
            disabled={loading}
            variant="primary"
          />
        ) : (
          <View style={styles.inviteContent}>
            {/* Invite Code Section */}
            <View>
              <ThemedText variant="overline" color="muted" style={styles.sectionLabel}>
                YOUR INVITE CODE
              </ThemedText>
              <ThemedCard elevation="sm" padding="lg" radius="lg">
                <View style={styles.codeContainer}>
                  <ThemedText variant="h1" color="primary" style={styles.codeText}>
                    {inviteCode}
                  </ThemedText>
                  <Pressable 
                    onPress={copyCode}
                    style={[styles.iconButton, { backgroundColor: theme.colors.surface }]}
                  >
                    <Ionicons 
                      name={copiedCode ? "checkmark" : "copy-outline"} 
                      size={20} 
                      color={copiedCode ? theme.colors.success : theme.colors.primary} 
                    />
                  </Pressable>
                </View>
                {expiresAt && (
                  <ThemedText variant="caption" color="muted" style={styles.expiryText}>
                    Expires: {new Date(expiresAt).toLocaleDateString()}
                  </ThemedText>
                )}
              </ThemedCard>
            </View>

            {/* Share Link Section */}
            {deepLink && (
              <View>
                <ThemedText variant="overline" color="muted" style={styles.sectionLabel}>
                  OR SHARE LINK
                </ThemedText>
                <ThemedCard elevation="sm" padding="md" radius="lg">
                  <View style={styles.linkActions}>
                    <Pressable 
                      onPress={copyLink}
                      style={[styles.linkButton, { borderColor: theme.colors.border }]}
                    >
                      <Ionicons 
                        name={copiedLink ? "checkmark" : "link-outline"} 
                        size={20} 
                        color={copiedLink ? theme.colors.success : theme.colors.primary} 
                      />
                      <ThemedText variant="body" color="primary">
                        {copiedLink ? "Copied!" : "Copy Link"}
                      </ThemedText>
                    </Pressable>
                    <Pressable 
                      onPress={shareLink}
                      style={[styles.linkButton, { borderColor: theme.colors.border }]}
                    >
                      <Ionicons name="share-outline" size={20} color={theme.colors.primary} />
                      <ThemedText variant="body" color="primary">
                        Share Link
                      </ThemedText>
                    </Pressable>
                  </View>
                </ThemedCard>
              </View>
            )}

            {/* Instructions */}
            <ThemedCard elevation="xs" padding="md" radius="lg" style={[styles.instructionsCard, { backgroundColor: theme.colors.surface }]}>
              <ThemedText variant="body" color="secondary" style={styles.instructionsText}>
                Send this code to your partner. They can enter it in the &quot;Accept Invite&quot; screen to pair with you.
              </ThemedText>
            </ThemedCard>
          </View>
        )}
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
  },
  errorCard: {
    marginBottom: spacing.md,
  },
  inviteContent: {
    gap: spacing.xl,
  },
  sectionLabel: {
    marginBottom: spacing.sm,
  },
  codeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  codeText: {
    letterSpacing: 4,
  },
  iconButton: {
    padding: spacing.sm,
    borderRadius: 8,
  },
  expiryText: {
    marginTop: spacing.xs,
  },
  linkActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  linkButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    padding: spacing.md,
    borderWidth: 1,
    borderRadius: 8,
  },
  instructionsCard: {
    marginTop: spacing.sm,
  },
  instructionsText: {
    lineHeight: 20,
  },
});
