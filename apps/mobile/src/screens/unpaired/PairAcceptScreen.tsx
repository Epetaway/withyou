import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { CONTENT, inviteAcceptSchema } from "@withyou/shared";
import { tokens } from "../../ui/tokens";
import { Screen } from "../../ui/components/Screen";
import { Text } from "../../ui/components/Text";
import { TextField } from "../../ui/components/TextField";
import { Button } from "../../ui/components/Button";

export function PairAcceptScreen() {
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    try {
      setError("");
      setLoading(true);

      const payload = inviteAcceptSchema.parse({ inviteCode });

      console.log("Accepting invite:", payload);

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text variant="title">{CONTENT.pairing.accept.title}</Text>
        <Text variant="muted" style={styles.helper}>
          {CONTENT.pairing.accept.helper}
        </Text>
      </View>

      <View style={styles.form}>
        <TextField
          label={CONTENT.pairing.accept.fields.inviteCodeLabel}
          value={inviteCode}
          onChangeText={setInviteCode}
          placeholder="ABC123"
          autoCapitalize="characters"
        />

        {error ? (
          <Text variant="muted" style={styles.errorText}>
            {error}
          </Text>
        ) : null}

        <Button
          label={CONTENT.pairing.accept.actions.primary}
          onPress={handleAccept}
          disabled={loading || !inviteCode}
          style={styles.submitButton}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: tokens.space.lg },
  helper: { marginTop: tokens.space.md },
  form: { gap: tokens.space.md },
  errorText: { color: tokens.color.danger },
  submitButton: { marginTop: tokens.space.md },
});
