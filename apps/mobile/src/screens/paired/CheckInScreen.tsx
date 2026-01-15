import React from "react";
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useTheme } from "../../theme/ThemeProvider";
import { useCheckInDraft } from "../../hooks/useCheckInDraft";
import { useSubmitCheckIn } from "../../hooks/useSubmitCheckIn";
import { getOptionsForSection } from "../../lib/checkinOptions";
import { CheckInHero } from "../../components/checkin/CheckInHero";
import { ChipGroup } from "../../components/checkin/ChipGroup";
import { CheckInTextArea } from "../../components/checkin/CheckInTextArea";
import { CheckInActions } from "../../components/checkin/CheckInActions";
import { ThemedCard } from "../../components/ThemedCard";
import { ThemedText } from "../../components/ThemedText";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

type RootStackParamList = Record<string, unknown>;
type CheckInScreenProps = NativeStackScreenProps<RootStackParamList, "CheckIn">;

export function CheckInScreen({ navigation }: CheckInScreenProps) {
  const theme = useTheme();
  const { draft, setNeeds, setIntentions, setSupport, updateNote, reset } =
    useCheckInDraft();
  const { submit, isLoading, error, clearError } = useSubmitCheckIn();

  // Get options for each section
  const needsOptions = getOptionsForSection("needs");
  const intentionsOptions = getOptionsForSection("intentions");
  const supportOptions = getOptionsForSection("support");

  const handleSave = async () => {
    if (error) clearError();

    try {
      const result = await submit(draft);
      if (result.success) {
        Alert.alert(
          "Check-in saved",
          "Your check-in has been sent to your partner.",
          [
            {
              text: "OK",
              onPress: () => {
                reset();
                navigation.goBack();
              },
            },
          ]
        );
      } else {
        Alert.alert("Error", result.error || "Failed to save check-in");
      }
    } catch (_err) {
      Alert.alert("Error", "An unexpected error occurred");
    }
  };

  const handleCancel = () => {
    if (
      draft.needs.length > 0 ||
      draft.intentions.length > 0 ||
      draft.support.length > 0 ||
      draft.note
    ) {
      Alert.alert(
        "Discard check-in?",
        "You have unsaved changes. Are you sure you want to discard them?",
        [
          { text: "Keep editing", onPress: () => {} },
          {
            text: "Discard",
            onPress: () => {
              reset();
              navigation.goBack();
            },
            style: "destructive",
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
        keyboardVerticalOffset={10}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          bounces={false}
        >
          {/* Hero header */}
          <CheckInHero
            onBackPress={handleCancel}
            onInfoPress={() => {
              Alert.alert(
                "About Check-ins",
                "Check-ins help you and your partner understand each other better. Your check-in is private until your partner also checks in."
              );
            }}
          />

          {/* Main content card */}
          <ThemedCard
            elevation="sm"
            padding="lg"
            radius="lg"
            style={{
              marginTop: -40,
              marginHorizontal: 16,
              marginBottom: 16,
            }}
          >
            {/* I could really use... section */}
            <ChipGroup
              label="I could really use..."
              options={needsOptions}
              selectedIds={draft.needs}
              onSelectionChange={setNeeds}
              helperText={
                draft.needs.includes("empathy")
                  ? "I need to feel heard and understood."
                  : draft.needs.includes("reassurance")
                  ? "I need support and comfort."
                  : undefined
              }
              style={{ marginBottom: 24 }}
            />

            {/* I need to... section */}
            <ChipGroup
              label="I need to..."
              options={intentionsOptions}
              selectedIds={draft.intentions}
              onSelectionChange={setIntentions}
              style={{ marginBottom: 24 }}
            />

            {/* Ways you can help... section */}
            <ChipGroup
              label="Ways you can help..."
              options={supportOptions}
              selectedIds={draft.support}
              onSelectionChange={setSupport}
              style={{ marginBottom: 24 }}
            />

            {/* Text input section */}
            <CheckInTextArea
              label="Anything else you'd like to share?"
              placeholder="Tell your partner what's on your mind today..."
              value={draft.note}
              onChangeText={updateNote}
              maxLength={250}
              helperText="Keep it short. This helps your partner understand, but they don't have to solve it."
              style={{ marginBottom: 24 }}
            />

            {/* Error message */}
            {error && (
              <View
                style={[
                  styles.errorContainer,
                  { backgroundColor: theme.colors.danger + "15" },
                ]}
              >
                <ThemedText variant="body" color="danger">
                  {error}
                </ThemedText>
              </View>
            )}

            {/* Actions */}
            <CheckInActions
              onSave={handleSave}
              onCancel={handleCancel}
              isLoading={isLoading}
            />
          </ThemedCard>
        </ScrollView>

        {/* Loading overlay */}
        {isLoading && (
          <View
            style={[
              styles.loadingOverlay,
              { backgroundColor: "rgba(0,0,0,0.3)" },
            ]}
          >
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
});
