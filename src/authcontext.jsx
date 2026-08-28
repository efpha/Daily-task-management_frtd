import React, { useState, useEffect } from "react";
import api from "./axiosConfig.js";
import { AuthContext } from "./AuthContext.js";

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return Boolean(localStorage.getItem("accessToken"));
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const refreshAccessToken = async () => {
      try {
        const refresh = localStorage.getItem("refreshToken");
        if (!refresh) throw new Error("No refresh token available");

        const response = await api.post(`users/token/refresh/`, { refresh });
        const newAccess = response.data.access;
        localStorage.setItem("accessToken", newAccess);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Token refresh failed:", error);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    const verifyToken = async (accessToken) => {
      try {
        await api.get("tasks/all/", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setIsAuthenticated(true);
        setIsLoading(false);
      } catch (error) {
        if (error.response?.status === 401) {
          await refreshAccessToken();
        } else {
          // On non-401 errors (e.g. server starting up), maintain current auth state based on token existence
          setIsLoading(false);
        }
      }
    };

    const access = localStorage.getItem("accessToken");
    if (access) {
      verifyToken(access);
    } else {
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  }, []);

  const login = (access_token, refresh_token) => {
    localStorage.setItem("accessToken", access_token);
    localStorage.setItem("refreshToken", refresh_token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
