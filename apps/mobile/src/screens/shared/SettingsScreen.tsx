import React, { useState } from "react";
import { View, ScrollView } from "react-native";
import { CONTENT } from "@withyou/shared";
import { Screen } from "../../ui/components/Screen";
import { Text } from "../../ui/components/Text";
import { ButtonNew as Button } from "../../ui/components/ButtonNew";
import { CardNew as Card } from "../../ui/components/CardNew";
import { api } from "../../state/appState";
import { clearSession } from "../../state/session";
import { useAsyncAction } from "../../api/hooks";
import { ToggleNew } from "../../ui/components/ToggleNew";
import { ModalNew } from "../../ui/components/ModalNew";
import { useTheme } from "../../ui/theme/ThemeProvider";

type SettingsScreenProps = {
  navigation: unknown;
};

export function SettingsScreen({ navigation }: SettingsScreenProps) {
  const { mode, toggle } = useTheme();
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

        <Text variant="subtitle">Appearance</Text>
        <Card>
          <ToggleNew
            label="Dark Mode"
            helper="Toggle the app theme"
            value={mode === 'dark'}
            onValueChange={toggle}
          />
        </Card>

        <Text variant="subtitle">{CONTENT.settings.sections.account}</Text>

        <Button
          label={CONTENT.settings.account.logout}
          onPress={() => setShowLogoutModal(true)}
          variant="secondary"
        />
      </ScrollView>

      <ModalNew
        visible={showEndPairingModal}
        onClose={() => setShowEndPairingModal(false)}
        title={CONTENT.settings.relationship.confirmEndTitle}
        message={CONTENT.settings.relationship.confirmEndBody}
        primaryAction={{
          label:
            endPairingLoading
              ? CONTENT.app.common.loading
              : CONTENT.settings.relationship.confirmEndAction,
          onPress: onEndPairingConfirm,
        }}
        secondaryAction={{
          label: CONTENT.settings.relationship.cancelEndAction,
          onPress: () => setShowEndPairingModal(false),
        }}
      />

      <ModalNew
        visible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title={CONTENT.settings.account.confirmLogoutTitle}
        message={CONTENT.settings.account.confirmLogoutBody}
        primaryAction={{
          label: CONTENT.settings.account.confirmLogoutAction,
          onPress: onLogoutConfirm,
        }}
        secondaryAction={{
          label: CONTENT.settings.account.cancelLogoutAction,
          onPress: () => setShowLogoutModal(false),
        }}
      />
    </Screen>
  );
}
