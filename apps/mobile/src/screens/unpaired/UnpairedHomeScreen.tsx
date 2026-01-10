import React from "react";
import { View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { CONTENT } from "@withyou/shared";
import { Screen } from "../../ui/components/Screen";
import { Text } from "../../ui/components/Text";
import { ButtonNew as Button } from "../../ui/components/ButtonNew";
import { CardNew as Card } from "../../ui/components/CardNew";
import { Spacing } from "../../ui/tokens";
import { useTheme } from "../../ui/theme/ThemeProvider";

type UnpairedHomeScreenProps = {
  navigation: unknown;
};

export function UnpairedHomeScreen({ navigation }: UnpairedHomeScreenProps) {
  const { colors } = useTheme();
  const c = CONTENT.dashboard.unpaired;

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: "center", gap: Spacing.xl }}>
        {/* Hero Section */}
        <Card variant="elevated">
          <View style={{ gap: Spacing.lg, alignItems: "center" }}>
            <Feather name="heart" size={56} color={colors.secondary} />
            <View style={{ gap: Spacing.sm }}>
              <Text variant="title" style={{ textAlign: "center" }}>
                {c.title}
              </Text>
              <Text
                variant="body"
                style={{ textAlign: "center", color: colors.textMuted }}
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
            fullWidth
            icon={<Feather name="link" size={16} color={colors.textInverse} />}
          />

          <Button
            label={CONTENT.settings.title}
            onPress={() =>
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (navigation as any)?.navigate?.("Settings")
            }
            variant="secondary"
            fullWidth
            icon={<Feather name="settings" size={16} color={colors.primary} />}
          />
        </View>
      </View>
    </Screen>
  );
}
