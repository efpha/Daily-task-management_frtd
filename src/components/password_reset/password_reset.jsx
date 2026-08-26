import React from "react";
import { ArrowLeft, Check, Mail, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import AuthField from "../auth/AuthField.jsx";
import AuthLayout from "../auth/AuthLayout.jsx";
import { Spinner } from "../ui/spinner.jsx";
import { usePasswordReset } from "../../hooks/usePasswordReset.js";

const PasswordReset = () => {
  const { email, loading, error, success, handleEmailChange, handleSubmit } = usePasswordReset();

  return (
    <AuthLayout eyebrow="Account recovery" title="Reset your password" description="Enter the email linked to your account and we’ll send you a secure reset link." footer={<Link className="auth-back-link" to="/home/login"><ArrowLeft size={15} /> Back to sign in</Link>}>
      {success ? (
        <div className="auth-success-state" role="status">
          <span className="auth-success-icon"><Check size={28} /></span>
          <h2>Check your inbox</h2>
          <p>{success}</p>
          <p>Didn’t receive it? Check your spam folder or try again in a few minutes.</p>
          <Link className="auth-submit" to="/home/login">Return to sign in</Link>
        </div>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <p className="auth-alert error" role="alert"><AlertCircle size={17} />{error}</p>}
          <AuthField id="email" label="Email address" type="email" value={email} onChange={handleEmailChange} placeholder="you@example.com" autoComplete="email" disabled={loading} hint="We’ll never reveal whether an account exists for this address." />
          <button className="auth-submit" type="submit" disabled={loading}>{loading ? <><Spinner /> Sending link...</> : <><Mail size={17} /> Send reset link</>}</button>
        </form>
      )}
    </AuthLayout>
  );
};

export default PasswordReset;
