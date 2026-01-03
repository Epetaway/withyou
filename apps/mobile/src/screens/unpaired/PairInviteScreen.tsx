import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { CONTENT } from "@withyou/shared";
import { tokens } from "../../ui/tokens";
import { Screen } from "../../ui/components/Screen";
import { Text } from "../../ui/components/Text";
import { Button } from "../../ui/components/Button";
import { Card } from "../../ui/components/Card";

export function PairInviteScreen() {
  const [inviteCode, _setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerateCode = async () => {
    try {
      setError("");
      setLoading(true);

      console.log("Generating invite code");

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    console.log("Copy to clipboard:", inviteCode);
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text variant="title">{CONTENT.pairing.invite.title}</Text>
        <Text variant="body" style={styles.body}>
          {CONTENT.pairing.invite.body}
        </Text>
      </View>

      {inviteCode ? (
        <Card style={styles.codeCard}>
          <Text variant="muted">{CONTENT.pairing.invite.fields.inviteCodeLabel}</Text>
          <Text variant="subtitle" style={styles.codeText}>
            {inviteCode}
          </Text>
          <Text variant="muted" style={styles.statusText}>
            {CONTENT.pairing.invite.status.waiting}
          </Text>
        </Card>
      ) : null}

      {error ? (
        <Text variant="muted" style={styles.errorText}>
          {error}
        </Text>
      ) : null}

      <View style={styles.actions}>
        <Button
          label={CONTENT.pairing.invite.actions.generateCode}
          onPress={handleGenerateCode}
          disabled={loading}
        />

        {inviteCode && (
          <Button
            label={CONTENT.pairing.invite.actions.copyLink}
            onPress={handleCopyLink}
            variant="secondary"
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: tokens.space.lg },
  body: { marginTop: tokens.space.md },
  codeCard: { marginVertical: tokens.space.lg },
  codeText: { marginVertical: tokens.space.md, fontWeight: "600" },
  statusText: { marginTop: tokens.space.sm },
  errorText: { color: tokens.color.danger, marginVertical: tokens.space.md },
  actions: { gap: tokens.space.md, marginTop: tokens.space.lg },
});
