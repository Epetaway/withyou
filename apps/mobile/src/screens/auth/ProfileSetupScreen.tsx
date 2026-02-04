import React, { useState } from "react";
import { View, StyleSheet, Pressable, SafeAreaView, ScrollView } from "react-native";
import { TextFieldNew } from "../../ui/components/TextFieldNew";
import { ThemedCard } from "../../ui/components/ThemedCard";
import { ThemedText } from "../../ui/components/ThemedText";
import { ScreenHeader } from "../../ui/components/ScreenHeader";
import { spacing } from "../../ui/tokens";
import { api } from "../../state/appState";
import { useAsyncAction } from "../../api/hooks";
import { useTheme } from "../../ui/theme/ThemeProvider";

type ProfileSetupScreenProps = {
  navigation: {
    navigate: (screen: string) => void;
  };
};

export function ProfileSetupScreen({ navigation }: ProfileSetupScreenProps) {
  const theme = useTheme();
  const [nickname, setNickname] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const { run: saveSetup, loading } = useAsyncAction(async () => {
    await api.request("/user/setup", {
      method: "POST",
      body: JSON.stringify({
        nickname: nickname || undefined,
      }),
    });

    // Navigate to unpaired home
    navigation.navigate("UnpairedHome");
  });

  const handleSkip = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      navigation.navigate("UnpairedHome");
    }
  };

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      try {
        await saveSetup();
      } catch (err) {
        console.error("Setup error:", err);
      }
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={{ gap: spacing.md }}>
            <ThemedText variant="body" color="secondary">
              What would you like to be called?
            </ThemedText>
            <TextFieldNew
              label="Nickname (optional)"
              value={nickname}
              onChangeText={setNickname}
              placeholder="Your nickname"
              autoCapitalize="words"
            />
          </View>
        );
      case 2:
        return (
          <View style={{ gap: spacing.md }}>
            <ThemedText variant="body" color="secondary">
              What are your relationship goals? (You can select multiple or skip)
            </ThemedText>
            <ThemedText variant="caption" color="secondary" style={{ fontStyle: "italic" }}>
              Goal selection would go here
            </ThemedText>
          </View>
        );
      case 3:
        return (
          <View style={{ gap: spacing.md }}>
            <ThemedText variant="body" color="secondary">
              Choose your privacy settings
            </ThemedText>
            <ThemedText variant="caption" color="secondary" style={{ fontStyle: "italic" }}>
              Privacy toggles would go here
            </ThemedText>
          </View>
        );
      case 4:
        return (
          <View style={{ gap: spacing.md }}>
            <ThemedText variant="body" color="secondary">
              When would you like to receive notifications?
            </ThemedText>
            <ThemedText variant="caption" color="secondary" style={{ fontStyle: "italic" }}>
              Notification time pickers would go here
            </ThemedText>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <ScreenHeader title="Set Up Your Profile" subtitle={`Step ${currentStep} of ${totalSteps}`} />

        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          {[1, 2, 3, 4].map((step) => (
            <View
              key={step}
              style={[
                styles.progressDot,
                {
                  backgroundColor:
                    step <= currentStep ? theme.colors.primary : theme.colors.textSecondary,
                  opacity: step <= currentStep ? 1 : 0.3,
                },
              ]}
            />
          ))}
        </View>

        {/* Step content */}
        <ThemedCard style={styles.stepContent} color="surface" elevation="sm">
          {renderStep()}
        </ThemedCard>

        {/* Buttons */}
        <View style={{ gap: spacing.sm }}>
          <Pressable
            style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleNext}
            disabled={loading}
          >
            <ThemedText variant="body" style={{ fontWeight: "600" }} color="secondary">
              {loading ? "Saving..." : currentStep === totalSteps ? "Finish" : "Next"}
            </ThemedText>
          </Pressable>

          <Pressable style={[styles.secondaryButton, { borderColor: theme.colors.primary }]} onPress={handleSkip}>
            <ThemedText variant="body" color="primary" style={{ fontWeight: "600" }}>
              Skip
            </ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { padding: spacing.lg, paddingBottom: 100, gap: spacing.lg },
  progressContainer: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  progressDot: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  stepContent: { padding: spacing.lg, gap: spacing.md },
  primaryButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    alignItems: "center",
    minHeight: 48,
  },
  secondaryButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1.5,
  },
});
