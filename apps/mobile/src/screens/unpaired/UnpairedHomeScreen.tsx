import React from "react";
import { View, StyleSheet } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import { CONTENT } from "@withyou/shared";
import { Screen } from "../../ui/components/Screen";
import { Text } from "../../ui/components/Text";
import { Button } from "../../ui/components/Button";
import { clearSession } from "../../state/session";
import { Card } from "../../ui/components/Card";
import { Spacing } from "../../ui/tokens";
import { useTheme } from "../../ui/theme/ThemeProvider";

type UnpairedHomeScreenProps = {
  navigation: unknown;
};

export function UnpairedHomeScreen({ navigation }: UnpairedHomeScreenProps) {
  const theme = useTheme();
  const c = CONTENT.dashboard.unpaired;

  const handleLogout = async () => {
    await clearSession();
  };

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: "center", gap: Spacing.xl }}>
        {/* Hero Section */}
        <Card>
          <View style={{ gap: Spacing.lg, alignItems: "center" }}>
            <FontAwesome6 name="heart" size={56} color={theme.primary} weight="solid" />
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
          <Button
            label="Logout"
            onPress={handleLogout}
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
