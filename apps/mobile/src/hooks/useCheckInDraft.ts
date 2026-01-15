import { useState, useCallback } from "react";
import type { CheckInOptionId } from "../lib/checkinOptions";

export interface CheckInDraft {
  moodLevel: 1 | 2 | 3 | 4 | 5 | null;
  needs: CheckInOptionId[];
  intentions: CheckInOptionId[];
  support: CheckInOptionId[];
  note: string;
}

export function useCheckInDraft(initialDraft?: CheckInDraft) {
  const [draft, setDraft] = useState<CheckInDraft>(
    initialDraft || {
      moodLevel: null,
      needs: [],
      intentions: [],
      support: [],
      note: "",
    }
  );

  const updateMoodLevel = useCallback((level: 1 | 2 | 3 | 4 | 5) => {
    setDraft((prev) => ({ ...prev, moodLevel: level }));
  }, []);

  const toggleNeed = useCallback((optionId: CheckInOptionId) => {
    setDraft((prev) => ({
      ...prev,
      needs: prev.needs.includes(optionId)
        ? prev.needs.filter((id) => id !== optionId)
        : [...prev.needs, optionId],
    }));
  }, []);

  const setNeeds = useCallback((needs: CheckInOptionId[]) => {
    setDraft((prev) => ({ ...prev, needs }));
  }, []);

  const toggleIntention = useCallback((optionId: CheckInOptionId) => {
    setDraft((prev) => ({
      ...prev,
      intentions: prev.intentions.includes(optionId)
        ? prev.intentions.filter((id) => id !== optionId)
        : [...prev.intentions, optionId],
    }));
  }, []);

  const setIntentions = useCallback((intentions: CheckInOptionId[]) => {
    setDraft((prev) => ({ ...prev, intentions }));
  }, []);

  const toggleSupport = useCallback((optionId: CheckInOptionId) => {
    setDraft((prev) => ({
      ...prev,
      support: prev.support.includes(optionId)
        ? prev.support.filter((id) => id !== optionId)
        : [...prev.support, optionId],
    }));
  }, []);

  const setSupport = useCallback((support: CheckInOptionId[]) => {
    setDraft((prev) => ({ ...prev, support }));
  }, []);

  const updateNote = useCallback((note: string) => {
    setDraft((prev) => ({ ...prev, note }));
  }, []);

  const reset = useCallback(() => {
    setDraft({
      moodLevel: null,
      needs: [],
      intentions: [],
      support: [],
      note: "",
    });
  }, []);

  return {
    draft,
    setDraft,
    updateMoodLevel,
    toggleNeed,
    setNeeds,
    toggleIntention,
    setIntentions,
    toggleSupport,
    setSupport,
    updateNote,
    reset,
  };
}
