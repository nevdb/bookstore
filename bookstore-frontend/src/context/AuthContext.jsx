import React, { createContext, useContext, useEffect, useState } from "react";
import API from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      const token = localStorage.getItem("authToken");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await API.get("/api/auth/profile");
        setUser(response.data);
      } catch (error) {
        localStorage.removeItem("authToken");
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  const login = async (credentials) => {
    const response = await API.post("/api/auth/login", credentials);
    const data = response.data;
    localStorage.setItem("authToken", data.token);
    setUser(data.user);
    return data;
  };

  const register = async (payload) => {
    const response = await API.post("/api/auth/register", payload);
    const data = response.data;
    localStorage.setItem("authToken", data.token);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    await API.post("/api/auth/logout");
    localStorage.removeItem("authToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
