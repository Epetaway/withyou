import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useNavigation, useRoute, NavigationProp } from "@react-navigation/native";
import { FontAwesome6 } from "@expo/vector-icons";
import { DashboardScreen } from "../screens/paired/DashboardScreenNew";
import { CheckInScreen } from "../screens/paired/CheckInScreen";
import { PreferencesScreen } from "../screens/paired/PreferencesScreen";
import { LocalMapScreen } from "../screens/paired/LocalMapScreen";
import { IdeasScreen } from "../screens/paired/IdeasScreen";
import { SettingsScreen } from "../screens/shared/SettingsScreen";
import { NoteComposeScreen } from "../screens/paired/NoteComposeScreen";
import { NotesListScreen } from "../screens/paired/NotesListScreen";
import { WorkoutGoalsScreen } from "../screens/paired/WorkoutGoalsScreen";
import { GroceryListScreen } from "../screens/paired/GroceryListScreen";
import { ChatScreen } from "../screens/paired/ChatScreen";
import { useTheme } from "../theme/ThemeProvider";

const Stack = createNativeStackNavigator();

type PairedStackParamList = {
  Dashboard: undefined;
  CheckIn: undefined;
  Ideas: undefined;
  Preferences: undefined;
  Settings: undefined;
  LocalMap: undefined;
  NoteCompose: undefined;
  NotesList: undefined;
  WorkoutGoals: undefined;
  GroceryList: undefined;
  Chat: undefined;
  CheckIn: undefined; // Still accessible via Dashboard
  Preferences: undefined; // Still accessible via Settings
};

function FloatingNav() {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp<PairedStackParamList>>();
  const route = useRoute();

  // Navigation items for the floating nav bar
  // New features: WorkoutGoals, GroceryList, Chat replace CheckIn and Preferences in main nav
  // Original screens (CheckIn, Preferences, Settings) are still accessible via Dashboard or Settings menu
  const navigationItems = [
    { name: "Dashboard" as const, icon: "house", label: "Home" },
    { name: "WorkoutGoals" as const, icon: "dumbbell", label: "Fitness" },
    { name: "Ideas" as const, icon: "plus", label: "Ideas" },
    { name: "GroceryList" as const, icon: "basket-shopping", label: "Grocery" },
    { name: "Chat" as const, icon: "comments", label: "Messages" },
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

// Wrapper component that adds FloatingNav to each screen
function ScreenWithNav({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ flex: 1 }}>
      {children}
      <FloatingNav />
    </View>
  );
}

export function PairedTabs() {
  const theme = useTheme();

  return (
    <Stack.Navigator
      id="PairedTabs"
      initialRouteName="Dashboard"
      screenOptions={{
        headerShown: false,
        animation: 'none',
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="Dashboard">
        {() => (
          <ScreenWithNav>
            <DashboardScreen />
          </ScreenWithNav>
        )}
      </Stack.Screen>
      <Stack.Screen name="CheckIn">
        {() => (
          <ScreenWithNav>
            <CheckInScreen />
          </ScreenWithNav>
        )}
      </Stack.Screen>
      <Stack.Screen name="Ideas">
        {() => (
          <ScreenWithNav>
            <IdeasScreen />
          </ScreenWithNav>
        )}
      </Stack.Screen>
      <Stack.Screen name="Preferences">
        {() => (
          <ScreenWithNav>
            <PreferencesScreen />
          </ScreenWithNav>
        )}
      </Stack.Screen>
      <Stack.Screen name="Settings">
        {() => (
          <ScreenWithNav>
            <SettingsScreen />
          </ScreenWithNav>
        )}
      </Stack.Screen>
      <Stack.Screen name="WorkoutGoals">
        {() => (
          <ScreenWithNav>
            <WorkoutGoalsScreen />
          </ScreenWithNav>
        )}
      </Stack.Screen>
      <Stack.Screen name="GroceryList">
        {() => (
          <ScreenWithNav>
            <GroceryListScreen />
          </ScreenWithNav>
        )}
      </Stack.Screen>
      <Stack.Screen name="Chat">
        {() => (
          <ScreenWithNav>
            <ChatScreen />
          </ScreenWithNav>
        )}
      </Stack.Screen>
      {/* Keep original screens accessible, though not in main nav */}
      <Stack.Screen name="CheckIn">
        {() => (
          <ScreenWithNav>
            <CheckInScreen />
          </ScreenWithNav>
        )}
      </Stack.Screen>
      <Stack.Screen name="Preferences">
        {() => (
          <ScreenWithNav>
            <PreferencesScreen />
          </ScreenWithNav>
        )}
      </Stack.Screen>
      <Stack.Screen name="LocalMap" component={LocalMapScreen} />
      <Stack.Screen name="NoteCompose" component={NoteComposeScreen} />
      <Stack.Screen name="NotesList" component={NotesListScreen} />
    </Stack.Navigator>
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
