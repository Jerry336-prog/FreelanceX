import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authService, userService } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  // Check auth session on startup
  const checkAuth = useCallback(async () => {
    try {
      const data = await authService.checkAuth();
      const userData = data?.user || data;
      if (userData?._id || userData?.id || userData?.email) {
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      }
    } catch (err) {
      // Session invalid or not logged in
      setUser(null);
      setToken(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Login handler
  const login = async (credentials) => {
    setLoading(true);
    try {
      const data = await authService.login(credentials);
      if (data?.user) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      if (data?.token) {
        setToken(data.token);
        localStorage.setItem("token", data.token);
      }
      return data;
    } finally {
      setLoading(false);
    }
  };

  // Signup handler
  const signup = async (formData) => {
    setLoading(true);
    try {
      const data = await authService.signup(formData);
      if (data?.user) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      if (data?.token) {
        setToken(data.token);
        localStorage.setItem("token", data.token);
      }
      return data;
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setLoading(false);
    }
  };

  // Update user profile in local state
  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    updateUser,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
