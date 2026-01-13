import React, { useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Screen } from "../../ui/components/Screen";
import { Text } from "../../ui/components/Text";
import { TextFieldNew } from "../../ui/components/TextFieldNew";
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
          <View style={{ gap: 16 }}>
            <Text variant="body" style={{ color: theme.colors.textSecondary }}>
              What would you like to be called?
            </Text>
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
          <View style={{ gap: 16 }}>
            <Text variant="body" style={{ color: theme.colors.textSecondary }}>
              What are your relationship goals? (You can select multiple or skip)
            </Text>
            <Text variant="helper" style={{ color: theme.colors.textSecondary, fontStyle: "italic" }}>
              Goal selection would go here
            </Text>
          </View>
        );
      case 3:
        return (
          <View style={{ gap: 16 }}>
            <Text variant="body" style={{ color: theme.colors.textSecondary }}>
              Choose your privacy settings
            </Text>
            <Text variant="helper" style={{ color: theme.colors.textSecondary, fontStyle: "italic" }}>
              Privacy toggles would go here
            </Text>
          </View>
        );
      case 4:
        return (
          <View style={{ gap: 16 }}>
            <Text variant="body" style={{ color: theme.colors.textSecondary }}>
              When would you like to receive notifications?
            </Text>
            <Text variant="helper" style={{ color: theme.colors.textSecondary, fontStyle: "italic" }}>
              Notification time pickers would go here
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <Screen scrollable>
      <View style={{ marginBottom: 32, marginTop: 40 }}>
        <Text variant="screenTitle">Set Up Your Profile</Text>
        <Text variant="screenSubtitle" style={{ color: theme.colors.textSecondary, marginTop: 4 }}>
          Step {currentStep} of {totalSteps}
        </Text>
      </View>

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
      <View style={{ marginBottom: 32 }}>{renderStep()}</View>

      {/* Buttons */}
      <View style={{ gap: 12 }}>
        <Pressable
          style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleNext}
          disabled={loading}
        >
          <Text style={{ color: theme.colors.background, fontSize: 16, fontWeight: "600" }}>
            {loading ? "Saving..." : currentStep === totalSteps ? "Finish" : "Next"}
          </Text>
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={handleSkip}>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 16, fontWeight: "600" }}>
            Skip
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  progressContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 32,
  },
  progressDot: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  primaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
  },
});
