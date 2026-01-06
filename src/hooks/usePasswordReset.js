import { useState, useCallback } from "react";
import api from "../axiosConfig.js";

export const usePasswordReset = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleEmailChange = useCallback((e) => {
    setEmail(e.target.value);
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setError("");
      setSuccess("");
      setLoading(true);

      try {
        await api.post("users/forgot-password/", { email });

        setSuccess(
          "If an account with this email exists, a password reset link has been sent."
        );
        setEmail("");
      } catch (err) {
        console.error("Forgot password error:", err);
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [email]
  );

  return {
    email,
    loading,
    error,
    success,
    handleEmailChange,
    handleSubmit,
  };
};