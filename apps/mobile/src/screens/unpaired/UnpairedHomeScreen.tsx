import React from "react";
import { View, StyleSheet, SafeAreaView, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CONTENT } from "@withyou/shared";
import { ThemedText } from "../../components/ThemedText";
import { ThemedCard } from "../../components/ThemedCard";
import { ScreenHeader } from "../../components/ScreenHeader";
import { Button } from "../../ui/components/Button";
import { clearSession } from "../../state/session";
import { useTheme } from "../../theme/ThemeProvider";
import { spacing } from "../../theme/tokens";
import { useNavigation, NavigationProp } from "@react-navigation/native";

type UnpairedStackParamList = {
  UnpairedHome: undefined;
  PairInvite: undefined;
  PairAccept: undefined;
};

export function UnpairedHomeScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp<UnpairedStackParamList>>();
  const c = CONTENT.dashboard.unpaired;

  const handleLogout = async () => {
    await clearSession();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader title="WithYou" />

        {/* Hero Card */}
        <ThemedCard elevation="sm" padding="xl" radius="lg" style={styles.heroCard}>
          <View style={styles.heroContent}>
            <Ionicons name="heart" size={64} color={theme.colors.primary} />
            <ThemedText variant="h1" color="primary" style={styles.heroTitle}>
              {c.title}
            </ThemedText>
            <ThemedText variant="body" color="secondary" style={styles.heroBody}>
              {c.body}
            </ThemedText>
          </View>
        </ThemedCard>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <Button
            label={c.actions.primary}
            onPress={() => navigation.navigate("PairInvite")}
            variant="primary"
          />
          <Button
            label={c.actions.secondary}
            onPress={() => navigation.navigate("PairAccept")}
            variant="secondary"
          />
          <Button
            label="Logout"
            onPress={handleLogout}
            variant="secondary"
          />
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
  heroCard: {
    marginBottom: spacing.xl,
  },
  heroContent: {
    alignItems: "center",
    gap: spacing.md,
  },
  heroTitle: {
    textAlign: "center",
  },
  heroBody: {
    textAlign: "center",
    lineHeight: 22,
  },
  actionsContainer: {
    gap: spacing.sm,
  },
});
