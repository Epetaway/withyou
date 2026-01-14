import React, { useState } from "react";
import { View, StyleSheet, TextInput, Pressable, Image, Alert, ActivityIndicator, ScrollView } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import { Screen } from "../../ui/components/Screen";
import { Text } from "../../ui/components/Text";
import { Button } from "../../ui/components/Button";
import { useTheme } from "../../ui/theme/ThemeProvider";
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
      setNoteType("TEXT"); // For now, treating image as attachment to text
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
      videoMaxDuration: 60, // 60 seconds max
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
      setNoteType("TEXT"); // Treating photo as attachment to text
    }
  };

  const uploadMedia = async (uri: string): Promise<string> => {
    // TODO: Implement secure media upload to S3 or similar storage
    // For now, this is a placeholder that returns the local URI
    // In production, this should:
    // 1. Upload the media file to S3 using pre-signed URL
    // 2. Return the public/secure URL for the uploaded file
    // 3. Handle upload failures with retry logic
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
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <FontAwesome6 name="arrow-left" size={24} color={theme.colors.text} />
        </Pressable>
        <Text variant="screenTitle">Send a Note</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <Text variant="body" style={[styles.hint, { color: theme.colors.textSecondary }]}>
          Send a sweet message, photo, or short video to your partner. Keep it private and meaningful.
        </Text>

        <TextInput
          style={[
            styles.textInput,
            {
              backgroundColor: theme.colors.surface,
              color: theme.colors.text,
              borderColor: theme.colors.border,
            },
          ]}
          placeholder="Write your note here..."
          placeholderTextColor={theme.colors.textSecondary}
          multiline
          value={content}
          onChangeText={setContent}
          maxLength={300}
          textAlignVertical="top"
        />

        <Text variant="helper" style={[styles.charCount, { color: theme.colors.textSecondary }]}>
          {content.length}/300
        </Text>

        {mediaUri && (
          <View style={styles.mediaPreview}>
            {noteType === "VIDEO" ? (
              <View style={[styles.videoPlaceholder, { backgroundColor: theme.colors.surface }]}>
                <FontAwesome6 name="video" size={48} color={theme.colors.primary} />
                <Text variant="body" style={{ marginTop: 8 }}>Video attached</Text>
              </View>
            ) : (
              <Image source={{ uri: mediaUri }} style={styles.imagePreview} resizeMode="cover" />
            )}
            <Pressable style={styles.removeMediaButton} onPress={clearMedia}>
              <FontAwesome6 name="xmark" size={16} color="#FFFFFF" />
            </Pressable>
          </View>
        )}

        <View style={styles.attachmentRow}>
          <Text variant="subtitle" style={{ marginBottom: 8 }}>Add attachment</Text>
          <View style={styles.attachmentButtons}>
            <Pressable
              style={[styles.attachmentButton, { backgroundColor: theme.colors.primary + "20" }]}
              onPress={takePhoto}
            >
              <FontAwesome6 name="camera" size={24} color={theme.colors.primary} />
              <Text variant="helper" style={{ color: theme.colors.primary }}>Camera</Text>
            </Pressable>

            <Pressable
              style={[styles.attachmentButton, { backgroundColor: theme.colors.primary + "20" }]}
              onPress={pickImage}
            >
              <FontAwesome6 name="image" size={24} color={theme.colors.primary} />
              <Text variant="helper" style={{ color: theme.colors.primary }}>Photo</Text>
            </Pressable>

            <Pressable
              style={[styles.attachmentButton, { backgroundColor: theme.colors.primary + "20" }]}
              onPress={pickVideo}
            >
              <FontAwesome6 name="video" size={24} color={theme.colors.primary} />
              <Text variant="helper" style={{ color: theme.colors.primary }}>Video</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.colors.background, borderTopColor: theme.colors.border }]}>
        {uploading && (
          <View style={styles.uploadingContainer}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text variant="helper" style={{ color: theme.colors.textSecondary, marginLeft: 8 }}>
              Uploading media...
            </Text>
          </View>
        )}
        <Button
          label={sending ? "Sending..." : "Send Note"}
          onPress={sendNote}
          variant="primary"
          disabled={sending || uploading}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  hint: {
    marginBottom: 16,
  },
  textInput: {
    minHeight: 120,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 8,
  },
  charCount: {
    textAlign: "right",
    marginBottom: 16,
  },
  mediaPreview: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
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
  },
  removeMediaButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  attachmentRow: {
    marginTop: 8,
  },
  attachmentButtons: {
    flexDirection: "row",
    gap: 12,
  },
  attachmentButton: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
  },
  uploadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
});
