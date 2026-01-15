import React, { useState } from "react";
import { View, Pressable, StyleSheet, Switch } from "react-native";
import { CONTENT } from "@withyou/shared";
import { Screen } from "../../ui/components/Screen";
import { Text } from "../../ui/components/Text";
import { Button } from "../../ui/components/Button";
import { api } from "../../state/appState";
import { clearSession } from "../../state/session";
import { useAsyncAction } from "../../api/hooks";
import { Spacing } from "../../ui/tokens";
import { useTheme } from "../../ui/theme/ThemeProvider";

export function SettingsScreen() {
  const theme = useTheme();
  const [showEndPairingModal, setShowEndPairingModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { run: runEndPairing, loading: endPairingLoading } = useAsyncAction(
    async () => {
      await api.request("/relationship/end", {
        method: "POST",
      });
      setShowEndPairingModal(false);
      return null;
    }
  );

  const onLogoutConfirm = async () => {
    setIsLoggingOut(true);
    try {
      await clearSession();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  if (isLoggingOut) {
    return (
      <Screen>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text variant="body">{CONTENT.app.common.loading}</Text>
        </View>
      </Screen>
    );
  }

  const SettingSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={{ marginBottom: Spacing.xl, gap: Spacing.sm }}>
      <Text variant="sectionLabel" style={{ color: theme.colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5 }}>
        {title}
      </Text>
      {children}
    </View>
  );

  const onEndPairingConfirm = async () => {
    try {
      await runEndPairing();
    } catch {
      // Error handled
    }
  };

  return (
    <Screen scrollable>
      {/* Page Header */}
      <View style={{ marginBottom: Spacing.xl }}>
        <Text variant="screenTitle">{CONTENT.settings.title}</Text>
      </View>

      {/* Appearance */}
      <SettingSection title="APPEARANCE">
        <View style={{
          backgroundColor: theme.colors.surface,
          borderRadius: 12,
          padding: Spacing.md,
        }}>
          <Pressable
            onPress={() => theme.toggle()}
            style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}
          >
            <Text variant="body">
              Dark Mode
            </Text>
            <Switch
              value={theme.mode === 'dark'}
              onValueChange={() => theme.toggle()}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={theme.colors.background}
            />
          </Pressable>
        </View>
      </SettingSection>

      {/* Relationship */}
      <SettingSection title={CONTENT.settings.sections.relationship.toUpperCase()}>
        <View style={{
          backgroundColor: theme.colors.surface,
          borderRadius: 12,
          padding: Spacing.md,
          gap: Spacing.sm,
        }}>
          <Text variant="body" style={{ color: theme.colors.textSecondary, fontSize: 13 }}>
            {CONTENT.settings.relationship.stageLabel}
          </Text>
          <Text variant="body">
            Dating
          </Text>
        </View>
      </SettingSection>

      {/* Account */}
      <SettingSection title={CONTENT.settings.sections.account.toUpperCase()}>
        <Button
          label={CONTENT.settings.account.logout}
          onPress={() => setShowLogoutModal(true)}
          variant="secondary"
        />
      </SettingSection>

      {/* End Pairing (isolated destructive action) */}
      <View style={{ marginBottom: Spacing.lg }}>
        <Button
          label={CONTENT.settings.relationship.endPairing}
          onPress={() => setShowEndPairingModal(true)}
          variant="danger"
        />
      </View>

      {/* Confirmation Modals - simplified inline for now */}
      {showEndPairingModal && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text variant="cardTitle">
              {CONTENT.settings.relationship.confirmEndTitle}
            </Text>
            <Text variant="body" style={{ color: theme.colors.textSecondary, marginTop: Spacing.sm }}>
              {CONTENT.settings.relationship.confirmEndBody}
            </Text>
            <View style={{ gap: Spacing.sm, marginTop: Spacing.lg }}>
              <Button
                label={
                  endPairingLoading
                    ? CONTENT.app.common.loading
                    : CONTENT.settings.relationship.confirmEndAction
                }
                onPress={onEndPairingConfirm}
                variant="danger"
              />
              <Button
                label={CONTENT.settings.relationship.cancelEndAction}
                onPress={() => setShowEndPairingModal(false)}
                variant="secondary"
              />
            </View>
          </View>
        </View>
      )}

      {showLogoutModal && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text variant="cardTitle">
              {CONTENT.settings.account.confirmLogoutTitle}
            </Text>
            <Text variant="body" style={{ color: theme.colors.textSecondary, marginTop: Spacing.sm }}>
              {CONTENT.settings.account.confirmLogoutBody}
            </Text>
            <View style={{ gap: Spacing.sm, marginTop: Spacing.lg }}>
              <Button
                label={CONTENT.settings.account.confirmLogoutAction}
                onPress={onLogoutConfirm}
                variant="primary"
              />
              <Button
                label={CONTENT.settings.account.cancelLogoutAction}
                onPress={() => setShowLogoutModal(false)}
                variant="secondary"
              />
            </View>
          </View>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 16,
    padding: Spacing.lg,
  },
});
