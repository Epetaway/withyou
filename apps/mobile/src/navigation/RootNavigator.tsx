import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { getSession, clearSession, onSessionChange } from "../state/session";
import { DashboardResponse } from "@withyou/shared";
import { api, setToken } from "../state/appState";
import { LoginScreen } from "../screens/auth/LoginScreen";
import { RegisterScreen } from "../screens/auth/RegisterScreen";
import { UnpairedHomeScreen } from "../screens/unpaired/UnpairedHomeScreen";
import { PairInviteScreen } from "../screens/unpaired/PairInviteScreen";
import { PairAcceptScreen } from "../screens/unpaired/PairAcceptScreen";
import { SettingsScreen } from "../screens/shared/SettingsScreen";
import { PairedTabs } from "./PairedTabs";

type AuthStatus = "loading" | "signedOut" | "signedIn";
type PairingStatus = "unknown" | "unpaired" | "paired";

const Stack = createNativeStackNavigator();

export function RootNavigator() {
  const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");
  const [pairingStatus, setPairingStatus] = useState<PairingStatus>("unknown");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const checkAuth = async () => {
      const session = await getSession();
      if (!session.token) {
        setAuthStatus("signedOut");
        return;
      }
      setToken(session.token);
      setAuthStatus("signedIn");
    };

    checkAuth();

    // Listen for session changes (login/logout)
    return onSessionChange(() => {
      setRefreshKey(k => k + 1);
    });
  }, [refreshKey]);

  useEffect(() => {
    if (authStatus !== "signedIn") return;

    (async () => {
      try {
        const dash = await api.request<DashboardResponse>("/dashboard");
        setPairingStatus(dash.relationshipStage ? "paired" : "unpaired");
      } catch (_e) {
        await clearSession();
        setToken(null);
        setAuthStatus("signedOut");
        setPairingStatus("unknown");
      }
    })();
  }, [authStatus]);

  if (authStatus === "loading") return null;

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={
          authStatus === "signedOut"
            ? "Login"
            : pairingStatus === "paired"
              ? "Paired"
              : "UnpairedHome"
        }
      >
        {authStatus === "signedOut" ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : pairingStatus === "paired" ? (
          <>
            <Stack.Screen name="Paired" component={PairedTabs} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="UnpairedHome" component={UnpairedHomeScreen} />
            <Stack.Screen name="PairInvite" component={PairInviteScreen} />
            <Stack.Screen name="PairAccept" component={PairAcceptScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
