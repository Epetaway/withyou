import React, { useState } from "react";
import { View, StyleSheet, Pressable, Platform, SafeAreaView, ScrollView, TextInput } from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { CONTENT, loginSchema, AuthResponse, OAuthLoginResponse } from "@withyou/shared";
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
import * as AppleAuthentication from "expo-apple-authentication";

type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  EmailVerification: { email: string };
};

export function LoginScreen() {
  const c = CONTENT.auth.login;
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp<AuthStackParamList>>();

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
            issue.code === "invalid_format"
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

  const handleAppleSignIn = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        ],
      });

      const res = await api.request<OAuthLoginResponse>("/auth/apple", {
        method: "POST",
        body: JSON.stringify({
          provider: "apple",
          idToken: credential.identityToken,
        }),
      });

      await setSession(res.token, res.userId);
      setToken(res.token);

      if (!res.emailVerified && res.isNewUser) {
        navigation.navigate("EmailVerification", { email: credential.email || "" });
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'code' in err && err.code === "ERR_CANCELED") {
        return;
      }
      console.error("Apple sign in error:", err);
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
        <ScreenHeader 
          title="Welcome Back"
          subtitle="Sign in to continue"
        />

        {/* OAuth Buttons */}
        {Platform.OS === "ios" && (
          <View style={styles.oauthSection}>
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
              cornerRadius={12}
              style={styles.appleButton}
              onPress={handleAppleSignIn}
            />
          </View>
        )}

        {/* Divider */}
        <View style={styles.divider}>
          <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
          <ThemedText variant="caption" color="muted" style={styles.dividerText}>
            or
          </ThemedText>
          <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
        </View>

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

        {/* Sign Up Link */}
        <View style={styles.linkContainer}>
          <ThemedText variant="body" color="secondary">
            Don&apos;t have an account?{" "}
          </ThemedText>
          <Pressable onPress={() => navigation.navigate("Register")}>
            <ThemedText variant="body" color="primary" style={styles.link}>
              Sign Up
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
  oauthSection: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  appleButton: {
    width: "100%",
    height: 50,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: spacing.md,
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
