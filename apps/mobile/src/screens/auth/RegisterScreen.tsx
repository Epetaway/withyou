import React, { useState } from "react";
import { View, StyleSheet, Pressable, ScrollView } from "react-native";
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
    <Screen style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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
        <View style={styles.titleSection}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={[styles.subtitle, { color: theme.colors.text2 }]}>
            Sign up to get started
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formSection}>
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
            <Text variant="muted" style={{ color: "#B00020", marginTop: 8 }}>
              {errorText}
            </Text>
          ) : null}

          <Pressable
            style={[
              styles.primaryButton,
              loading && styles.disabledButton
            ]}
            onPress={onSubmit}
            disabled={loading}
          >
            <Text style={styles.primaryButtonText}>
              {loading ? CONTENT.app.common.loading : c.actions.primary}
            </Text>
          </Pressable>
        </View>

        {/* Login Link */}
        <View style={styles.loginSection}>
          <Text style={[styles.loginText, { color: theme.colors.text2 }]}>
            Already have an account?{" "}
          </Text>
          <Pressable onPress={() => navigation.navigate("Login")}>
            <Text style={[styles.loginLink, { color: theme.colors.primary }]}>
              Login
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  titleSection: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  formSection: {
    gap: 16,
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: "#4C1D95",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  loginSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loginText: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: "600",
  },
});
