"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as authService from "@/services/authService";
import * as userService from "@/services/userService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const current = await authService.getCurrentUser();
        if (active) setUser(current);
      } catch {
        // ignore session restore errors
      }
      if (active) setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const authedUser = await authService.login(email, password);
    setUser(authedUser);
    return authedUser;
  }, []);

  const register = useCallback(async (data) => {
    const newUser = await authService.register(data);
    setUser(newUser);
    return newUser;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    async (patch) => {
      if (!user) return null;
      const updated = await userService.updateProfile(user.id, patch);
      setUser(updated);
      return updated;
    },
    [user]
  );

  const setSharing = useCallback(
    async (enabled) => {
      if (!user) return null;
      const updated = await userService.setLocationSharing(user.id, enabled);
      setUser(updated);
      return updated;
    },
    [user]
  );

  const value = useMemo(
    () => ({ user, loading, login, register, logout, updateProfile, setSharing }),
    [user, loading, login, register, logout, updateProfile, setSharing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}

export const AuthContextRef = AuthContext;