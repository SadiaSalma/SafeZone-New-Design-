 "use client";
/**
 * Frontend (web) · Task 10 · AuthProvider.tsx - remembers WHO is logged in.
 *
 * When the website opens, it asks the backend "who am I?" (GET /api/v1/me).
 * Any component can then call useAuth() to get:
 *   user        - the logged-in person, or null if nobody is logged in
 *   loading     - true while we are still asking
 *   setUser()   - used by the log-in / verify pages after a successful log-in
 *   reload()    - ask the backend again
 *   logout()    - log out and forget the user
 *
 * The log-in tickets themselves live in httpOnly cookies that JavaScript
 * cannot read; this file only keeps the person's public details.
 */
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "@/lib/api";

export type User = {
  id: string;
  name_en: string;
  name_bn: string;
  phone: string;
  email: string;
  role: "victim" | "verifier" | "admin";
  status: string;
  nid_added: boolean;
  nid_last4: string | null;
};

type Auth = {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  reload: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<Auth | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      setUser(await api<User>("/me"));
    } catch {
      setUser(null); // not logged in (or the backend is down)
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- ask "who am I?" once when the site opens
    reload();
  }, [reload]);

  const logout = useCallback(async () => {
    try {
      await api("/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
    }
  }, []);

  return <AuthContext.Provider value={{ user, loading, setUser, reload, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): Auth {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error("useAuth() must be used inside <AuthProvider>");
  return auth;
}
