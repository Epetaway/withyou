import React, { useState } from "react";
import { View, Pressable, StyleSheet, Switch, SafeAreaView, ScrollView, Modal } from "react-native";
import { CONTENT } from "@withyou/shared";
import { ThemedText } from "../../components/ThemedText";
import { ThemedCard } from "../../components/ThemedCard";
import { ScreenHeader } from "../../components/ScreenHeader";
import { Button } from "../../ui/components/Button";
import { api } from "../../state/appState";
import { clearSession } from "../../state/session";
import { useAsyncAction } from "../../api/hooks";
import { useTheme } from "../../theme/ThemeProvider";
import { spacing } from "../../theme/tokens";

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

  const onEndPairingConfirm = async () => {
    try {
      await runEndPairing();
    } catch {
      // Error handled
    }
  };

  if (isLoggingOut) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ThemedText variant="body" color="secondary">
            {CONTENT.app.common.loading}
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader title={CONTENT.settings.title} />

        {/* Appearance */}
        <View style={styles.section}>
          <ThemedText variant="overline" color="muted" style={styles.sectionLabel}>
            APPEARANCE
          </ThemedText>
          <ThemedCard elevation="xs" padding="md" radius="lg">
            <Pressable
              onPress={() => theme.toggle()}
              style={styles.settingRow}
            >
              <ThemedText variant="body" color="primary">
                Dark Mode
              </ThemedText>
              <Switch
                value={theme.mode === 'dark'}
                onValueChange={() => theme.toggle()}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor="#FFFFFF"
              />
            </Pressable>
          </ThemedCard>
        </View>

        {/* Relationship */}
        <View style={styles.section}>
          <ThemedText variant="overline" color="muted" style={styles.sectionLabel}>
            {CONTENT.settings.sections.relationship.toUpperCase()}
          </ThemedText>
          <ThemedCard elevation="xs" padding="md" radius="lg">
            <ThemedText variant="caption" color="muted" style={styles.label}>
              {CONTENT.settings.relationship.stageLabel}
            </ThemedText>
            <ThemedText variant="body" color="primary" style={styles.value}>
              Dating
            </ThemedText>
          </ThemedCard>
        </View>

        {/* Account */}
        <View style={styles.section}>
          <ThemedText variant="overline" color="muted" style={styles.sectionLabel}>
            {CONTENT.settings.sections.account.toUpperCase()}
          </ThemedText>
          <Button
            label={CONTENT.settings.account.logout}
            onPress={() => setShowLogoutModal(true)}
            variant="secondary"
          />
        </View>

        {/* End Pairing */}
        <View style={styles.dangerSection}>
          <Button
            label={CONTENT.settings.relationship.endPairing}
            onPress={() => setShowEndPairingModal(true)}
            variant="danger"
          />
        </View>
      </ScrollView>

      {/* End Pairing Modal */}
      <Modal
        visible={showEndPairingModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEndPairingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ThemedCard elevation="lg" padding="lg" radius="xl" style={styles.modalContent}>
            <ThemedText variant="h2" color="primary" style={styles.modalTitle}>
              {CONTENT.settings.relationship.confirmEndTitle}
            </ThemedText>
            <ThemedText variant="body" color="muted" style={styles.modalBody}>
              {CONTENT.settings.relationship.confirmEndBody}
            </ThemedText>
            <View style={styles.modalActions}>
              <Button
                label={
                  endPairingLoading
                    ? CONTENT.app.common.loading
                    : CONTENT.settings.relationship.confirmEndAction
                }
                onPress={onEndPairingConfirm}
                variant="danger"
                disabled={endPairingLoading}
              />
              <Button
                label={CONTENT.settings.relationship.cancelEndAction}
                onPress={() => setShowEndPairingModal(false)}
                variant="secondary"
              />
            </View>
          </ThemedCard>
        </View>
      </Modal>

      {/* Logout Modal */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ThemedCard elevation="lg" padding="lg" radius="xl" style={styles.modalContent}>
            <ThemedText variant="h2" color="primary" style={styles.modalTitle}>
              {CONTENT.settings.account.confirmLogoutTitle}
            </ThemedText>
            <ThemedText variant="body" color="muted" style={styles.modalBody}>
              {CONTENT.settings.account.confirmLogoutBody}
            </ThemedText>
            <View style={styles.modalActions}>
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
          </ThemedCard>
        </View>
      </Modal>
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
    paddingBottom: 100, // Space for floating nav
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    marginBottom: spacing.xl,
  },
  dangerSection: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    marginBottom: spacing.sm,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    marginBottom: spacing.xs,
  },
  value: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    marginBottom: spacing.sm,
  },
  modalBody: {
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  modalActions: {
    gap: spacing.sm,
  },
});
