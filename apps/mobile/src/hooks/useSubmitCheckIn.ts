import { useState, useCallback } from "react";
import { api } from "../state/appState";
import type { CheckInDraft } from "./useCheckInDraft";

export interface CheckInPayload {
  date: string; // YYYY-MM-DD
  needs: string[];
  intentions: string[];
  support: string[];
  note?: string;
}

export interface SubmitCheckInResult {
  success: boolean;
  error?: string;
  data?: Record<string, unknown>;
}

export function useSubmitCheckIn() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (draft: CheckInDraft): Promise<SubmitCheckInResult> => {
      try {
        setIsLoading(true);
        setError(null);

        // Validate minimum selection
        if (!draft.moodLevel) {
          setError("Please select your mood level");
          return { success: false, error: "Mood level is required" };
        }

        // Get today's date in ISO format
        const today = new Date();
        const dateString = today.toISOString().split("T")[0]; // YYYY-MM-DD

        const payload: CheckInPayload = {
          date: dateString,
          needs: draft.needs,
          intentions: draft.intentions,
          support: draft.support,
          ...(draft.note && { note: draft.note }),
        };

        // POST to /checkins endpoint
        const response = await api.request<Record<string, unknown>>("/checkins", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        return {
          success: true,
          data: response,
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to save check-in";
        setError(errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    submit,
    isLoading,
    error,
    clearError,
  };
}
