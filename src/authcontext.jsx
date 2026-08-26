import React, { createContext, useState, useEffect } from "react";
import api from "./axiosConfig.js";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // On app load, check if tokens exist in localStorage
  useEffect(() => {
    const access = localStorage.getItem("accessToken");
    if (access) {
      setIsAuthenticated(true);
      verifyToken(access);
    }
  }, []);


  const verifyToken = async (accessToken) => {
    try {
      // Try to decode or ping a protected route
      await api.get("tasks/all/", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    } catch (error) {
      // If expired, refresh it
      if (error.response?.status === 401) {
        await refreshAccessToken();
      }
    }
  };

  const refreshAccessToken = async () => {
    try {
      const refresh = localStorage.getItem("refreshToken");
      const response = await api.post(`users/token/refresh/`,
        { refresh }
      );
      const newAccess = response.data.access;
      localStorage.setItem("accessToken", newAccess);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Token refresh failed:", error);
      logout(); // clear tokens if refresh also invalid
    }
  };

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
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
