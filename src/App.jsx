import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./app/home/home";
import Dashboard from "./app/dashboard/dashboard";
import Signin from "./components/login/login";
import Register from "./components/register/register";
import Password_reset from "./components/password_reset/password_reset";
import { AuthProvider } from "./authcontext.jsx";
import { AuthContext } from "./AuthContext.js";
import { Toaster } from "./components/ui/sonner.jsx";
import { Spinner } from "./components/ui/spinner.jsx";

// Protected route wrapper that waits for auth initialization before redirecting
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-2">
          <Spinner />
          <span className="text-xs text-slate-500 font-medium">Verifying session…</span>
        </div>
      </div>
    );
  }

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
