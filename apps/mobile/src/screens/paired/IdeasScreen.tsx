import React, { useEffect, useState } from "react";
import { View, ScrollView, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { CONTENT, IdeasResponse } from "@withyou/shared";
import { Screen } from "../../ui/components/Screen";
import { Text } from "../../ui/components/Text";
import { ButtonNew as Button } from "../../ui/components/ButtonNew";
import { CardNew as Card } from "../../ui/components/CardNew";
import { api } from "../../state/appState";
import { Spacing } from "../../ui/tokens";
import { useTheme } from "../../ui/theme/ThemeProvider";

type IdeasScreenProps = {
  navigation: unknown;
};

export function IdeasScreen({ navigation }: IdeasScreenProps) {
  const { colors } = useTheme();
  const [ideas, setIdeas] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState("");

  const fetchIdeas = async () => {
    try {
      setErrorText("");
      setLoading(true);
      const res = await api.request<IdeasResponse>("/ideas");
      setIdeas(res.ideas || []);
    } catch (err) {
      if (err instanceof Error) {
        setErrorText(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIdeas();
  }, []);

  const onGoToPreferences = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (navigation as any)?.navigate?.("Preferences");
  };

  if (errorText) {
    return (
      <Screen>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: Spacing.lg }}>
          <Feather name="alert-circle" size={48} color={colors.error} />
          <Text variant="title" style={{ textAlign: "center", color: colors.error }}>
            {CONTENT.app.errors.unknown}
          </Text>
          <Text variant="body" style={{ textAlign: "center", color: colors.textMuted }}>
            {errorText}
          </Text>
          <Button
            label={CONTENT.ideas.actions.goToPreferences}
            onPress={onGoToPreferences}
          />
        </View>
      </Screen>
    );
  }

  if (!ideas.length && !loading) {
    return (
      <Screen>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: Spacing.lg }}>
          <Feather name="inbox" size={48} color={colors.textMuted} />
          <Text variant="title" style={{ textAlign: "center" }}>
            {CONTENT.ideas.empty.needsPreferencesTitle}
          </Text>
          <Text variant="body" style={{ textAlign: "center", color: colors.textMuted }}>
            {CONTENT.ideas.empty.needsPreferencesBody}
          </Text>
          <Button
            label={CONTENT.ideas.actions.goToPreferences}
            onPress={onGoToPreferences}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.lg, paddingBottom: Spacing.xl }}>
        {/* Header */}
        <View style={{ gap: Spacing.sm }}>
          <Text variant="title">{CONTENT.ideas.title}</Text>
          <Text variant="body" style={{ color: colors.textMuted }}>
            {CONTENT.ideas.body}
          </Text>
        </View>

        {/* Loading State */}
        {loading ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", minHeight: 200 }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          /* Ideas List */
          <View style={{ gap: Spacing.md }}>
            {ideas.map((idea, idx) => (
              <Card key={idx} variant="elevated">
                <View style={{ gap: Spacing.md }}>
                  <View style={{ flexDirection: "row", gap: Spacing.sm }}>
                    <Feather name="lightbulb" size={20} color={colors.secondary} />
                    <Text variant="subtitle" style={{ flex: 1 }}>
                      {idea}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", gap: Spacing.sm }}>
                    <Button
                      label={CONTENT.ideas.actions.save}
                      onPress={() => console.log("Saved idea:", idea)}
                      variant="secondary"
                      size="small"
                      icon={<Feather name="bookmark" size={14} color={colors.primary} />}
                    />
                    <Button
                      label="Share"
                      onPress={() => console.log("Share idea:", idea)}
                      variant="ghost"
                      size="small"
                      icon={<Feather name="share-2" size={14} color={colors.primary} />}
                    />
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Refresh Button */}
        <Button
          label={loading ? CONTENT.app.common.loading : CONTENT.ideas.actions.refresh}
          onPress={fetchIdeas}
          disabled={loading}
          fullWidth
          icon={<Feather name="refresh-cw" size={16} color={colors.textInverse} />}
        />
      </ScrollView>
    </Screen>
  );
}
