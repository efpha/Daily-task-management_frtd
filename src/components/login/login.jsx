import React, { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import api from "../../axiosConfig.js";
import { AuthContext } from "../../authcontext.jsx";
import AuthField from "../auth/AuthField.jsx";
import AuthLayout from "../auth/AuthLayout.jsx";
import { Spinner } from "../ui/spinner";
import { toast } from "sonner";

const Signin = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);

  const handleChange = (event) => {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
    if (error) setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("users/login/", formData);
      const { access_token, refresh_token } = response.data;
      login(access_token, refresh_token);
      toast.success("Welcome back", { description: "Your workspace is ready." });
      navigate("/dashboard");
    } catch (err) {
      console.error("Login failed:", err);
      toast.error("Sign in failed", { description: "Check your email and password and try again." });
      setError("We couldn’t sign you in. Check your email and password and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      // eyebrow="Welcome back"
      title="Sign in to your workspace"
      // description="Pick up where you left off and keep your day moving."
      footer={<>New to Task Manager? <Link to="/home/register">Create an account</Link></>}
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {location.state?.registered && <p className="auth-alert success" role="status"><CheckCircle2 size={17} />Account created. You can sign in now.</p>}
        {error && <p className="auth-alert error" role="alert"><AlertCircle size={17} />{error}</p>}
        <AuthField id="email" label="Email address" type="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" autoComplete="email" />
        <AuthField id="password" label="Password" type="password" value={formData.password} onChange={handleChange} placeholder="Enter your password" autoComplete="current-password" />
        <div className="auth-form-links"><span /><Link to="/home/password_reset">Forgot your password?</Link></div>
        <button className="auth-submit" type="submit" disabled={loading}>
          {loading ? <><Spinner /> Signing in...</> : "Sign in"}
        </button>
      </form>
    </AuthLayout>
  );
};

export default Signin;
