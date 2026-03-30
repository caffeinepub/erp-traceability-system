import { useState } from "react";
import { clearSession, getSession, login as localLogin } from "./localAuth";

export function useAuth() {
  const [session, setSession] = useState(getSession());

  const login = (username: string, password: string): boolean => {
    const s = localLogin(username, password);
    if (s) {
      setSession(s);
      return true;
    }
    return false;
  };

  const logout = () => {
    clearSession();
    setSession(null);
  };

  return {
    isLoggedIn: !!session,
    isAdmin: session?.role === "admin",
    isInitializing: false,
    username: session?.username ?? null,
    role: session?.role ?? null,
    login,
    logout,
    isLoggingIn: false,
  };
}
