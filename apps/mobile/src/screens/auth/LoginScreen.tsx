import React, { useState } from "react";
import { View } from "react-native";
import { CONTENT, loginSchema, AuthResponse } from "@withyou/shared";
import { Screen } from "../../ui/components/Screen";
import { Text } from "../../ui/components/Text";
import { TextFieldNew } from "../../ui/components/TextFieldNew";
import { ButtonNew } from "../../ui/components/ButtonNew";
import { api } from "../../state/appState";
import { setSession } from "../../state/session";
import { setToken } from "../../state/appState";
import { useAsyncAction } from "../../api/hooks";

type LoginScreenProps = {
  navigation: unknown;
};

export function LoginScreen({ navigation }: LoginScreenProps) {
  const c = CONTENT.auth.login;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [emailError, setEmailError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();

  const { run, loading, errorText, setErrorText } = useAsyncAction(async () => {
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setErrorText(null);
      setEmailError(undefined);
      setPasswordError(undefined);

      for (const issue of parsed.error.issues) {
        if (issue.path[0] === "email") {
          setEmailError(
            issue.code === "invalid_string"
              ? c.validation.emailInvalid
              : c.validation.emailRequired
          );
        }
        if (issue.path[0] === "password") {
          setPasswordError(c.validation.passwordRequired);
        }
      }
      throw new Error("Validation failed");
    }

    const res = await api.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    await setSession(res.token, res.userId);
    setToken(res.token);
  });

  const onSubmit = async () => {
    setEmailError(undefined);
    setPasswordError(undefined);
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
          error={emailError}
        />
        <TextFieldNew
          label={c.fields.passwordLabel}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          error={passwordError}
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
          onPress={() => navigation.navigate("Register")}
          variant="secondary"
        />
      </View>
    </Screen>
  );
}
