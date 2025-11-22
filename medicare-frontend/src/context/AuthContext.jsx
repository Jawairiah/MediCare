import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../lib/api';

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
    // Try backend login first; fallback to local demo if API not configured.
    const r = await api.login({ email, password });
    if (r.ok && r.data?.user) {
      const role = r.data.user.role || selectedRole || 'patient';
      setUser({ ...r.data.user, role });
      setIsAuthenticated(true);
      localStorage.setItem('medicare_auth', 'true');
      if (selectedRole !== role) {
        setSelectedRole(role);
        localStorage.setItem('medicare_role', role);
      }
      // Fetch notifications and trigger popup alerts
      try {
        const notifs = await api.getNotifications();
        if (notifs.ok && Array.isArray(notifs.data)) {
          const unread = notifs.data.filter(n => !n.read);
          unread.forEach(n => {
            const action = n.type || 'Notification';
            const msg = `${action} with ${n.withName} at ${n.clinic_name} on ${n.date} ${n.time}.`;
            try { window.notify({ title: action, message: msg, type: 'info', meta: { ...n } }); } catch {}
          });
        }
      } catch {}
      return { ok: true };
    }
    // Fallback demo mode
    if (!r.ok && r.status === 0) {
      const role = selectedRole || 'patient';
      setUser({ email, role });
      setIsAuthenticated(true);
      localStorage.setItem('medicare_auth', 'true');
      // Demo: also emit a welcome notification
      try { window.notify({ title: 'Welcome', message: 'You are logged in.', type: 'info' }); } catch {}
      return { ok: true, demo: true };
    }
    return { ok: false, error: r.data?.error || 'Login failed' };
  };

  const signup = async ({ name, email, password, role, specialty }) => {
    const payload = { name, email, password, role, specialty };
    const r = await api.signup(payload);
    if (r.ok) {
      return { ok: true };
    }
    // Fallback demo: allow signup without backend
    if (r.status === 0) return { ok: true, demo: true };
    return { ok: false, error: r.data?.error || 'Signup failed' };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('medicare_auth');
    api.logout();
  };

  const value = useMemo(() => ({
    selectedRole,
    isAuthenticated,
    user,
    selectRole,
    login,
    signup,
    logout,
  }), [selectedRole, isAuthenticated, user]);

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
