import { createContext, useState, useEffect } from 'react';
import api from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Auth bypass for MCP-only flows.
    // If you set `VITE_BYPASS_AUTH=true` or provide `VITE_MCP_TOKEN`, we skip the local REST auth.
    const bypassAuth = String(import.meta.env.VITE_BYPASS_AUTH || '').toLowerCase() === 'true';

    const envMcpToken = import.meta.env.VITE_MCP_TOKEN;

    if (bypassAuth || envMcpToken) {
      setUser({ name: 'MCP User' });
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('token');
    if (token) {
      fetchUser();
      return;
    }

    setLoading(false);
  }, []);

  const fetchUser = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data);
    } catch (error) {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};