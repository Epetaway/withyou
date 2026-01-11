import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { 
  faHome, 
  faHeart, 
  faSliders,
  faLightbulb,
  faGear 
} from "@fortawesome/free-solid-svg-icons";
import { DashboardScreen } from "../screens/paired/DashboardScreen";
import { CheckInScreen } from "../screens/paired/CheckInScreen";
import { PreferencesScreen } from "../screens/paired/PreferencesScreen";
import { IdeasNavigator } from "./IdeasNavigator";
import { SettingsScreen } from "../screens/shared/SettingsScreen";

const Tab = createBottomTabNavigator();

const ICON_SIZE = 22;
const ACTIVE_COLOR = "#9B8CFF";
const INACTIVE_COLOR = "#B9B5D0";

export function PairedTabs() {
  return (
    <Tab.Navigator 
      id="PairedTabs" 
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let icon;
          
          switch (route.name) {
            case "Dashboard":
              icon = faHome;
              break;
            case "CheckIn":
              icon = faHeart;
              break;
            case "Preferences":
              icon = faSliders;
              break;
            case "Ideas":
              icon = faLightbulb;
              break;
            case "Settings":
              icon = faGear;
              break;
            default:
              icon = faHome;
          }
          
          return (
            <FontAwesomeIcon 
              icon={icon} 
              size={ICON_SIZE}
              color={focused ? ACTIVE_COLOR : INACTIVE_COLOR}
            />
          );
        },
        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
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
        options={{ title: "Check-in" }}
      />
      <Tab.Screen 
        name="Preferences" 
        component={PreferencesScreen}
        options={{ title: "Preferences" }}
      />
      <Tab.Screen 
        name="Ideas" 
        component={IdeasNavigator}
        options={{ title: "Ideas" }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: "Settings" }}
      />
    </Tab.Navigator>
  );
}
