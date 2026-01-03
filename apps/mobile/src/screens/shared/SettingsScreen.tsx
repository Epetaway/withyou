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

  const { run: runEndPairing, loading: endPairingLoading } = useAsyncAction(
    async () => {
      await api.request("/relationship/end", {
        method: "POST",
      });
      setShowEndPairingModal(false);
      // Refresh nav to show unpaired screens
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (navigation as any)?.reset?.({
        index: 0,
        routes: [{ name: "Home" }],
      });
      return null;
    }
  );

  const { run: runLogout, loading: logoutLoading } = useAsyncAction(
    async () => {
      await clearSession();
      setShowLogoutModal(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (navigation as any)?.reset?.({
        index: 0,
        routes: [{ name: "Login" }],
      });
      return null;
    }
  );

  const onEndPairingConfirm = async () => {
    try {
      await runEndPairing();
    } catch {
      // Error handled
    }
  };

  const onLogoutConfirm = async () => {
    try {
      await runLogout();
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
                  label={
                    logoutLoading
                      ? CONTENT.app.common.loading
                      : CONTENT.settings.account.confirmLogoutAction
                  }
                  onPress={onLogoutConfirm}
                  disabled={logoutLoading}
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
