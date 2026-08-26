import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./app/home/home";
import Dashboard from "./app/dashboard/dashboard";
import Signin from "./components/login/login";
import Register from "./components/register/register";
import Password_reset from "./components/password_reset/password_reset";
import "./App.css";
import { AuthProvider, AuthContext } from "./authcontext.jsx";
import { Toaster } from "./components/ui/sonner.jsx";

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  return isAuthenticated ? children : <Navigate to="/home/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" richColors closeButton />
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/home/login" element={<Signin />} />
          <Route path="/home/register" element={<Register />} />
          <Route path="/home/password_reset" element={<Password_reset />} />
          
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
