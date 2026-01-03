import React from "react";
import { View, StyleSheet } from "react-native";
import { CONTENT } from "@withyou/shared";
import { tokens } from "../../ui/tokens";
import { Screen } from "../../ui/components/Screen";
import { Text } from "../../ui/components/Text";
import { Button } from "../../ui/components/Button";

export function UnpairedHomeScreen() {
  const handlePair = () => {
    console.log("Navigate to pairing");
  };

  return (
    <Screen>
      <View style={styles.container}>
        <Text variant="title">{CONTENT.dashboard.unpaired.title}</Text>
        <Text variant="body" style={styles.body}>
          {CONTENT.dashboard.unpaired.body}
        </Text>

        <Button
          label={CONTENT.dashboard.unpaired.actions.primary}
          onPress={handlePair}
          style={styles.button}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  body: { marginVertical: tokens.space.lg, textAlign: "center" },
  button: { marginTop: tokens.space.lg, alignSelf: "stretch" },
});
