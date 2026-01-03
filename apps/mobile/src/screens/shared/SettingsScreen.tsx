import React, { useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { CONTENT } from "@withyou/shared";
import { tokens } from "../../ui/tokens";
import { Screen } from "../../ui/components/Screen";
import { Text } from "../../ui/components/Text";
import { Button } from "../../ui/components/Button";
import { Card } from "../../ui/components/Card";

export function SettingsScreen() {
  const [showEndPairingModal, setShowEndPairingModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEndPairing = async () => {
    try {
      setLoading(true);
      console.log("Ending pairing");
      setShowEndPairingModal(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      console.log("Logging out");
      setShowLogoutModal(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text variant="title">{CONTENT.settings.title}</Text>

        <Text variant="subtitle" style={styles.sectionTitle}>
          {CONTENT.settings.sections.relationship}
        </Text>
        <Card style={styles.card}>
          <Text variant="muted">{CONTENT.settings.relationship.stageLabel}</Text>
          <Text variant="body" style={styles.stageValue}>Dating</Text>
        </Card>

        <Button
          label={CONTENT.settings.relationship.endPairing}
          onPress={() => setShowEndPairingModal(true)}
          variant="danger"
          style={styles.button}
        />

        <Text variant="subtitle" style={styles.sectionTitle}>
          {CONTENT.settings.sections.account}
        </Text>

        <Button
          label={CONTENT.settings.account.logout}
          onPress={() => setShowLogoutModal(true)}
          variant="secondary"
          style={styles.button}
        />

        {showEndPairingModal && (
          <View style={styles.modal}>
            <Card style={styles.modalContent}>
              <Text variant="title">{CONTENT.settings.relationship.confirmEndTitle}</Text>
              <Text variant="body" style={styles.modalText}>
                {CONTENT.settings.relationship.confirmEndBody}
              </Text>
              <View style={styles.modalActions}>
                <Button
                  label={CONTENT.settings.relationship.confirmEndAction}
                  onPress={handleEndPairing}
                  variant="danger"
                  disabled={loading}
                />
                <Button
                  label={CONTENT.settings.relationship.cancelEndAction}
                  onPress={() => setShowEndPairingModal(false)}
                  variant="secondary"
                />
              </View>
            </Card>
          </View>
        )}

        {showLogoutModal && (
          <View style={styles.modal}>
            <Card style={styles.modalContent}>
              <Text variant="title">{CONTENT.settings.account.confirmLogoutTitle}</Text>
              <Text variant="body" style={styles.modalText}>
                {CONTENT.settings.account.confirmLogoutBody}
              </Text>
              <View style={styles.modalActions}>
                <Button
                  label={CONTENT.settings.account.confirmLogoutAction}
                  onPress={handleLogout}
                  variant="danger"
                  disabled={loading}
                />
                <Button
                  label={CONTENT.settings.account.cancelLogoutAction}
                  onPress={() => setShowLogoutModal(false)}
                  variant="secondary"
                />
              </View>
            </Card>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { marginTop: tokens.space.lg, marginBottom: tokens.space.md },
  card: { marginBottom: tokens.space.md },
  stageValue: { marginTop: tokens.space.md },
  button: { marginVertical: tokens.space.sm },
  modal: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: tokens.space.lg },
  modalContent: { padding: tokens.space.lg },
  modalText: { marginVertical: tokens.space.md },
  modalActions: { gap: tokens.space.md, marginTop: tokens.space.lg },
});
