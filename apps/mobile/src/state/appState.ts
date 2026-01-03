import { getSession } from "./session";
import { createApiClient } from "../api/client";

let cachedToken: string | null = null;

export async function getToken(): Promise<string | null> {
  if (cachedToken) return cachedToken;
  const session = await getSession();
  cachedToken = session.token ?? null;
  return cachedToken;
}

export function setToken(token: string | null) {
  cachedToken = token;
}

export const api = createApiClient(getToken);
