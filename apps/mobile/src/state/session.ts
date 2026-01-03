import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "withyou_token";
const USER_ID_KEY = "withyou_user_id";

export async function getSession() {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  const userId = await SecureStore.getItemAsync(USER_ID_KEY);
  return { token, userId };
}

export async function setSession(token: string, userId: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  await SecureStore.setItemAsync(USER_ID_KEY, userId);
}

export async function clearSession() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(USER_ID_KEY);
}
