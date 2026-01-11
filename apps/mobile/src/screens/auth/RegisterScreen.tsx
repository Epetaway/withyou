import React, { useState } from "react";
import { View } from "react-native";
import { CONTENT, registerSchema, AuthResponse } from "@withyou/shared";
import { Screen } from "../../ui/components/Screen";
import { Text } from "../../ui/components/Text";
import { TextFieldNew } from "../../ui/components/TextFieldNew";
import { ButtonNew } from "../../ui/components/ButtonNew";
import { api } from "../../state/appState";
import { setSession } from "../../state/session";
import { setToken } from "../../state/appState";
import { useAsyncAction } from "../../api/hooks";

type RegisterScreenProps = {
  navigation: {
    navigate: (screen: string) => void;
  };
};

export function RegisterScreen({ navigation }: RegisterScreenProps) {
  const c = CONTENT.auth.register;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const { run, loading, errorText, setErrorText } = useAsyncAction(async () => {
    const parsed = registerSchema.safeParse({ email, password, confirmPassword });

    if (!parsed.success) {
      setErrorText(null);
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (key === "email") {
          next.email =
            issue.code === "invalid_string"
              ? c.validation.emailInvalid
              : c.validation.emailRequired;
        } else if (key === "password") {
          next.password =
            issue.code === "too_small"
              ? c.validation.passwordMinLength
              : c.validation.passwordRequired;
        } else if (key === "confirmPassword") {
          next.confirmPassword = c.validation.passwordMismatch;
        }
      }
      setFieldErrors(next);
      throw new Error("Validation failed");
    }

    const res = await api.request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    await setSession(res.token, res.userId);
    setToken(res.token);
  });

  const onSubmit = async () => {
    setFieldErrors({});
    try {
      await run();
    } catch {
      // Error handled in useAsyncAction
    }
  };

  return (
    <Screen>
      <View style={{ gap: 16 }}>
        <Text variant="title">{c.title}</Text>
        <Text variant="muted">{c.helper}</Text>

        <TextFieldNew
          label={c.fields.emailLabel}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          error={fieldErrors.email}
        />
        <TextFieldNew
          label={c.fields.passwordLabel}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          error={fieldErrors.password}
        />
        <TextFieldNew
          label={c.fields.confirmPasswordLabel}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          autoCapitalize="none"
          error={fieldErrors.confirmPassword}
        />

        {errorText ? (
          <Text variant="muted" style={{ color: "#B00020" }}>
            {errorText}
          </Text>
        ) : null}

        <ButtonNew
          label={loading ? CONTENT.app.common.loading : c.actions.primary}
          onPress={onSubmit}
          disabled={loading}
        />

        <ButtonNew
          label={c.actions.secondary}
          onPress={() => navigation.navigate("Login")}
          variant="secondary"
        />
      </View>
    </Screen>
  );
}
