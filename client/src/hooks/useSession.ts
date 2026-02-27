import { useEffect, useRef } from "react";
import type { User } from "../types";
import { apiHelpers, useApi } from "./useApi";

type UseSessionArgs = {
  apiBase: string;
  user: User | null;
  setUser: (value: User | null) => void;
  accessToken: string;
  setAccessToken: (value: string) => void;
  refreshToken: string;
  setRefreshToken: (value: string) => void;
  showToast: (message: string) => void;
  onHydrated: () => void;
};

export const useSession = ({
  apiBase,
  user,
  setUser,
  accessToken,
  setAccessToken,
  refreshToken,
  setRefreshToken,
  showToast,
  onHydrated,
}: UseSessionArgs) => {
  const hasHydrated = useRef(false);
  const refreshTimer = useRef<number | null>(null);

  const api = useApi({
    apiBase,
    accessToken,
    setAccessToken,
    refreshToken,
    setRefreshToken,
    setUser,
    showToast,
  });

  useEffect(() => {
    if (hasHydrated.current) return;
    hasHydrated.current = true;
    api.hydrateSession().finally(onHydrated);
  }, [api, onHydrated]);

  useEffect(() => {
    if (refreshTimer.current) {
      window.clearTimeout(refreshTimer.current);
      refreshTimer.current = null;
    }
    if (!accessToken) return;
    const expMs = apiHelpers.decodeTokenExp(accessToken);
    if (!expMs) return;
    const refreshIn = Math.max(expMs - Date.now() - 60 * 1000, 10 * 1000);
    refreshTimer.current = window.setTimeout(() => {
      api.hydrateSession();
    }, refreshIn);
    return () => {
      if (refreshTimer.current) window.clearTimeout(refreshTimer.current);
    };
  }, [accessToken, refreshToken, api]);

  useEffect(() => {
    if (!user && accessToken && !apiHelpers.isAccessValid(accessToken)) {
      api.clearTokens();
    }
  }, [accessToken, api, user]);

  return api;
};
