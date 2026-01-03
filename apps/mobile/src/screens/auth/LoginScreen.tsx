import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { CONTENT, loginSchema } from "@withyou/shared";
import { tokens } from "../../ui/tokens";
import { Screen } from "../../ui/components/Screen";
import { Text } from "../../ui/components/Text";
import { TextField } from "../../ui/components/TextField";
import { Button } from "../../ui/components/Button";

export function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setError("");
      setLoading(true);

      const payload = loginSchema.parse({ email, password });

      console.log("Logging in with:", payload);

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    console.log("Navigate to register screen");
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text variant="title">{CONTENT.auth.login.title}</Text>
        <Text variant="muted" style={styles.helper}>
          {CONTENT.auth.login.helper}
        </Text>
      </View>

      <View style={styles.form}>
        <TextField
          label={CONTENT.auth.login.fields.emailLabel}
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          errorText={error ? CONTENT.auth.login.validation.emailRequired : undefined}
        />

        <TextField
          label={CONTENT.auth.login.fields.passwordLabel}
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
        />

        {error ? (
          <Text variant="muted" style={styles.errorText}>
            {error}
          </Text>
        ) : null}

        <Button
          label={CONTENT.auth.login.actions.primary}
          onPress={handleLogin}
          disabled={loading}
          style={styles.submitButton}
        />

        <Button
          label={CONTENT.auth.login.actions.secondary}
          onPress={handleRegister}
          variant="secondary"
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
