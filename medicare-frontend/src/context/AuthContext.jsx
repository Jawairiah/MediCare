// medicare-frontend/src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as api from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [selectedRole, setSelectedRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load correct keys
    const persistedRole = localStorage.getItem("mc_role");
    const access = localStorage.getItem("mc_access");

    if (persistedRole) setSelectedRole(persistedRole);

    if (access) {
      loadUserProfile(persistedRole);
    } else {
      setLoading(false);
    }
  }, []);

  const loadUserProfile = async (role) => {
    try {
      let response =
        role === "doctor"
          ? await api.getDoctorProfile()
          : await api.getPatientProfile();

      if (response.ok) {
        setUser({ ...response.data, role });
        setIsAuthenticated(true);
        setSelectedRole(role);
      } else {
        logout();
      }
    } catch (err) {
      console.error("Failed to load user", err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const selectRole = (role) => {
    setSelectedRole(role);
    localStorage.setItem("mc_role", role);
  };

  const login = async ({ email, password }) => {
    if (!selectedRole) {
      return { ok: false, error: "Please select a role first" };
    }

    try {
      const response = await api.login({
        email,
        password,
        role: selectedRole,
      });

      if (response.ok) {
        const userData = { ...response.data.user, role: selectedRole };

        setUser(userData);
        setIsAuthenticated(true);

        localStorage.setItem("mc_role", selectedRole);

        return { ok: true, user: userData };
      }

      return {
        ok: false,
        error: response.data?.detail || "Invalid credentials",
      };
    } catch (err) {
      console.error("Login error", err);
      return { ok: false, error: "Login failed" };
    }
  };

  const signup = async (payload) => {
    const role = payload.role || selectedRole;
    if (!role) return { ok: false, error: "Please select a role first" };

    try {
      const response = await api.signup({ ...payload, role });
      return response.ok
        ? { ok: true }
        : { ok: false, error: response.data?.error || "Signup failed" };
    } catch (err) {
      console.error("Signup error", err);
      return { ok: false, error: "Signup failed" };
    }
  };

  const logout = () => {
    api.logout();
    setUser(null);
    setSelectedRole(null);
    setIsAuthenticated(false);
    localStorage.removeItem("mc_role");
  };

  const value = useMemo(
    () => ({
      selectedRole,
      user,
      loading,
      isAuthenticated,
      selectRole,
      login,
      signup,
      logout,
    }),
    [selectedRole, user, loading, isAuthenticated]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
