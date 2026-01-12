import React from "react";
import { View, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { DashboardScreen } from "../screens/paired/DashboardScreen";
import { CheckInScreen } from "../screens/paired/CheckInScreen";
import { PreferencesScreen } from "../screens/paired/PreferencesScreen";
import { IdeasNavigator } from "./IdeasNavigator";
import { SettingsScreen } from "../screens/shared/SettingsScreen";

const Tab = createBottomTabNavigator();

const ICON_SIZE = 24;
const ACTIVE_COLOR = "#D946EF";
const INACTIVE_COLOR = "#9CA3AF";

export function PairedTabs() {
  return (
    <Tab.Navigator 
      id="PairedTabs" 
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => {
          let iconName;
          let showCircle = false;
          
          switch (route.name) {
            case "Dashboard":
              iconName = focused ? "home" : "home-outline";
              break;
            case "CheckIn":
              iconName = focused ? "heart-circle" : "heart-circle-outline";
              showCircle = focused;
              break;
            case "Ideas":
              iconName = "add-circle";
              break;
            case "Preferences":
              iconName = focused ? "people" : "people-outline";
              break;
            case "Settings":
              iconName = focused ? "chatbubble-ellipses" : "chatbubble-ellipses-outline";
              break;
            default:
              iconName = "home-outline";
          }
          
          // Special styling for the center "Add" button
          if (route.name === "Ideas") {
            return (
              <View style={styles.centerButton}>
                <Ionicons 
                  name={iconName as any}
                  size={40}
                  color="#FFFFFF"
                />
              </View>
            );
          }
          
          return (
            <View style={showCircle && styles.activeIconContainer}>
              <Ionicons 
                name={iconName as any}
                size={ICON_SIZE}
                color={focused ? ACTIVE_COLOR : INACTIVE_COLOR}
              />
            </View>
          );
        },
        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,
        tabBarLabelStyle: { 
          fontSize: 11, 
          fontWeight: "600",
          marginTop: -4,
        },
        tabBarStyle: {
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F3F4F6',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ title: "Home" }}
      />
      <Tab.Screen 
        name="CheckIn" 
        component={CheckInScreen}
        options={{ title: "Discover" }}
      />
      <Tab.Screen 
        name="Ideas" 
        component={IdeasNavigator}
        options={{ title: "" }}
      />
      <Tab.Screen 
        name="Preferences" 
        component={PreferencesScreen}
        options={{ title: "Connect" }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: "Messages" }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  centerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#D946EF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
    shadowColor: '#D946EF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  activeIconContainer: {
    backgroundColor: '#FCE7F3',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
});
