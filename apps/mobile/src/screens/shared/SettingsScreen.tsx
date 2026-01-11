import React, { useState } from "react";
import { View, Pressable, StyleSheet, Switch } from "react-native";
import { CONTENT } from "@withyou/shared";
import { Screen } from "../../ui/components/Screen";
import { Text } from "../../ui/components/Text";
import { Button } from "../../ui/components/Button";
import { Card } from "../../ui/components/Card";
import { Section } from "../../ui/components/Section";
import { api } from "../../state/appState";
import { clearSession } from "../../state/session";
import { useAsyncAction } from "../../api/hooks";
import { Spacing } from "../../ui/tokens";
import { useTheme } from "../../ui/theme";

type SettingsScreenProps = {
  navigation: unknown;
};

export function SettingsScreen({ navigation }: SettingsScreenProps) {
  const theme = useTheme();
  const [showEndPairingModal, setShowEndPairingModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const { run: runEndPairing, loading: endPairingLoading } = useAsyncAction(
    async () => {
      await api.request("/relationship/end", {
        method: "POST",
      });
      setShowEndPairingModal(false);
      // Navigate back - will show unpaired home
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (navigation as any)?.goBack?.();
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

  const onEndPairingConfirm = async () => {
    try {
      await runEndPairing();
    } catch {
      // Error handled
    }
  };

  return (
    <Screen style={{ paddingHorizontal: Spacing.md, paddingTop: Spacing.lg }} scrollable>
        {/* Page Header */}
        <View style={{ marginBottom: Spacing.xl }}>
          <Text style={[styles.h1, { color: theme.text }]}>{CONTENT.settings.title}</Text>
        </View>

        {/* Appearance */}
        <Section title="Appearance">
          <Card>
            <Pressable
              onPress={() => setDarkMode(!darkMode)}
              style={styles.settingRow}
            >
              <Text variant="body" style={{ color: theme.text }}>
                Dark Mode
              </Text>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor="#fff"
              />
            </Pressable>
          </Card>
        </Section>

        {/* Relationship */}
        <Section title={CONTENT.settings.sections.relationship}>
          <Card>
            <View style={{ gap: Spacing.sm }}>
              <Text style={{ fontSize: 12, color: theme.text2, fontWeight: "500" }}>
                {CONTENT.settings.relationship.stageLabel}
              </Text>
              <Text variant="body" style={{ color: theme.text }}>
                Dating
              </Text>
            </View>
          </Card>
        </Section>

        {/* Account */}
        <Section title={CONTENT.settings.sections.account}>
          <Button
            label={CONTENT.settings.account.logout}
            onPress={() => setShowLogoutModal(true)}
            variant="secondary"
          />
        </Section>

        {/* End Pairing (isolated destructive action) */}
        <View style={{ marginTop: Spacing.xl }}>
          <Button
            label={CONTENT.settings.relationship.endPairing}
            onPress={() => setShowEndPairingModal(true)}
            variant="danger"
          />
        </View>

      {/* Confirmation Modals - simplified inline for now */}
      {showEndPairingModal && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text variant="title" style={{ color: theme.text }}>
              {CONTENT.settings.relationship.confirmEndTitle}
            </Text>
            <Text variant="body" style={{ color: theme.text2, marginTop: Spacing.sm }}>
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
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text variant="title" style={{ color: theme.text }}>
              {CONTENT.settings.account.confirmLogoutTitle}
            </Text>
            <Text variant="body" style={{ color: theme.text2, marginTop: Spacing.sm }}>
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
  h1: { fontSize: 28, fontWeight: "700" },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
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
