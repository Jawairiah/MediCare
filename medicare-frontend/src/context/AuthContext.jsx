import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [selectedRole, setSelectedRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const persistedRole = localStorage.getItem('medicare_role');
    const persistedAuth = localStorage.getItem('medicare_auth');
    if (persistedRole) setSelectedRole(persistedRole);
    if (persistedAuth === 'true') setIsAuthenticated(true);
  }, []);

  const selectRole = (role) => {
    setSelectedRole(role);
    localStorage.setItem('medicare_role', role);
  };

  const login = async ({ email, password }) => {
    // Placeholder: integrate backend auth here.
    // On success, set user info and mark authenticated.
    setUser({ email });
    setIsAuthenticated(true);
    localStorage.setItem('medicare_auth', 'true');
    return { ok: true };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('medicare_auth');
  };

  const value = useMemo(() => ({
    selectedRole,
    isAuthenticated,
    user,
    selectRole,
    login,
    logout,
  }), [selectedRole, isAuthenticated, user]);

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
