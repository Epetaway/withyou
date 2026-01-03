import { useCallback, useState } from "react";
import { ApiError } from "./client";
import { CONTENT } from "@withyou/shared";

export function useAsyncAction<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>
) {
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const run = useCallback(
    async (...args: TArgs) => {
      setLoading(true);
      setErrorText(null);
      try {
        return await fn(...args);
      } catch (e) {
        if (e instanceof ApiError) setErrorText(e.message);
        else setErrorText(CONTENT.app.errors.unknown);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [fn]
  );

  return { run, loading, errorText, setErrorText };
}
