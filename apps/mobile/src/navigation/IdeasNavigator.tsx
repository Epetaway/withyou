import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { IdeasScreen } from "../screens/paired/IdeasScreen";
import { LocalFiltersScreen } from "../screens/paired/LocalFiltersScreen";
import { LocalResultsScreen } from "../screens/paired/LocalResultsScreen";

const Stack = createNativeStackNavigator();

export function IdeasNavigator() {
  return (
    <Stack.Navigator id="IdeasStack" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="IdeasHome" component={IdeasScreen} />
      <Stack.Screen name="LocalFilters" component={LocalFiltersScreen} />
      <Stack.Screen name="LocalResults" component={LocalResultsScreen} />
    </Stack.Navigator>
  );
}
