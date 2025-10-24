import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

// Create context
export const AuthContext = createContext();

// Provider component
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
      await axios.get("https://daily-task-management-backend.onrender.com/api/tasks/all", {
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
      const response = await axios.post(
        "https://daily-task-management-backend.onrender.com/api/users/token/refresh/",
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

  // Login method
  const login = (access_token, refresh_token) => {
    localStorage.setItem("accessToken", access_token);
    localStorage.setItem("refreshToken", refresh_token);
    setIsAuthenticated(true);
  };

  // Logout method
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
