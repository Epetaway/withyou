import React, { useEffect, useMemo, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { getSession, clearSession } from "../state/session";
import { createApiClient } from "../api/client";
import { DashboardResponse } from "@withyou/shared";

type AuthStatus = "loading" | "signedOut" | "signedIn";
type PairingStatus = "unknown" | "unpaired" | "paired";

const Stack = createNativeStackNavigator();

export function RootNavigator() {
  const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");
  const [pairingStatus, setPairingStatus] = useState<PairingStatus>("unknown");
  const [token, setToken] = useState<string | null>(null);

  const api = useMemo(() => createApiClient(async () => token), [token]);

  useEffect(() => {
    (async () => {
      const session = await getSession();
      if (!session.token) {
        setAuthStatus("signedOut");
        setToken(null);
        return;
      }
      setToken(session.token);
      setAuthStatus("signedIn");
    })();
  }, []);

  useEffect(() => {
    if (authStatus !== "signedIn" || !token) return;

    (async () => {
      try {
        const dash = await api.request<DashboardResponse>("/dashboard");
        setPairingStatus(dash.relationshipStage ? "paired" : "unpaired");
      } catch (e) {
        await clearSession();
        setToken(null);
        setAuthStatus("signedOut");
        setPairingStatus("unknown");
      }
    })();
  }, [authStatus, token, api]);

  if (authStatus === "loading") return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {authStatus === "signedOut" ? (
          <>
            <Stack.Screen name="Login" component={() => null} />
            <Stack.Screen name="Register" component={() => null} />
          </>
        ) : pairingStatus === "paired" ? (
          <Stack.Screen name="Paired" component={() => null} />
        ) : (
          <>
            <Stack.Screen name="UnpairedHome" component={() => null} />
            <Stack.Screen name="PairInvite" component={() => null} />
            <Stack.Screen name="PairAccept" component={() => null} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
