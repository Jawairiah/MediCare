import React, { createContext, useState, useEffect } from "react";
import api from "../services/api";

/**
 * AuthContext handles:
 * - storing tokens (localStorage for now)
 * - current user info
 * - login/logout/register helpers
 *
 * NOTE: For production prefer HTTP-only cookies for refresh tokens.
 */

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // load user from localStorage if exists
    const u = localStorage.getItem("mc_user");
    return u ? JSON.parse(u) : null;
  });
  const [access, setAccess] = useState(() => localStorage.getItem("mc_access") || null);
  const [refresh, setRefresh] = useState(() => localStorage.getItem("mc_refresh") || null);

  useEffect(() => {
    // Attach token into api default header
    if (access) {
      api.defaults.headers.common["Authorization"] = `Bearer ${access}`;
      localStorage.setItem("mc_access", access);
    } else {
      delete api.defaults.headers.common["Authorization"];
      localStorage.removeItem("mc_access");
    }
    if (refresh) localStorage.setItem("mc_refresh", refresh);
    else localStorage.removeItem("mc_refresh");
    if (user) localStorage.setItem("mc_user", JSON.stringify(user));
    else localStorage.removeItem("mc_user");
  }, [access, refresh, user]);

  const login = async ({ email, password, role }) => {
    // backend expects role + email + password on login
    const res = await api.post("/api/auth/login/", { email, password, role });
    const { access: at, refresh: rt, user: u } = res.data;
    setAccess(at);
    setRefresh(rt);
    setUser(u);
    return res.data;
  };

  const register = async (payload) => {
    const res = await api.post("/api/auth/register/", payload);
    return res.data;
  };

  const logout = () => {
    setUser(null);
    setAccess(null);
    setRefresh(null);
    localStorage.removeItem("mc_user");
    localStorage.removeItem("mc_access");
    localStorage.removeItem("mc_refresh");
  };

  const value = {
    user,
    access,
    refresh,
    login,
    register,
    logout,
    setAccess,
    setRefresh,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
