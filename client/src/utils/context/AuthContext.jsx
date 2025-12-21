import { createContext, useState, useEffect } from "react";
import api from "../api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Extract token and user info from URL params if present
    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get("token");
    const user_id = searchParams.get("user_id");
    const user_name = searchParams.get("user_name");
    const user_email = searchParams.get("user_email");
    if (token && user_id && user_name && user_email) {
      localStorage.setItem("token", token);
      localStorage.setItem("user_id", user_id);
      localStorage.setItem("user_name", user_name);
      localStorage.setItem("user_email", user_email);
      // Remove search params from URL
      window.history.replaceState({}, document.title, window.location.pathname);
      // Delay fetchUser to ensure token is set
      setTimeout(() => {
        setUser({ id: user_id, name: user_name, email: user_email });
        setLoading(false);
      }, 100);
      return;
    }
  }, []);

  const fetchUser = async () => {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data);
    } catch (error) {
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  const login = (token, userData) => {
    localStorage.setItem("token", token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};
