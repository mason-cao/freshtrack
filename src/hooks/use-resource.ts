"use client";

import { useCallback, useEffect, useState } from "react";

type ResourceState<T> = {
  data: T | undefined;
  loading: boolean;
  error: string | null;
};

type Subscribe = (refresh: () => void) => () => void;

export function useResource<T>(
  load: (signal: AbortSignal) => Promise<T>,
  { enabled = true, subscribe }: { enabled?: boolean; subscribe?: Subscribe } = {}
) {
  const [state, setState] = useState<ResourceState<T>>({
    data: undefined, loading: enabled, error: null,
  });
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(() => setRevision((value) => value + 1), []);

  useEffect(() => subscribe?.(refresh), [subscribe, refresh]);

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    setState((current) => ({ ...current, loading: true, error: null }));
    load(controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setState({ data, loading: false, error: null });
      },
      (error: unknown) => {
        if (!controller.signal.aborted) setState((current) => ({
          ...current,
          loading: false,
          error: error instanceof Error ? error.message : "Unable to load data.",
        }));
      }
    );
    return () => controller.abort();
  }, [load, enabled, revision]);

  return { ...state, refresh };
}
