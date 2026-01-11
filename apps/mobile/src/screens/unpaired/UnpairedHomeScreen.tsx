import React from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CONTENT } from "@withyou/shared";
import { Screen } from "../../ui/components/Screen";
import { Text } from "../../ui/components/Text";
import { Button } from "../../ui/components/Button";
import { Card } from "../../ui/components/Card";
import { Spacing } from "../../ui/tokens";
import { useTheme } from "../../ui/theme";

type UnpairedHomeScreenProps = {
  navigation: unknown;
};

export function UnpairedHomeScreen({ navigation }: UnpairedHomeScreenProps) {
  const theme = useTheme();
  const c = CONTENT.dashboard.unpaired;

  return (
    <Screen style={{ paddingHorizontal: Spacing.md, paddingTop: Spacing.lg }}>
      <View style={{ flex: 1, justifyContent: "center", gap: Spacing.xl }}>
        {/* Hero Section */}
        <Card>
          <View style={{ gap: Spacing.lg, alignItems: "center" }}>
            <Ionicons name="heart-outline" size={56} color={theme.primary} />
            <View style={{ gap: Spacing.sm }}>
              <Text style={[styles.title, { color: theme.text, textAlign: "center" }]}>
                {c.title}
              </Text>
              <Text
                variant="body"
                style={{ textAlign: "center", color: theme.text2 }}
              >
                {c.body}
              </Text>
            </View>
          </View>
        </Card>

        {/* CTA Buttons */}
        <View style={{ gap: Spacing.sm }}>
          <Button
            label={c.actions.primary}
            onPress={() =>
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (navigation as any)?.navigate?.("PairInvite")
            }
            variant="primary"
          />
          <Button
            label={c.actions.secondary}
            onPress={() =>
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (navigation as any)?.navigate?.("PairAccept")
            }
            variant="secondary"
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: "700" },
});
