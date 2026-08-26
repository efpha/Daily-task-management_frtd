import { useState, useCallback } from "react";
import api from "../axiosConfig.js";
import { toast } from "sonner";

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
        toast.success("Reset link requested", { description: "Check your inbox for the next step." });
        setEmail("");
      } catch (err) {
        console.error("Forgot password error:", err);
        toast.error("Couldn’t request a reset link", { description: "Please try again in a moment." });
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
