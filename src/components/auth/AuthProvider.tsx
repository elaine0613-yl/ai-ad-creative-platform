"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { api } from "@/lib/api/client";

interface User {
  id: string;
  email: string;
  name: string;
  plan: string;
  credits: number;
  totalCredits?: number;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  loginDemo: () => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { user: u } = await api.auth.me();
      setUser(u);
    } catch {
      setUser(null);
    }
  }, []);

  const loginDemo = useCallback(async () => {
    const { user: u } = await api.auth.demo();
    setUser(u as User);
  }, []);

  const logout = useCallback(async () => {
    await api.auth.logout();
    setUser(null);
  }, []);

  useEffect(() => {
    refresh()
      .then(async () => {
        const { user: u } = await api.auth.me();
        if (!u) await loginDemo();
      })
      .finally(() => setLoading(false));
  }, [refresh, loginDemo]);

  return (
    <AuthContext.Provider value={{ user, loading, loginDemo, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
