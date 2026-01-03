import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { CONTENT, registerSchema } from "@withyou/shared";
import { tokens } from "../../ui/tokens";
import { Screen } from "../../ui/components/Screen";
import { Text } from "../../ui/components/Text";
import { TextField } from "../../ui/components/TextField";
import { Button } from "../../ui/components/Button";

export function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    try {
      setError("");
      setLoading(true);

      const payload = registerSchema.parse({
        email,
        password,
        confirmPassword,
      });

      console.log("Registering with:", payload);

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    console.log("Navigate to login screen");
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text variant="title">{CONTENT.auth.register.title}</Text>
        <Text variant="muted" style={styles.helper}>
          {CONTENT.auth.register.helper}
        </Text>
      </View>

      <View style={styles.form}>
        <TextField
          label={CONTENT.auth.register.fields.emailLabel}
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
        />

        <TextField
          label={CONTENT.auth.register.fields.passwordLabel}
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
        />

        <TextField
          label={CONTENT.auth.register.fields.confirmPasswordLabel}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="••••••••"
          secureTextEntry
        />

        {error ? (
          <Text variant="muted" style={styles.errorText}>
            {error}
          </Text>
        ) : null}

        <Button
          label={CONTENT.auth.register.actions.primary}
          onPress={handleRegister}
          disabled={loading}
          style={styles.submitButton}
        />

        <Button
          label={CONTENT.auth.register.actions.secondary}
          onPress={handleBackToLogin}
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
