import React, { useState } from "react";
import { View, ScrollView, Modal } from "react-native";
import { CONTENT } from "@withyou/shared";
import { Screen } from "../../ui/components/Screen";
import { Text } from "../../ui/components/Text";
import { Button } from "../../ui/components/Button";
import { Card } from "../../ui/components/Card";
import { api } from "../../state/appState";
import { clearSession } from "../../state/session";
import { useAsyncAction } from "../../api/hooks";

type SettingsScreenProps = {
  navigation: unknown;
};

export function SettingsScreen({ navigation }: SettingsScreenProps) {
  const [showEndPairingModal, setShowEndPairingModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
      // Force app to restart by going back to root - but since RootNavigator
      // doesn't poll, we'll need a workaround. For now, show a loading state.
      // In production, you'd use a proper state management solution.
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
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} style={{ gap: 16 }}>
        <Text variant="title">{CONTENT.settings.title}</Text>

        <Text variant="subtitle">{CONTENT.settings.sections.relationship}</Text>
        <Card>
          <View style={{ gap: 10 }}>
            <Text variant="muted">{CONTENT.settings.relationship.stageLabel}</Text>
            <Text variant="body">Dating</Text>
          </View>
        </Card>

        <Button
          label={CONTENT.settings.relationship.endPairing}
          onPress={() => setShowEndPairingModal(true)}
          variant="secondary"
        />

        <Text variant="subtitle">{CONTENT.settings.sections.account}</Text>

        <Button
          label={CONTENT.settings.account.logout}
          onPress={() => setShowLogoutModal(true)}
          variant="secondary"
        />
      </ScrollView>

      <Modal
        visible={showEndPairingModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEndPairingModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <Card>
            <View style={{ gap: 16 }}>
              <Text variant="title">
                {CONTENT.settings.relationship.confirmEndTitle}
              </Text>
              <Text variant="body">
                {CONTENT.settings.relationship.confirmEndBody}
              </Text>
              <View style={{ gap: 10 }}>
                <Button
                  label={
                    endPairingLoading
                      ? CONTENT.app.common.loading
                      : CONTENT.settings.relationship.confirmEndAction
                  }
                  onPress={onEndPairingConfirm}
                  disabled={endPairingLoading}
                />
                <Button
                  label={CONTENT.settings.relationship.cancelEndAction}
                  onPress={() => setShowEndPairingModal(false)}
                  variant="secondary"
                />
              </View>
            </View>
          </Card>
        </View>
      </Modal>

      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <Card>
            <View style={{ gap: 16 }}>
              <Text variant="title">
                {CONTENT.settings.account.confirmLogoutTitle}
              </Text>
              <Text variant="body">
                {CONTENT.settings.account.confirmLogoutBody}
              </Text>
              <View style={{ gap: 10 }}>
                <Button
                  label={CONTENT.settings.account.confirmLogoutAction}
                  onPress={onLogoutConfirm}
                />
                <Button
                  label={CONTENT.settings.account.cancelLogoutAction}
                  onPress={() => setShowLogoutModal(false)}
                  variant="secondary"
                />
              </View>
            </View>
          </Card>
        </View>
      </Modal>
    </Screen>
  );
}
