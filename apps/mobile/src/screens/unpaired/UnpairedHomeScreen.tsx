import React from "react";
import { View } from "react-native";
import { CONTENT } from "@withyou/shared";
import { Screen } from "../../ui/components/Screen";
import { Text } from "../../ui/components/Text";
import { Button } from "../../ui/components/Button";

type UnpairedHomeScreenProps = {
  navigation: unknown;
};

export function UnpairedHomeScreen({ navigation }: UnpairedHomeScreenProps) {
  const c = CONTENT.dashboard.unpaired;

  return (
    <Screen>
      <View style={{ gap: 16 }}>
        <Text variant="title">{c.title}</Text>
        <Text variant="body">{c.body}</Text>

        <Button
          label={c.actions.primary}
          onPress={() =>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (navigation as any)?.navigate?.("PairInvite")
          }
        />

        <Button
          label={CONTENT.settings.title}
          onPress={() =>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (navigation as any)?.navigate?.("Settings")
          }
          variant="secondary"
        />
      </View>
    </Screen>
  );
}
