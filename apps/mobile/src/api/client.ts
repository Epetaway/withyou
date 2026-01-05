import { ApiErrorShape } from "@withyou/shared";

export class ApiError extends Error {
  code: string;
  details?: unknown;

  constructor(code: string, message: string, details?: unknown) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

export function createApiClient(getToken: () => Promise<string | null>) {
  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://withyouapi-production.up.railway.app";

  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    if (!baseUrl) throw new Error("Missing EXPO_PUBLIC_API_BASE_URL");

    const token = await getToken();
    const res = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init?.headers ?? {}),
      },
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) : null;

    if (!res.ok) {
      const maybe = data as ApiErrorShape | null;
      if (maybe?.error?.code && maybe?.error?.message) {
        throw new ApiError(
          maybe.error.code,
          maybe.error.message,
          maybe.error.details
        );
      }
      throw new ApiError("HTTP_ERROR", "Request failed");
    }

    return data as T;
  }

  return { request };
}
