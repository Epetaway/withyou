import React, { useState } from "react";
import { View } from "react-native";
import { CONTENT, InviteResponse } from "@withyou/shared";
import { Screen } from "../../ui/components/Screen";
import { Text } from "../../ui/components/Text";
import { Button } from "../../ui/components/Button";
import { Card } from "../../ui/components/Card";
import { api } from "../../state/appState";
import { useAsyncAction } from "../../api/hooks";
import * as Clipboard from "expo-clipboard";

type PairInviteScreenProps = {
  navigation: unknown;
};

export function PairInviteScreen({ navigation }: PairInviteScreenProps) {
  const c = CONTENT.pairing.invite;

  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  const { run, loading, errorText } = useAsyncAction(async () => {
    const res = await api.request<InviteResponse>("/relationship/invite", {
      method: "POST",
    });
    setInviteCode(res.inviteCode);
    setExpiresAt(res.expiresAt);
    return res;
  });

  const copyLink = async () => {
    if (!inviteCode) return;
    const link = `withyou://pair?code=${inviteCode}`;
    await Clipboard.setStringAsync(link);
  };

  const copyCode = async () => {
    if (!inviteCode) return;
    await Clipboard.setStringAsync(inviteCode);
  };

  return (
    <Screen>
      <View style={{ gap: 16 }}>
        <Text variant="title">{c.title}</Text>
        <Text variant="body">{c.body}</Text>

        {errorText ? (
          <Text variant="muted" style={{ color: "#B00020" }}>
            {errorText}
          </Text>
        ) : null}

        <Button
          label={loading ? CONTENT.app.common.loading : c.actions.generateCode}
          onPress={() => run()}
          disabled={loading}
        />

        {inviteCode ? (
          <Card>
            <View style={{ gap: 10 }}>
              <Text variant="subtitle">{c.fields.inviteCodeLabel}</Text>
              <Text variant="body">{inviteCode}</Text>
              {expiresAt ? (
                <Text variant="muted">Expires: {expiresAt}</Text>
              ) : null}

              <Button label="Copy code" onPress={copyCode} variant="secondary" />
              <Button label={c.actions.copyLink} onPress={copyLink} variant="secondary" />
              <Text variant="muted">{c.status.waiting}</Text>
            </View>
          </Card>
        ) : null}

        <Button
          label="Enter invite code"
          onPress={() =>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (navigation as any)?.navigate?.("PairAccept")
          }
          variant="secondary"
        />
      </View>
    </Screen>
  );
}
