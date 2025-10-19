import React, { createContext, useState, useEffect } from "react";

// Create context
export const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // On app load, check if tokens exist in localStorage
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    setIsAuthenticated(!!accessToken); // true if token exists
  }, []);

  // Login method
  const login = (access, refresh) => {
    localStorage.setItem("accessToken", access);
    localStorage.setItem("refreshToken", refresh);
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
