import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import { useTheme } from "../../theme/ThemeProvider";
import { api } from "../../state/appState";
import { getSession } from "../../state/session";
import type { ChatMessage } from "@withyou/shared";

export function ChatScreen() {
  const theme = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showAssistance, setShowAssistance] = useState(false);
  const [assistanceSuggestions, setAssistanceSuggestions] = useState<Array<{
    type: string;
    title: string;
    content: string;
  }>>([]);

  useEffect(() => {
    loadCurrentUser();
    fetchMessages();
    // Poll for new messages every 5 seconds
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadCurrentUser = async () => {
    const session = await getSession();
    if (session?.userId) {
      setCurrentUserId(session.userId);
    }
  };

  const fetchMessages = async () => {
    try {
        const response = await api.request<{
          messages: ChatMessage[];
          count: number;
          unreadCount: number;
        }>("/messages", { method: "GET" });
      setMessages(response.messages);
      
      // Mark messages as read
      const unreadIds = response.messages
        .filter(m => m.senderId !== currentUserId && !m.readAt)
        .map(m => m.id);
      
      if (unreadIds.length > 0) {
          await api.request("/messages/read", {
            method: "PUT",
            body: JSON.stringify({ messageIds: unreadIds }),
          });
      }
    } catch (error) {
      const err = error as { code?: string };
      if (err.code !== "NO_RELATIONSHIP") {
        console.error("Failed to load messages:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim()) return;

    const tempMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      relationshipId: "",
      senderId: currentUserId || "",
      content: messageText.trim(),
      type: "text",
      createdAt: new Date().toISOString(),
    };

    setMessages([...messages, tempMessage]);
    setMessageText("");
    setSending(true);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
        const response = await api.request<{ message: ChatMessage }>("/messages/send", {
          method: "POST",
          body: JSON.stringify({
            content: tempMessage.content,
            type: "text",
          }),
        });

      // Replace temp message with real message
      setMessages(prev => prev.map(m => m.id === tempMessage.id ? response.message : m));
    } catch (error) {
      const err = error as { message?: string };
      Alert.alert("Error", err.message || "Failed to send message");
      // Remove temp message on error
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
    } finally {
      setSending(false);
    }
  };

  const requestAssistance = async () => {
    interface AssistanceSuggestion {
      type: string;
      title: string;
      content: string;
    }

    interface AssistanceContext {
      recentMessageCount: number;
      timeSinceLastMessage: number | null;
    }

    try {
        const response = await api.request<{
          suggestions: AssistanceSuggestion[];
          context: AssistanceContext;
        }>("/messages/assistance", {
          method: "POST",
        });
      setAssistanceSuggestions(response.suggestions);
      setShowAssistance(true);
    } catch (error) {
      const err = error as { message?: string };
      Alert.alert("Error", err.message || "Failed to get assistance");
    }
  };

  const useSuggestion = (content: string) => {
    setMessageText(content);
    setShowAssistance(false);
  };

  const renderMessage = (message: ChatMessage, index: number) => {
    const isOwnMessage = message.senderId === currentUserId;
    const showTimestamp = index === 0 || 
      new Date(messages[index - 1].createdAt).toDateString() !== new Date(message.createdAt).toDateString();

    return (
      <View key={message.id} style={styles.messageWrapper}>
        {showTimestamp && (
          <View style={styles.timestampContainer}>
            <Text style={[styles.timestamp, { color: theme.colors.text2 }]}>
              {new Date(message.createdAt).toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </Text>
          </View>
        )}
        
        <View
          style={[
            styles.messageBubble,
            isOwnMessage ? styles.ownMessage : styles.partnerMessage,
            isOwnMessage
              ? { backgroundColor: theme.colors.primary }
              : { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
        >
          <Text
            style={[
              styles.messageText,
              { color: isOwnMessage ? "#FFFFFF" : theme.colors.text },
            ]}
          >
            {message.content}
          </Text>
          <View style={styles.messageFooter}>
            <Text
              style={[
                styles.messageTime,
                { color: isOwnMessage ? "#FFFFFF" : theme.colors.text2 },
              ]}
            >
              {new Date(message.createdAt).toLocaleTimeString(undefined, {
                hour: "numeric",
                minute: "2-digit",
              })}
            </Text>
            {isOwnMessage && message.readAt && (
              <FontAwesome6
                name="check-double"
                size={12}
                color="#FFFFFF"
                style={{ marginLeft: 4 }}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Messages</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Messages</Text>
        <Pressable style={styles.assistanceButton} onPress={requestAssistance}>
          <FontAwesome6 name="lightbulb" size={20} color={theme.colors.primary} />
        </Pressable>
      </View>

      {showAssistance && assistanceSuggestions.length > 0 && (
        <View style={[styles.assistanceContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <View style={styles.assistanceHeader}>
            <FontAwesome6 name="lightbulb" size={16} color={theme.colors.primary} />
            <Text style={[styles.assistanceTitle, { color: theme.colors.text }]}>
              Communication Assistance
            </Text>
            <Pressable onPress={() => setShowAssistance(false)}>
              <FontAwesome6 name="times" size={16} color={theme.colors.text2} />
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {assistanceSuggestions.map((suggestion, index) => (
              <Pressable
                key={index}
                style={[styles.suggestionCard, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}
                onPress={() => useSuggestion(suggestion.content)}
              >
                <Text style={[styles.suggestionTitle, { color: theme.colors.primary }]}>
                  {suggestion.title}
                </Text>
                <Text style={[styles.suggestionContent, { color: theme.colors.text }]}>
                  {suggestion.content}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: false })}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <FontAwesome6 name="comments" size={64} color={theme.colors.text2} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No messages yet</Text>
            <Text style={[styles.emptyDescription, { color: theme.colors.text2 }]}>
              Start a conversation with your partner
            </Text>
          </View>
        ) : (
          messages.map((message, index) => renderMessage(message, index))
        )}
      </ScrollView>

      <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <TextInput
          style={[styles.textInput, { color: theme.colors.text }]}
          placeholder="Type a message..."
          placeholderTextColor={theme.colors.text2}
          value={messageText}
          onChangeText={setMessageText}
          multiline
          maxLength={5000}
        />
        <Pressable
          style={[
            styles.sendButton,
            { backgroundColor: messageText.trim() ? theme.colors.primary : theme.colors.border },
          ]}
          onPress={sendMessage}
          disabled={!messageText.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <FontAwesome6 name="paper-plane" size={18} color="#FFFFFF" />
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
  },
  assistanceButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  assistanceContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  assistanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  assistanceTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
  },
  suggestionCard: {
    width: 200,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
  },
  suggestionTitle: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
  },
  suggestionContent: {
    fontSize: 13,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 20,
  },
  messageWrapper: {
    marginBottom: 12,
  },
  timestampContainer: {
    alignItems: "center",
    marginVertical: 16,
  },
  timestamp: {
    fontSize: 12,
    fontWeight: "500",
  },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  ownMessage: {
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  partnerMessage: {
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    justifyContent: "flex-end",
  },
  messageTime: {
    fontSize: 11,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    marginBottom: 80,
  },
  textInput: {
    flex: 1,
    maxHeight: 100,
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: "center",
  },
});
