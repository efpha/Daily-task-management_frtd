import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import api from "../../axiosConfig.js";
import AuthField from "../auth/AuthField.jsx";
import AuthLayout from "../auth/AuthLayout.jsx";
import { Spinner } from "../ui/spinner";
import { toast } from "sonner";

const Register = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event) => {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
    if (error) setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (formData.password !== formData.confirmPassword) {
      setError("Your passwords don’t match. Please check them and try again.");
      return;
    }
    if (formData.password.length < 8) {
      setError("Your password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      await api.post("users/register/", { name: formData.name, email: formData.email, password: formData.password });
      toast.success("Account created", { description: "Sign in to open your workspace." });
      navigate("/home/login", { state: { registered: true } });
    } catch (err) {
      console.error("Registration failed:", err);
      toast.error("Couldn’t create your account", { description: "Please check your details and try again." });
      const backendError = err.response?.data;
      const emailError = Array.isArray(backendError?.email) ? backendError.email[0] : "";
      setError(emailError || "We couldn’t create your account. Please check your details and try again.");
    } finally {
      setLoading(false);
    }
  };

  const passwordRules = [[formData.password.length >= 8, "At least 8 characters"], [/[A-Z]/.test(formData.password), "One uppercase letter"], [/[0-9]/.test(formData.password), "One number"]];

  return (
    <AuthLayout eyebrow="Get started" title="Create your account" description="" footer={<>Already have an account? <Link to="/home/login">Sign in</Link></>}>
      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <p className="auth-alert error" role="alert"><AlertCircle size={17} />{error}</p>}
        <AuthField id="name" label="Your name" value={formData.name} onChange={handleChange} placeholder="e.g. John Kamau" autoComplete="name" />
        <AuthField id="email" label="Email address" type="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" autoComplete="email" />
        <AuthField id="password" label="Create a password" type="password" value={formData.password} onChange={handleChange} placeholder="Choose a strong password" autoComplete="new-password" />
        <div className="auth-password-rules" aria-label="Password strength tips">
          {passwordRules.map(([isMet, text]) => <span className={`auth-password-rule ${isMet ? "is-met" : ""}`} key={text}>{text}</span>)}
        </div>
        <AuthField id="confirmPassword" label="Confirm password" type="password" value={formData.confirmPassword} onChange={handleChange} placeholder="Enter it again" autoComplete="new-password" error={formData.confirmPassword && formData.password !== formData.confirmPassword ? "Passwords don’t match" : ""} />
        <button className="auth-submit" type="submit" disabled={loading}>{loading ? <><Spinner /> Creating account...</> : "Create account"}</button>
      </form>
    </AuthLayout>
  );
};

export default Register;
