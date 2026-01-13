import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Screen } from "../../ui/components/Screen";
import { Text } from "../../ui/components/Text";
import { TextFieldNew } from "../../ui/components/TextFieldNew";
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
    <Screen scrollable>
      <View style={{ marginBottom: 32, marginTop: 40 }}>
        <Text variant="screenTitle">Verify Your Email</Text>
        <Text variant="screenSubtitle" style={{ color: theme.colors.textSecondary, marginTop: 4 }}>
          We sent a 6-digit code to {email || "your email"}
        </Text>
      </View>

      <View style={{ gap: 16, marginBottom: 24 }}>
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
          <Text variant="helper" style={{ color: theme.colors.error }}>
            {error}
          </Text>
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
          <Text style={{ color: theme.colors.background, fontSize: 16, fontWeight: "600" }}>
            {verifying ? "Verifying..." : "Verify Email"}
          </Text>
        </Pressable>

        <View style={{ alignItems: "center", marginTop: 16 }}>
          {countdown > 0 ? (
            <Text variant="helper" style={{ color: theme.colors.textSecondary }}>
              Resend code in {countdown}s
            </Text>
          ) : (
            <Pressable onPress={handleResend} disabled={sending}>
              <Text variant="helper" style={{ color: theme.colors.primary, fontWeight: "600" }}>
                {sending ? "Sending..." : "Resend Code"}
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      <Pressable onPress={() => navigation.navigate("Login")}>
        <Text variant="helper" style={{ color: theme.colors.textSecondary, textAlign: "center" }}>
          Back to Login
        </Text>
      </Pressable>
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
    marginTop: 8,
  },
});
