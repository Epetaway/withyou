import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "withyou_token";
const USER_ID_KEY = "withyou_user_id";

let sessionChangeCallbacks: (() => void)[] = [];

export function onSessionChange(callback: () => void) {
  sessionChangeCallbacks.push(callback);
  return () => {
    sessionChangeCallbacks = sessionChangeCallbacks.filter(cb => cb !== callback);
  };
}

function notifySessionChange() {
  sessionChangeCallbacks.forEach(cb => cb());
}

export async function getSession() {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  const userId = await SecureStore.getItemAsync(USER_ID_KEY);
  return { token, userId };
}

export async function setSession(token: string, userId: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  await SecureStore.setItemAsync(USER_ID_KEY, userId);
  notifySessionChange();
}

export async function clearSession() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(USER_ID_KEY);
  notifySessionChange();
}
