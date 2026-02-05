import React, { useState } from "react";
import { View, StyleSheet, Pressable, SafeAreaView, ScrollView, TextInput } from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { CONTENT, registerSchema, AuthResponse } from "@withyou/shared";
import { ThemedText } from "../../components/ThemedText";
import { ThemedCard } from "../../components/ThemedCard";
import { ScreenHeader } from "../../components/ScreenHeader";
import { Button } from "../../ui/components/Button";
import { api } from "../../state/appState";
import { setSession } from "../../state/session";
import { setToken } from "../../state/appState";
import { useAsyncAction } from "../../api/hooks";
import { useTheme } from "../../theme/ThemeProvider";
import { spacing } from "../../theme/tokens";

type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export function RegisterScreen() {
  const c = CONTENT.auth.register;
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp<AuthStackParamList>>();

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
            issue.code === "invalid_format"
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back Button */}
        <Pressable 
          style={styles.backButton}
          onPress={() => navigation.navigate("Login")}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </Pressable>

        <ScreenHeader 
          title="Create Account"
          subtitle="Sign up to get started"
        />

        {/* Form */}
        <ThemedCard elevation="sm" padding="lg" radius="lg" style={styles.formCard}>
          <View style={styles.formFields}>
            <View>
              <ThemedText variant="caption" color="secondary" style={styles.fieldLabel}>
                {c.fields.emailLabel}
              </ThemedText>
              <TextInput
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="you@example.com"
                placeholderTextColor={theme.colors.textMuted}
                style={[
                  styles.input,
                  {
                    color: theme.colors.text,
                    backgroundColor: theme.colors.background,
                    borderColor: fieldErrors.email ? theme.colors.danger : theme.colors.border,
                  },
                ]}
              />
              {fieldErrors.email && (
                <ThemedText variant="caption" color="danger" style={styles.errorText}>
                  {fieldErrors.email}
                </ThemedText>
              )}
            </View>

            <View>
              <ThemedText variant="caption" color="secondary" style={styles.fieldLabel}>
                {c.fields.passwordLabel}
              </ThemedText>
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                placeholder="••••••••"
                placeholderTextColor={theme.colors.textMuted}
                style={[
                  styles.input,
                  {
                    color: theme.colors.text,
                    backgroundColor: theme.colors.background,
                    borderColor: fieldErrors.password ? theme.colors.danger : theme.colors.border,
                  },
                ]}
              />
              {fieldErrors.password && (
                <ThemedText variant="caption" color="danger" style={styles.errorText}>
                  {fieldErrors.password}
                </ThemedText>
              )}
            </View>

            <View>
              <ThemedText variant="caption" color="secondary" style={styles.fieldLabel}>
                {c.fields.confirmPasswordLabel}
              </ThemedText>
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
                placeholder="••••••••"
                placeholderTextColor={theme.colors.textMuted}
                style={[
                  styles.input,
                  {
                    color: theme.colors.text,
                    backgroundColor: theme.colors.background,
                    borderColor: fieldErrors.confirmPassword ? theme.colors.danger : theme.colors.border,
                  },
                ]}
              />
              {fieldErrors.confirmPassword && (
                <ThemedText variant="caption" color="danger" style={styles.errorText}>
                  {fieldErrors.confirmPassword}
                </ThemedText>
              )}
            </View>

            {errorText && (
              <ThemedText variant="body" color="danger">
                {errorText}
              </ThemedText>
            )}

            <Button
              label={loading ? CONTENT.app.common.loading : c.actions.primary}
              onPress={onSubmit}
              disabled={loading}
              variant="primary"
            />
          </View>
        </ThemedCard>

        {/* Login Link */}
        <View style={styles.linkContainer}>
          <ThemedText variant="body" color="secondary">
            Already have an account?{" "}
          </ThemedText>
          <Pressable onPress={() => navigation.navigate("Login")}>
            <ThemedText variant="body" color="primary" style={styles.link}>
              Sign In
            </ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  backButton: {
    marginBottom: spacing.md,
  },
  formCard: {
    marginBottom: spacing.lg,
  },
  formFields: {
    gap: spacing.md,
  },
  fieldLabel: {
    marginBottom: spacing.xs,
  },
  input: {
    fontSize: 16,
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
  },
  errorText: {
    marginTop: spacing.xs,
  },
  linkContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  link: {
    fontWeight: "600",
  },
});
