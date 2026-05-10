import { createContext, ReactNode, useEffect, useState } from "react";
import type { AuthUser, LoginInput } from "@hackathon/shared";
import * as authApi from "@/features/auth/api/auth";
import { authEvents } from "@/lib/auth-events";
import {
  clearTokens,
  getRefreshToken,
  getToken,
  setRefreshToken,
  setToken,
} from "@/lib/auth";

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (formData: FormData) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    // api() will auto-refresh on 401 — only lands in catch if refresh also failed
    authApi
      .me()
      .then((u) => {
        if (!cancelled) setUser(u);
      })
      .catch(() => {
        clearTokens();
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // refresh layer fires this when a refresh fails mid-session
  useEffect(() => {
    return authEvents.onSessionEnded(() => setUser(null));
  }, []);

  async function login(input: LoginInput) {
    const res = await authApi.login(input);
    setToken(res.accessToken);
    setRefreshToken(res.refreshToken);
    setUser(res.user);
  }

  async function register(formData: FormData) {
    await authApi.register(formData);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    await login({ email, password });
  }

  async function logout() {
    const refresh = getRefreshToken();
    if (refresh) {
      await authApi.logout(refresh).catch(() => {});
    }
    clearTokens();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
