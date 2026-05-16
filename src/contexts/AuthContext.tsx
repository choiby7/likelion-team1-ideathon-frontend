import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { AUTH_LOGOUT_EVENT } from "@/lib/apiClient";
import { clearAuth, getAccessToken, readUser, writeUser } from "@/lib/auth";
import { fetchMe, logoutRequest } from "@/lib/authApi";
import type { User } from "@/types/auth";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(() => readUser());
  const [isLoading, setIsLoading] = useState(true);

  const setUser = useCallback((next: User | null) => {
    setUserState(next);
    if (next) writeUser(next);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!getAccessToken()) {
      setUserState(null);
      return;
    }
    try {
      const me = await fetchMe();
      setUserState(me);
      writeUser(me);
    } catch {
      setUserState(null);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } catch {
      clearAuth();
    }
    setUserState(null);
  }, []);

  useEffect(() => {
    (async () => {
      await refreshUser();
      setIsLoading(false);
    })();
  }, [refreshUser]);

  useEffect(() => {
    const onLogout = () => setUserState(null);
    window.addEventListener(AUTH_LOGOUT_EVENT, onLogout);
    return () => window.removeEventListener(AUTH_LOGOUT_EVENT, onLogout);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, setUser, refreshUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
