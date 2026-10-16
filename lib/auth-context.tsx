"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { api } from "./api/client";

// Non-httpOnly routing hint readable by Next middleware on THIS frontend host.
// The real session cookie (access_token) is set by the API on the backend host
// and is httpOnly + cross-site, so middleware here can't read it. We mirror auth
// state purely for redirects; the backend still enforces auth on every request.
function setAuthMarker() {
  if (typeof document === "undefined") return;
  document.cookie = "auth_state=1; path=/; max-age=2415600; samesite=lax";
}
function clearAuthMarker() {
  if (typeof document === "undefined") return;
  document.cookie = "auth_state=; path=/; max-age=0; samesite=lax";
}

export interface RiderUser {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: string;
  branchId?: string;
  vehicleType?: string;
  vehiclePlate?: string;
}

interface AuthResponse {
  user: RiderUser;
  access_token: string;
}

interface AuthContextValue {
  user: RiderUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<RiderUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const profile = await api.get<RiderUser>("/auth/rider/profile");
      setUser(profile);
      setAuthMarker();
    } catch {
      setUser(null);
      clearAuthMarker();
    }
  }, []);

  useEffect(() => {
    async function checkAuth() {
      try {
        const profile = await api.get<RiderUser>("/auth/rider/profile");
        setUser(profile);
        setAuthMarker();
      } catch {
        setUser(null);
        clearAuthMarker();
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api.post<AuthResponse>("/auth/staff/login", {
        email,
        password,
      });
      setUser(res.user);
      setAuthMarker();
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await api.post<void>("/auth/staff/logout", {});
    } finally {
      setUser(null);
      clearAuthMarker();
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
