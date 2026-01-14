import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useNavigation, useRoute, NavigationProp } from "@react-navigation/native";
import { FontAwesome6 } from "@expo/vector-icons";
import { DashboardScreen } from "../screens/paired/DashboardScreen";
import { CheckInV2Screen } from "../screens/paired/CheckInV2Screen";
import { PreferencesScreen } from "../screens/paired/PreferencesScreen";
import { LocalMapScreen } from "../screens/paired/LocalMapScreen";
import { IdeasScreen } from "../screens/paired/IdeasScreen";
import { SettingsScreen } from "../screens/shared/SettingsScreen";
import { useTheme } from "../ui/theme/ThemeProvider";

const Stack = createNativeStackNavigator();

type PairedStackParamList = {
  Dashboard: undefined;
  CheckIn: undefined;
  Ideas: undefined;
  Preferences: undefined;
  Settings: undefined;
  LocalMap: undefined;
};

function FloatingNav() {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp<PairedStackParamList>>();
  const route = useRoute();

  const navigationItems = [
    { name: "Dashboard" as const, icon: "house", label: "Home" },
    { name: "CheckIn" as const, icon: "heart", label: "Discover" },
    { name: "Ideas" as const, icon: "plus", label: "Ideas" },
    { name: "Preferences" as const, icon: "handshake", label: "Connect" },
    { name: "Settings" as const, icon: "comments", label: "Messages" },
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
            onPress={() => navigation.navigate(item.name)}
          >
            {item.name === "Ideas" ? (
              <View style={[styles.centerButton, { backgroundColor: theme.colors.primary }]}>
                <FontAwesome6 name={item.icon} size={28} color="#FFFFFF" weight="bold" />
              </View>
            ) : (
              <FontAwesome6
                name={item.icon}
                size={22}
                color={route.name === item.name ? theme.colors.primary : "#9CA3AF"}
                weight={route.name === item.name ? "bold" : "regular"}
              />
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export function PairedTabs() {
  const theme = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Stack.Navigator
        initialRouteName="Dashboard"
        screenOptions={{
          headerShown: false,
          animation: 'none',
        }}
      >
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="CheckIn" component={CheckInV2Screen} />
        <Stack.Screen name="Ideas" component={IdeasScreen} />
        <Stack.Screen name="Preferences" component={PreferencesScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="LocalMap" component={LocalMapScreen} />
      </Stack.Navigator>
      <FloatingNav
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
