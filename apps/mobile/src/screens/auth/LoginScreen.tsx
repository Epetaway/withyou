import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import { Screen } from "../../ui/components/Screen";
import { Text } from "../../ui/components/Text";
import { useTheme } from "../../ui/theme/ThemeProvider";

type LoginScreenProps = {
  navigation: {
    navigate: (screen: string) => void;
  };
};

export function LoginScreen({ navigation }: LoginScreenProps) {
  const theme = useTheme();

  const handlePhoneLogin = () => {
    // TODO: Implement phone login
    navigation.navigate("Register");
  };

  const handleGoogleLogin = () => {
    // TODO: Implement Google login
    navigation.navigate("Register");
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.content}>
        {/* Circular Avatar Layout */}
        <View style={styles.avatarSection}>
          {/* Outer gradient circles */}
          <View style={[styles.gradientCircle, styles.outerCircle]} />
          <View style={[styles.gradientCircle, styles.middleCircle]} />
          
          {/* Center avatar placeholder */}
          <View style={[styles.avatar, styles.centerAvatar]}>
            <FontAwesome6 name="user" size={40} color="#A78BFA" weight="bold" />
          </View>
          
          {/* Orbiting avatars */}
          <View style={[styles.avatar, styles.avatar1]}>
            <FontAwesome6 name="user" size={20} color="#A78BFA" weight="regular" />
          </View>
          <View style={[styles.avatar, styles.avatar2]}>
            <FontAwesome6 name="user" size={20} color="#A78BFA" weight="regular" />
          </View>
          <View style={[styles.avatar, styles.avatar3]}>
            <FontAwesome6 name="user" size={20} color="#A78BFA" weight="regular" />
          </View>
          <View style={[styles.avatar, styles.avatar4]}>
            <FontAwesome6 name="user" size={20} color="#A78BFA" weight="regular" />
          </View>
          <View style={[styles.avatar, styles.avatar5]}>
            <FontAwesome6 name="user" size={20} color="#A78BFA" weight="regular" />
          </View>
          <View style={[styles.avatar, styles.avatar6]}>
            <FontAwesome6 name="user" size={20} color="#A78BFA" weight="regular" />
          </View>
          <View style={[styles.avatar, styles.avatar7]}>
            <FontAwesome6 name="user" size={20} color="#A78BFA" weight="regular" />
          </View>
          <View style={[styles.avatar, styles.avatar8]}>
            <FontAwesome6 name="user" size={20} color="#A78BFA" weight="regular" />
          </View>

          {/* Decorative icons */}
          <View style={[styles.decorIcon, styles.heartIcon]}>
            <FontAwesome6 name="heart" size={24} color="#D946EF" weight="solid" />
          </View>
          <View style={[styles.decorIcon, styles.chatIcon]}>
            <FontAwesome6 name="message" size={24} color="#D946EF" weight="solid" />
          </View>
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Let's meeting new</Text>
          <Text style={styles.title}>people around you</Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonSection}>
          <Pressable
            style={styles.primaryButton}
            onPress={handlePhoneLogin}
          >
            <FontAwesome6 name="phone" size={24} color="#FFFFFF" weight="bold" />
            <Text style={styles.primaryButtonText}>Login with Phone</Text>
          </Pressable>

          <Pressable
            style={styles.secondaryButton}
            onPress={handleGoogleLogin}
          >
            <FontAwesome6 name="google" size={24} color="#4285F4" weight="bold" />
            <Text style={styles.secondaryButtonText}>Login with Google</Text>
          </Pressable>
        </View>

        {/* Sign Up Link */}
        <View style={styles.signupSection}>
          <Text style={[styles.signupText, { color: theme.colors.text2 }]}>
            Don't have an account?{" "}
          </Text>
          <Pressable onPress={() => navigation.navigate("Register")}>
            <Text style={[styles.signupLink, { color: theme.colors.primary }]}>
              Sign Up
            </Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: "center",
  },
  avatarSection: {
    width: 300,
    height: 300,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
    position: "relative",
  },
  gradientCircle: {
    position: "absolute",
    borderRadius: 9999,
    backgroundColor: "rgba(233, 213, 255, 0.3)",
  },
  outerCircle: {
    width: 280,
    height: 280,
  },
  middleCircle: {
    width: 200,
    height: 200,
    backgroundColor: "rgba(233, 213, 255, 0.5)",
  },
  avatar: {
    position: "absolute",
    backgroundColor: "#F3E8FF",
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  centerAvatar: {
    width: 80,
    height: 80,
  },
  avatar1: {
    width: 50,
    height: 50,
    top: 20,
    left: 50,
  },
  avatar2: {
    width: 50,
    height: 50,
    top: 20,
    right: 50,
  },
  avatar3: {
    width: 50,
    height: 50,
    bottom: 20,
    left: 50,
  },
  avatar4: {
    width: 50,
    height: 50,
    bottom: 20,
    right: 50,
  },
  avatar5: {
    width: 45,
    height: 45,
    top: 80,
    left: 10,
  },
  avatar6: {
    width: 45,
    height: 45,
    top: 80,
    right: 10,
  },
  avatar7: {
    width: 45,
    height: 45,
    bottom: 80,
    left: 10,
  },
  avatar8: {
    width: 45,
    height: 45,
    bottom: 80,
    right: 10,
  },
  decorIcon: {
    position: "absolute",
    backgroundColor: "#FCEEF8",
    borderRadius: 9999,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  heartIcon: {
    top: 10,
    right: 30,
  },
  chatIcon: {
    bottom: 30,
    left: 20,
  },
  titleSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
  },
  buttonSection: {
    width: "100%",
    gap: 16,
    marginBottom: 24,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4C1D95",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 50,
    gap: 12,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9FAFB",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 50,
    gap: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  secondaryButtonText: {
    color: "#1F2937",
    fontSize: 16,
    fontWeight: "600",
  },
  signupSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  signupText: {
    fontSize: 14,
  },
  signupLink: {
    fontSize: 14,
    fontWeight: "600",
  },
});
