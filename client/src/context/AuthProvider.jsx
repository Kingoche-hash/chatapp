import { useCallback, useEffect, useMemo, useState } from 'react';
import { AuthContext } from './authContext';
import { getMeRequest, loginRequest, registerRequest } from '../services/auth.Service';
import { clearToken, getToken, setToken } from '../services/tokenStorage';

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(getToken()));

  // On first load: if a wristband is saved, ask the server who it belongs to.
  useEffect(() => {
    if (!getToken()) return;

    let cancelled = false;

    getMeRequest()
      .then(({ user }) => {
        if (!cancelled) setUser(user);
      })
      .catch(() => clearToken())
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // The API helper announces this when the server says "your wristband is no good".
  useEffect(() => {
    const handleLogout = () => setUser(null);
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  const login = useCallback(async (credentials) => {
    const { user, token } = await loginRequest(credentials);
    setToken(token);
    setUser(user);
  }, []);

  const register = useCallback(async (details) => {
    const { user, token } = await registerRequest(details);
    setToken(token);
    setUser(user);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}