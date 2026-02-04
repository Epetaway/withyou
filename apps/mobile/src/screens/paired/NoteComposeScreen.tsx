import React, { useState } from "react";
import { View, StyleSheet, TextInput, Pressable, Image, Alert, ActivityIndicator, SafeAreaView, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import { ThemedText } from "../../components/ThemedText";
import { ThemedCard } from "../../components/ThemedCard";
import { ScreenHeader } from "../../components/ScreenHeader";
import { Button } from "../../ui/components/Button";
import { useTheme } from "../../theme/ThemeProvider";
import { spacing } from "../../theme/tokens";
import { api } from "../../state/appState";
import { NoteType } from "@withyou/shared";

export function NoteComposeScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const [noteType, setNoteType] = useState<NoteType>("TEXT");
  const [content, setContent] = useState("");
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert("Permission Required", "Please grant photo library permission to send images.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setMediaUri(result.assets[0].uri);
      setNoteType("TEXT");
    }
  };

  const pickVideo = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert("Permission Required", "Please grant photo library permission to send videos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 0.5,
      videoMaxDuration: 60,
    });

    if (!result.canceled && result.assets[0]) {
      setMediaUri(result.assets[0].uri);
      setNoteType("VIDEO");
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert("Permission Required", "Please grant camera permission to take photos.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setMediaUri(result.assets[0].uri);
      setNoteType("TEXT");
    }
  };

  const uploadMedia = async (uri: string): Promise<string> => {
    console.warn("Media upload not implemented - using local URI as placeholder");
    return uri;
  };

  const sendNote = async () => {
    if (noteType === "TEXT" && !content.trim()) {
      Alert.alert("Empty Note", "Please enter some text for your note.");
      return;
    }

    if ((noteType === "VIDEO") && !mediaUri) {
      Alert.alert("No Media", "Please select a video to send.");
      return;
    }

    try {
      setSending(true);
      
      let mediaUrl: string | undefined = undefined;
      if (mediaUri) {
        setUploading(true);
        mediaUrl = await uploadMedia(mediaUri);
        setUploading(false);
      }

      const payload: { type: NoteType; content?: string; media_url?: string } = {
        type: noteType,
      };

      if (noteType === "TEXT" || content.trim()) {
        payload.content = content.trim();
      }

      if (mediaUrl) {
        payload.media_url = mediaUrl;
      }

      await api.request("/notes", {
        method: "POST",
        body: payload,
      });

      Alert.alert("Note Sent", "Your note has been sent to your partner.", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to send note");
    } finally {
      setSending(false);
      setUploading(false);
    }
  };

  const clearMedia = () => {
    setMediaUri(null);
    if (noteType === "VIDEO") {
      setNoteType("TEXT");
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader title="Send a Note" subtitle="Keep it private and meaningful" />

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <ThemedText variant="body" color="secondary" style={styles.hint}>
          Send a sweet message, photo, or short video to your partner.
        </ThemedText>

        <ThemedCard elevation="sm" padding="md" radius="lg">
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border,
              },
            ]}
            placeholder="Write your note here..."
            placeholderTextColor={theme.colors.textMuted}
            multiline
            value={content}
            onChangeText={setContent}
            maxLength={300}
            textAlignVertical="top"
          />
          <ThemedText variant="caption" color="muted" style={styles.charCount}>
            {content.length}/300
          </ThemedText>
        </ThemedCard>

        {mediaUri && (
          <View style={styles.mediaSection}>
            <ThemedText variant="overline" color="muted" style={styles.sectionLabel}>
              ATTACHMENT
            </ThemedText>
            <ThemedCard elevation="sm" padding="0" radius="lg" style={styles.mediaPreview}>
              {noteType === "VIDEO" ? (
                <View style={[styles.videoPlaceholder, { backgroundColor: theme.colors.surface }]}>
                  <Ionicons name="film" size={48} color={theme.colors.primary} />
                  <ThemedText variant="body" color="primary" style={styles.videoText}>
                    Video attached
                  </ThemedText>
                </View>
              ) : (
                <Image source={{ uri: mediaUri }} style={styles.imagePreview} resizeMode="cover" />
              )}
              <Pressable style={styles.removeMediaButton} onPress={clearMedia}>
                <Ionicons name="close" size={18} color="#FFFFFF" />
              </Pressable>
            </ThemedCard>
          </View>
        )}

        <View style={styles.attachmentSection}>
          <ThemedText variant="overline" color="muted" style={styles.sectionLabel}>
            ADD ATTACHMENT
          </ThemedText>
          <View style={styles.attachmentButtons}>
            <Pressable
              style={[styles.attachmentButton, { backgroundColor: theme.colors.primary + "15", borderColor: theme.colors.primary }]}
              onPress={takePhoto}
            >
              <Ionicons name="camera" size={28} color={theme.colors.primary} />
              <ThemedText variant="caption" color="primary">Camera</ThemedText>
            </Pressable>

            <Pressable
              style={[styles.attachmentButton, { backgroundColor: theme.colors.primary + "15", borderColor: theme.colors.primary }]}
              onPress={pickImage}
            >
              <Ionicons name="image" size={28} color={theme.colors.primary} />
              <ThemedText variant="caption" color="primary">Photo</ThemedText>
            </Pressable>

            <Pressable
              style={[styles.attachmentButton, { backgroundColor: theme.colors.primary + "15", borderColor: theme.colors.primary }]}
              onPress={pickVideo}
            >
              <Ionicons name="film" size={28} color={theme.colors.primary} />
              <ThemedText variant="caption" color="primary">Video</ThemedText>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.colors.background, borderTopColor: theme.colors.border }]}>
        {uploading && (
          <View style={styles.uploadingContainer}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <ThemedText variant="caption" color="secondary" style={styles.uploadingText}>
              Uploading media...
            </ThemedText>
          </View>
        )}
        <Button
          label={sending ? "Sending..." : "Send Note"}
          onPress={sendNote}
          variant="primary"
          disabled={sending || uploading}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: 120,
  },
  hint: {
    lineHeight: 20,
  },
  textInput: {
    minHeight: 120,
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.md,
    fontSize: 16,
  },
  charCount: {
    textAlign: "right",
    marginTop: spacing.xs,
  },
  mediaSection: {
    gap: spacing.sm,
  },
  sectionLabel: {
    marginBottom: spacing.xs,
  },
  mediaPreview: {
    width: "100%",
    height: 200,
    overflow: "hidden",
    position: "relative",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
  },
  videoPlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.sm,
  },
  videoText: {
    marginTop: spacing.sm,
  },
  removeMediaButton: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  attachmentSection: {
    gap: spacing.sm,
  },
  attachmentButtons: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  attachmentButton: {
    flex: 1,
    alignItems: "center",
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    gap: spacing.xs,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
  },
  uploadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  uploadingText: {
    marginLeft: spacing.sm,
  },
});
