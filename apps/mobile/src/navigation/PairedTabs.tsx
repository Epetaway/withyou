import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { DashboardScreen } from "../screens/paired/DashboardScreen";
import { CheckInScreen } from "../screens/paired/CheckInScreen";
import { PreferencesScreen } from "../screens/paired/PreferencesScreen";
import { IdeasScreen } from "../screens/paired/IdeasScreen";
import { SettingsScreen } from "../screens/shared/SettingsScreen";

const Tab = createBottomTabNavigator();

export function PairedTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="CheckIn" component={CheckInScreen} />
      <Tab.Screen name="Preferences" component={PreferencesScreen} />
      <Tab.Screen name="Ideas" component={IdeasScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
