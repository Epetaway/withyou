import React, { useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import { CONTENT, loginSchema, AuthResponse } from "@withyou/shared";
import { Screen } from "../../ui/components/Screen";
import { Text } from "../../ui/components/Text";
import { TextFieldNew } from "../../ui/components/TextFieldNew";
import { api } from "../../state/appState";
import { setSession } from "../../state/session";
import { setToken } from "../../state/appState";
import { useAsyncAction } from "../../api/hooks";
import { useTheme } from "../../ui/theme/ThemeProvider";

type LoginScreenProps = {
  navigation: {
    navigate: (screen: string) => void;
  };
};

export function LoginScreen({ navigation }: LoginScreenProps) {
  const c = CONTENT.auth.login;
  const theme = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const { run, loading, errorText, setErrorText } = useAsyncAction(async () => {
    const parsed = loginSchema.safeParse({ email, password });

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
          next.password = c.validation.passwordRequired;
        }
      }
      setFieldErrors(next);
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
    setFieldErrors({});
    try {
      await run();
    } catch {
      // Error handled in useAsyncAction
    }
  };

  return (
    <Screen scrollable>
      {/* Title Section */}
      <View style={{ marginBottom: 32, marginTop: 40 }}>
        <Text variant="screenTitle">Welcome Back</Text>
        <Text variant="screenSubtitle" style={{ color: theme.colors.textSecondary, marginTop: 4 }}>
          Sign in to continue
        </Text>
      </View>

      {/* Form */}
      <View style={{ gap: 16, marginBottom: 24 }}>
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

        {errorText ? (
          <Text variant="helper" style={{ color: theme.colors.error, marginTop: 8 }}>
            {errorText}
          </Text>
        ) : null}

        <Pressable
          style={[
            styles.primaryButton,
            { backgroundColor: theme.colors.primary },
            loading && { opacity: 0.6 }
          ]}
          onPress={onSubmit}
          disabled={loading}
        >
          <Text style={{ color: theme.colors.background, fontSize: 16, fontWeight: "600" }}>
            {loading ? CONTENT.app.common.loading : c.actions.primary}
          </Text>
        </Pressable>
      </View>

      {/* Sign Up Link */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
        <Text variant="helper" style={{ color: theme.colors.textSecondary }}>
          Don&apos;t have an account?{" "}
        </Text>
        <Pressable onPress={() => navigation.navigate("Register")}>
          <Text variant="helper" style={{ color: theme.colors.primary, fontWeight: "600" }}>
            Sign Up
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
});
