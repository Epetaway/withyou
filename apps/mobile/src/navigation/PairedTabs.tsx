import React, { useState } from "react";
import { View, StyleSheet, Pressable, Dimensions } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { FontAwesome6 } from "@expo/vector-icons";
import { DashboardScreen } from "../screens/paired/DashboardScreen";
import { CheckInScreen } from "../screens/paired/CheckInScreen";
import { PreferencesScreen } from "../screens/paired/PreferencesScreen";
import { IdeasNavigator } from "./IdeasNavigator";
import { SettingsScreen } from "../screens/shared/SettingsScreen";
import { useTheme } from "../ui/theme/ThemeProvider";

const Stack = createNativeStackNavigator();
const { width } = Dimensions.get('window');

interface FloatingNavProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
}

function FloatingNav({ currentRoute, onNavigate }: FloatingNavProps) {
  const theme = useTheme();

  const navigationItems = [
    { name: "Dashboard", icon: "house", label: "Home" },
    { name: "CheckIn", icon: "heart", label: "Discover" },
    { name: "Ideas", icon: "plus", label: "Ideas" },
    { name: "Preferences", icon: "handshake", label: "Connect" },
    { name: "Settings", icon: "comments", label: "Messages" },
  ];

  return (
    <View style={[styles.floatingNavContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <View style={styles.navContent}>
        {navigationItems.map((item) => (
          <Pressable
            key={item.name}
            style={[
              styles.navItem,
              item.name === "Ideas" && styles.centerButtonWrapper,
            ]}
            onPress={() => onNavigate(item.name)}
          >
            {item.name === "Ideas" ? (
              <View style={[styles.centerButton, { backgroundColor: theme.colors.primary }]}>
                <FontAwesome6 name={item.icon} size={28} color="#FFFFFF" weight="bold" />
              </View>
            ) : (
              <FontAwesome6
                name={item.icon}
                size={22}
                color={currentRoute === item.name ? theme.colors.primary : "#9CA3AF"}
                weight={currentRoute === item.name ? "bold" : "regular"}
              />
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export function PairedTabs() {
  const [currentRoute, setCurrentRoute] = useState("Dashboard");
  const theme = useTheme();

  const navigationConfig: Record<string, React.ComponentType<any>> = {
    Dashboard: DashboardScreen,
    CheckIn: CheckInScreen,
    Ideas: IdeasNavigator,
    Preferences: PreferencesScreen,
    Settings: SettingsScreen,
  };

  const renderScreen = () => {
    const Screen = navigationConfig[currentRoute];
    if (!Screen) return null;
    
    return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animationEnabled: false,
        }}
      >
        <Stack.Screen
          name={currentRoute}
          component={Screen}
          options={{ animationEnabled: false }}
        />
      </Stack.Navigator>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      {renderScreen()}
      <FloatingNav 
        currentRoute={currentRoute} 
        onNavigate={setCurrentRoute}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  floatingNavContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
    justifyContent: "center",
  },
  navContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  navItem: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  centerButtonWrapper: {
    marginBottom: 20,
  },
  centerButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#D946EF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#D946EF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
