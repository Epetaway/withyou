import React, { useState } from "react";
import { View } from "react-native";
import {
  CONTENT,
  inviteAcceptSchema,
  RelationshipAcceptResponse,
} from "@withyou/shared";
import { Screen } from "../../ui/components/Screen";
import { Text } from "../../ui/components/Text";
import { TextField } from "../../ui/components/TextField";
import { Button } from "../../ui/components/Button";
import { api } from "../../state/appState";
import { useAsyncAction } from "../../api/hooks";

type PairAcceptScreenProps = {
  navigation: unknown;
};

export function PairAcceptScreen({ navigation }: PairAcceptScreenProps) {
  const c = CONTENT.pairing.accept;

  const [inviteCode, setInviteCode] = useState("");
  const [inviteCodeError, setInviteCodeError] = useState("");

  const { run, loading, errorText } = useAsyncAction(async () => {
    setInviteCodeError("");

    const parsed = inviteAcceptSchema.safeParse({ inviteCode });
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      if (fieldErrors.inviteCode) {
        setInviteCodeError(fieldErrors.inviteCode[0]);
      }
      throw new Error("Validation failed");
    }

    const res = await api.request<RelationshipAcceptResponse>(
      "/relationship/accept",
      {
        method: "POST",
        body: JSON.stringify({ inviteCode }),
      }
    );

    // Success - navigate to dashboard
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (navigation as any)?.navigate?.("Dashboard");
    return res;
  });

  const onSubmit = async () => {
    try {
      await run();
    } catch {
      // Error handled in useAsyncAction
    }
  };

  return (
    <Screen>
      <View style={{ gap: 16 }}>
        <Text variant="title">{c.title}</Text>
        <Text variant="muted">{c.helper}</Text>

        <TextField
          label={c.fields.inviteCodeLabel}
          value={inviteCode}
          onChangeText={setInviteCode}
          placeholder="ABC123"
          autoCapitalize="characters"
          errorText={inviteCodeError}
        />

        {errorText ? (
          <Text variant="muted" style={{ color: "#B00020" }}>
            {errorText}
          </Text>
        ) : null}

        <Button
          label={loading ? CONTENT.app.common.loading : c.actions.primary}
          onPress={onSubmit}
          disabled={loading || !inviteCode}
        />
      </View>
    </Screen>
  );
}
