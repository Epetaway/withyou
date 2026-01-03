import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

const Tab = createBottomTabNavigator();

export function PairedTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Dashboard" component={() => null} />
      <Tab.Screen name="CheckIn" component={() => null} />
      <Tab.Screen name="Preferences" component={() => null} />
      <Tab.Screen name="Ideas" component={() => null} />
      <Tab.Screen name="Settings" component={() => null} />
    </Tab.Navigator>
  );
}
