import React, { useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import { CONTENT, registerSchema, AuthResponse } from "@withyou/shared";
import { Screen } from "../../ui/components/Screen";
import { Text } from "../../ui/components/Text";
import { TextFieldNew } from "../../ui/components/TextFieldNew";
import { api } from "../../state/appState";
import { setSession } from "../../state/session";
import { setToken } from "../../state/appState";
import { useAsyncAction } from "../../api/hooks";
import { useTheme } from "../../ui/theme/ThemeProvider";

type RegisterScreenProps = {
  navigation: {
    navigate: (screen: string) => void;
  };
};

export function RegisterScreen({ navigation }: RegisterScreenProps) {
  const c = CONTENT.auth.register;
  const theme = useTheme();

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
    <Screen scrollable>
      {/* Header with back button */}
      <View style={styles.header}>
        <Pressable 
          style={styles.backButton}
          onPress={() => navigation.navigate("Login")}
        >
          <FontAwesome6 name="arrow-left" size={24} color={theme.colors.text} weight="bold" />
        </Pressable>
      </View>

      {/* Title Section */}
      <View style={{ marginBottom: 32, marginTop: 8 }}>
        <Text variant="screenTitle">Create Account</Text>
        <Text variant="screenSubtitle" style={{ color: theme.colors.textSecondary, marginTop: 4 }}>
          Sign up to get started
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
        
        <TextFieldNew
          label={c.fields.confirmPasswordLabel}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          autoCapitalize="none"
          error={fieldErrors.confirmPassword}
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

      {/* Login Link */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
        <Text variant="helper" style={{ color: theme.colors.textSecondary }}>
          Already have an account?{" "}
        </Text>
        <Pressable onPress={() => navigation.navigate("Login")}>
          <Text variant="helper" style={{ color: theme.colors.primary, fontWeight: "600" }}>
            Login
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
});
