import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { LOGOUT_EVENT, authApi, getToken, setToken } from "../services/api";
import type { User } from "../types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(getToken() !== null);

  useEffect(() => {
    if (getToken() === null) return;
    authApi
      .me()
      .then(setUser)
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const onLogout = (): void => setUser(null);
    window.addEventListener(LOGOUT_EVENT, onLogout);
    return () => window.removeEventListener(LOGOUT_EVENT, onLogout);
  }, []);

  const finish = useCallback(async (token: string): Promise<void> => {
    setToken(token);
    setUser(await authApi.me());
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<void> =>
      finish((await authApi.login(email, password)).access_token),
    [finish],
  );
  const register = useCallback(
    async (email: string, password: string, fullName: string): Promise<void> =>
      finish((await authApi.register(email, password, fullName)).access_token),
    [finish],
  );
  const logout = useCallback((): void => {
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx === null) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
