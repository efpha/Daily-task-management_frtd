import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./app/home/home";
import Dashboard from "./app/dashboard/dashboard";
import Signin from "./components/login/login";
import Register from "./components/register/register";
import "./App.css";
import { AuthProvider, AuthContext } from "./authcontext.jsx";

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Signin />} />
          <Route path="/register" element={<Register />} />
          
          {/* 👇 Secure dashboard using AuthContext */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
