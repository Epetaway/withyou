import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, Pressable, SafeAreaView, ScrollView, ActivityIndicator } from "react-native";
import { TextFieldNew } from "../../ui/components/TextFieldNew";
import { ThemedCard } from "../../components/ThemedCard";
import { ThemedText } from "../../components/ThemedText";
import { ScreenHeader } from "../../components/ScreenHeader";
import { Spacing } from "../../ui/tokens";
import { api } from "../../state/appState";
import { useAsyncAction } from "../../api/hooks";
import { useTheme } from "../../ui/theme/ThemeProvider";

type EmailVerificationScreenProps = {
  navigation: {
    navigate: (screen: string) => void;
  };
  route?: {
    params?: {
      email?: string;
    };
  };
};

export function EmailVerificationScreen({ navigation, route }: EmailVerificationScreenProps) {
  const theme = useTheme();
  const spacing = Spacing;
  const [code, setCode] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const email = route?.params?.email || "";

  // Send verification email on mount
  useEffect(() => {
    sendVerification();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const { run: sendVerification, loading: sending } = useAsyncAction(async () => {
    await api.request("/auth/verify/send", {
      method: "POST",
      body: JSON.stringify({}),
    });
    setCountdown(60); // 60 second cooldown
    setError(null);
  });

  const { run: verifyCode, loading: verifying } = useAsyncAction(async () => {
    if (code.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }

    await api.request("/auth/verify/confirm", {
      method: "POST",
      body: JSON.stringify({ code }),
    });

    // Navigate to next screen (e.g., pairing or dashboard)
    navigation.navigate("UnpairedHome");
  });

  const handleResend = async () => {
    if (countdown > 0) return;
    
    try {
      await sendVerification();
    } catch (_err) {
      setError("Failed to resend code. Please try again.");
    }
  };

  const handleVerify = useCallback(async () => {
    setError(null);
    try {
      await verifyCode();
    } catch (_err) {
      setError("Invalid or expired code. Please try again.");
    }
  }, [verifyCode]);

  // Auto-submit when 6 digits entered
  useEffect(() => {
    if (code.length === 6 && !verifying) {
      handleVerify();
    }
  }, [code, verifying, handleVerify]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <ScreenHeader title="Verify Your Email" subtitle={`We sent a 6-digit code to ${email || "your email"}`} />

        <ThemedCard style={styles.formSection} color="surface" elevation="sm">
          <TextFieldNew
            label="Verification Code"
            value={code}
            onChangeText={(text) => setCode(text.replace(/[^0-9]/g, "").slice(0, 6))}
            keyboardType="number-pad"
            autoCapitalize="none"
            placeholder="000000"
            maxLength={6}
            error={error || undefined}
          />

          {error ? (
            <ThemedText variant="caption" color="danger" style={{ marginTop: spacing.sm }}>
              {error}
            </ThemedText>
          ) : null}

          <Pressable
            style={[
              styles.primaryButton,
              { backgroundColor: theme.colors.primary },
              (verifying || code.length !== 6) && { opacity: 0.6 }
            ]}
            onPress={handleVerify}
            disabled={verifying || code.length !== 6}
          >
            {verifying ? (
              <ActivityIndicator color={theme.colors.background} />
            ) : (
              <ThemedText variant="body" color="secondary" style={{ fontWeight: "600" }}>
                Verify Email
              </ThemedText>
            )}
          </Pressable>

          <View style={styles.resendContainer}>
            {countdown > 0 ? (
              <ThemedText variant="caption" color="secondary">
                Resend code in {countdown}s
              </ThemedText>
            ) : (
              <Pressable onPress={handleResend} disabled={sending}>
                {sending ? (
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                ) : (
                  <ThemedText variant="caption" color="primary" style={{ fontWeight: "600" }}>
                    Resend Code
                  </ThemedText>
                )}
              </Pressable>
            )}
          </View>
        </ThemedCard>

        <Pressable style={styles.backButton} onPress={() => navigation.navigate("Login")}>
          <ThemedText variant="caption" color="secondary" style={{ textAlign: "center" }}>
            Back to Login
          </ThemedText>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { padding: Spacing.lg, paddingBottom: 100, gap: Spacing.lg },
  formSection: { gap: Spacing.md, padding: Spacing.lg },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 12,
    marginTop: Spacing.md,
    minHeight: 48,
  },
  resendContainer: { alignItems: "center", marginTop: Spacing.md },
  backButton: { alignItems: "center", marginTop: Spacing.lg },
});
